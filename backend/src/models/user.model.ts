import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const RefreshTokenSchema = new Schema<IUser["refreshTokens"][number]>(
  {
    token: {
      type: String,
      required: [true, "Refresh token is required"],
    },

    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },

    userAgent: {
      type: String,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, // Prevents creation of an _id field for subdocuments
  },
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar_url: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [RefreshTokenSchema],
      default: [],
      select: false, // Exclude refresh tokens from query results by default
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
