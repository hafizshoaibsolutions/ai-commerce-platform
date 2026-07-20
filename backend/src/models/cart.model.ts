import mongoose, { Schema } from "mongoose";
import { ICart } from "../interfaces/cart.interface";

const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    cartItems: [CartItemSchema],
      
  },
  {
    timestamps: true,
  }
);

CartSchema.index({ userId: 1 });

const Cart = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;