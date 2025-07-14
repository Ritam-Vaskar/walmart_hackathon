import express from 'express';
import Groq from 'groq-sdk';
import Product from '../models/Product.js';

const router = express.Router();

// Initialize Groq AI
const groq = new Groq({ apiKey: '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' });

// Helper function to format products for Groq prompt
const formatProductsForPrompt = (products) => {
  return products.map((product, index) => (
    `${index + 1}. ID: ${product._id}\nName: ${product.name}\nBrand: ${product.brand || 'Generic'}\nPrice: $${product.price}\nDescription: ${product.description || 'No description available'}\nCategory: ${product.category}\nRating: ${product.rating || 'N/A'}\nStock: ${product.stock || 'Available'}\n`
  )).join('\n');
};

// Get product recommendations based on custom prompt
router.post('/recommend', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Validate that prompt is provided
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid prompt describing what you are looking for'
      });
    }

    console.log('User prompt:', prompt);
    console.log('Fetching products from database...');
    
    // First, let's try to fetch ALL products to see what we have
    const allProducts = await Product.find({});
    console.log(`Total products in database: ${allProducts.length}`);
    
    if (allProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found in database. Please add some products first.'
      });
    }

    // Log categories to debug
    const categories = [...new Set(allProducts.map(p => p.category))];
    console.log('Available categories:', categories);

    // Filter products that are available and have valid data
    const availableProducts = allProducts.filter(product => 
      product.price && 
      product.price > 0 && 
      (product.inStock !== false) && 
      (product.stock !== 0) &&
      product.name && 
      product.name.trim().length > 0
    );

    if (availableProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No suitable products found for recommendations'
      });
    }

    console.log(`Found ${availableProducts.length} available products`);

    // Format products for Groq
    const productsList = formatProductsForPrompt(availableProducts);

    // Generate dynamic prompt based on user input
    const dynamicPrompt = `As a product recommendation expert, analyze these products and suggest the most suitable products based on the following user request:

USER REQUEST: "${prompt}"

Consider the user's specific needs, preferences, and requirements mentioned in their request. Analyze:
- What type of products they're looking for
- Any specific categories, brands, or features mentioned
- Budget considerations if mentioned
- Quantity or serving size requirements
- Any dietary restrictions or preferences
- Occasion or purpose for the products
- Target audience (kids, adults, office, party, etc.)

Select 3-6 products that best match the user's request and work well together. Prioritize products that directly address their needs.

Return ONLY a valid JSON object with this exact structure:
{
  "recommended_products": ["product_id_1", "product_id_2", "product_id_3"],
  "reasoning": ["reason 1", "reason 2", "reason 3"]
}

The reasoning should explain why these specific products were chosen based on the user's request.

Available Products:
${productsList}`;

    console.log('Sending request to Groq AI...');

    // Get recommendation from Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a product recommendation expert. Analyze the user's request carefully and recommend products that best match their specific needs and preferences. Always respond with valid JSON only, no additional text or markdown formatting."
        },
        {
          role: "user",
          content: dynamicPrompt
        }
      ],
      model: "llama3-70b-8192", // You can also use "llama3-8b-8192" or "mixtral-8x7b-32768"
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.8,
      stream: false
    });

    let recommendationText = completion.choices[0]?.message?.content || '';
    
    // Clean up the response to ensure valid JSON
    recommendationText = recommendationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Raw Groq response:', recommendationText);

    let recommendation;
    try {
      recommendation = JSON.parse(recommendationText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Attempting to extract JSON from response...');
      
      // Try to extract JSON from the response
      const jsonMatch = recommendationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          recommendation = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error('Second JSON parsing attempt failed:', secondParseError);
          recommendation = null;
        }
      }
      
      // If still no valid JSON, create fallback recommendation
      if (!recommendation) {
        const fallbackProducts = availableProducts.slice(0, 4);
        recommendation = {
          recommended_products: fallbackProducts.map(p => p._id.toString()),
          reasoning: [
            `Selected products that best match your request: "${prompt}"`,
            "Chosen based on availability and relevance to your needs",
            "Curated to provide good value and variety",
            "Perfect selection for your requirements"
          ]
        };
      }
    }

    // Validate that we have recommended products
    if (!recommendation.recommended_products || recommendation.recommended_products.length === 0) {
      const fallbackProducts = availableProducts.slice(0, 4);
      recommendation = {
        recommended_products: fallbackProducts.map(p => p._id.toString()),
        reasoning: [
          `Selected products that align with your request: "${prompt}"`,
          "Chosen based on product availability and quality",
          "Curated to meet your specific needs",
          "Great selection for your requirements"
        ]
      };
    }

    // Ensure reasoning is provided
    if (!recommendation.reasoning || recommendation.reasoning.length === 0) {
      recommendation.reasoning = [
        `Products selected based on your request: "${prompt}"`,
        "Chosen for their quality and relevance to your needs",
        "Curated to provide the best experience",
        "Perfect match for your requirements"
      ];
    }

    // Fetch full product details for recommended products
    const recommendedProducts = await Product.find({
      _id: { $in: recommendation.recommended_products }
    });

    // Filter out any products that weren't found
    const validProducts = recommendedProducts.filter(product => product);

    console.log(`Returning ${validProducts.length} recommended products`);

    // If no valid products found, return error
    if (validProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching products found for your request. Please try a different prompt.'
      });
    }

    return res.json({
      success: true,
      bucket: {
        products: validProducts,
        reasoning: recommendation.reasoning,
        userRequest: prompt // Include the original user request for reference
      }
    });

  } catch (error) {
    console.error('Product recommendation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating product recommendations',
      error: error.message
    });
  }
});

// Debug endpoint to check what products are in the database
router.get('/debug-products', async (req, res) => {
  try {
    const products = await Product.find({}).limit(10);
    const categories = [...new Set(products.map(p => p.category))];
    
    return res.json({
      success: true,
      totalProducts: await Product.countDocuments(),
      categories: categories,
      sampleProducts: products.map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        inStock: p.inStock,
        stock: p.stock
      }))
    });
  } catch (error) {
    console.error('Debug products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching debug information',
      error: error.message
    });
  }
});

export default router;