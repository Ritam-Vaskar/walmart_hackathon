import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name image price brand',
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'items.product',
      select: 'name image price brand',
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price image inStock',
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check if all items are in stock
    const outOfStockItems = cart.items.filter(item => !item.product.inStock);
    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        message: 'Some items are out of stock',
        items: outOfStockItems.map(item => item.product.name),
      });
    }

    // Calculate total price
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create new order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
      shippingAddress,
      status: 'pending',
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    // Populate product details in the response
    const populatedOrder = await Order.findById(order._id).populate({
      path: 'items.product',
      select: 'name image price brand',
    });

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;