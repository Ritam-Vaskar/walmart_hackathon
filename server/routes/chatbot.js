import express from 'express';
import Chatbot from '../models/Chatbot.js';
import Product from '../models/Product.js';
import {protect} from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChromaClient } from 'chromadb';

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful shopping assistant for Walmart. Your capabilities include:
- Helping users find products across multiple categories
- Creating and managing shopping lists
- Providing personalized product recommendations
- Assisting with meal planning and recipe suggestions
- Offering shopping tips and deals
- Making product comparisons
- Answering questions about products, orders, and services

Be friendly, concise, and helpful. Always try to understand the user's needs and preferences to provide the most relevant assistance.`;

// Initialize ChromaDB
const chromaClient = new ChromaClient();
const productCollection = await chromaClient.getOrCreateCollection({
  name: "products"
});

// Helper function to get personalized recommendations
async function getRecommendations(userId, message, category = null, limit = 5) {
  try {
    const chatbot = await Chatbot.findOne({ userId }).populate('conversationHistory.context.products');
    const preferences = chatbot?.preferences || {};
    
    // Extract keywords from the message using Gemini
    const keywordPrompt = "Extract key product-related keywords from this message. Return only the keywords separated by commas.\n\nMessage: " + message;
    
    const keywordResult = await model.generateContent(keywordPrompt);
    const keywordResponse = await keywordResult.response;
    const keywords = keywordResponse.text().split(',').map(k => k.trim());
    
    // Build query
    let query = {};
    if (category) query.category = category;
    if (preferences.budget) {
      query.price = {
        $gte: preferences.budget.min || 0,
        $lte: preferences.budget.max || Number.MAX_VALUE
      };
    }
    
    // Use ChromaDB for semantic search if keywords are present
    if (keywords.length > 0) {
      const results = await productCollection.query({
        queryTexts: keywords,
        nResults: limit
      });
      
      // Get products by IDs from MongoDB
      if (results.ids.length > 0) {
        query._id = { $in: results.ids.flat() };
      }
    }

    const products = await Product.find(query)
      .sort({ rating: -1 })
      .limit(limit);

    return products;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

// Start or continue conversation
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    let chatbot = await Chatbot.findOne({ userId });
    if (!chatbot) {
      chatbot = new Chatbot({ userId });
    }

    // Prepare conversation history
    const conversationContext = chatbot.conversationHistory
      .slice(-5) // Get last 5 messages for context
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }]
      }));

    // Build the conversation prompt
    let conversationPrompt = SYSTEM_PROMPT + "\n\nConversation history:\n";
    
    // Add conversation context
    conversationContext.forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      conversationPrompt += `${role}: ${msg.parts[0].text}\n`;
    });
    
    conversationPrompt += `User: ${message}\nAssistant:`;

    // Get AI response using Gemini
    const result = await model.generateContent(conversationPrompt);
    const response = await result.response;
    const botResponse = response.text();
    
    // Update conversation history
    chatbot.conversationHistory.push(
      { message, sender: 'user' },
      { message: botResponse, sender: 'bot' }
    );

    await chatbot.save();

    res.json({
      message: botResponse,
      recommendations: await getRecommendations(userId, message)
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get or update user preferences
router.post('/preferences', protect, async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    let chatbot = await Chatbot.findOne({ userId });
    if (!chatbot) {
      chatbot = new Chatbot({ userId });
    }

    chatbot.preferences = { ...chatbot.preferences, ...preferences };
    await chatbot.save();

    res.json(chatbot.preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update meal plan
router.post('/meal-plan', protect, async (req, res) => {
  try {
    const { week, meals } = req.body;
    const userId = req.user._id;

    let chatbot = await Chatbot.findOne({ userId });
    if (!chatbot) {
      chatbot = new Chatbot({ userId });
    }

    const mealPlanIndex = chatbot.mealPlans.findIndex(plan => 
      plan.week.getTime() === new Date(week).getTime()
    );

    if (mealPlanIndex > -1) {
      chatbot.mealPlans[mealPlanIndex].meals = meals;
    } else {
      chatbot.mealPlans.push({ week, meals });
    }

    await chatbot.save();

    res.json(chatbot.mealPlans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update shopping list
router.post('/shopping-list', protect, async (req, res) => {
  try {
    const { name, items } = req.body;
    const userId = req.user._id;

    let chatbot = await Chatbot.findOne({ userId });
    if (!chatbot) {
      chatbot = new Chatbot({ userId });
    }

    const listIndex = chatbot.shoppingLists.findIndex(list => list.name === name);

    if (listIndex > -1) {
      chatbot.shoppingLists[listIndex].items = items;
    } else {
      chatbot.shoppingLists.push({ name, items });
    }

    await chatbot.save();

    res.json(chatbot.shoppingLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game stats and update points
router.post('/game-stats', protect, async (req, res) => {
  try {
    const { points, badge, challenge } = req.body;
    const userId = req.user._id;

    let chatbot = await Chatbot.findOne({ userId });
    if (!chatbot) {
      chatbot = new Chatbot({ userId });
    }

    if (points) {
      chatbot.gameStats.points += points;
    }

    if (badge && !chatbot.gameStats.badges.includes(badge)) {
      chatbot.gameStats.badges.push(badge);
    }

    if (challenge) {
      chatbot.gameStats.completedChallenges.push({
        name: challenge,
        completedAt: new Date()
      });
    }

    await chatbot.save();

    res.json(chatbot.gameStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;