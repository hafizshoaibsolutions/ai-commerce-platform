import { Document, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  amount: number;
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  method:
    "credit_card" | "paypal" | "stripe" | "bank_transfer" | "cash_on_delivery";
}
