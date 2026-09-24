import mongoose from 'mongoose';
import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('Admin seeding skipped: ADMIN_EMAIL or ADMIN_PASSWORD not configured.');
      return;
    }

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        phone: '9999999999',
        password: adminPassword, // Will be hashed automatically by pre-save middleware
        role: 'admin',
        status: 'active',
        isActive: true
      });
      console.log(`Admin seeded successfully: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
