import mongoose, { Schema } from "mongoose";
import { IBrand } from "../interfaces/brand.interface";

const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Brand slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo_url: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// PERFORMANCE INDEXES
// ==========================================
BrandSchema.index({ slug: 1 });
BrandSchema.index({ isActive: 1 });

const Brand = mongoose.model<IBrand>("Brand", BrandSchema);

export default Brand;
