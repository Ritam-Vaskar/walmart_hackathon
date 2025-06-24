import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  getProductsByCategory,
  updateProductInventory
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts);
router.route('/categories').get(getCategories);
router.route('/category/:category').get(getProductsByCategory);
router.route('/:id').get(getProductById);
router.route('/:id/inventory').put(protect, updateProductInventory);

export default router;