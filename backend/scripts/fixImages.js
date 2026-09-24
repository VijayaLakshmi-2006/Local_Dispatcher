import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const categoryImages = {
  Groceries: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'],
  Vegetables: ['https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80'],
  Fruits: ['https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=400&q=80'],
  Electronics: ['https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1550009158-9effb64fda70?auto=format&fit=crop&w=400&q=80'],
  Pharmacy: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80'],
  Dairy: ['https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'],
  Snacks: ['https://images.unsplash.com/photo-1566478989037-eec170784d20?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80'],
  Beverages: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80'],
  Household: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80'],
  'Fast Food': ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80']
};

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyperlocal-dispatcher');
    console.log('Connected to MongoDB for fixing images...');

    const products = await Product.find({ image: { $regex: 'source.unsplash.com' } });
    console.log("Found " + products.length + " products with broken Unsplash source URLs.");

    for (let product of products) {
      const images = categoryImages[product.category] || categoryImages['Groceries'];
      product.image = images[Math.floor(Math.random() * images.length)];
      await product.save();
    }
    
    console.log('Successfully fixed product images!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing images:', error.message);
    process.exit(1);
  }
};

fixImages();
