import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, default: 'Home', trim: true },
  streetAddress: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// Indexing by userId allows you to instantly pull a user's addresses directly from this table
AddressSchema.index({ userId: 1 });

const Address = mongoose.model('Address', AddressSchema);
export default Address;
