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
import userRouter from './api_routes/UserRouter.js';
import newsRouter from './api_routes/NewsRouter.js';
import commentRouter from './api_routes/CommentRouter.js';
import filterRouter from './api_routes/FilterRouter.js';
import vinDecoderRouter from './api_routes/VinDecoderRouter.js';
import chatbotRouter from './api_routes/ChatbotRouter.js';

const app = express();
dotenv.config();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
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
app.use('/api/users', userRouter);
app.use('/api/news', newsRouter);
app.use('/api/comments', commentRouter);
app.use('/api/filters', filterRouter);
app.use('/api/vin', vinDecoderRouter);
app.use('/api/chatbot', chatbotRouter);
// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.status(200).json(healthCheck);
});

app.listen(3000, () => {
      console.log('Server is running on port 3000');
});