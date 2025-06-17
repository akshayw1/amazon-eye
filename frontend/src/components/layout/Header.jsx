import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, MapPin, Globe, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accountDropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsAccountDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-xl">
      {/* Merged Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <img 
                src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                alt="Amazon" 
                className="h-7 w-auto"
              />
              <h1 className="text-xl font-bold text-blue-400">Eye</h1>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="hidden lg:flex flex-col text-sm cursor-pointer hover:opacity-80 transition-opacity px-2">
            <span className="text-gray-300 text-xs">Deliver to</span>
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-white" />
              <span className="font-medium">Mumbai 400001</span>
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="flex shadow-lg rounded-md overflow-hidden">
              <select className="bg-gray-100 text-gray-900 px-3 py-2 text-sm border-r border-gray-300 focus:outline-none focus:bg-white transition-colors">
                <option>All</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home & Garden</option>
                <option>Sports</option>
              </select>
              <input
                type="text"
                placeholder="Search Amazon.in"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-gray-900 border-0 focus:outline-none"
              />
              <button className="bg-yellow-400 px-4 py-2 hover:bg-yellow-500 transition-colors">
                <Search size={18} className="text-gray-900" />
              </button>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 text-sm">
            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded hover:bg-gray-700">
              <Globe size={14} />
              <span className="text-xs font-medium">EN</span>
              <ChevronDown size={12} />
            </div>

            {/* Account Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button 
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="flex flex-col items-start hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
              >
                <span className="text-xs text-gray-300">
                  {isAuthenticated() ? `Hello, ${user?.name?.split(' ')[0]}` : 'Hello, sign in'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Account & Lists</span>
                  <ChevronDown size={12} className={`transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {isAccountDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-2xl border z-50 w-48">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide border-b">
                      {isAuthenticated() ? 'Your Account' : 'Account'}
                    </div>
                    
                    {!isAuthenticated() ? (
                      <>
                        <button
                          onClick={() => {
                            navigate('/login');
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <User size={16} />
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            navigate('/register');
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <User size={16} />
                          Create Account
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b">
                          <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                          <div className="text-xs text-gray-600">{user?.email}</div>
                          <div className="text-xs text-blue-600 font-medium capitalize">
                            {user?.role?.toLowerCase()} Account
                          </div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2 text-red-600"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </>
                    )}
                    
                    <div className="border-t mt-2 pt-2">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm">
                        Your Account
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm">
                        Your Orders
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm">
                        Your Wish List
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <div className="hidden md:flex flex-col items-start hover:text-white transition-colors cursor-pointer px-2 py-1 rounded hover:bg-gray-700">
              <span className="text-xs text-gray-300">Returns</span>
              <span className="text-sm font-medium">& Orders</span>
            </div>

            {/* Cart */}
            <button className="flex items-center gap-1 hover:text-white transition-colors relative px-2 py-1 rounded hover:bg-gray-700">
              <div className="relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">0  </span>
              </div>
              <span className="hidden lg:inline text-sm font-medium ml-1">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extended Categories Navigation */}
      <nav className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-5 py-2 text-sm overflow-x-hidden">
            {/* All Categories Link */}
            <span className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors whitespace-nowrap text-sm cursor-pointer">
              <Menu size={14} />
              <span className="font-medium">All</span>
            </span>

            {/* Quick Navigation Links */}
            {[
              'Fresh', 'MX Player', 'Sell', 'Bestsellers', 'Mobiles', 'Today\'s Deals', 
              'Customer Service', 'Electronics', 'Prime', 'Fashion', 'New Releases', 
              'Home & Kitchen', 'Amazon Pay', 'Computers', 'Books'
            ].map((item) => (
              <span 
                key={item} 
                className="whitespace-nowrap hover:text-yellow-400 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-gray-700 text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 