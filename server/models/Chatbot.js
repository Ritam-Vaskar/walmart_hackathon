import mongoose from 'mongoose';

// Constants for validation
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DIETARY_RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher'];

const chatbotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  conversationHistory: [{
    message: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    context: {
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      category: String,
      preferences: Object,
      quizAnswers: Object
    }
  }],
  preferences: {
    dietaryRestrictions: [{
      type: String,
      enum: DIETARY_RESTRICTIONS
    }],
    favoriteCategories: [{
      type: String,
      ref: 'Category'
    }],
    style: {
      colors: [String],
      sizes: [String],
      brands: [String]
    },
    budget: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  gameStats: {
    points: {
      type: Number,
      default: 0
    },
    badges: [String],
    completedChallenges: [{
      name: String,
      completedAt: Date
    }]
  },
  shoppingLists: [{
    name: String,
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  mealPlans: [{
    week: Date,
    meals: [{
      day: {
        type: String,
        enum: DAYS_OF_WEEK,
        required: true
      },
      recipes: [{
        name: String,
        ingredients: [{
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
          },
          quantity: Number,
          unit: String
        }]
      }]
    }]
  }]
}, { timestamps: true });

// Indexes for performance
chatbotSchema.index({ 'conversationHistory.timestamp': -1 });
chatbotSchema.index({ 'shoppingLists.createdAt': -1 });
chatbotSchema.index({ 'mealPlans.week': 1 });

// Utility methods
chatbotSchema.methods.getRecentConversations = function(limit = 5) {
  return this.conversationHistory
    .slice(-limit)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));
};

chatbotSchema.methods.addMessage = function(message, sender, context = {}) {
  this.conversationHistory.push({
    message,
    sender,
    timestamp: new Date(),
    context
  });
};

chatbotSchema.methods.updatePreferences = function(newPreferences) {
  this.preferences = {
    ...this.preferences,
    ...newPreferences,
    lastUpdated: new Date()
  };
};

chatbotSchema.methods.addPoints = function(points, badge = null) {
  this.gameStats.points += points;
  
  if (badge && !this.gameStats.badges.includes(badge)) {
    this.gameStats.badges.push(badge);
  }

  return this.gameStats.points;
};

chatbotSchema.methods.createShoppingList = function(name, items = []) {
  const newList = {
    name,
    items: items.map(item => ({
      product: item.productId,
      quantity: item.quantity || 1
    })),
    createdAt: new Date()
  };
  
  this.shoppingLists.push(newList);
  return newList;
};

export default mongoose.model('Chatbot', chatbotSchema);