const mongoose = require('mongoose');

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
  otp: String,
  otpExpire: Date,
  verified: {
    type: Boolean,
    default: false,
  },
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

module.exports = User;
