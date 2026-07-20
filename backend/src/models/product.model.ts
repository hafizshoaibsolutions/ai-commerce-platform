import mongoose, { Schema, model } from "mongoose";
import {
  IAttribute,
  IImage,
  IProduct,
  IShipping,
  IVariant,
  IVariantOption,
} from "../interfaces/product.interface";

const AttributeSchema = new Schema<IAttribute>(
  {
    key: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    value: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const ShippingSchema = new Schema<IShipping>(
  {
    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    length: {
      type: Number,
      required: true,
      min: 0,
    },

    width: {
      type: Number,
      required: true,
      min: 0,
    },

    height: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["metric", "imperial"],
      default: "metric",
    },
  },
  {
    _id: false,
  },
);

const ImageSchema = new Schema<IImage>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    alt: {
      type: String,
      default: "",
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const VariantOptionSchema = new Schema<IVariantOption>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const VariantSchema = new Schema<IVariant>(
  {
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    barcode: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    images: {
      type: [ImageSchema],
      default: [],
    },

    options: {
      type: [VariantOptionSchema],
      default: [],
    },

    shipping: {
      type: ShippingSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    images: {
      type: [ImageSchema],
      validate: [
        (images: IImage[]) => images.length > 0,
        "Product must have at least one image",
      ],
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    categoryIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
      ],
      validate: [
        (categories: mongoose.Types.ObjectId[]) => categories.length > 0,
        "Product must belong to at least one category",
      ],
    },

    globalAttributes: {
      type: [AttributeSchema],
      default: [],
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    variants: {
      type: [VariantSchema],
      validate: [
        (variants: IVariant[]) => variants.length > 0,
        "Product must have at least one variant",
      ],
    },

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: [String],
      default: [],
    },

    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({ slug: 1 });

ProductSchema.index({
  brandId: 1,
  status: 1,
});

ProductSchema.index({
  categoryIds: 1,
  status: 1,
});

ProductSchema.index({
  "globalAttributes.key": 1,
  "globalAttributes.value": 1,
});

ProductSchema.index({
  "variants.sku": 1,
});

ProductSchema.index({
  name: "text",
  description: "text",
  shortDescription: "text",
});

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
