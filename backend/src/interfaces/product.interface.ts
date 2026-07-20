import { Types } from "mongoose";

export interface IImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
}

export interface IAttribute {
  key: string;
  value: string;
  label: string;
}

export interface IShipping {
  weight: number;
  length: number;
  width: number;
  height: number;
  unit: "metric" | "imperial";
}

export interface IVariantOption {
  name: string;
  value: string;
}

export interface IVariant {
  sku: string;
  barcode?: string;

  price: number;
  compareAtPrice?: number;
  costPrice?: number;

  stock: number;

  images: IImage[];

  options: IVariantOption[];

  shipping: IShipping;
}

export interface IRating {
  average: number;
  count: number;
}

export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface IProduct {
  name: string;

  slug: string;

  description: string;

  shortDescription?: string;

  images: IImage[];

  brandId: Types.ObjectId;

  categoryIds: Types.ObjectId[];

  globalAttributes: IAttribute[];

  specifications: Map<string, string>;

  variants: IVariant[];

  status: "draft" | "active" | "archived";

  isFeatured: boolean;

  tags?: string[];

  ratings: IRating;

  seo?: ISEO;

  createdAt?: Date;

  updatedAt?: Date;
}
