import express from 'express';
import PostingFee from '../model/PostingFee.js';
import { createCarPost } from '../controller/CarPostController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { VNPay } from 'vnpay';
import dotenv from 'dotenv';

dotenv.config();

const postingFeeRouter = express.Router();

// Initialize VNPay
const vnpayInstance = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
  testMode: true,
  hashAlgorithm: 'SHA512',
});

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

    if (!postingFeeId) {
      return res.status(400).json({
        success: false,
        message: 'Posting fee ID is required',
      });
    }

    const postingFee = await PostingFee.findById(postingFeeId);

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

    // Build payment URL
    const paymentUrl = vnpayInstance.buildPaymentUrl({
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Posting Fee - Car Listing`,
      vnp_Amount: postingFee.amount,
      vnp_ReturnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/posting-fee-return`,
      vnp_IpAddr: req.ip,
    });

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

// Handle VNPay return for posting fee
postingFeeRouter.get('/pay/return', async (req, res) => {
  try {
    const vnp_ResponseCode = req.query.vnp_ResponseCode;
    const vnp_TxnRef = req.query.vnp_TxnRef;
    const vnp_Amount = req.query.vnp_Amount;
    const vnp_TransactionNo = req.query.vnp_TransactionNo;
    const vnp_BankCode = req.query.vnp_BankCode;
    const vnp_PayDate = req.query.vnp_PayDate;

    // Extract posting fee ID from transaction ref
    // Format: POSTFEE_{postingFeeId}_{timestamp}
    const postingFeeId = vnp_TxnRef.split('_')[1];

    const postingFee = await PostingFee.findById(postingFeeId);

    if (!postingFee) {
      return res.status(404).json({
        success: false,
        message: 'Posting fee not found',
      });
    }

    if (vnp_ResponseCode === '00') {
      // Payment successful
      await PostingFee.findByIdAndUpdate(
        postingFeeId,
        {
          paymentStatus: 'paid',
          'paymentDetails.responseCode': vnp_ResponseCode,
          'paymentDetails.transactionId': vnp_TransactionNo,
          'paymentDetails.bankCode': vnp_BankCode,
          'paymentDetails.paymentTime': new Date(),
        },
        { new: true }
      );

      // Auto-create the car post after payment
      try {
        await createCarPost(
          {
            body: { postingFeeId },
          },
          {
            status: () => ({
              json: (response) => {
                console.log('Car post created:', response);
              },
            }),
          }
        );
      } catch (error) {
        console.error('Error creating car post after payment:', error);
        // Continue anyway - user can retry
      }

      res.status(200).json({
        success: true,
        message: 'Payment successful',
        data: {
          postingFeeId,
          paymentStatus: 'paid',
          responseCode: vnp_ResponseCode,
        },
      });
    } else {
      // Payment failed
      await PostingFee.findByIdAndUpdate(
        postingFeeId,
        {
          paymentStatus: 'failed',
          'paymentDetails.responseCode': vnp_ResponseCode,
        },
        { new: true }
      );

      res.status(400).json({
        success: false,
        message: `Payment failed. Code: ${vnp_ResponseCode}`,
        data: {
          postingFeeId,
          paymentStatus: 'failed',
          responseCode: vnp_ResponseCode,
        },
      });
    }
  } catch (error) {
    console.error('Error handling posting fee return:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment return',
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
