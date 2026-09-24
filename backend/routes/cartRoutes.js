import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getCart);

router.route('/add')
  .post(protect, addToCart);

router.route('/update')
  .put(protect, updateCartItem);

router.route('/remove')
  .delete(protect, removeFromCart);

export default router;
