import express from 'express';
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import Order from '../model/Order.js';
import { updatePaymentDetailsVNPay } from '../controller/OrderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ==================== CREATE CHECKOUT SESSION ====================
/**
 * Create VNPay payment URL for order checkout
 * @route POST /api/payments/vnpay/create-checkout
 * Body: {
 *   orderId: "order_id",
 *   billingInfo?: { firstName, lastName, email, phone, address, city, state, country, zipCode }
 * }
 */
router.post('/vnpay/create-checkout', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Get order to retrieve amount
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Amount should already be in VND (database stores in VND)
    const amountInVND = order.total;

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE,
      secureSecret: process.env.VNPAY_HASH_SECRET,
      vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
      testMode: process.env.NODE_ENV !== 'production',
      hashAlgorithm: 'SHA512',
      loggerFn: ignoreLogger,
    });

    const createDate = new Date();
    const txnRef = `${orderId}-${createDate.getTime()}`;

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: amountInVND,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `CarDB Order #${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_Locale: VnpLocale.VN,
      vnp_ReturnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/vnpay-return`,
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(new Date(createDate.getTime() + 15 * 60 * 1000)), // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: "Payment URL created successfully",
      data: {
        url: vnpayResponse,
        orderId,
        amount: amountInVND,
      },
    });
  } catch (error) {
    console.error('Error creating payment URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment URL',
      error: error.message,
    });
  }
});

// ==================== VNPAY RETURN HANDLER ====================
/**
 * Handle VNPay return callback
 * @route GET /api/payments/vnpay/return
 * Query params: vnp_Amount, vnp_BankCode, vnp_OrderInfo, vnp_ResponseCode, vnp_TxnRef, etc.
 */
router.get('/vnpay/return', async (req, res) => {
  try {
    const {
      vnp_ResponseCode,
      vnp_TxnRef,
      vnp_Amount,
      vnp_BankCode,
      vnp_BankTmnCode,
      vnp_TransactionNo,
      vnp_PayDate,
    } = req.query;

    // Extract orderId from txnRef (format: orderId-timestamp)
    const orderId = vnp_TxnRef.split('-')[0];

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction reference',
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Handle payment response
    if (vnp_ResponseCode === '00') {
      // Payment successful
      order.paymentStatus = true;
      order.orderStatus = 'confirmed';
      order.paymentId = vnp_TxnRef;
      order.paymentDetails = {
        responseCode: vnp_ResponseCode,
        transactionId: vnp_TransactionNo,
        bankCode: vnp_BankCode,
        bankTmnCode: vnp_BankTmnCode,
        paymentTime: new Date(),
      };

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Payment successful',
        data: {
          orderId,
          paymentStatus: 'success',
          order,
        },
      });
    } else {
      // Payment failed
      order.paymentStatus = false;
      order.orderStatus = 'cancelled';
      order.paymentDetails = {
        responseCode: vnp_ResponseCode,
        transactionId: vnp_TransactionNo,
        bankCode: vnp_BankCode,
        paymentTime: new Date(),
      };

      await order.save();

      res.status(200).json({
        success: false,
        message: 'Payment failed',
        data: {
          orderId,
          paymentStatus: 'failed',
          responseCode: vnp_ResponseCode,
        },
      });
    }
  } catch (error) {
    console.error('Error processing VNPay return:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment return',
      error: error.message,
    });
  }
});

// ==================== VERIFY PAYMENT STATUS ====================
/**
 * Verify payment status for an order
 * @route GET /api/payments/vnpay/verify/:orderId
 */
router.get('/vnpay/verify/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status retrieved',
      data: {
        orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        paymentDetails: order.paymentDetails,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
});

export default router;
