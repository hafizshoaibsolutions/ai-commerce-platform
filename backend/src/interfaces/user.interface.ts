import { Document } from "mongoose";

export interface IRefreshToken {
  token: string;
  expiresAt: Date;
  userAgent?: string;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  phone?: string;
  avatar_url?: string;

  role: "customer" | "admin";

  isActive: boolean;
  isEmailVerified: boolean;

  lastLogin?: Date;
  refreshTokens: IRefreshToken[];

  createdAt: Date;
  updatedAt: Date;
}
