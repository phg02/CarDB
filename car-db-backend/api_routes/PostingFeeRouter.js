import express from 'express';
import PostingFee from '../model/PostingFee.js';
import { createCarPost } from '../controller/CarPostController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import dotenv from 'dotenv';

dotenv.config();

const postingFeeRouter = express.Router();

// GET posting fee info
postingFeeRouter.get('/:postingFeeId', verifyToken, async (req, res) => {
  try {
    const { postingFeeId } = req.params;

    const postingFee = await PostingFee.findById(postingFeeId).populate('seller', 'name email');
    
    if (!postingFee) {
      return res.status(404).json({
        success: false,
        message: 'Posting fee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Posting fee retrieved successfully',
      data: {
        postingFeeId: postingFee._id,
        seller: postingFee.seller,
        amount: postingFee.amount,
        paymentStatus: postingFee.paymentStatus,
        carData: postingFee.carData,
      },
    });
  } catch (error) {
    console.error('Error fetching posting fee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posting fee',
      error: error.message,
    });
  }
});

// Create VNPay checkout for posting fee
postingFeeRouter.post('/pay/checkout', verifyToken, async (req, res) => {
  try {
    const { postingFeeId } = req.body;
    console.log('PostingFee checkout called with:', req.body);

    if (!postingFeeId) {
      return res.status(400).json({
        success: false,
        message: 'Posting fee ID is required',
      });
    }

    const postingFee = await PostingFee.findById(postingFeeId);
    console.log('Found posting fee:', postingFee);

    if (!postingFee) {
      return res.status(404).json({
        success: false,
        message: 'Posting fee not found',
      });
    }

    if (postingFee.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This posting fee has already been paid',
      });
    }

    // Generate unique transaction reference
    const txnRef = `POSTFEE_${postingFee._id}_${Date.now()}`;

    // Create VNPay instance for this request
    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE,
      secureSecret: process.env.VNPAY_HASH_SECRET,
      vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
      testMode: process.env.NODE_ENV !== 'production',
      hashAlgorithm: 'SHA512',
      loggerFn: ignoreLogger,
    });

    const createDate = new Date();

    // Build payment URL
    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: postingFee.amount,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Posting Fee - Car Listing`,
      vnp_OrderType: ProductCode.Other,
      vnp_Locale: VnpLocale.VN,
      vnp_ReturnUrl: `http://localhost:3000/api/payments/vnpay/return`,
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(new Date(createDate.getTime() + 15 * 60 * 1000)), // 15 minutes
    });

    console.log('Generated payment URL:', paymentUrl);

    // Store transaction ref in posting fee
    await PostingFee.findByIdAndUpdate(
      postingFeeId,
      { paymentId: txnRef },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payment URL created successfully',
      data: {
        url: paymentUrl,
        postingFeeId,
        amount: postingFee.amount,
      },
    });
  } catch (error) {
    console.error('Error creating posting fee payment URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment URL',
      error: error.message,
    });
  }
});

// Verify payment status
postingFeeRouter.get('/verify/:postingFeeId', verifyToken, async (req, res) => {
  try {
    const { postingFeeId } = req.params;

    const postingFee = await PostingFee.findById(postingFeeId).populate('carPost');

    if (!postingFee) {
      return res.status(404).json({
        success: false,
        message: 'Posting fee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status retrieved',
      data: {
        postingFeeId,
        paymentStatus: postingFee.paymentStatus,
        carPost: postingFee.carPost,
        paymentDetails: postingFee.paymentDetails,
      },
    });
  } catch (error) {
    console.error('Error verifying posting fee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
});

export default postingFeeRouter;
