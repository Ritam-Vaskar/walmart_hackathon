import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ArrowLeft, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const ordersData = await ordersAPI.getOrders();
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your orders.</p>
          <Link
            to="/login?redirect=orders"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your orders</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Continue Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">
              When you place your first order, it will appear here.
            </p>
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders
              .filter(order => activeFilter === 'All' || order.status.toLowerCase() === activeFilter.toLowerCase())
              .map((order) => (
              <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Order #{order.id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span> ${order.total.toFixed(2)}
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-gray-600 text-sm mt-1">{item.product.brand}</p>
                          <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                      {order.deliveryDate && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {order.status === 'delivered' ? 'Delivered on:' : 'Expected delivery:'}
                          </span>{' '}
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Track Package
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Reorder Items
                      </button>
                      {order.status === 'delivered' && (
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Filters - if there are orders */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Orders</h2>
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === activeFilter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;