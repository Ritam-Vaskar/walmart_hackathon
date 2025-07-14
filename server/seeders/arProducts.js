import Product from '../models/Product.js';

const arProducts = [
  {
    name: 'Modern Sofa',
    description: 'Elegant 3-seater sofa with premium fabric upholstery',
    price: 899.99,
    originalPrice: 999.99,
    category: 'Furniture',
    image: 'https://example.com/sofa.jpg',
    brand: 'HomeStyle',
    features: ['Stain resistant', 'Easy assembly', 'Premium fabric'],
    hasARModel: true,
    arModelType: 'furniture',
    arModelUrl: '/models/furniture/default-furniture.glb'
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket with a modern fit',
    price: 59.99,
    originalPrice: 79.99,
    category: 'Apparel',
    image: 'https://example.com/jacket.jpg',
    brand: 'FashionFit',
    features: ['100% cotton', 'Machine washable', 'Multiple pockets'],
    hasARModel: true,
    arModelType: 'apparel',
    arModelUrl: '/models/apparel/default-clothing.glb'
  }
];

export const seedARProducts = async () => {
  try {
    // Clear existing AR products
    await Product.deleteMany({ hasARModel: true });

    // Insert new AR products
    await Product.insertMany(arProducts);

    console.log('AR products seeded successfully');
  } catch (error) {
    console.error('Error seeding AR products:', error);
  }
};