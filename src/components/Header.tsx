import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white text-sm py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              How do you want your items?
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span>Free shipping, arrives in 3+ days</span>
            <span>|</span>
            <span>Get $5 off with Walmart+</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
              W
            </div>
            <div className="hidden sm:block">
              <div className="text-2xl font-bold text-blue-600">Walmart</div>
              <div className="text-xs text-gray-500 -mt-1">Save Money. Live Better.</div>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything at Walmart online and in store"
                className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-full text-sm font-medium transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Heart Icon */}
            <button className="hidden md:flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Heart className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-600">Reorder</span>
            </button>

            {/* Account */}
            <div className="relative group">
              <button className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-6 h-6 text-gray-600" />
                <span className="text-xs text-gray-600 hidden md:block">
                  {user ? user.name.split(' ')[0] : 'Account'}
                </span>
              </button>
              {user && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>
                    <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
              {!user && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign In
                    </Link>
                    <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 hidden md:block">
                ${getTotalItems() > 0 ? '0.00' : '0.00'}
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search everything"
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/categories" className="block py-2 text-gray-700 hover:text-blue-600">Categories</Link>
            {user ? (
              <>
                <Link to="/orders" className="block py-2 text-gray-700 hover:text-blue-600">My Orders</Link>
                <Link to="/account" className="block py-2 text-gray-700 hover:text-blue-600">Account</Link>
                <button onClick={handleLogout} className="block py-2 text-gray-700 hover:text-blue-600">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-blue-600">Sign In</Link>
                <Link to="/register" className="block py-2 text-gray-700 hover:text-blue-600">Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;