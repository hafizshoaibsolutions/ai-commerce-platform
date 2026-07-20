import { Document } from "mongoose";

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

  createdAt: Date;
  updatedAt: Date;
}