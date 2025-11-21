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

    carfax_1_owner: { type: Boolean, default: false },
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
    body_type: String,
    body_subtype: String,
    vehicle_type: String,
    transmission: String,
    drivetrain: String,
    fuel_type: String,
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
    overall_height: String,
    overall_length: String,
    overall_width: String,
    std_seating: String,
    highway_mpg: Number,
    city_mpg: Number,
    powertrain_type: String,

    // Status fields
    verified: { type: Boolean, default: false },
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
