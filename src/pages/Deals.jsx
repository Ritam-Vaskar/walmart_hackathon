import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Clock, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../services/api';

const Deals = () => {
  const [dealProducts, setDealProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productsData = await productsAPI.getProducts();
        const dealsData = productsData.filter(product => product.originalPrice && product.originalPrice > product.price);
        setDealProducts(dealsData);
        const categoriesData = await productsAPI.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError('Failed to load deals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDeals = activeTab === 'all' 
    ? dealProducts 
    : dealProducts.filter(product => product.category === activeTab);

  const calculateDiscount = (original, current) => {
    return Math.round(((original - current) / original) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading deals...</p>
        </div>
      </div>
    );
  }

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
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg overflow-hidden mb-8">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Flash Deals & Clearance
              </h1>
              <p className="text-red-100 text-lg mb-6">
                Save big on top brands with limited-time offers and special discounts.
              </p>
              <div className="flex items-center bg-white bg-opacity-20 text-white rounded-lg p-3 w-fit">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">Limited time offers - Shop now!</span>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-white rounded-full p-6 w-32 h-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">50%</div>
                  <div className="text-sm font-medium text-gray-800">UP TO</div>
                  <div className="text-sm font-medium text-gray-800">OFF</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 min-w-max pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              All Deals
            </button>
            {categories.map(category => (
              <button
                key={category._id}
                onClick={() => setActiveTab(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === category.name ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Deal Stats */}
        <div className="bg-white rounded-lg p-4 mb-8 flex flex-wrap justify-between">
          <div className="text-center px-4 py-2">
            <div className="text-2xl font-bold text-gray-900">{dealProducts.length}</div>
            <div className="text-sm text-gray-600">Total Deals</div>
          </div>
          <div className="text-center px-4 py-2">
            <div className="text-2xl font-bold text-gray-900">
              {Math.max(...dealProducts.map(p => calculateDiscount(p.originalPrice, p.price)))}%
            </div>
            <div className="text-sm text-gray-600">Max Discount</div>
          </div>
          <div className="text-center px-4 py-2">
            <div className="text-2xl font-bold text-gray-900">
              ${Math.min(...dealProducts.map(p => p.price)).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Lowest Price</div>
          </div>
          <div className="text-center px-4 py-2">
            <div className="text-2xl font-bold text-red-600">Limited Time</div>
            <div className="text-sm text-gray-600">Hurry Up!</div>
          </div>
        </div>

        {/* Deals Grid */}
        {filteredDeals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500 text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600 mb-4">We couldn't find any deals in this category right now.</p>
            <button 
              onClick={() => setActiveTab('all')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              View All Deals
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'all' ? 'All Deals' : `${activeTab} Deals`}
              </h2>
              <p className="text-gray-600">
                {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'} available
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredDeals.map(product => (
                <div key={product._id} className="relative">
                  {/* Discount % badge (top-left) */}
                  <div className="absolute top-0 left-0 z-10 bg-red-600 text-white px-3 py-1 rounded-br-lg font-bold">
                    {calculateDiscount(product.originalPrice, product.price)}% OFF
                  </div>

                  {/* Save amount badge (top-right) */}
                  <div className="absolute top-0 right-0 z-10 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-semibold text-sm">
                    SAVE ${Math.round(product.originalPrice - product.price)}
                  </div>

                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shop Deals by Category */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop Deals by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map(category => {
              const categoryDeals = dealProducts.filter(p => p.category === category.name);
              if (categoryDeals.length === 0) return null;
              return (
                <Link 
                  key={category._id} 
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-sm font-medium">
                      Up to {Math.max(...categoryDeals.map(p => calculateDiscount(p.originalPrice, p.price)))}% Off
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                      <span>{category.name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </h3>
                    <p className="text-sm text-gray-600">
                      {categoryDeals.length} {categoryDeals.length === 1 ? 'deal' : 'deals'}
                    </p>
                  </div>
                </Link>
              );
            }).filter(Boolean)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deals;
