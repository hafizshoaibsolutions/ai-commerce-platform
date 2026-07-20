import mongoose, { Schema } from "mongoose";
import { IOrder } from "../interfaces/order.interface";



const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    variant:{
      type: Map,
      of: String,
      default: {},
    },


    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [OrderItemSchema],

    shippingAddressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "card", "online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Faster user order queries
OrderSchema.index({ userId: 1 });

// Faster order status queries
OrderSchema.index({ status: 1 });

// Faster payment queries
OrderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;