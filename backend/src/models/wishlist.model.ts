import mongoose, { Schema } from "mongoose";
import { IWishlist } from "../interfaces/wishlist.interface";

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Faster lookup by user
WishlistSchema.index({ userId: 1 });

// Prevent duplicate products in the same wishlist
WishlistSchema.index({ userId: 1, productIds: 1 }, { unique: true });

const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
