import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productsApi } from '../services/api';
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
  Clock,
  Edit,
  History,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Fetch seller's products
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await productsApi.getSellerProducts({
        page,
        perPage: 10,
        search: searchTerm
      });
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product edit history
  const fetchProductHistory = async (productId) => {
    try {
      const response = await productsApi.getProductHistory(productId);
      setEditHistory(response.data);
    } catch (error) {
      console.error('Error fetching product history:', error);
    }
  };

  // Handle product edit
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // Handle view history
  const handleViewHistory = async (product) => {
    setSelectedProduct(product);
    await fetchProductHistory(product.id);
    setShowHistoryModal(true);
  };

  // Update product
  const handleUpdateProduct = async (productData) => {
    try {
      await productsApi.updateProductWithHistory(selectedProduct.id, productData);
      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProducts(pagination.page); // Refresh the list
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, searchTerm]);

  const stats = [
    { name: 'Total Products', value: '24', icon: Package, color: 'bg-blue-500', change: '+2 this week' },
    { name: 'Total Sales', value: '$3,247', icon: DollarSign, color: 'bg-green-500', change: '+15% this month' },
    { name: 'Avg Rating', value: '4.8', icon: Star, color: 'bg-yellow-500', change: '+0.2 this month' },
    { name: 'Trust Score', value: '92', icon: Eye, color: 'bg-purple-500', change: '+5 points' },
  ];

  const quickActions = [
    { name: 'Add New Product', icon: Plus, description: 'List a new product for sale', color: 'bg-green-500' },
    { name: 'Manage Products', icon: Package, description: 'Edit products and view history', color: 'bg-orange-500', action: () => setActiveTab('products') },
    { name: 'View Analytics', icon: BarChart3, description: 'Check your sales performance', color: 'bg-blue-500' },
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
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Products
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
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
                      onClick={action.action || (() => {})}
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
          </>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Products Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                <p className="text-gray-600">Manage your product listings and view edit history</p>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Plus size={20} />
                Add Product
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Start by adding your first product to the marketplace.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images?.[0] || '/placeholder-product.jpg'}
                                alt={product.name}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Updated {new Date(product.updatedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${product.price.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              product.stock > 10 ? 'text-green-600' : 
                              product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {product.stock} units
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div>{product._count?.reviewInfos || 0} reviews</div>
                            <div>{product._count?.orderItems || 0} orders</div>
                            <div>{product._count?.editHistory || 0} edits</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-green-600 hover:text-green-800 p-1 rounded"
                                title="Edit Product"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleViewHistory(product)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                title="View Edit History"
                              >
                                <History size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchProducts(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchProducts(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <ProductEditModal
            product={selectedProduct}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateProduct}
          />
        )}

        {/* History Modal */}
        {showHistoryModal && selectedProduct && (
          <ProductHistoryModal
            product={selectedProduct}
            history={editHistory}
            onClose={() => setShowHistoryModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Product Edit Modal Component
const ProductEditModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    editReason: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Edit Product</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
              <option value="Health & Beauty">Health & Beauty</option>
              <option value="Toys">Toys</option>
              <option value="Automotive">Automotive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Edit (Optional)
            </label>
            <input
              type="text"
              value={formData.editReason}
              onChange={(e) => setFormData({ ...formData, editReason: e.target.value })}
              placeholder="e.g., Price update, Stock adjustment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Product History Modal Component
const ProductHistoryModal = ({ product, history, onClose }) => {
  const formatValue = (value) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join(', ') : value;
    } catch {
      return value;
    }
  };

  const getFieldDisplayName = (field) => {
    const fieldNames = {
      name: 'Product Name',
      description: 'Description',
      price: 'Price',
      stock: 'Stock',
      category: 'Category',
      images: 'Images'
    };
    return fieldNames[field] || field;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Edit History - {product.name}</h3>
        </div>
        
        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No edit history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((edit) => (
                <div key={edit.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getFieldDisplayName(edit.fieldChanged)} Updated
                      </h4>
                      <p className="text-sm text-gray-600">
                        By {edit.editor.name} on {new Date(edit.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {edit.editType}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Previous Value:</p>
                      <p className="text-sm text-gray-900 bg-red-50 p-2 rounded border-l-4 border-red-200">
                        {edit.oldValue ? formatValue(edit.oldValue) : 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">New Value:</p>
                      <p className="text-sm text-gray-900 bg-green-50 p-2 rounded border-l-4 border-green-200">
                        {edit.newValue ? formatValue(edit.newValue) : 'None'}
                      </p>
                    </div>
                  </div>
                  
                  {edit.editReason && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reason:</p>
                      <p className="text-sm text-gray-600 italic">{edit.editReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 