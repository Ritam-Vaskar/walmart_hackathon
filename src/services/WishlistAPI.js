import api from './api'; // this should be your existing api instance

export const wishlistAPI = {
  // Get all wishlist products for the logged-in user
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  // Add a product to wishlist
  addToWishlist: async (productId) => {
    const response = await api.post(`/wishlist/add/${productId}`);
    return response.data;
  },

  // Remove a product from wishlist
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/wishlist/remove/${productId}`);
    return response.data;
  },
};

export default wishlistAPI;