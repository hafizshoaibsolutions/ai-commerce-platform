import mongoose, { Schema } from "mongoose";
import { ICategory } from "../interfaces/category.interface";

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    image_url: {
      type: String,
      trim: true,
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// PERFORMANCE INDEXES
// ==========================================
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent_id: 1 });
CategorySchema.index({ isActive: 1 });

const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
    