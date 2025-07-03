import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const cartData = await cartAPI.getCart();
      if (cartData && cartData.items) {
        const cartItems = cartData.items.map((item) => ({
          product: {
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            category: item.product.category,
            brand: item.product.brand,
            inStock: item.product.inStock,
            description: '',
            rating: 0,
            reviews: 0,
            features: []
          },
          quantity: item.quantity
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    setIsLoading(true);
    try {
      if (user) {
        await cartAPI.addToCart(product.id, quantity);
        await fetchCart();
      } else {
        setItems((prevItems) => {
          const existingItem = prevItems.find(item => item.product.id === product.id);
          if (existingItem) {
            return prevItems.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [...prevItems, { product, quantity }];
        });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setIsLoading(true);
    try {
      if (user) {
        await cartAPI.removeFromCart(productId);
        await fetchCart();
      } else {
        setItems((prevItems) => prevItems.filter(item => item.product.id !== productId));
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setIsLoading(true);
    try {
      if (user) {
        await cartAPI.updateCartItem(productId, quantity);
        await fetchCart();
      } else {
        setItems((prevItems) =>
          prevItems.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      if (user) {
        await cartAPI.clearCart();
        setItems([]);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
