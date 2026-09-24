import express from 'express';
import { 
  trackOrder, 
  updateAgentLocation, 
  manualAssignAgent, 
  getAllAgents,
  toggleAgentOnline,
  getAgentProfile,
  acceptOrder,
  rejectOrder,
  getActiveRequest
} from '../controllers/dispatchController.js';
import { protect, isAdmin, isAgent } from '../middleware/auth.js';

const router = express.Router();

router.get('/track/:orderId', protect, trackOrder);
router.put('/update-location', protect, isAgent, updateAgentLocation);
router.post('/assign', protect, isAdmin, manualAssignAgent);
router.get('/agents', protect, isAdmin, getAllAgents);

// Agent specific dashboard routes
router.put('/toggle-online', protect, isAgent, toggleAgentOnline);
router.get('/agent-profile', protect, isAgent, getAgentProfile);
router.post('/accept', protect, isAgent, acceptOrder);
router.post('/reject', protect, isAgent, rejectOrder);
router.get('/active-request', protect, isAgent, getActiveRequest);

export default router;
