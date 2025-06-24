import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// In-memory cart storage (in production, use Redis or database)
const carts = new Map();

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const cart = carts.get(userId) || { items: [], total: 0 };

  // Recalculate cart with current prices
  if (cart.items.length > 0) {
    const updatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) return null;

        return {
          ...item,
          price: product.price.current,
          subtotal: product.price.current * item.quantity,
          available: product.inventory.available
        };
      })
    );

    // Remove any items where product no longer exists
    cart.items = updatedItems.filter(item => item !== null);
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    carts.set(userId, cart);
  }

  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, specifications = {} } = req.body;
  const userId = req.user._id.toString();

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check inventory
  if (product.inventory.available < quantity) {
    res.status(400);
    throw new Error('Not enough stock available');
  }

  // Get or create cart
  const cart = carts.get(userId) || { items: [], total: 0 };

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update existing item
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (newQuantity > product.inventory.available) {
      res.status(400);
      throw new Error('Cannot add more of this item');
    }
    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].subtotal = newQuantity * product.price.current;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      name: product.name,
      price: product.price.current,
      quantity,
      specifications,
      image: product.images[0],
      subtotal: quantity * product.price.current
    });
  }

  // Update cart total
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Save cart
  carts.set(userId, cart);

  res.status(201).json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;
  const userId = req.user._id.toString();

  const cart = carts.get(userId);
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  // Validate product and inventory
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (quantity > product.inventory.available) {
    res.status(400);
    throw new Error('Not enough stock available');
  }

  if (quantity <= 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = quantity * product.price.current;
  }

  // Update cart total
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Save cart
  carts.set(userId, cart);

  res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id.toString();

  const cart = carts.get(userId);
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Remove item
  cart.items = cart.items.filter(item => item.product.toString() !== productId);

  // Update cart total
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Save cart
  carts.set(userId, cart);

  res.json(cart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  carts.delete(userId);
  res.json({ message: 'Cart cleared' });
});

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};