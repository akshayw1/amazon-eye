import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PhoneIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ordersApi } from '../services/api';

export default function AdminOrderManagement({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updating, setUpdating] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAllOrders({ page: 1, perPage: 100 });
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      await ordersApi.updateOrderStatus(orderId, newStatus);
      
      // Update the local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              deliveredAt: newStatus === 'DELIVERED' ? new Date().toISOString() : order.deliveredAt,
              shippedAt: newStatus === 'SHIPPED' ? new Date().toISOString() : order.shippedAt
            }
          : order
      ));
      
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'PROCESSING':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'SHIPPED':
        return <TruckIcon className="h-5 w-5 text-indigo-500" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'PROCESSING', 
      'PROCESSING': 'SHIPPED',
      'SHIPPED': 'DELIVERED'
    };
    return statusFlow[currentStatus];
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const orderStatusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const CallTranscript = ({ transcript }) => {
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return <div className="text-sm text-gray-500 italic">No transcript available</div>;
    }

    return (
      <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 p-3 rounded">
        {transcript.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'agent' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-2 rounded-lg ${
              message.type === 'agent' 
                ? 'bg-blue-100 text-blue-900' 
                : 'bg-green-100 text-green-900'
            }`}>
              <div className="text-xs font-medium mb-1">
                {message.type === 'agent' ? '👩‍💼 Sakshi (Agent)' : '👤 Customer'}
              </div>
              <div className="text-sm">{message.text}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ReturnRequestDetails = ({ returnRequests }) => {
    if (!returnRequests || returnRequests.length === 0) {
      return <div className="text-sm text-gray-500 italic">No return requests</div>;
    }

    return (
      <div className="space-y-4">
        {returnRequests.map((returnReq) => (
          <div key={returnReq.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{returnReq.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    returnReq.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    returnReq.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    returnReq.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {returnReq.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Product:</strong> {returnReq.product?.name}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Reason:</strong> {returnReq.reason}
                </div>
                {returnReq.description && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Description:</strong> {returnReq.description}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Requested: {new Date(returnReq.createdAt).toLocaleString()}
                </div>
              </div>
              
                             {/* Call Status */}
               <div className="ml-4 text-right">
                 <div className="flex items-center gap-2 mb-2">
                   {returnReq.isCalled === 'completed' ? (
                     <>
                       <PhoneIcon className="h-4 w-4 text-green-500" />
                       <span className="text-sm text-green-600 font-medium">Call Completed</span>
                     </>
                   ) : returnReq.isCalled === 'initiated' ? (
                     <>
                       <PhoneIcon className="h-4 w-4 text-blue-500" />
                       <span className="text-sm text-blue-600 font-medium">Call Initiated</span>
                     </>
                   ) : returnReq.isCalled === 'failed' ? (
                     <>
                       <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                       <span className="text-sm text-red-600 font-medium">Call Failed</span>
                     </>
                   ) : (
                     <>
                       <ClockIcon className="h-4 w-4 text-yellow-500" />
                       <span className="text-sm text-yellow-600 font-medium">Call Pending</span>
                     </>
                   )}
                 </div>
                {returnReq.callSid && (
                  <div className="text-xs text-gray-500 mb-1">
                    Call ID: {returnReq.callSid}
                  </div>
                )}
              </div>
            </div>
            
            {/* AI Summary */}
            {returnReq.aiSummary && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900">AI Call Analysis</span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    AI Generated
                  </span>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-lg font-semibold text-gray-900 mb-2 border-b border-purple-200 pb-1">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-semibold text-gray-900 mb-2 mt-4">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-semibold text-gray-900 mb-1 mt-3">{children}</h3>,
                        p: ({children}) => <p className="text-sm text-gray-700 mb-2 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="text-sm text-gray-700 mb-2 ml-4 space-y-1">{children}</ul>,
                        li: ({children}) => <li className="text-sm text-gray-700 list-disc">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        em: ({children}) => <em className="italic text-gray-600">{children}</em>
                      }}
                    >
                      {returnReq.aiSummary}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Call Transcript */}
            {(returnReq.isCalled === 'completed' || returnReq.isCalled === 'initiated') && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">Call Transcript</span>
                </div>
                <CallTranscript transcript={returnReq.transcript} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <p className="text-gray-600">Manage and update order statuses</p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
          <div key={status} className="bg-white rounded-lg shadow p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              {getStatusIcon(status)}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {orderStatusCounts[status] || 0}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {status.toLowerCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, customer name, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Orders ({filteredOrders.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Returns
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {order.returnRequests && order.returnRequests.length > 0 && (
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedOrders.has(order.id) ? (
                              <ChevronDownIcon className="h-4 w-4" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.firstName} {order.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {order.returnRequests && order.returnRequests.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-red-600">
                              {order.returnRequests.length}
                            </span>
                            <span className="text-xs text-red-500">
                              return{order.returnRequests.length > 1 ? 's' : ''}
                            </span>
                            {order.returnRequests.some(r => r.isCalled === 'completed') && (
                              <PhoneIcon className="h-4 w-4 text-green-500 ml-1" title="Call Completed" />
                            )}
                            {order.returnRequests.some(r => r.isCalled === 'initiated') && (
                              <PhoneIcon className="h-4 w-4 text-blue-500 ml-1" title="Call Initiated" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {/* Quick Next Status Button */}
                        {getNextStatus(order.status) && (
                          <button
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                            disabled={updating === order.id}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {updating === order.id ? '...' : `Mark ${getNextStatus(order.status)}`}
                          </button>
                        )}
                        
                        {/* Status Dropdown */}
                        <select
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          value=""
                        >
                          <option value="">Change Status</option>
                          {getStatusOptions(order.status).map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Return Request Details */}
                  {expandedOrders.has(order.id) && order.returnRequests && order.returnRequests.length > 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-medium text-gray-900 mb-3">Return Requests & Call Details</h3>
                          <ReturnRequestDetails returnRequests={order.returnRequests} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No orders found matching your criteria</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 