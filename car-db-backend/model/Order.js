import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Customer Reference
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Billing Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Billing Address
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: "VN",
    },
    zipCode: {
      type: String,
      trim: true,
    },

    // Order Items
    items: [
      {
        carPost: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CarPost",
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        title: String,
        price: Number, // Price in VND
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    // Payment Information (VNPay Integration)
    total: {
      type: Number,
      required: true, // Amount in VND
    },
    paymentMethod: {
      type: String,
      enum: ["vnpay", "bank_transfer", "cash"],
      default: "vnpay",
    },
    paymentId: {
      type: String, // VNPay transaction reference (vnp_TxnRef)
      unique: true,
      sparse: true,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    paymentDetails: {
      responseCode: String, // VNPay response code (00 = success)
      transactionId: String, // VNPay transaction ID (vnp_TransactionNo)
      bankCode: String, // Bank code from VNPay
      bankTmnCode: String, // Bank terminal code
      paymentTime: Date, // Payment completion time
    },

    // Order Status
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Notes
    notes: {
      type: String,
      trim: true,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
orderSchema.index({ customer: 1, createdAt: -1 });

orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "items.carPost": 1 });

export default mongoose.model("Order", orderSchema);
