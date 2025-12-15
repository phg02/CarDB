import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20,
    default: null,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Email verification
  verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpire: {
    type: Date,
    default: null,
  },
  // Password reset
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpire: {
    type: Date,
    default: null,
  },
  // User relationships
  watchlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarPost',
    },
  ],
  purchasingList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarPost',
    },
  ],
  sellingList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarPost',
    },
  ],
  paymentHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  ],
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
