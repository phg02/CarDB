import mongoose from "mongoose";

const carPostSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vin: {
      type: String,
      trim: true,
    },

    heading: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    miles: {
      type: Number,
      required: true,
    },

    carfax_clean_title: { type: Boolean, default: false },

    inventory_type: {
      type: String,
      enum: ["new", "used"],
      default: "used",
    },

    // Images
    photo_links: [String],

    // Dealer (address only)
    dealer: {
      street: String,
      city: String,
      state: String,
      country: String,
    },

    // Build info (flattened)
    year: Number,
    make: String,
    model: String,
    trim: String,
    version: String,
    body_type: {
      type: String,
      enum: ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Wagon', 'Convertible'],
    },
    body_subtype: String,
    vehicle_type: String,
    transmission: String,
    drivetrain: String,
    fuel_type: {
      type: String,
      enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'],
    },
    engine: String,
    engine_size: Number,
    engine_block: String,
    doors: Number,
    cylinders: Number,
    made_in: String,
    exterior_color: String,
    interior_color: String,
    base_int_color: String,
    base_ext_color: String,
    overall_height: Number,
    overall_length: Number,
    overall_width: Number,
    std_seating: Number,
    highway_mpg: Number,
    city_mpg: Number,


    // Payment and Approval Status
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    }, // Payment status: unpaid (waiting for payment) or paid (payment received, waiting for admin verification)
    verified: { type: Boolean, default: false }, // Admin approval status (only true if post is paid AND admin verified)
    rejectionReason: { type: String, default: null }, // Reason if rejected
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Admin who approved
    approvedAt: { type: Date, default: null },
    sold: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["Available", "Sold"],
      default: "Available",
    },

    // Soft delete fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("CarPost", carPostSchema);
