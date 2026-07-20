import { Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo_url?: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
