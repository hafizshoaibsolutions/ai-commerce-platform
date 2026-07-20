import mongoose, { Schema } from "mongoose";
import { IReview } from "../interfaces/review.interface";

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent one user from reviewing the same product multiple times
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Faster product review queries
ReviewSchema.index({ productId: 1 });

const Review = mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
