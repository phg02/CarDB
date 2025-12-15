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
 * Get order by ID
 * GET /api/orders/:id
 */
router.get('/:id', getOrderById);

/**
 * Get all orders for a customer
 * GET /api/orders/customer/:customerId
 * Query: page, limit
 */
router.get('/customer/:customerId', getCustomerOrders);

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
 * GET /api/orders/seller/:sellerId/stats
 */
router.get('/seller/:sellerId/stats', getOrderStats);

export default router;
