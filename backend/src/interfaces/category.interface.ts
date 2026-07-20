import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image_url?: string;
  parent_id?: Types.ObjectId | null;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}