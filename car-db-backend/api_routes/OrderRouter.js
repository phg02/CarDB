import express from 'express';
import {
  createOrder,
  getOrderById,
  getCustomerOrders,
  updatePaymentDetailsVNPay,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrderStats,
} from '../controller/OrderController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== CREATE ORDER ====================
/**
 * Create a new order
 * POST /api/orders/create
 * Requires authentication
 */
router.post('/create', verifyToken, createOrder);

// ==================== GET ORDERS ====================
/**
 * Get all orders for a customer
 * GET /api/orders/customer
 * Query: page, limit
 * SECURITY: Requires authenticated user - retrieves their own orders
 */
router.get('/customer', verifyToken, getCustomerOrders);

/**
 * Get order by ID
 * GET /api/orders/:id
 */
router.get('/:id', getOrderById);

// ==================== UPDATE ORDER ====================
/**
 * Update payment details (VNPay return)
 * PATCH /api/orders/:id/payment-vnpay
 */
router.patch('/:id/payment-vnpay', updatePaymentDetailsVNPay);

/**
 * Update order status
 * PATCH /api/orders/:id/status
 * Requires: Admin or Seller
 * Body: { orderStatus }
 */
router.patch('/:id/status', verifyToken, updateOrderStatus);

/**
 * Cancel an order
 * PATCH /api/orders/:id/cancel
 * Requires authentication
 */
router.patch('/:id/cancel', verifyToken, cancelOrder);

// ==================== DELETE ORDER ====================
/**
 * Soft delete an order
 * DELETE /api/orders/:id
 * Requires authentication
 */
router.delete('/:id', verifyToken, deleteOrder);

// ==================== STATISTICS ====================
/**
 * Get order statistics for a seller
 * GET /api/orders/seller/stats
 * SECURITY: Requires authenticated user - retrieves their own statistics
 */
router.get('/seller/stats', verifyToken, getOrderStats);

export default router;
