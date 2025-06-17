import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                alt="Amazon" 
                className="h-8 w-auto"
              />
              <h3 className="font-bold text-2xl text-blue-400">Eye</h3>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">Your trusted shopping companion with AI-powered product verification and transparent reviews for a better shopping experience.</p>
          </div>
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Get to Know Us</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors text-lg">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Press Releases</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Trust & Safety</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Make Money with Us</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors text-lg">Sell Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Become an Affiliate</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Advertise Your Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Partner with Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Let Us Help You</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors text-lg">Your Account</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Your Orders</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-lg">&copy; 2025 Amazon Eye. All rights reserved. | Empowering smart shopping decisions</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 