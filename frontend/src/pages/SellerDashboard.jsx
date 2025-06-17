import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Star, 
  ShoppingCart, 
  Eye,
  Plus,
  BarChart3,
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Products', value: '24', icon: Package, color: 'bg-blue-500', change: '+2 this week' },
    { name: 'Total Sales', value: '$3,247', icon: DollarSign, color: 'bg-green-500', change: '+15% this month' },
    { name: 'Avg Rating', value: '4.8', icon: Star, color: 'bg-yellow-500', change: '+0.2 this month' },
    { name: 'Trust Score', value: '92', icon: Eye, color: 'bg-purple-500', change: '+5 points' },
  ];

  const quickActions = [
    { name: 'Add New Product', icon: Plus, description: 'List a new product for sale', color: 'bg-green-500' },
    { name: 'View Analytics', icon: BarChart3, description: 'Check your sales performance', color: 'bg-blue-500' },
    { name: 'Manage Inventory', icon: Package, description: 'Update stock and pricing', color: 'bg-orange-500' },
    { name: 'Customer Reviews', icon: Users, description: 'Respond to customer feedback', color: 'bg-purple-500' },
  ];

  const recentOrders = [
    { id: '#1234', product: 'Wireless Headphones', amount: '$89.99', status: 'shipped', customer: 'John D.' },
    { id: '#1235', product: 'Smart Watch', amount: '$199.99', status: 'processing', customer: 'Sarah M.' },
    { id: '#1236', product: 'Phone Case', amount: '$24.99', status: 'delivered', customer: 'Mike R.' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'shipped':
        return <TrendingUp className="text-blue-500" size={16} />;
      case 'processing':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
                Seller Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your products and sales.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 font-medium">Seller Account</div>
                <div className="text-xs text-green-600">{user?.email}</div>
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="text-white" size={24} />
                  </div>
                </div>
                <p className="text-xs text-green-600 font-medium">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <ShoppingCart size={48} className="text-green-100" />
            <div>
              <h2 className="text-2xl font-bold">Welcome to Your Seller Dashboard</h2>
              <p className="text-green-100 mt-1">Grow your business with Amazon Eye's trusted marketplace</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Store Performance</h3>
              <p className="text-green-100 text-sm">Your store is performing well with high trust scores.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Recent Activity</h3>
              <p className="text-green-100 text-sm">3 new orders today, 2 products viewed 50+ times.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Next Steps</h3>
              <p className="text-green-100 text-sm">Consider adding more product photos and descriptions.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.name}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-green-900">{action.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h3>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.product}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{order.amount}</span>
                      <span className="text-xs text-gray-500">{order.customer}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Orders
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">More Seller Tools Coming Soon</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're building advanced inventory management, automated pricing tools, customer communication features, 
              and detailed analytics to help you grow your business on Amazon Eye.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 