import express from 'express';
import { protect } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Process text-based AI shopping assistant requests
 * @access  Public/Private (depends on the action)
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Process the user's message and determine intent
    const response = await processAIRequest(message, userId);
    
    res.json(response);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Server error processing AI request' });
  }
});

/**
 * @route   POST /api/ai/voice
 * @desc    Process voice-based AI shopping assistant requests
 * @access  Public/Private (depends on the action)
 */
router.post('/voice', async (req, res) => {
  try {
    const { audioData, userId } = req.body;
    
    // Here we would typically send the audio to a speech-to-text service
    // For now, we'll assume the text is extracted and process it like a chat message
    const message = "This is where speech-to-text conversion would happen";
    const response = await processAIRequest(message, userId);
    
    res.json(response);
  } catch (error) {
    console.error('AI Voice Error:', error);
    res.status(500).json({ message: 'Server error processing voice request' });
  }
});

/**
 * @route   POST /api/ai/cart/add
 * @desc    Add product to cart via AI assistant
 * @access  Private
 */
router.post('/cart/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Find the user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = new Cart({ user: req.user.id, items: [] });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    
    // Populate product details
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    console.error('AI Add to Cart Error:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

/**
 * @route   GET /api/ai/products/search
 * @desc    Search products with natural language query
 * @access  Public
 */
router.get('/products/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Extract search terms from natural language query
    const searchTerms = extractSearchTerms(query);
    
    // Build MongoDB query
    const mongoQuery = buildProductSearchQuery(searchTerms);
    
    // Find products matching the query
    const products = await Product.find(mongoQuery).limit(10);
    
    res.json(products);
  } catch (error) {
    console.error('AI Product Search Error:', error);
    res.status(500).json({ message: 'Server error searching products' });
  }
});

/**
 * Helper function to process AI requests
 * @param {string} message - User's message
 * @param {string} userId - User ID if authenticated
 * @returns {Object} AI response
 */
async function processAIRequest(message, userId) {
  // This is a simplified version - in a real implementation, you would use
  // a natural language understanding service like OpenAI's GPT or similar
  
  // Detect intent from message
  const intent = detectIntent(message);
  
  // Process based on intent
  switch (intent.type) {
    case 'product_search':
      return await handleProductSearch(intent.params);
      
    case 'add_to_cart':
      if (!userId) {
        return { 
          type: 'auth_required',
          message: 'Please log in to add items to your cart.'
        };
      }
      return await handleAddToCart(intent.params, userId);
      
    case 'checkout':
      if (!userId) {
        return { 
          type: 'auth_required',
          message: 'Please log in to proceed to checkout.'
        };
      }
      return await handleCheckout(userId);
      
    case 'order_status':
      if (!userId) {
        return { 
          type: 'auth_required',
          message: 'Please log in to check your order status.'
        };
      }
      return await handleOrderStatus(userId);
      
    default:
      return {
        type: 'general_response',
        message: 'I\'m your Walmart shopping assistant. How can I help you shop today?'
      };
  }
}

/**
 * Detect intent from user message
 * @param {string} message - User's message
 * @returns {Object} Intent object with type and parameters
 */
function detectIntent(message) {
  // This is a simplified intent detection
  // In a real implementation, you would use NLP/NLU services
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('show me')) {
    // Product search intent
    return {
      type: 'product_search',
      params: { query: message }
    };
  }
  
  if (lowerMessage.includes('add to cart') || lowerMessage.includes('buy')) {
    // Add to cart intent
    return {
      type: 'add_to_cart',
      params: { query: message }
    };
  }
  
  if (lowerMessage.includes('checkout') || lowerMessage.includes('place order')) {
    // Checkout intent
    return {
      type: 'checkout',
      params: {}
    };
  }
  
  if (lowerMessage.includes('order status') || lowerMessage.includes('track order')) {
    // Order status intent
    return {
      type: 'order_status',
      params: {}
    };
  }
  
  // Default fallback intent
  return {
    type: 'general_inquiry',
    params: { query: message }
  };
}

/**
 * Handle product search intent
 * @param {Object} params - Search parameters
 * @returns {Object} Search results
 */
async function handleProductSearch(params) {
  try {
    const searchTerms = extractSearchTerms(params.query);
    const mongoQuery = buildProductSearchQuery(searchTerms);
    
    const products = await Product.find(mongoQuery).limit(5);
    
    return {
      type: 'product_results',
      message: `Here are some ${searchTerms.category || 'products'} I found for you:`,
      products: products
    };
  } catch (error) {
    console.error('Error handling product search:', error);
    return {
      type: 'error',
      message: 'Sorry, I had trouble finding products. Please try again.'
    };
  }
}

/**
 * Handle add to cart intent
 * @param {Object} params - Cart parameters
 * @param {string} userId - User ID
 * @returns {Object} Cart update result
 */
