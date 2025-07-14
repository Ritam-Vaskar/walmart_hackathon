import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { 
  Star, 
  ShoppingCart, 
  Loader2, 
  RefreshCw, 
  Package, 
  Info, 
  Plus, 
  Sparkles,
  Users,
  Clock,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const SnackBucket = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [addingAllToCart, setAddingAllToCart] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  // Enhanced debug function
  const getDebugInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/snack-bucket/debug-products`);
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error getting debug info:', error);
      toast.error('Failed to fetch database information');
    }
  };

  // Enhanced recommendation function
  const getRecommendation = async () => {
    setLoading(true);
    setRecommendation(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/snack-bucket/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get recommendations');
      }

      setRecommendation(data.bucket);
      setAnimateCards(true);
      
      // Reset animation after delay
      setTimeout(() => setAnimateCards(false), 600);
      
      toast.success('🎉 Perfect snack bucket curated for you!');
    } catch (error) {
      console.error('Error getting snack recommendations:', error);
      toast.error(error.message || 'Failed to get snack recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced add all to cart function
  const addAllToCart = async () => {
    if (!recommendation?.products || recommendation.products.length === 0) {
      toast.error('No products to add to cart');
      return;
    }
    
    setAddingAllToCart(true);
    
    try {
      let addedCount = 0;
      let skippedCount = 0;
      
      recommendation.products.forEach(product => {
        if (product.inStock) {
          addToCart({ ...product, id: product._id }, 1);
          addedCount++;
        } else {
          skippedCount++;
        }
      });
      
      if (addedCount > 0) {
        toast.success(`🛒 ${addedCount} items added to cart!`);
        if (skippedCount > 0) {
          toast.warning(`⚠️ ${skippedCount} out of stock items were skipped`);
        }
      } else {
        toast.error('No items could be added - all are out of stock');
      }
    } catch (error) {
      console.error('Error adding items to cart:', error);
      toast.error('Failed to add items to cart');
    } finally {
      setAddingAllToCart(false);
    }
  };

  // Helper functions
  const calculateTotalPrice = () => {
    if (!recommendation?.products) return 0;
    return recommendation.products
      .filter(product => product.inStock)
      .reduce((total, product) => total + product.price, 0);
  };

  const getInStockCount = () => {
    if (!recommendation?.products) return 0;
    return recommendation.products.filter(product => product.inStock).length;
  };

  const formatPrice = (price) => {
    return (price / 100).toFixed(2);
  };

  const getEstimatedServings = () => {
    if (!recommendation?.products) return 0;
    return Math.ceil(recommendation.products.length * 1.5); // Rough estimate
  };

  // Load debug info on component mount
  useEffect(() => {
    getDebugInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full">
                <Package className="text-white" size={32} />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                AI Snack Bucket
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Let our AI curate the perfect snack combination for your gathering. 
              Smart recommendations based on flavor profiles, popularity, and variety.
            </p>
          </div>

          {/* Debug Info Panel - Collapsible */}
          <div className="mb-6">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2"
            >
              <Info size={16} />
              Database Information
              {showDebugInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showDebugInfo && debugInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-blue-800">Total Products:</span>
                    <span className="text-blue-700 ml-2">{debugInfo.totalProducts}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Categories:</span>
                    <span className="text-blue-700 ml-2">{debugInfo.categories?.length || 0}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Food Items:</span>
                    <span className="text-blue-700 ml-2">
                      {debugInfo.categories?.some(cat => cat.toLowerCase().includes('food')) ? 'Available' : 'None'}
                    </span>
                  </div>
                </div>
                
                {debugInfo.totalProducts === 0 && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-red-700">
                    <strong>No products found!</strong> Please add some products to your database first.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Action Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-semibold">AI-Powered Snack Curation</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={16} />
                <span className="text-sm">Perfect for groups</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Target size={16} />
                <span className="text-sm">Balanced variety</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span className="text-sm">Instant recommendations</span>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Our AI analyzes flavor profiles, popularity metrics, and nutritional balance to create 
              the perfect snack combination for your gathering. From sweet to savory, we've got every 
              craving covered!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={getRecommendation}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Curating Your Perfect Bucket...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    Generate Snack Bucket
                  </>
                )}
              </button>
              
              <button
                onClick={getDebugInfo}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={16} className="inline mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Recommendation Results */}
          {recommendation && (
            <div className="space-y-6">
              {/* AI Reasoning Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                    <Star className="text-white" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold">Why This Combination?</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendation.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 text-sm">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Your Curated Snack Bucket</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package size={16} />
                        {recommendation.products.length} items
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart size={16} />
                        {getInStockCount()} in stock
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        ~{getEstimatedServings()} servings
                      </span>
                      <span className="font-semibold text-green-600">
                        Total: ${formatPrice(calculateTotalPrice())}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={addAllToCart}
                      disabled={addingAllToCart || getInStockCount() === 0}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {addingAllToCart ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          Add All ({getInStockCount()})
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => navigate('/cart')}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors"
                    >
                      <ShoppingCart size={20} />
                      View Cart
                    </button>
                  </div>
                </div>

                {/* Enhanced Products Grid */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${animateCards ? 'animate-pulse' : ''}`}>
                  {recommendation.products.map((product, index) => (
                    <div 
                      key={product._id} 
                      className={`transition-all duration-300 ${animateCards ? 'scale-105' : ''}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ProductCard
                        product={{
                          ...product,
                          price: product.price / 100,
                          originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
                          image: product.image || 'https://via.placeholder.com/300x200?text=Snack+Item',
                          brand: product.brand || 'Generic',
                          rating: product.rating || 4.0,
                          reviews: product.reviews || Math.floor(Math.random() * 100) + 10
                        }}
                        className="w-full h-full hover:shadow-xl transition-shadow duration-300"
                      />
                    </div>
                  ))}
                </div>

                {/* Enhanced Bottom Action */}
                <div className="mt-8 text-center">
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Ready to Complete Your Bucket?
                    </h3>
                    <p className="text-green-700 text-sm mb-4">
                      Perfect for {getEstimatedServings()} servings • Great value at ${formatPrice(calculateTotalPrice())}
                    </p>
                    
                    <button
                      onClick={addAllToCart}
                      disabled={addingAllToCart || getInStockCount() === 0}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {addingAllToCart ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Adding All Items...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          Add Complete Bucket (${formatPrice(calculateTotalPrice())})
                        </>
                      )}
                    </button>
                    
                    {getInStockCount() < recommendation.products.length && (
                      <p className="text-sm text-orange-600 mt-3">
                        ⚠️ {recommendation.products.length - getInStockCount()} items out of stock (will be skipped)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Empty States */}
          {!recommendation && !loading && debugInfo?.totalProducts === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-red-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">No Products Available</h3>
              <p className="text-red-600 max-w-md mx-auto">
                It looks like your product database is empty. Add some snacks and beverages 
                to start generating amazing bucket recommendations!
              </p>
            </div>
          )}

          {!recommendation && !loading && debugInfo?.totalProducts > 0 && 
           !debugInfo?.categories?.some(cat => cat.toLowerCase().includes('food')) && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-yellow-200">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Food Items Found</h3>
              <p className="text-yellow-600 max-w-md mx-auto">
                You have {debugInfo.totalProducts} products, but none are categorized as food items. 
                Add some snacks and beverages to unlock bucket recommendations!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnackBucket;