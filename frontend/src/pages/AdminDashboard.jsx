import React from 'react';
import { useAuth } from '../context/AuthContext';
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
  Eye
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Users', value: '2,847', icon: Users, color: 'bg-blue-500' },
    { name: 'Total Products', value: '1,234', icon: Package, color: 'bg-green-500' },
    { name: 'Total Orders', value: '5,678', icon: ShoppingCart, color: 'bg-purple-500' },
    { name: 'Trust Score Avg', value: '87.3', icon: Shield, color: 'bg-orange-500' },
  ];

  const quickActions = [
    { name: 'Manage Users', icon: Users, description: 'View and manage user accounts' },
    { name: 'Product Oversight', icon: Package, description: 'Monitor product listings and quality' },
    { name: 'Trust Analytics', icon: BarChart3, description: 'View trust scores and fraud detection' },
    { name: 'System Settings', icon: Settings, description: 'Configure platform settings' },
    { name: 'Fraud Alerts', icon: AlertCircle, description: 'Review flagged activities' },
    { name: 'Verification Queue', icon: UserCheck, description: 'Approve seller verifications' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your Amazon Eye platform.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 font-medium">Admin Access</div>
                <div className="text-xs text-blue-600">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Eye size={48} className="text-blue-100" />
            <div>
              <h2 className="text-2xl font-bold">Welcome to Amazon Eye Admin Panel</h2>
              <p className="text-blue-100 mt-1">Your central hub for platform management and oversight</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Platform Health</h3>
              <p className="text-blue-100 text-sm">All systems operational. Trust detection running smoothly.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Recent Activity</h3>
              <p className="text-blue-100 text-sm">15 new sellers verified, 3 fraud cases resolved today.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Pending Actions</h3>
              <p className="text-blue-100 text-sm">2 seller applications, 5 product reviews awaiting approval.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.name}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                      <IconComponent className="text-gray-600 group-hover:text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-900">{action.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">More Features Coming Soon</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're working on advanced analytics, automated fraud detection, seller performance metrics, 
              and comprehensive reporting tools to make your admin experience even better.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 