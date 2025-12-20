import express from 'express';
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import Order from '../model/Order.js';
import PostingFee from '../model/PostingFee.js';
import { updatePaymentDetailsVNPay } from '../controller/OrderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ==================== CREATE CHECKOUT SESSION ====================
/**
 * Create VNPay payment URL for order/posting fee checkout
 * @route POST /api/payments/vnpay/create-checkout
 * Body: {
 *   orderId: "order_id or postingFeeId",
 *   type?: "order" | "posting_fee" (auto-detect if not provided),
 *   billingInfo?: { firstName, lastName, email, phone, address, city, state, country, zipCode }
 * }
 */
router.post('/vnpay/create-checkout', verifyToken, async (req, res) => {
  try {
    const { orderId, type } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID or Posting Fee ID is required",
      });
    }

    let amountInVND;
    let paymentType = type || 'posting_fee'; // Default to posting_fee
    let paymentRecord;

    // Try to find as PostingFee first (most common case)
    if (paymentType === 'posting_fee' || !paymentType) {
      paymentRecord = await PostingFee.findById(orderId);
      if (paymentRecord) {
        amountInVND = paymentRecord.amount;
        paymentType = 'posting_fee';
      }
    }

    // If not found as PostingFee, try as Order
    if (!paymentRecord) {
      paymentRecord = await Order.findById(orderId);
      if (paymentRecord) {
        amountInVND = paymentRecord.total;
        paymentType = 'order';
      }
    }

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: "Order or Posting Fee not found",
      });
    }

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

    // Extract ID from txnRef (format: id-timestamp)
    const recordId = vnp_TxnRef.split('-')[0];

    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction reference',
      });
    }

    // Try to find as PostingFee first
    let record = await PostingFee.findById(recordId);
    let recordType = 'posting_fee';

    // If not found, try as Order
    if (!record) {
      record = await Order.findById(recordId);
      recordType = 'order';
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Handle payment response
    if (vnp_ResponseCode === '00') {
      // Payment successful
      record.paymentStatus = recordType === 'posting_fee' ? 'paid' : true;
      if (recordType === 'order') {
        record.orderStatus = 'confirmed';
      }
      record.paymentId = vnp_TxnRef;
      record.paymentDetails = {
        responseCode: vnp_ResponseCode,
        transactionId: vnp_TransactionNo,
        bankCode: vnp_BankCode,
        bankTmnCode: vnp_BankTmnCode,
        paymentTime: new Date(),
      };

      await record.save();

      res.status(200).json({
        success: true,
        message: 'Payment successful',
        data: {
          recordId,
          recordType,
          paymentStatus: 'success',
        },
      });
    } else {
      // Payment failed
      record.paymentStatus = recordType === 'posting_fee' ? 'failed' : false;
      if (recordType === 'order') {
        record.orderStatus = 'cancelled';
      }
      record.paymentDetails = {
        responseCode: vnp_ResponseCode,
        transactionId: vnp_TransactionNo,
        bankCode: vnp_BankCode,
        paymentTime: new Date(),
      };

      await record.save();

      res.status(200).json({
        success: false,
        message: 'Payment failed',
        data: {
          recordId,
          recordType,
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
 * Verify payment status for an order or posting fee
 * @route GET /api/payments/vnpay/verify/:recordId
 */
router.get('/vnpay/verify/:recordId', verifyToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    // Try to find as PostingFee first
    let record = await PostingFee.findById(recordId);
    let recordType = 'posting_fee';

    // If not found, try as Order
    if (!record) {
      record = await Order.findById(recordId);
      recordType = 'order';
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status retrieved',
      data: {
        recordId,
        recordType,
        paymentStatus: record.paymentStatus,
        orderStatus: record.orderStatus || record.paymentStatus,
        paymentDetails: record.paymentDetails,
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
