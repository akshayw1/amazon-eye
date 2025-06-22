import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NetworkGraph from '../components/NetworkGraph';
import NetworkGraphOptimized from '../components/NetworkGraphOptimized';
import ClusterNetworkGraph from '../components/ClusterNetworkGraph';
import AdminOrderManagement from '../components/AdminOrderManagement';
import AdminTrustAnalysis from './AdminTrustAnalysis';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  Shield,
  BarChart3,
  AlertCircle,
  UserCheck,
  Eye,
  Network,
  ArrowLeft,
  Zap,
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [showNetworkGraph, setShowNetworkGraph] = useState(false);
  const [showOptimizedGraph, setShowOptimizedGraph] = useState(false);
  const [showClusterNetwork, setShowClusterNetwork] = useState(false);
  const [showOrderManagement, setShowOrderManagement] = useState(false);
  const [showTrustAnalysis, setShowTrustAnalysis] = useState(false);
  const accountDropdownRef = useRef(null);

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

  const stats = [
    { name: 'Total Users', value: '2,847', icon: Users, color: 'bg-blue-600' },
    { name: 'Total Products', value: '1,234', icon: Package, color: 'bg-green-600' },
    { name: 'Total Orders', value: '5,678', icon: ShoppingCart, color: 'bg-purple-600' },
    { name: 'Trust Score Avg', value: '87.3', icon: Shield, color: 'bg-orange-600' },
  ];

  const quickActions = [
    { name: 'Manage Users', icon: Users, description: 'View and manage user accounts', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { name: 'Product Oversight', icon: Package, description: 'Monitor product listings and quality', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
    { name: 'Order Management', icon: ShoppingCart, description: 'Manage orders and update delivery status', action: () => setShowOrderManagement(true), color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { name: 'Trust Analytics', icon: BarChart3, description: 'Detailed product trust analysis with IP, reviews, and network data', action: () => setShowTrustAnalysis(true), color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
    { name: 'Network Analysis', icon: Network, description: 'Visualize product network clusters (120 products)', action: () => setShowNetworkGraph(true), color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { name: 'Cluster Network Analysis', icon: Eye, description: 'Advanced cluster-based network visualization with product connections', action: () => setShowClusterNetwork(true), color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200' },
    { name: 'Large Dataset Analysis', icon: Zap, description: 'High-performance visualization (64K products)', action: () => setShowOptimizedGraph(true), color: 'bg-pink-50 hover:bg-pink-100 border-pink-200' },
    { name: 'System Settings', icon: Settings, description: 'Configure platform settings', color: 'bg-gray-50 hover:bg-gray-100 border-gray-200' },
    { name: 'Fraud Alerts', icon: AlertCircle, description: 'Review flagged activities', color: 'bg-red-50 hover:bg-red-100 border-red-200' },
    { name: 'Verification Queue', icon: UserCheck, description: 'Approve seller verifications', color: 'bg-teal-50 hover:bg-teal-100 border-teal-200' },
  ];

  // Trust Analysis view
  if (showTrustAnalysis) {
    return <AdminTrustAnalysis onBack={() => setShowTrustAnalysis(false)} />;
  }

  // Order Management view
  if (showOrderManagement) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Amazon-style Admin Header */}
        <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowOrderManagement(false)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm">Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2">
                  <img 
                    src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                    alt="Amazon" 
                    className="h-6 w-auto"
                  />
                  <h1 className="text-lg font-bold text-blue-400">Eye Admin</h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-300">Admin Panel</span>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <AdminOrderManagement onBack={() => setShowOrderManagement(false)} />
        </div>
      </div>
    );
  }

  // Full screen cluster network graph view
  if (showClusterNetwork) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Amazon-style Admin Header */}
        <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowClusterNetwork(false)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm">Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2">
                  <img 
                    src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                    alt="Amazon" 
                    className="h-6 w-auto"
                  />
                  <h1 className="text-lg font-bold text-blue-400">Eye Admin</h1>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">Cluster Network Analysis</span>
                  <div className="text-xs text-gray-400">Interactive product connections</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-300">Admin Panel</span>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Full Screen Cluster Network Graph */}
        <div className="h-screen pt-16 pb-4 px-4">
          <div className="h-full">
            <ClusterNetworkGraph />
          </div>
        </div>
      </div>
    );
  }

  // Full screen optimized network graph view
  if (showOptimizedGraph) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Amazon-style Admin Header */}
        <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowOptimizedGraph(false)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm">Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2">
                  <img 
                    src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                    alt="Amazon" 
                    className="h-6 w-auto"
                  />
                  <h1 className="text-lg font-bold text-blue-400">Eye Admin</h1>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">Large Dataset Analysis</span>
                  <div className="text-xs text-gray-400">64K products visualization</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-300">Admin Panel</span>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Full Screen Optimized Network Graph */}
        <div className="h-screen pt-16 pb-4 px-4">
          <div className="h-full">
            <NetworkGraphOptimized />
          </div>
        </div>
      </div>
    );
  }

  // Full screen network graph view (original)
  if (showNetworkGraph) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Amazon-style Admin Header */}
        <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowNetworkGraph(false)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm">Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2">
                  <img 
                    src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                    alt="Amazon" 
                    className="h-6 w-auto"
                  />
                  <h1 className="text-lg font-bold text-blue-400">Eye Admin</h1>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">Product Network Analysis</span>
                  <div className="text-xs text-gray-400">120 products visualization</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-300">Admin Panel</span>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Full Screen Network Graph */}
        <div className="h-screen pt-16">
          <div className="h-full">
            <NetworkGraph />
          </div>
        </div>
      </div>
    );
  }

  // Regular dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Amazon-style Admin Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                  alt="Amazon" 
                  className="h-7 w-auto"
                />
                <h1 className="text-xl font-bold text-blue-400">Eye Admin</h1>
              </div>
              <div className="text-sm">
                <span className="text-gray-300">Admin Dashboard</span>
                <div className="text-xs text-gray-400">Platform Management</div>
              </div>
            </div>

            {/* Right side - Account and Logout */}
            <div className="flex items-center gap-4">
              <div className="relative" ref={accountDropdownRef}>
                <button 
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex flex-col items-start hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                >
                  <span className="text-xs text-gray-300">
                    Hello, {user?.name?.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">Admin Account</span>
                    <ChevronDown size={12} className={`transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {isAccountDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-2xl border z-50 w-56">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide border-b">
                        Admin Account
                      </div>
                      
                      <div className="px-4 py-3 bg-orange-50 border-b">
                        <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                        <div className="text-xs text-gray-600">{user?.email}</div>
                        <div className="text-xs text-orange-600 font-medium capitalize mt-1">
                          {user?.role?.toLowerCase()} Access
                        </div>
                      </div>
                      
                      <div className="border-t pt-2">
                        <button 
                          onClick={() => {
                            navigate('/profile');
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                        >
                          <User size={16} />
                          Admin Profile
                        </button>
                        <button 
                          onClick={() => {
                            navigate('/admin/settings');
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                        >
                          <Settings size={16} />
                          System Settings
                        </button>
                      </div>
                      
                      <div className="border-t mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600 font-medium"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Secondary navigation bar */}
        <nav className="bg-gray-800 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center space-x-8 py-2">
              <span className="text-sm text-yellow-400 font-medium">Dashboard</span>
              <span className="text-sm hover:text-white transition-colors cursor-pointer">Analytics</span>
              <span className="text-sm hover:text-white transition-colors cursor-pointer">Users</span>
              <span className="text-sm hover:text-white transition-colors cursor-pointer">Products</span>
              <span className="text-sm hover:text-white transition-colors cursor-pointer">Orders</span>
              <span className="text-sm hover:text-white transition-colors cursor-pointer">Reports</span>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <Eye size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-orange-100 mt-1 text-lg">Amazon Eye Admin Control Center</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-white" />
                <h3 className="font-semibold">Platform Health</h3>
              </div>
              <p className="text-orange-100 text-sm">All systems operational. Trust detection running smoothly.</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-white" />
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <p className="text-orange-100 text-sm">15 new sellers verified, 3 fraud cases resolved today.</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={20} className="text-white" />
                <h3 className="font-semibold">Pending Actions</h3>
              </div>
              <p className="text-orange-100 text-sm">2 seller applications, 5 product reviews awaiting approval.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <Settings className="text-white" size={14} />
            </div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.name}
                  onClick={action.action}
                  className={`text-left p-4 border rounded-lg transition-all group ${action.color}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border transition-colors">
                      <IconComponent className="text-gray-700" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{action.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-orange-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">More Features Coming Soon</h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              We're working on advanced analytics, automated fraud detection, seller performance metrics, 
              and comprehensive reporting tools to make your Amazon Eye admin experience even better.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                🚀 In Development
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 