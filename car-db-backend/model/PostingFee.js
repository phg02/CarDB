import mongoose from 'mongoose';

const postingFeeSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Car post data (temporary storage until payment)
  carData: {
    type: Object,
    required: true,
  },
  
  // Photo links (if uploaded before payment)
  photoLinks: [String],
  
  // Payment info
  amount: {
    type: Number,
    default: 15000, // 15,000 VND
  },
  
  // VNPay details
  paymentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  
  paymentDetails: {
    responseCode: String,
    transactionId: String,
    bankCode: String,
    bankTmnCode: String,
    paymentTime: Date,
  },
  
  // After successful payment, link to created car post
  carPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarPost',
    default: null,
  },
  
  // Expiry - posting fee is valid for 24 hours
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  },
  
  isDeleted: {
    type: Boolean,
    default: false,
  },
  
}, { timestamps: true });

// Auto-delete expired pending payments after 24 hours
postingFeeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PostingFee = mongoose.model('PostingFee', postingFeeSchema);

export default PostingFee;
