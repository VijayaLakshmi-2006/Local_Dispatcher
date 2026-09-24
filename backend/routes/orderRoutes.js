import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  cancelOrder, 
  rateOrder,
  getDispatchLog
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/dispatch-log', protect, getDispatchLog);
router.put('/cancel', protect, cancelOrder);
router.post('/:id/rate', protect, rateOrder);

export default router;
