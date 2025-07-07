import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Truck, RotateCcw,Star,Clock } from 'lucide-react';
import { productsAPI } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await productsAPI.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-15 transform -translate-x-8 translate-y-8"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-800 font-bold text-xl">W</span>
              </div>
              <h1 className="text-4xl font-bold">Shop by Category</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mb-4">
              Save money. Live better. Discover thousands of products across all categories.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>4.5+ Rating</span>
              </div>
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-1" />
                <span>Free Shipping $35+</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>2-Day Delivery</span>
              </div>
            </div>
          </div>
        </div>


        {/* Featured Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group transform hover:-translate-y-1"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-sm font-medium">Shop Now</div>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <img
                      src={category.icon}
                      alt=""
                      className="w-5 h-5"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                        {category.itemCount || 'New'}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Shopping Benefits */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Shop with Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $35 or pick up in store for free.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Shop with Confidence</h3>
              <p className="text-gray-600">All products backed by our satisfaction guarantee.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">90-day return window on most items.</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-6">Check back later for new categories.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
