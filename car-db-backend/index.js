import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './api_routes/authRouter.js';
import carPostRouter from './api_routes/CarPostRouter.js';
import orderRouter from './api_routes/OrderRouter.js';
import vnpayRouter from './api_routes/VNPayRouter.js';
import postingFeeRouter from './api_routes/PostingFeeRouter.js';

const app = express();
dotenv.config();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parser middleware - MUST be before routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cars', carPostRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payments', vnpayRouter);
app.use('/api/posting-fee', postingFeeRouter);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

app.listen(3000, () => {
      console.log('Server is running on port 3000');
});