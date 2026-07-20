import { Document, Types } from "mongoose";

export interface IAddress extends Document {
  userId: Types.ObjectId;
  title: string;
  shippingAddressPhoneNumber:string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}