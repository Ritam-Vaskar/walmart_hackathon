import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import Product from './models/Product.js';
import Category from './models/Category.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import { seedARProducts } from './seeders/arProducts.js';
import { seedSnackProducts } from './seeders/snackProducts.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Sample categories data
const categories = [
  { name: 'Electronics', image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Smartphone' },
  { name: 'Clothing', image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Shirt' },
  { name: 'Home & Garden', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Home' },
  { name: 'Grocery', image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'ShoppingBasket' },
  { name: 'Sports', image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Dumbbell' },
  { name: 'Toys', image: 'https://images.pexels.com/photos/163637/lego-toys-child-colorful-163637.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Gamepad2' },
];

// Sample products data
const products = [
  {
    name: 'iPhone 15 Pro Max 256GB',
    price: 1199.99,
    originalPrice: 1299.99,
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    description: 'The most advanced iPhone yet with titanium design, A17 Pro chip, and incredible camera system.',
    rating: 4.8,
    reviews: 12847,
    inStock: true,
    brand: 'Apple',
    features: ['6.7" Super Retina XDR display', 'A17 Pro chip', 'Pro camera system', '5G capable']
  },
  {
    name: 'Samsung 55" 4K Smart TV',
    price: 599.99,
    originalPrice: 799.99,
    image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    description: 'Crystal-clear 4K resolution with smart features and sleek design.',
    rating: 4.6,
    reviews: 8934,
    inStock: true,
    brand: 'Samsung',
    features: ['4K UHD resolution', 'Smart TV features', 'HDR support', 'Multiple HDMI ports']
  },
  {
    name: 'Nike Air Max 270',
    price: 149.99,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Clothing',
    description: 'Comfortable and stylish sneakers for everyday wear.',
    rating: 4.7,
    reviews: 5632,
    inStock: true,
    brand: 'Nike',
    features: ['Air Max cushioning', 'Breathable mesh upper', 'Durable rubber outsole', 'Iconic design']
  },
  {
    name: 'KitchenAid Stand Mixer',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Home & Garden',
    description: 'Professional-grade stand mixer for all your baking needs.',
    rating: 4.9,
    reviews: 3421,
    inStock: true,
    brand: 'KitchenAid',
    features: ['5-quart stainless steel bowl', '10 speeds', 'Tilt-head design', 'Multiple attachments included']
  },
  {
    name: 'Organic Bananas (3 lbs)',
    price: 2.98,
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Grocery',
    description: 'Fresh organic bananas, perfect for snacking or baking.',
    rating: 4.4,
    reviews: 892,
    inStock: true,
    brand: 'Great Value',
    features: ['Certified organic', 'Rich in potassium', 'No artificial preservatives', 'Sustainably grown']
  },
  {
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    originalPrice: 129.99,
    image: 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    description: 'Premium wireless headphones with noise cancellation.',
    rating: 4.5,
    reviews: 2156,
    inStock: true,
    brand: 'Sony',
    features: ['Active noise cancellation', '30-hour battery life', 'Quick charge', 'Premium sound quality']
  },
  {
    name: 'Yoga Mat Premium',
    price: 39.99,
    image: 'https://images.pexels.com/photos/4498318/pexels-photo-4498318.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Sports',
    description: 'High-quality yoga mat for comfortable practice.',
    rating: 4.6,
    reviews: 1834,
    inStock: true,
    brand: 'Gaiam',
    features: ['Non-slip surface', 'Extra thick padding', 'Eco-friendly materials', 'Carrying strap included']
  },
  {
    name: 'LEGO Creator 3-in-1 Deep Sea Creatures',
    price: 79.99,
    image: 'https://images.pexels.com/photos/1302999/pexels-photo-1302999.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Toys',
    description: 'Build and rebuild 3 different sea creatures with this creative set.',
    rating: 4.8,
    reviews: 967,
    inStock: true,
    brand: 'LEGO',
    features: ['3 models in 1', '230 pieces', 'Ages 7+', 'Promotes creativity']
  },
  {
    name: 'MacBook Pro 14" M3 Pro',
    price: 1999.99,
    originalPrice: 2199.99,
    image: 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    description: 'Powerful laptop with M3 Pro chip for professional workflows.',
    rating: 4.9,
    reviews: 3245,
    inStock: true,
    brand: 'Apple',
    features: ['14-inch Liquid Retina XDR display', 'M3 Pro chip', 'Up to 18 hours battery life', 'MagSafe charging']
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: 1199.99,
    originalPrice: 1299.99,
    image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    description: 'The ultimate Android smartphone with S Pen and advanced camera system.',
    rating: 4.7,
    reviews: 5678,
    inStock: true,
    brand: 'Samsung',
    features: ['6.8-inch Dynamic AMOLED display', 'Snapdragon 8 Gen 3', '200MP camera system', 'S Pen included']
  },
  {
    name: 'Adidas Ultraboost 24',
    price: 189.99,
    image: 'https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Clothing',
    description: 'Premium running shoes with responsive Boost cushioning.',
    rating: 4.8,
    reviews: 3421,
    inStock: true,
    brand: 'Adidas',
    features: ['Boost cushioning', 'Primeknit upper', 'Continental rubber outsole', 'Responsive feel']
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    price: 749.99,
    originalPrice: 849.99,
    image: 'https://images.pexels.com/photos/4108714/pexels-photo-4108714.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Home & Garden',
    description: 'Powerful cordless vacuum with laser dust detection technology.',
    rating: 4.7,
    reviews: 2345,
    inStock: true,
    brand: 'Dyson',
    features: ['Laser dust detection', 'HEPA filtration', '60-minute run time', 'LCD screen']
  },
  {
    name: 'Organic Avocados (4 pack)',
    price: 5.99,
    image: 'https://images.pexels.com/photos/2228553/pexels-photo-2228553.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Grocery',
    description: 'Fresh organic avocados, perfect for guacamole or toast.',
    rating: 4.5,
    reviews: 782,
    inStock: true,
    brand: 'Great Value',
    features: ['Certified organic', 'Rich in healthy fats', 'No artificial preservatives', 'Sustainably grown']
  },
  {
    name: 'Sony PlayStation 5',
    price: 499.99,
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    description: 'Next-generation gaming console with lightning-fast loading and stunning graphics.',
    rating: 4.9,
    reviews: 7823,
    inStock: true,
    brand: 'Sony',
    features: ['4K gaming', 'Ray tracing', 'Ultra-high speed SSD', 'Haptic feedback controller']
  },
  {
    name: 'Bowflex SelectTech 552 Dumbbells',
    price: 429.99,
    originalPrice: 549.99,
    image: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Sports',
    description: 'Adjustable dumbbells that replace 15 sets of weights.',
    rating: 4.8,
    reviews: 3456,
    inStock: true,
    brand: 'Bowflex',
    features: ['Adjustable from 5 to 52.5 lbs', 'Space-saving design', 'Durable construction', 'Easy weight selection']
  },
  {
    name: 'Nintendo Switch OLED',
    price: 349.99,
    image: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Toys',
    description: 'Versatile gaming console with vibrant OLED screen for handheld and TV play.',
    rating: 4.8,
    reviews: 5432,
    inStock: true,
    brand: 'Nintendo',
    features: ['7-inch OLED screen', 'Enhanced audio', 'Wired LAN port', '64GB internal storage']
  }
];

// Sample user data
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
  },
];

// Import data function
const importData = async () => {
  // Seed AR products and snack products
  await Promise.all([
    seedARProducts(),
    seedSnackProducts()
  ]);
  try {
    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories inserted`);

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products inserted`);

    // Hash passwords and insert users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} users inserted`);

    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

// Delete data function
const destroyData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

// Run the appropriate function based on command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}