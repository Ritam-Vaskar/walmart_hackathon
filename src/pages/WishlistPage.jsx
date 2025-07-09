import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { wishlistAPI } from '../services/api';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistAPI.getWishlist();
      
      // Handle different response structures
      const data = Array.isArray(response)
        ? response
        : response?.products || [];
      
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist. Please try again.');
      setWishlist([]); // fallback to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      toast.success('Removed from wishlist');
      // Remove the item from local state instead of refetching
      setWishlist(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const clearWishlist = async () => {
    try {
      await wishlistAPI.clearWishlist();
      toast.success('Wishlist cleared');
      setWishlist([]);
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl text-gray-700">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={fetchWishlist}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 shadow-sm max-w-md mx-auto">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">
                Save items you love by clicking the heart icon on any product
              </p>
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map(product => (
              <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow relative group">
                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10 opacity-0 group-hover:opacity-100"
                  title="Remove from wishlist"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>

                <Link to={`/product/${product._id}`} className="block">
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Brand */}
                    {product.brand && (
                      <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price?.toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Quick Actions */}
                <div className="p-4 pt-0">
                  <button
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                      product.inStock
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;