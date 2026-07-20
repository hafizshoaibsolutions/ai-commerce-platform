import { Document, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;

  orderItems: IOrderItem[];

  shippingAddressId: Types.ObjectId;

  subtotal: number;
  shippingFee: number;
  totalAmount: number;

  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  paymentMethod: "cod" | "card" | "online";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  createdAt: Date;
  updatedAt: Date;
}