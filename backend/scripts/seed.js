import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import DeliveryAgent from '../models/DeliveryAgent.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import DispatchLog from '../models/DispatchLog.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hyperlocal-dispatcher');
    console.log('MongoDB connected for seeding');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();
  console.log('Starting idempotent seed process...');

  const passwordHash = await bcrypt.hash('Demo@123', 10);

  // 1. Seed Users (1 admin, 2 customers, 4 agents)
  console.log('Seeding Users...');
  const admin = await User.findOneAndUpdate(
    { email: 'admin@demo.com' },
    { name: 'Demo Admin', password: passwordHash, role: 'admin', phone: '9999999990', isActive: true, status: 'active' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const customer1 = await User.findOneAndUpdate(
    { email: 'customer@demo.com' },
    { 
      name: 'Demo Customer', 
      password: passwordHash, 
      role: 'customer', 
      phone: '8888888881', 
      isActive: true, 
      status: 'active',
      location: { latitude: 17.3850, longitude: 78.4867 }, // Hyderabad
      addresses: [{
        name: 'Home', phone: '8888888881', houseNumber: '123', street: 'MG Road',
        city: 'Hyderabad', state: 'Telangana', pincode: '500001', isDefault: true
      }]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const customer2 = await User.findOneAndUpdate(
    { email: 'customer2@demo.com' },
    { name: 'Second Customer', password: passwordHash, role: 'customer', phone: '8888888882', isActive: true, status: 'active' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const agentEmails = ['agent@demo.com', 'agent2@demo.com', 'agent3@demo.com', 'agent4@demo.com'];
  const agents = [];
  for (let i = 0; i < agentEmails.length; i++) {
    const agentUser = await User.findOneAndUpdate(
      { email: agentEmails[i] },
      { name: `Demo Agent ${i+1}`, password: passwordHash, role: 'delivery_agent', phone: `777777777${i}`, isActive: true, status: 'active' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    agents.push(agentUser);
  }

  console.log('Seeding Stores...');
  const storesData = [
    { name: 'Hyderabad FreshMart', category: 'Supermarket', address: { street: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' }, location: { lat: 17.4156, lng: 78.4396 }, preparationTime: 10, isActive: true, isOpen: true },
    { name: 'City Grocers', category: 'Groceries', address: { street: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' }, location: { lat: 17.4311, lng: 78.4069 }, preparationTime: 15, isActive: true, isOpen: true },
    { name: 'Quick Pharmacy', category: 'Pharmacy', address: { street: 'Madhapur', city: 'Hyderabad', state: 'Telangana', pincode: '500081' }, location: { lat: 17.4483, lng: 78.3915 }, preparationTime: 5, isActive: true, isOpen: true }
  ];

  const stores = [];
  for (const s of storesData) {
    const store = await Store.findOneAndUpdate(
      { name: s.name },
      s,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    stores.push(store);
  }

  console.log('Seeding Delivery Agents...');
  const agentDetails = [
    { lat: 17.3850, lng: 78.4867, active: 0, rating: 4.9, accept: 98 },
    { lat: 17.4156, lng: 78.4396, active: 1, rating: 4.5, accept: 85 },
    { lat: 17.4311, lng: 78.4069, active: 2, rating: 4.0, accept: 70 },
    { lat: 17.4483, lng: 78.3915, active: 0, rating: 4.2, accept: 90 },
  ];

  for (let i = 0; i < agents.length; i++) {
    await DeliveryAgent.findOneAndUpdate(
      { user: agents[i]._id },
      {
        name: agents[i].name,
        email: agents[i].email,
        phone: agents[i].phone,
        approvalStatus: 'approved',
        isOnline: true,
        isAvailable: agentDetails[i].active < 2,
        currentLocation: { lat: agentDetails[i].lat, lng: agentDetails[i].lng },
        rating: agentDetails[i].rating,
        acceptanceRate: agentDetails[i].accept,
        activeOrders: agentDetails[i].active,
        maximumActiveOrders: 3
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Seeding Products...');
  const productsData = [
    // Grocery
    { name: 'Basmati Rice', category: 'Groceries', price: 120, unit: '1 Kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c' },
    { name: 'Wheat Flour (Atta)', category: 'Groceries', price: 250, unit: '5 Kg', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff' },
    { name: 'Toor Dal', category: 'Groceries', price: 150, unit: '1 Kg', image: 'https://images.unsplash.com/photo-1585641775734-71bcff43195f' },
    { name: 'Sunflower Cooking Oil', category: 'Groceries', price: 180, unit: '1 Litre', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5' },
    { name: 'Refined Sugar', category: 'Groceries', price: 45, unit: '1 Kg', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b' },
    { name: 'Iodized Salt', category: 'Groceries', price: 25, unit: '1 Kg', image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca' },
    { name: 'Toned Milk', category: 'Dairy', price: 30, unit: '500 ml', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150' },
    { name: 'Fresh Curd', category: 'Dairy', price: 40, unit: '500 g', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777' },
    { name: 'Cottage Cheese (Paneer)', category: 'Dairy', price: 90, unit: '200 g', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777' },
    { name: 'Farm Fresh Eggs', category: 'Groceries', price: 70, unit: '12 units', image: 'https://images.unsplash.com/photo-1506976785307-8732eca9c2a9' },
    { name: 'Whole Wheat Bread', category: 'Groceries', price: 45, unit: '1 pack', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff' },
    { name: 'Assam Tea Leaves', category: 'Groceries', price: 120, unit: '250 g', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b' },
    { name: 'Instant Coffee', category: 'Groceries', price: 150, unit: '50 g', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b' },
    
    // Vegetables
    { name: 'Fresh Tomato', category: 'Vegetables', price: 30, unit: '1 Kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655' },
    { name: 'Fresh Potato', category: 'Vegetables', price: 25, unit: '1 Kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655' },
    { name: 'Red Onion', category: 'Vegetables', price: 35, unit: '1 Kg', image: 'https://images.unsplash.com/photo-1508747703725-719777637510' },
    { name: 'Fresh Carrot', category: 'Vegetables', price: 40, unit: '500 g', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655' },
    { name: 'Green Capsicum', category: 'Vegetables', price: 45, unit: '500 g', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655' },

    // Snacks & Party
    { name: 'Digestive Biscuits', category: 'Snacks', price: 50, unit: '1 pack', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35' },
    { name: 'Salted Potato Chips', category: 'Snacks', price: 20, unit: '1 pack', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d20' },
    { name: 'Mini Samosa Pack', category: 'Snacks', price: 60, unit: '250 g', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950' },
    { name: 'Namkeen Mixture', category: 'Snacks', price: 80, unit: '400 g', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950' },
    { name: 'Cola Soft Drink', category: 'Beverages', price: 40, unit: '750 ml', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97' },
    { name: 'Mixed Fruit Juice', category: 'Beverages', price: 110, unit: '1 Litre', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97' },
    { name: 'Chocolate Chip Cookies', category: 'Snacks', price: 70, unit: '1 pack', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35' },
    { name: 'Chocolate Cake', category: 'Snacks', price: 400, unit: '500 g', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35' },
    { name: 'Disposable Plates', category: 'Household', price: 50, unit: '25 units', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f' },
    { name: 'Disposable Cups', category: 'Household', price: 30, unit: '25 units', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f' },
    { name: 'Paper Napkins', category: 'Household', price: 40, unit: '100 units', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f' }
  ];

  for (const pd of productsData) {
    let assignedStores = [];
    if (pd.category === 'Pharmacy') assignedStores.push(stores[2]);
    else if (pd.category === 'Vegetables' || pd.category === 'Dairy') assignedStores.push(stores[0], stores[1]);
    else assignedStores.push(stores[0], stores[1]); // supermarkets have most things

    const storeInventory = assignedStores.map(st => ({
      store: st._id,
      stock: Math.floor(Math.random() * 50) + 10,
      price: pd.price,
      isAvailable: true
    }));

    await Product.findOneAndUpdate(
      { name: pd.name },
      {
        ...pd,
        description: `Premium quality ${pd.name}`,
        stock: 100,
        storeInventory
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Seed completed successfully!');
  process.exit(0);
};

seedDatabase();
