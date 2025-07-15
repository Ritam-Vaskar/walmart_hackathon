import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
                W
              </div>
              <span className="text-xl font-bold">Walmart</span>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              Save Money. Live Better. Your one-stop shop for everything you need.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Return Policy</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Walmart+ Help</Link></li>
            </ul>
          </div>

          {/* Shop & Browse */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Shop & Browse</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li><Link to="#" className="hover:text-white transition-colors">All Departments</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Weekly Ad</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Rollbacks</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Clearance</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Gift Cards</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Registry</Link></li>
            </ul>
          </div>

          {/* Account & Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Account & Services</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Walmart+</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Credit Cards</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Pharmacy</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Photo Center</Link></li>
            </ul>
          </div>
        </div>

        {/* Download App Section */}
        <div className="border-t border-blue-500 mt-8 pt-8 text-center">
          <h3 className="font-semibold text-lg mb-4">Get the Walmart App</h3>
          <div className="flex justify-center space-x-4 mb-6">
            <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 cursor-pointer hover:bg-gray-800 transition-colors">
              <Smartphone className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="font-semibold">App Store</div>
              </div>
            </div>
            <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 cursor-pointer hover:bg-gray-800 transition-colors">
              <Smartphone className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs">Get it on</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue-500 mt-8 pt-8 text-center text-sm text-blue-100">
          <div className="flex flex-wrap justify-center space-x-6 mb-4">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to="#" className="hover:text-white transition-colors">Accessibility</Link>
            <Link to="#" className="hover:text-white transition-colors">Store Directory</Link>
          </div>
          <p>&copy; 2024 S-Mart+ Inc. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
