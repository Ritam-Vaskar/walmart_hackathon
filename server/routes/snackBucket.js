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

// Get snack bucket recommendations
router.post('/recommend', async (req, res) => {
  try {
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

    // Try different category matching strategies
    let snackProducts = await Product.find({
      $or: [
        { category: { $regex: /snack/i } },
        { category: { $regex: /beverage/i } },
        { category: { $regex: /food/i } },
        { category: { $regex: /drink/i } },
        { category: { $regex: /chip/i } },
        { category: { $regex: /candy/i } },
        { category: { $regex: /chocolate/i } },
        { category: { $regex: /cookie/i } }
      ],
      $and: [
        { $or: [{ inStock: true }, { inStock: { $exists: false } }] },
        { $or: [{ stock: { $gt: 0 } }, { stock: { $exists: false } }] }
      ]
    });

    // If no snack-specific products found, get a variety of products
    if (snackProducts.length === 0) {
      console.log('No snack-specific products found, using all available products');
      snackProducts = allProducts.filter(product => 
        product.price && product.price > 0 && 
        (product.inStock !== false) && 
        (product.stock !== 0)
      ).slice(0, 20); // Limit to first 20 products
    }

    if (snackProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No suitable products found for snack bucket recommendations'
      });
    }

    console.log(`Found ${snackProducts.length} suitable products`);

    // Format products for Groq
    const productsList = formatProductsForPrompt(snackProducts);

    // Generate prompt for Groq
    const prompt = `As a snack recommendation expert, analyze these products and suggest a perfect snack bucket for a friends gathering. 

Consider:
- Variety of flavors (sweet, salty, savory)
- Mix of different types (chips, drinks, sweets, etc.)
- Popular party snacks
- Good value for money
- Complementary items

Select 4-6 products that work well together. Return ONLY a valid JSON object with this exact structure:
{
  "recommended_products": ["product_id_1", "product_id_2", "product_id_3"],
  "reasoning": ["reason 1", "reason 2", "reason 3"]
}

Available Products:
${productsList}`;

    // Get recommendation from Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a snack recommendation expert. Always respond with valid JSON only, no additional text or markdown formatting."
        },
        {
          role: "user",
          content: prompt
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
      
      // Fallback: create manual recommendation
      const fallbackProducts = snackProducts.slice(0, 4);
      recommendation = {
        recommended_products: fallbackProducts.map(p => p._id.toString()),
        reasoning: [
          "Selected a variety of popular snacks for your gathering",
          "Included different flavor profiles to satisfy all tastes",
          "Chosen products with good ratings and value",
          "Perfect combination for sharing with friends"
        ]
      };
    }

    // Validate that we have recommended products
    if (!recommendation.recommended_products || recommendation.recommended_products.length === 0) {
      const fallbackProducts = snackProducts.slice(0, 4);
      recommendation = {
        recommended_products: fallbackProducts.map(p => p._id.toString()),
        reasoning: [
          "Selected a variety of popular snacks for your gathering",
          "Included different flavor profiles to satisfy all tastes",
          "Chosen products with good ratings and value",
          "Perfect combination for sharing with friends"
        ]
      };
    }

    // Fetch full product details for recommended products
    const recommendedProducts = await Product.find({
      _id: { $in: recommendation.recommended_products }
    });

    console.log(`Returning ${recommendedProducts.length} recommended products`);

    return res.json({
      success: true,
      bucket: {
        products: recommendedProducts,
        reasoning: recommendation.reasoning || ["Great selection of snacks for your gathering!"]
      }
    });

  } catch (error) {
    console.error('Snack bucket recommendation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating snack bucket recommendations',
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