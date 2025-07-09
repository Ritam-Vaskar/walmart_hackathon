import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET wishlist
router.get('/', protect, async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
  res.json(wishlist ? wishlist.products : []);
});

// ADD product to wishlist
router.post('/add/:productId', protect, async (req, res) => {
  const { productId } = req.params;
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user.id, products: [] });
  }
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  res.json({ success: true, wishlist });
});

// REMOVE product from wishlist
router.delete('/remove/:productId', protect, async (req, res) => {
  const { productId } = req.params;
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });

  wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
  await wishlist.save();

  res.json({ success: true, wishlist });
});

export default router;
