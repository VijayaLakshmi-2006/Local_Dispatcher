import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { 
    type: String, 
    required: true,
    enum: ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Beverages', 'Snacks', 'Household', 'Pharmacy', 'Electronics', 'Fast Food', 'Supermarket']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  isOpen: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 15 }, // in minutes
  operatingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' }
  },
  contactInformation: {
    phone: { type: String },
    email: { type: String }
  },
  rating: { type: Number, default: 5.0 },
  ratingsCount: { type: Number, default: 0 }
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);
export default Store;
