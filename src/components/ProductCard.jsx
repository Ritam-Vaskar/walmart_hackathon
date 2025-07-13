import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product, className = "" }) => {
  const { addToCart } = useCart();
  const [showInquire, setShowInquire] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState(null);

  const handleAddToCart = () => {
    addToCart({ ...product, id: product._id });
  };

  const sendInquiry = async () => {
    if (!phoneNumber.trim()) return;
    try {
      // console.log(`url: ${process.env.VITE_AI_URL}/inquire`);
      const res = await fetch(`${import.meta.env.VITE_AI_URL}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_details: `${product.name} - $${product.price} - Raw : ${product}`,
          phone_number: phoneNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Inquiry sent successfully!");
      } else {
        setMessage(data.error || "Failed to send inquiry.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setTimeout(() => {
        setShowInquire(false);
        setPhoneNumber("");
        setMessage(null);
      }, 2500);
    }
  };

  return (
    <div
      className={`group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Clickable Image and Title */}
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            type="button"
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50"
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {product.brand}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>
        </div>

        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              product.inStock
                ? "text-green-700 bg-green-100"
                : "text-red-700 bg-red-100"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              product.inStock
                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add to Cart
          </button>
        </div>

        <button
          onClick={() => setShowInquire(true)}
          className="mt-1 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium py-2 rounded transition-all"
        >
          Inquire
        </button>

        {/* Mini Inquire Modal */}
        {showInquire && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div
              className="bg-white p-5 rounded-lg shadow-lg w-[90%] max-w-sm relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-md font-semibold mb-2">
                Inquire about this product
              </h3>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowInquire(false)}
                  className="text-sm px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={sendInquiry}
                  className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
              {message && (
                <p className="text-sm mt-3 text-center text-gray-700">
                  {message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
