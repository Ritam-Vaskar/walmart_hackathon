import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
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
  ChevronUp,
  Send
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
  const [customPrompt, setCustomPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Enhanced debug function using axios
  const getDebugInfo = async () => {
    try {
      const response = await api.get('/snack-bucket/debug-products');
      setDebugInfo(response.data);
    } catch (error) {
      console.error('Error getting debug info:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch database information');
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCustomPrompt(prev => prev ? prev + ' ' + transcript : transcript);
      toast.success('Voice captured successfully!');
    };

    recognition.onerror = () => {
      toast.error('Voice input failed. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const speakRecommendation = () => {
    if (!recommendation?.reasoning || recommendation.reasoning.length === 0) {
      toast.error('Nothing to speak. Generate a recommendation first.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(recommendation.reasoning.join('. '));
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  // Enhanced recommendation function with custom prompt using axios
  const getRecommendation = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt to generate recommendations');
      return;
    }

    setLoading(true);
    setRecommendation(null);

    try {
      const response = await api.post('/snack-bucket/recommend', {
        prompt: customPrompt.trim()
      });

      setRecommendation(response.data.bucket);
      setAnimateCards(true);

      // Reset animation after delay
      setTimeout(() => setAnimateCards(false), 600);

      toast.success('🎉 Perfect recommendations generated for your request!');
    } catch (error) {
      console.error("Error getting recommendations: ", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to get recommendations';
      toast.error(errorMessage);
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

      // Process each product
      for (const product of recommendation.products) {
        if (product.inStock) {
          try {
            await addToCart({ ...product, id: product._id }, 1);
            addedCount++;
          } catch (error) {
            console.error(`Error adding product ${product._id} to cart:`, error);
            skippedCount++;
          }
        } else {
          skippedCount++;
        }
      }

      if (addedCount > 0) {
        toast.success(`🛒 ${addedCount} items added to cart!`);
        if (skippedCount > 0) {
          toast.warning(`⚠️ ${skippedCount} items were skipped (out of stock or error)`);
        }
      } else {
        toast.error('No items could be added - all are out of stock or unavailable');
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

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      getRecommendation();
    }
  };

  // Load debug info on component mount
  useEffect(() => {
    getDebugInfo();
  }, []);

  // Axios interceptor for handling auth errors
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('walmart_token');
          toast.error('Session expired. Please login again.');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

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
                AI Product Curator
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Describe what you're looking for and let our AI curate the perfect product combination for you.
              From snacks to any category - just tell us what you need!
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
                    <span className="font-semibold text-blue-800">Available Categories:</span>
                    <span className="text-blue-700 ml-2">
                      {debugInfo.categories?.join(', ') || 'None'}
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

          {/* Enhanced Action Panel with Custom Prompt */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-semibold">AI-Powered Product Curation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={16} />
                <span className="text-sm">Customized recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Target size={16} />
                <span className="text-sm">Based on your needs</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span className="text-sm">Instant results</span>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Tell our AI exactly what you're looking for! Whether it's "healthy snacks for office",
              "party treats for kids", "premium beverages", or any specific requirement - our AI will
              analyze your request and curate the perfect product combination.
            </p>

            {/* Custom Prompt Input */}
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                What are you looking for? Be specific about your needs:
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Example: 'I need healthy snacks for a fitness-focused office party with 20 people, budget around $50, mix of sweet and savory options'"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows="3"
                  disabled={loading}
                />
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={loading}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                  >
                    🎤 {isListening ? 'Listening...' : 'Speak Prompt'}
                  </button>

                  {recommendation && (
                    <button
                      type="button"
                      onClick={speakRecommendation}
                      disabled={isSpeaking}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      🔊 {isSpeaking ? 'Speaking...' : 'Play AI Reasoning'}
                    </button>
                  )}
                </div>

                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  Ctrl/Cmd + Enter to generate
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={getRecommendation}
                disabled={loading || !customPrompt.trim()}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating Your Recommendations...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Generate Recommendations
                  </>
                )}
              </button>

              <button
                onClick={getDebugInfo}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className="inline mr-2" />
                Refresh
              </button>
            </div>

            {/* Sample Prompts */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sample prompts to get you started:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Healthy snacks for office party",
                  "Kids birthday party treats",
                  "Premium beverages for dinner",
                  "Vegan and gluten-free options",
                  "Budget-friendly family snacks"
                ].map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setCustomPrompt(sample)}
                    disabled={loading}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {sample}
                  </button>
                ))}
              </div>
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
                  <h2 className="text-xl font-semibold">AI Analysis & Reasoning</h2>
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
                    <h2 className="text-2xl font-semibold mb-2">Your Curated Selection</h2>
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
                          image: product.image || 'https://via.placeholder.com/300x200?text=Product+Item',
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
                      Ready to Complete Your Selection?
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
                          Add Complete Selection (${formatPrice(calculateTotalPrice())})
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
                It looks like your product database is empty. Add some products
                to start generating amazing recommendations!
              </p>
            </div>
          )}

          {!recommendation && !loading && debugInfo?.totalProducts > 0 && !customPrompt.trim() && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-blue-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-blue-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Ready to Get Started!</h3>
              <p className="text-blue-600 max-w-md mx-auto">
                You have {debugInfo.totalProducts} products available.
                Enter your custom prompt above to get personalized recommendations!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnackBucket;