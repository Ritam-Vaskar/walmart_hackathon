import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate prices and verify inventory
  const orderItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.inventory.available < item.quantity) {
        res.status(400);
        throw new Error(`Product ${product.name} is out of stock`);
      }
      return {
        product: item.product,
        name: product.name,
        price: product.price.current,
        quantity: item.quantity,
        image: product.images[0],
        specifications: item.specifications
      };
    })
  );

  // Calculate totals
  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shipping: {
      address: shippingAddress,
      method: 'standard'
    },
    payment: {
      method: paymentMethod || 'cash_on_delivery'
    },
    pricing: {
      subtotal,
      tax,
      shipping,
      total
    }
  });

  // Update product inventory
  await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      product.inventory.reserved += item.quantity;
      product.inventory.available = product.inventory.stock - product.inventory.reserved;
      await product.save();
    })
  );

  res.status(201).json(order);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order && (order.user.toString() === req.user._id.toString())) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (order && (order.user.toString() === req.user._id.toString())) {
    order.status.current = status;
    
    // Update dates based on status
    if (status === 'cancelled') {
      // Release reserved inventory
      await Promise.all(
        order.items.map(async (item) => {
          const product = await Product.findById(item.product);
          product.inventory.reserved -= item.quantity;
          product.inventory.available = product.inventory.stock - product.inventory.reserved;
          await product.save();
        })
      );
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get order summary with status counts
// @route   GET /api/orders/summary
// @access  Private
const getOrderSummary = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  
  const summary = {
    total: orders.length,
    totalAmount: orders.reduce((acc, order) => acc + order.pricing.total, 0),
    status: {
      placed: orders.filter(order => order.status.current === 'placed').length,
      confirmed: orders.filter(order => order.status.current === 'confirmed').length,
      shipped: orders.filter(order => order.status.current === 'shipped').length,
      delivered: orders.filter(order => order.status.current === 'delivered').length,
      cancelled: orders.filter(order => order.status.current === 'cancelled').length
    }
  };

  res.json(summary);
});

export {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  getOrderSummary,
};