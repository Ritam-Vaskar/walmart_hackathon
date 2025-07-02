import { Product, Category, Order } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'Electronics', image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Smartphone' },
  { id: '2', name: 'Clothing', image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Shirt' },
  { id: '3', name: 'Home & Garden', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Home' },
  { id: '4', name: 'Grocery', image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'ShoppingBasket' },
  { id: '5', name: 'Sports', image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Dumbbell' },
  { id: '6', name: 'Toys', image: 'https://images.pexels.com/photos/163637/lego-toys-child-colorful-163637.jpeg?auto=compress&cs=tinysrgb&w=300', icon: 'Gamepad2' },
];

export const products: Product[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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
    id: '7',
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
    id: '8',
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
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'user1',
    items: [
      { product: products[0], quantity: 1 },
      { product: products[5], quantity: 2 }
    ],
    total: 1359.97,
    status: 'delivered',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-18',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    }
  },
  {
    id: 'ORD-002',
    userId: 'user1',
    items: [
      { product: products[1], quantity: 1 },
      { product: products[3], quantity: 1 }
    ],
    total: 899.98,
    status: 'shipped',
    orderDate: '2024-01-20',
    deliveryDate: '2024-01-25',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    }
  }
];