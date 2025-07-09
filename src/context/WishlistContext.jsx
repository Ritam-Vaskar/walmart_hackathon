import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const res = await axios.get('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('walmart_token')}`,
        },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.products || [];

      setWishlist(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await axios.post(`/api/wishlist/add/${productId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('walmart_token')}`,
        },
      });
      await fetchWishlist();
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await axios.delete(`/api/wishlist/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('walmart_token')}`,
        },
      });
      await fetchWishlist();
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId || item.id === productId);
  };

  const getTotalItems = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist,
        isInWishlist,
        getTotalItems,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
