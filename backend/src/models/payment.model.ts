import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"],
    },

    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    transactionId:{
        type: String,
        required: false,
    },
    method: {
        type: String,
        enum: ["credit_card", "paypal", "stripe","bank_transfer", "cash_on_delivery"],
        required: true,
    },

});