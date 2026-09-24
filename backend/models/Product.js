import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Beverages', 'Snacks', 'Household', 'Pharmacy', 'Electronics', 'Fast Food']
  },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 }, // in percentage
  stock: { type: Number, required: true, default: 0, min: 0 },
  image: { type: String, default: '' },
  brand: { type: String, default: 'Generic' },
  unit: { type: String, default: 'unit' }, // e.g. "Kg", "g", "Pack", "Litre"
  storeInventory: [{
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    stock: { type: Number, default: 0 },
    price: { type: Number },
    isAvailable: { type: Boolean, default: true }
  }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
