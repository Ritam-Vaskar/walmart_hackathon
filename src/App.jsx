import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import Header from './components/Header';
import Footer from './components/Footer';
import VoiceAssistant from './components/VoiceAssistant';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import WishlistPage from './pages/WishlistPage';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Deals from './pages/Deals';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ScrollToTopOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

function AppContent() {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <VoiceAssistant />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />        
          </Routes>
           <ToastContainer position="top-center" />
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <VoiceAssistantProvider>
            <Router>
              <AppContent />
            </Router>
          </VoiceAssistantProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
