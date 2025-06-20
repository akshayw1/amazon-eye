import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import ReturnRequestModal from '../components/ReturnRequestModal';

export default function OrderDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (user && id) {
      fetchOrder();
    }
  }, [user, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrder(id);
      setOrder(response);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'PROCESSING':
        return <TruckIcon className="h-6 w-6 text-blue-500" />;
      case 'SHIPPED':
        return <TruckIcon className="h-6 w-6 text-indigo-500" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'CANCELLED':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
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

  const handleReturnRequest = (item) => {
    setSelectedItem(item);
    setShowReturnModal(true);
  };

  const handleReturnSubmitted = () => {
    setShowReturnModal(false);
    setSelectedItem(null);
    // Refresh order to show updated return request status
    fetchOrder();
  };

  const hasReturnRequest = (productId) => {
    return order?.returnRequests?.some(req => req.productId === productId);
  };

  if (!user) {
    return (
    <>
  
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-gray-600">Please login to view order details.</p>
            <Link
              to="/login"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
     
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-32 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
              <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
              <Link
                to="/orders"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/orders"
              className="inline-flex items-center text-blue-600 hover:text-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </div>

          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center space-x-4">
                {getStatusIcon(order.status)}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #{order.orderNumber}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                {order.deliveredAt && (
                  <p className="mb-2">✅ Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</p>
                )}
                {order.shippedAt && (
                  <p className="mb-2">🚚 Shipped on {new Date(order.shippedAt).toLocaleDateString()}</p>
                )}
                <p>📦 Order confirmed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.product.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">Category: {item.product.category}</p>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">${item.total.toFixed(2)}</p>
                        {order.status === 'DELIVERED' && !hasReturnRequest(item.product.id) && (
                          <button
                            onClick={() => handleReturnRequest(item)}
                            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                          >
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Return Item
                          </button>
                        )}
                        {hasReturnRequest(item.product.id) && (
                          <span className="mt-2 inline-block text-sm text-amber-600">
                            Return Requested
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Requests */}
              {order.returnRequests && order.returnRequests.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Return Requests</h2>
                  <div className="space-y-4">
                    {order.returnRequests.map((returnReq) => (
                      <div key={returnReq.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{returnReq.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            returnReq.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            returnReq.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            returnReq.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {returnReq.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Reason:</strong> {returnReq.reason}
                        </p>
                        {returnReq.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Description:</strong> {returnReq.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Requested on {new Date(returnReq.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* AI Summary */}
                        {returnReq.aiSummary && (
                          <div className="mt-4 border-t border-gray-200 pt-3">
                            <div className="flex items-center gap-2 mb-3">
                              <SparklesIcon className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium text-gray-900">Call Analysis</span>
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                AI Generated
                              </span>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3">
                              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: ({children}) => <h1 className="text-base font-semibold text-gray-900 mb-2 border-b border-purple-200 pb-1">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-sm font-semibold text-gray-900 mb-2 mt-3">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-sm font-semibold text-gray-900 mb-1 mt-2">{children}</h3>,
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

                        {returnReq.adminResponse && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Admin Response:</strong> {returnReq.adminResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary & Shipping */}
            <div className="space-y-6">
              {/* Order Total */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={order.shipping === 0 ? "text-green-500" : ""}>
                      {order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="text-sm text-gray-900">
                  <p className="font-medium">{order.firstName} {order.lastName}</p>
                  <p>{order.shippingAddress}</p>
                  <p>{order.city}, {order.state} {order.zipCode}</p>
                  <p className="mt-2">{order.email}</p>
                  {order.phone && <p>{order.phone}</p>}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                <div className="text-sm text-gray-900">
                  <p>{order.paymentMethod || 'Credit Card'}</p>
                  <p className="text-gray-600">Status: {order.paymentStatus}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && selectedItem && (
        <ReturnRequestModal
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          order={order}
          item={selectedItem}
          onSubmitted={handleReturnSubmitted}
        />
      )}
      </>
  );
} 