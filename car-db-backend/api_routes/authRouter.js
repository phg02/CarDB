import express from 'express';
import {register, login, refreshToken, logout} from '../controller/authController';

const router = express.Router();

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// Token refresh route
router.post('/refresh-token', refreshToken);

// Logout route
router.post('/logout', logout);

export default router;