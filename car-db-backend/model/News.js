import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // main content (text, HTML, etc.)
    content: {
      type: String,
      required: true,
    },

    // Cover image (optional)
    thumbnail: {
      type: String,
      default: null,
    },

    // Additional inline images inside the news content
    images: [String],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);