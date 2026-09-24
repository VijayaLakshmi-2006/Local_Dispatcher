import express from 'express';
import { 
  registerUser, 
  loginUser, 
  googleLogin, 
  getUserProfile, 
  logoutUser, 
  addAddress,
  updateAddress,
  deleteAddress,
  updateUserLocation
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.post('/address', protect, addAddress);
router.put('/address/:addressId', protect, updateAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.put('/location', protect, updateUserLocation);

export default router;
