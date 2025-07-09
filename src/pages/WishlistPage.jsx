// src/pages/WishlistPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

const fetchWishlist = async () => {
  try {
    const response = await axios.get('/api/wishlist', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('walmart_token')}`,
      },
    });

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.products || [];

    setWishlist(data);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    setWishlist([]); // fallback to empty array on error
  }
};

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/api/wishlist/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('walmart_token')}`,
        },
      });
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <p>No products in wishlist.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <div key={product._id} className="border rounded-lg p-4 relative">
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Heart className="w-5 h-5 text-red-500" />
              </button>
              <Link to={`/product/${product._id}`}>
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
                <h2 className="text-lg">{product.name}</h2>
                <p className="text-gray-500">₹{product.price}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
