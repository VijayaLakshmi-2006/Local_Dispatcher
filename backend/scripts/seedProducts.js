import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';
import DeliveryAgent from '../models/DeliveryAgent.js';

dotenv.config();

const products = [
  // Groceries
  {
    name: 'India Gate Basmati Rice Premium',
    description: 'High-quality aged basmati rice, perfect for biryani and pulav.',
    category: 'Groceries',
    price: 130,
    discount: 10,
    stock: 50,
    unit: '1 Kg',
    brand: 'India Gate',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Standard Basmati Rice',
    description: 'Affordable long grain basmati rice for daily use.',
    category: 'Groceries',
    price: 90,
    discount: 0,
    stock: 100,
    unit: '1 Kg',
    brand: 'Fortune',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fortune Soyabean Oil',
    description: 'Refined soyabean cooking oil, rich in Vitamin A & D.',
    category: 'Groceries',
    price: 140,
    discount: 5,
    stock: 40,
    unit: '1 Litre',
    brand: 'Fortune',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Everest Biryani Masala',
    description: 'Perfect blend of spices for making authentic aromatic biryani.',
    category: 'Groceries',
    price: 80,
    discount: 0,
    stock: 60,
    unit: '50 g',
    brand: 'Everest',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Aashirvaad Shudh Chakki Atta',
    description: '100% stone-ground whole wheat flour for soft rotis.',
    category: 'Groceries',
    price: 260,
    discount: 8,
    stock: 35,
    unit: '5 Kg',
    brand: 'Aashirvaad',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Organic Sugar',
    description: 'Unrefined healthy sugarcane sugar.',
    category: 'Groceries',
    price: 60,
    discount: 0,
    stock: 80,
    unit: '1 Kg',
    brand: 'Tata',
    image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Tata Salt Lite',
    description: 'Iodized low sodium salt.',
    category: 'Groceries',
    price: 28,
    discount: 0,
    stock: 120,
    unit: '1 Kg',
    brand: 'Tata',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Pizza Base Combo',
    description: 'Pack of 2 soft pizza bases.',
    category: 'Groceries',
    price: 45,
    discount: 0,
    stock: 30,
    unit: '2 units',
    brand: 'Harvest Gold',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Dr. Oetker Pizza Sauce',
    description: 'Spicy and tangy tomato sauce for pizza bases.',
    category: 'Groceries',
    price: 99,
    discount: 15,
    stock: 45,
    unit: '200 g',
    brand: 'Dr. Oetker',
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Chicken',
    description: 'Fresh, clean and tender raw chicken curry cut.',
    category: 'Groceries',
    price: 220,
    discount: 5,
    stock: 50,
    unit: '1 Kg',
    brand: 'Suguna',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Mother\'s Recipe Ginger Garlic Paste',
    description: 'Thick and aromatic ginger garlic paste, perfect for biryanis.',
    category: 'Groceries',
    price: 50,
    discount: 0,
    stock: 90,
    unit: '200 g',
    brand: 'Mother\'s Recipe',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
  },

  // Vegetables
  {
    name: 'Fresh Onion (Pyaz)',
    description: 'Organic pink onions, fresh from local farms.',
    category: 'Vegetables',
    price: 35,
    discount: 0,
    stock: 200,
    unit: '1 Kg',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Premium Red Onion',
    description: 'Slightly sweeter, larger and premium quality red onions.',
    category: 'Vegetables',
    price: 55,
    discount: 5,
    stock: 80,
    unit: '1 Kg',
    brand: 'Safal',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Country Tomato',
    description: 'Juicy sour tomatoes for gravies and curries.',
    category: 'Vegetables',
    price: 40,
    discount: 0,
    stock: 150,
    unit: '1 Kg',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Potato (Aloo)',
    description: 'High-starch table potatoes, ideal for baking or frying.',
    category: 'Vegetables',
    price: 30,
    discount: 0,
    stock: 250,
    unit: '1 Kg',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Garlic (Lahsun)',
    description: 'Strong flavored farm garlic bulbs.',
    category: 'Vegetables',
    price: 180,
    discount: 10,
    stock: 50,
    unit: '250 g',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Ginger (Adrak)',
    description: 'Spicy and fibrous fresh ginger root.',
    category: 'Vegetables',
    price: 60,
    discount: 0,
    stock: 60,
    unit: '250 g',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Coriander (Dhania)',
    description: 'Aromatic green coriander leaves for garnishing.',
    category: 'Vegetables',
    price: 15,
    discount: 0,
    stock: 100,
    unit: '100 g',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Green Chillies',
    description: 'Spicy and fresh local green chillies.',
    category: 'Vegetables',
    price: 20,
    discount: 0,
    stock: 100,
    unit: '250 g',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Mint Leaves (Pudina)',
    description: 'Fresh aromatic mint leaves for cooking and biryanis.',
    category: 'Vegetables',
    price: 15,
    discount: 0,
    stock: 80,
    unit: '100 g',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Lemon',
    description: 'Juicy local lemons, full of Vitamin C.',
    category: 'Vegetables',
    price: 30,
    discount: 0,
    stock: 150,
    unit: '250 g',
    brand: 'FarmFresh',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=400&q=80'
  },

  // Dairy
  {
    name: 'Amul Masti Dahi (Curd)',
    description: 'Thick, delicious pasteurized curd from Amul.',
    category: 'Dairy',
    price: 35,
    discount: 0,
    stock: 120,
    unit: '400 g',
    brand: 'Amul',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Amul Fresh Curd Cup',
    description: 'Premium thick set curd cup.',
    category: 'Dairy',
    price: 45,
    discount: 0,
    stock: 75,
    unit: '500 g',
    brand: 'Amul',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Amul Fresh Paneer Block',
    description: 'Rich, soft and smooth cottage cheese.',
    category: 'Dairy',
    price: 90,
    discount: 5,
    stock: 60,
    unit: '200 g',
    brand: 'Amul',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Amul Salted Butter',
    description: 'Utterly butterly delicious salted butter pasteurized.',
    category: 'Dairy',
    price: 58,
    discount: 0,
    stock: 90,
    unit: '100 g',
    brand: 'Amul',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Amul Mozzarella Grated Cheese',
    description: 'Finely grated mozzarella cheese for great pizza pull.',
    category: 'Dairy',
    price: 140,
    discount: 10,
    stock: 50,
    unit: '200 g',
    brand: 'Amul',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Mother Dairy Toned Milk',
    description: 'Pasteurized homogenized toned milk.',
    category: 'Dairy',
    price: 27,
    discount: 0,
    stock: 150,
    unit: '500 ml',
    brand: 'Mother Dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'
  },

  // Snacks & Beverages
  {
    name: 'Coca Cola Soft Drink',
    description: 'Refreshing carbonated soft drink.',
    category: 'Beverages',
    price: 40,
    discount: 5,
    stock: 100,
    unit: '750 ml',
    brand: 'Coca Cola',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Lay\'s Classic Salted Chips',
    description: 'Crispy classic salted potato chips.',
    category: 'Snacks',
    price: 20,
    discount: 0,
    stock: 200,
    unit: '50 g',
    brand: 'Lay\'s',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d20?auto=format&fit=crop&w=400&q=80'
  },

  // Household
  {
    name: 'Vim Dishwash Gel Lemon',
    description: 'Power of 100 lemons, gives sparkling clean dishes.',
    category: 'Household',
    price: 115,
    discount: 12,
    stock: 40,
    unit: '500 ml',
    brand: 'Vim',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Domex Toilet Cleaner',
    description: 'Kills all germs, thick formula for ultimate cleaning.',
    category: 'Household',
    price: 79,
    discount: 5,
    stock: 90,
    unit: '500 ml',
    brand: 'Domex',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Harpic Power Toilet Cleaner',
    description: 'Disinfectant toilet cleaner, thick liquid formula.',
    category: 'Household',
    price: 99,
    discount: 8,
    stock: 110,
    unit: '500 ml',
    brand: 'Harpic',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'HomeLite Floor Cleaner Lemon',
    description: 'Citrus fresh fragrance floor cleaning disinfectant.',
    category: 'Household',
    price: 89,
    discount: 0,
    stock: 75,
    unit: '500 ml',
    brand: 'HomeLite',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Lizol Floor Cleaner Lavender',
    description: '10x better germ kill floor cleaner with soothing lavender fragrance.',
    category: 'Household',
    price: 189,
    discount: 10,
    stock: 85,
    unit: '500 ml',
    brand: 'Lizol',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'SoftSpin Microfiber Cloth',
    description: 'Thick and highly absorbent cleaning cloth for dust.',
    category: 'Household',
    price: 120,
    discount: 5,
    stock: 100,
    unit: '2 units',
    brand: 'SoftSpin',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Scotch-Brite Microfiber Cloth',
    description: 'Scratch-free lifting of dust and water streaks, premium quality.',
    category: 'Household',
    price: 240,
    discount: 12,
    stock: 60,
    unit: '2 units',
    brand: 'Scotch-Brite',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80'
  },

  // Pharmacy
  {
    name: 'Crocin Advance 650mg',
    description: 'Fast pain relief and fever reducing tablets containing Paracetamol.',
    category: 'Pharmacy',
    price: 30,
    discount: 0,
    stock: 150,
    unit: '15 tablets',
    brand: 'Crocin',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Calpol 650mg',
    description: 'Doctor recommended Paracetamol 650mg for body aches and fever.',
    category: 'Pharmacy',
    price: 35,
    discount: 0,
    stock: 120,
    unit: '15 tablets',
    brand: 'Calpol',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Dabur Honitus Cough Syrup',
    description: 'Herbal honey-based cough remedy for sore throat relief.',
    category: 'Pharmacy',
    price: 90,
    discount: 5,
    stock: 80,
    unit: '100 ml',
    brand: 'Dabur',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Benadryl Cough Syrup',
    description: 'Fast acting syrup for dry cough and throat irritation.',
    category: 'Pharmacy',
    price: 150,
    discount: 8,
    stock: 60,
    unit: '100 ml',
    brand: 'Benadryl',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Dettol Antiseptic Liquid',
    description: 'First aid antiseptic liquid for wound cleaning and disinfection.',
    category: 'Pharmacy',
    price: 100,
    discount: 5,
    stock: 100,
    unit: '250 ml',
    brand: 'Dettol',
    image: 'https://images.unsplash.com/photo-1607619056574-7b8f30413736?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Band-Aid Fast Healing',
    description: 'Washproof plastic adhesive bandages for small cuts and wounds.',
    category: 'Pharmacy',
    price: 20,
    discount: 0,
    stock: 200,
    unit: '10 units',
    brand: 'Johnson & Johnson',
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Premium First Aid Kit',
    description: 'Complete emergency medical kit containing gauze, scissors, tape, and wipes.',
    category: 'Pharmacy',
    price: 450,
    discount: 10,
    stock: 30,
    unit: '1 Kit',
    brand: 'Dettol',
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&q=80'
  },

  // Electronics
  {
    name: 'Portronics USB-C Cable',
    description: 'Tough braided fast charging USB Type-C data sync cable.',
    category: 'Electronics',
    price: 149,
    discount: 10,
    stock: 70,
    unit: '1 unit',
    brand: 'Portronics',
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Anker PowerLine USB-C Cable',
    description: 'Ultra-durable double-braided nylon charging cable, highly rated.',
    category: 'Electronics',
    price: 499,
    discount: 15,
    stock: 40,
    unit: '1 unit',
    brand: 'Anker',
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Zebronics Lightning Cable',
    description: 'Flexible lightning charging cable for Apple devices.',
    category: 'Electronics',
    price: 199,
    discount: 5,
    stock: 60,
    unit: '1 unit',
    brand: 'Zebronics',
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Apple Original Lightning Cable',
    description: 'Official Apple charging and sync cable for iPhones/iPads.',
    category: 'Electronics',
    price: 1499,
    discount: 5,
    stock: 25,
    unit: '1 unit',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Syska 12W Wall Charger',
    description: 'Dual-port USB wall adapter plug with smart charging detection.',
    category: 'Electronics',
    price: 249,
    discount: 8,
    stock: 50,
    unit: '1 unit',
    brand: 'Syska',
    image: 'https://images.unsplash.com/photo-1622445262465-24819af52486?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Mi 20W Fast Charger',
    description: 'Type-C power adapter supporting Power Delivery (PD) fast charging.',
    category: 'Electronics',
    price: 599,
    discount: 10,
    stock: 45,
    unit: '1 unit',
    brand: 'Mi',
    image: 'https://images.unsplash.com/photo-1622445262465-24819af52486?auto=format&fit=crop&w=400&q=80'
  },

  // Fast Food
  {
    name: 'Veg Crispy Burger',
    description: 'Crunchy vegetable patty burger with fresh mayo and lettuce.',
    category: 'Fast Food',
    price: 80,
    discount: 5,
    stock: 50,
    unit: '1 unit',
    brand: 'Burger King',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'McSpicy Premium Cheese Burger',
    description: 'Juicy spiced veg fillet burger with double cheese slice and hot sauce.',
    category: 'Fast Food',
    price: 180,
    discount: 10,
    stock: 30,
    unit: '1 unit',
    brand: 'McDonald\'s',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Steamed Veg Momos Pack',
    description: 'Authentic thin-wrapper steamed momos filled with finely chopped cabbage and carrots.',
    category: 'Fast Food',
    price: 60,
    discount: 0,
    stock: 40,
    unit: '6 units',
    brand: 'Momo Zone',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Wow! Fried Paneer Momos',
    description: 'Crispy deep-fried momos stuffed with spiced cottage cheese cubes.',
    category: 'Fast Food',
    price: 120,
    discount: 5,
    stock: 35,
    unit: '6 units',
    brand: 'Wow! Momo',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Domino\'s Margherita Pizza',
    description: 'Classic single-cheese thin crust margherita pizza.',
    category: 'Fast Food',
    price: 150,
    discount: 8,
    stock: 25,
    unit: '1 unit',
    brand: 'Domino\'s',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Pizza Hut Double Cheese Margherita',
    description: 'Signature loaded double cheese margherita pizza with herbs.',
    category: 'Fast Food',
    price: 299,
    discount: 10,
    stock: 20,
    unit: '1 unit',
    brand: 'Pizza Hut',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Classic Salted French Fries',
    description: 'Deep-fried golden potato strips, salted to perfection.',
    category: 'Fast Food',
    price: 70,
    discount: 0,
    stock: 80,
    unit: '1 unit',
    brand: 'Generic',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'McDonald\'s Peri Peri Fries Large',
    description: 'Large fries served with a spicy peri peri spice shake bag.',
    category: 'Fast Food',
    price: 130,
    discount: 5,
    stock: 60,
    unit: '1 unit',
    brand: 'McDonald\'s',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyperlocal-dispatcher');
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await DeliveryAgent.deleteMany({});

    console.log('Cleared existing data (Users, Products, DeliveryAgents)');

    const generateProducts = () => {
      const categories = {
        Groceries: ['Rice', 'Dal', 'Oil', 'Flour', 'Spices', 'Sugar', 'Salt', 'Pasta', 'Noodles', 'Sauce'],
        Vegetables: ['Onion', 'Tomato', 'Potato', 'Garlic', 'Ginger', 'Coriander', 'Chilli', 'Mint', 'Lemon', 'Carrot', 'Spinach', 'Broccoli', 'Capsicum', 'Cabbage', 'Cauliflower'],
        Fruits: ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Papaya', 'Watermelon', 'Pineapple', 'Kiwi', 'Pomegranate', 'Guava', 'Strawberry'],
        Electronics: ['Cable', 'Charger', 'Earphones', 'Power Bank', 'Mouse', 'Keyboard', 'Pendrive', 'Adapter', 'Screen Guard', 'Smart Watch'],
        Pharmacy: ['Paracetamol', 'Cough Syrup', 'Antiseptic', 'Band-Aid', 'First Aid Kit', 'Vitamin C', 'Pain Relief Spray', 'Thermometer', 'Digestive Drops', 'Eye Drops'],
        Dairy: ['Milk', 'Curd', 'Cheese', 'Butter', 'Paneer', 'Yogurt', 'Ghee', 'Ice Cream', 'Buttermilk', 'Cream'],
        Snacks: ['Chips', 'Biscuits', 'Namkeen', 'Popcorn', 'Chocolates', 'Nuts', 'Nachos', 'Wafers', 'Cookies', 'Bhujia'],
        Beverages: ['Soft Drink', 'Juice', 'Tea', 'Coffee', 'Energy Drink', 'Water', 'Soda', 'Squash', 'Syrup', 'Mocktail'],
        Household: ['Floor Cleaner', 'Toilet Cleaner', 'Dishwash Gel', 'Detergent', 'Scrub', 'Mop', 'Broom', 'Air Freshener', 'Tissue Paper', 'Garbage Bags']
      };

      const adjectives = ['Premium', 'Fresh', 'Organic', 'Natural', 'Classic', 'Super', 'Extra', 'Pure', 'Healthy', 'Tasty', 'Spicy', 'Sweet', 'Sour', 'Crunchy', 'Soft', 'Hard', 'Smooth', 'Rough', 'Clean', 'Shiny', 'Matte', 'Glossy', 'Bright', 'Dark', 'Light', 'Heavy'];
      const brands = ['Generic', 'FarmFresh', 'Local', 'Mega', 'Ultra', 'Superb', 'Prime', 'Elite', 'Pro', 'Max', 'Star', 'King', 'Queen', 'Royal', 'Imperial', 'Grand', 'Supreme', 'Master', 'Chief', 'Leader'];

      const genProducts = [];

      Object.entries(categories).forEach(([category, items]) => {
        for (let i = 0; i < 55; i++) {
          const item = items[Math.floor(Math.random() * items.length)];
          const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
          const brand = brands[Math.floor(Math.random() * brands.length)];
          
          let price = Math.floor(Math.random() * 500) + 10;
          if (category === 'Electronics') price = Math.floor(Math.random() * 2000) + 100;
          
          const discount = Math.floor(Math.random() * 20); // 0-19% discount
          const stock = Math.floor(Math.random() * 300) + 20;
          
          let unit = '1 unit';
          if (['Groceries', 'Vegetables', 'Fruits'].includes(category)) {
            unit = ['1 Kg', '500 g', '250 g', '2 Kg', '5 Kg'][Math.floor(Math.random() * 5)];
          } else if (['Beverages', 'Dairy'].includes(category)) {
            unit = ['1 Litre', '500 ml', '250 ml', '2 Litre'][Math.floor(Math.random() * 4)];
          }

          const name = `${adj} ${item}`;
          
          genProducts.push({
            name: name,
            description: `High-quality ${name.toLowerCase()} from ${brand}. Great value for money.`,
            category: category,
            price: price,
            discount: discount,
            stock: stock,
            unit: unit,
            brand: brand,
            image: `https://source.unsplash.com/400x400/?${encodeURIComponent(item.toLowerCase())}`
          });
        }
      });

      return genProducts;
    };

    const extraProducts = generateProducts();
    const allProducts = [...products, ...extraProducts];

    // Seed Products
    const seededProducts = await Product.insertMany(allProducts);
    console.log(`Seeded ${seededProducts.length} Products!`);

    // Create Test Admin User
    const adminUser = await User.create({
      name: 'App Admin',
      email: 'admin@delivery.com',
      phone: '9999999999',
      password: 'admin12345', // pre-save will hash this
      role: 'admin'
    });
    console.log('Admin User created (email: admin@delivery.com, password: admin12345)');

    // Create Test Customer User
    const customerUser = await User.create({
      name: 'John Doe',
      email: 'user@delivery.com',
      phone: '9888888888',
      password: 'user12345',
      role: 'customer',
      addresses: [
        {
          name: 'Home Address',
          phone: '9888888888',
          houseNumber: 'Flat 405, Building A',
          street: 'Indiranagar 80 Feet Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Opposite To Metro Station',
          isDefault: true
        }
      ]
    });
    console.log('Customer User created (email: user@delivery.com, password: user12345)');

    // Create Delivery Agent Users & Agent Documents
    // Agent 1: Rahul Kumar (Located close to Indiranagar)
    const userAgent1 = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul@delivery.com',
      phone: '9876543210',
      password: 'agent12345',
      role: 'delivery_agent'
    });
    const agent1 = await DeliveryAgent.create({
      user: userAgent1._id,
      name: userAgent1.name,
      email: userAgent1.email,
      phone: userAgent1.phone,
      currentLocation: { lat: 12.9780, lng: 77.6400 }, // Close to Indiranagar
      isAvailable: true,
      isOnline: true,
      approvalStatus: 'approved',
      rating: 4.8,
      ratingsCount: 15
    });

    // Agent 2: Amit Singh (Located slightly further)
    const userAgent2 = await User.create({
      name: 'Amit Singh',
      email: 'amit@delivery.com',
      phone: '9876543211',
      password: 'agent12345',
      role: 'delivery_agent'
    });
    const agent2 = await DeliveryAgent.create({
      user: userAgent2._id,
      name: userAgent2.name,
      email: userAgent2.email,
      phone: userAgent2.phone,
      currentLocation: { lat: 12.9650, lng: 77.6200 }, // Slightly further
      isAvailable: true,
      isOnline: true,
      approvalStatus: 'approved',
      rating: 4.6,
      ratingsCount: 8
    });

    // Agent 3: Vikram Malhotra (Unavailable agent)
    const userAgent3 = await User.create({
      name: 'Vikram Malhotra',
      email: 'vikram@delivery.com',
      phone: '9876543212',
      password: 'agent12345',
      role: 'delivery_agent'
    });
    const agent3 = await DeliveryAgent.create({
      user: userAgent3._id,
      name: userAgent3.name,
      email: userAgent3.email,
      phone: userAgent3.phone,
      currentLocation: { lat: 12.9820, lng: 77.6500 },
      isAvailable: false,
      isOnline: false,
      approvalStatus: 'pending',
      rating: 4.9,
      ratingsCount: 20
    });

    console.log(`Seeded 3 Delivery Agents and corresponding User logins! (Rahul, Amit, Vikram; passwords: agent12345)`);

    console.log('Seeding completed successfully! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