async function handleAddToCart(params, userId) {
  try {
    // Extract product information from the query
    // This is simplified - in a real implementation, you would use more sophisticated NLP
    const productInfo = extractProductInfo(params.query);
    
    // Find matching products
    const products = await Product.find({
      name: { $regex: productInfo.name, $options: 'i' }
    }).limit(1);
    
    if (products.length === 0) {
      return {
        type: 'not_found',
        message: `Sorry, I couldn't find ${productInfo.name}. Would you like to search for something else?`
      };
    }
    
    // Add the first matching product to cart
    const product = products[0];
    
    // Find user's cart
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    
    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === product._id.toString()
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += productInfo.quantity || 1;
    } else {
      cart.items.push({
        product: product._id,
        quantity: productInfo.quantity || 1
      });
    }
    
    await cart.save();
    
    return {
      type: 'cart_updated',
      message: `Added ${productInfo.quantity || 1} ${product.name} to your cart.`,
      product: product
    };
  } catch (error) {
    console.error('Error handling add to cart:', error);
    return {
      type: 'error',
      message: 'Sorry, I had trouble adding the item to your cart. Please try again.'
    };
  }
}

/**
 * Handle checkout intent
 * @param {string} userId - User ID
 * @returns {Object} Checkout result
 */
async function handleCheckout(userId) {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return {
        type: 'empty_cart',
        message: 'Your cart is empty. Add some items before checking out.'
      };
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
    
    return {
      type: 'checkout_ready',
      message: `You have ${cart.items.length} items in your cart with a total of $${subtotal.toFixed(2)}. Would you like to proceed to checkout?`,
      cart: cart
    };
  } catch (error) {
    console.error('Error handling checkout:', error);
    return {
      type: 'error',
      message: 'Sorry, I had trouble processing your checkout. Please try again.'
    };
  }
}

/**
 * Handle order status intent
 * @param {string} userId - User ID
 * @returns {Object} Order status result
 */
async function handleOrderStatus(userId) {
  try {
    // Get user's recent orders
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3);
    
    if (orders.length === 0) {
      return {
        type: 'no_orders',
        message: 'You don\'t have any recent orders.'
      };
    }
    
    // Format order information
    const orderInfo = orders.map(order => ({
      id: order._id,
      date: order.createdAt,
      status: order.status,
      total: order.totalPrice
    }));
    
    return {
      type: 'order_status',
      message: `Here are your recent orders:`,
      orders: orderInfo
    };
  } catch (error) {
    console.error('Error handling order status:', error);
    return {
      type: 'error',
      message: 'Sorry, I had trouble retrieving your order status. Please try again.'
    };
  }
}

/**
 * Extract search terms from natural language query
 * @param {string} query - User's query
 * @returns {Object} Extracted search terms
 */
function extractSearchTerms(query) {
  // This is a simplified extraction
  // In a real implementation, you would use NLP to extract entities
  
  const lowerQuery = query.toLowerCase();
  const terms = {};
  
  // Try to extract category
  const categoryMatches = lowerQuery.match(/(?:find|show|search for|looking for)\s+([\w\s]+)/);
  if (categoryMatches && categoryMatches[1]) {
    terms.category = categoryMatches[1].trim();
  }
  
  // Try to extract price range
  const priceMatches = lowerQuery.match(/under\s+\$(\d+)/);
  if (priceMatches && priceMatches[1]) {
    terms.maxPrice = parseInt(priceMatches[1]);
  }
  
  // Try to extract brand
  const brandMatches = lowerQuery.match(/by\s+([\w\s]+)/);
  if (brandMatches && brandMatches[1]) {
    terms.brand = brandMatches[1].trim();
  }
  
  return terms;
}

/**
 * Build MongoDB query from extracted search terms
 * @param {Object} terms - Extracted search terms
 * @returns {Object} MongoDB query object
 */
function buildProductSearchQuery(terms) {
  const query = {};
  
  if (terms.category) {
    query.category = { $regex: terms.category, $options: 'i' };
  }
  
  if (terms.brand) {
    query.brand = { $regex: terms.brand, $options: 'i' };
  }
  
  if (terms.maxPrice) {
    query.price = { $lte: terms.maxPrice };
  }
  
  return query;
}

/**
 * Extract product information from natural language query
 * @param {string} query - User's query
 * @returns {Object} Extracted product info
 */
function extractProductInfo(query) {
  // This is a simplified extraction
  // In a real implementation, you would use NLP to extract entities
  
  const lowerQuery = query.toLowerCase();
  const productInfo = {
    quantity: 1
  };
  
  // Try to extract product name
  const productMatches = lowerQuery.match(/add\s+(?:to cart\s+)?([\w\s]+)/);
  if (productMatches && productMatches[1]) {
    productInfo.name = productMatches[1].trim();
  }
  
  // Try to extract quantity
  const quantityMatches = lowerQuery.match(/(\d+)\s+(?:of|pieces|items)/);
  if (quantityMatches && quantityMatches[1]) {
    productInfo.quantity = parseInt(quantityMatches[1]);
  }
  
  return productInfo;
}

export default router;