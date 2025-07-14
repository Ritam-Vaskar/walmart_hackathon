import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Minus,
  Plus,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Box,
  Smartphone
} from "lucide-react";
import ARTryOn from '../components/ARTryOn';
import { checkDeviceARCapabilities, fetchProductARModel } from '../services/arService';
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { productsAPI, wishlistAPI } from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [arSupported, setArSupported] = useState(false);
  const [showARView, setShowARView] = useState(false);
  const [arModelUrl, setArModelUrl] = useState(null);
  const [arLoading, setArLoading] = useState(false);

  const handleInquiry = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_AI_URL}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_details: `${product.name} - $${product.price} - Raw : ${product} `,
          phone_number: phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("You'll get a call from our AI assistant shortly!");
        setPhoneNumber("");
      } else {
        toast.error(data.error || "Inquiry failed. Try again.");
      }
    } catch (error) {
      console.error("Inquiry failed:", error);
      toast.error("Something went wrong. Try again later.");
    }
  };

  useEffect(() => {
    const checkARSupport = async () => {
      try {
        const capabilities = await checkDeviceARCapabilities();
        setArSupported(capabilities.isSupported);
        console.log('AR Support:', capabilities);
      } catch (error) {
        console.error('Error checking AR support:', error);
        setArSupported(false);
      }
    };

    checkARSupport();
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const [productData, relatedProductsData] = await Promise.all([
          productsAPI.getProductById(id),
          productsAPI.getRelatedProducts(id),
        ]);
        setProduct(productData);
        setRelatedProducts(relatedProductsData);

        // Fetch AR model if available
        if (productData.hasARModel) {
          console.log('Fetching AR model for product:', productData.name, 'Type:', productData.type);
          try {
            const modelUrl = await fetchProductARModel(id, productData.type);
            setArModelUrl(modelUrl);
            console.log('AR model URL:', modelUrl);
          } catch (error) {
            console.error('Error fetching AR model:', error);
            toast.error('AR model not available for this product');
          }
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to load product data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
    setQuantity(1);
    setSelectedImage(0);
  }, [id]);

  useEffect(() => {
    if (product) checkWishlist();
  }, [product]);

  const checkWishlist = async () => {
    try {
      const wishlistData = await wishlistAPI.getWishlist();
      const wishlistProducts = Array.isArray(wishlistData) ? wishlistData : [];
      const found = wishlistProducts.some((item) => item._id === product._id);
      setIsWishlisted(found);
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await wishlistAPI.removeFromWishlist(product._id);
        toast.success("Removed from wishlist");
      } else {
        await wishlistAPI.addToWishlist(product._id);
        toast.success("Added to wishlist");
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Wishlist action failed:", error);
      toast.error("Wishlist action failed");
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success("Added to cart");
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleTryOnClick = async () => {
    if (!arSupported) {
      toast.error('AR is not supported on your device');
      return;
    }

    if (!product.hasARModel) {
      toast.error('AR model not available for this product');
      return;
    }

    if (!arModelUrl) {
      setArLoading(true);
      toast.info('Loading AR model...');
      try {
        const modelUrl = await fetchProductARModel(id, product.type);
        setArModelUrl(modelUrl);
        setShowARView(true);
      } catch (error) {
        console.error('Error loading AR model:', error);
        toast.error('Failed to load AR model');
      } finally {
        setArLoading(false);
      }
    } else {
      setShowARView(true);
    }
  };

  const getARButtonText = () => {
    if (product?.type === 'apparel') {
      return 'Virtual Try-On';
    } else if (product?.type === 'furniture') {
      return 'View in Your Space';
    } else {
      return 'View in AR';
    }
  };

  const getARButtonIcon = () => {
    if (product?.type === 'apparel') {
      return <Smartphone size={20} />;
    } else {
      return <Box size={20} />;
    }
  };

  const productImages = product?.image
    ? [product.image, product.image, product.image, product.image]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Something went wrong
          </h2>
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-yellow-500 text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (showARView && arModelUrl) {
    return (
      <ARTryOn 
        productType={product.type} 
        modelUrl={arModelUrl}
        onClose={() => setShowARView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-blue-600">
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/categories")}
            className="hover:text-blue-600"
          >
            {product.category}
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* AR Button in Header */}
        {product.hasARModel && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={handleTryOnClick}
              disabled={!arSupported || arLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                arSupported && !arLoading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {arLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading AR...</span>
                </>
              ) : (
                <>
                  {getARButtonIcon()}
                  <span>{getARButtonText()}</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-2xl p-8 mb-4">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white rounded-lg p-2 border-2 transition-colors ${
                    selectedImage === index
                      ? "border-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-16 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.brand}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleWishlist}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted
                          ? "text-red-500 fill-current"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-lg font-medium text-gray-900">
                    {product.rating}
                  </span>
                </div>
                <span className="text-gray-600">
                  ({product.reviews} reviews)
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {product.description}
              </p>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Key Features:
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-8">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    product.inStock
                      ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Add to Cart
                </button>
              </div>
              
              {/* Inquire via AI Assistant */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Inquire via AI Assistant 🤖
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Get a call from our smart assistant with all the details about
                  this product and help with your purchase.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full sm:w-auto flex-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handleInquiry}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-all"
                  >
                    Request Call
                  </button>
                </div>
              </div>
              
              {/* Shipping Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Free Shipping</div>
                      <div className="text-gray-600">On orders over $35</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">2-Year Warranty</div>
                      <div className="text-gray-600">Manufacturer warranty</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Easy Returns</div>
                      <div className="text-gray-600">90-day return policy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.length > 0 ? (
              relatedProducts.slice(0, 4).map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  onClick={() => navigate(`/product/${relatedProduct._id}`)}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {relatedProduct.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-gray-500">No related products found</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;