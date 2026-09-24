import express from 'express';
import { 
  getAllUsers, 
  updateUserStatus, 
  updateAgentStatus, 
  getAdminAnalytics 
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/agents/:id/status', updateAgentStatus);
router.get('/analytics', getAdminAnalytics);

export default router;
