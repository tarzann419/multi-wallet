import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    getUserProfileByEmail,
    updateUserProfile,
    changeUserPassword,
} from '../controllers/auth/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', verifyToken, getUserProfile);
router.get('/profile/:email', verifyToken, getUserProfileByEmail);
router.put('/profile', verifyToken, updateUserProfile);
router.put('/profile/password', verifyToken, changeUserPassword);

export default router;
