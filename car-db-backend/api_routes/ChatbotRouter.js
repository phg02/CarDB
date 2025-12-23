import express from 'express';
import { handleChat } from '../controller/ChatbotController.js';

const router = express.Router();

/**
 * Chat with AI assistant
 * @route POST /api/chatbot/chat
 * @body {string} message - User's message
 * @returns {object} AI response with intent, filters, and matched cars
 */
router.post('/chat', handleChat);

export default router;
