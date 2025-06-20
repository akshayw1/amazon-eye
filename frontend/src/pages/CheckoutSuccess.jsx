import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, TruckIcon } from '@heroicons/react/24/outline';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

export default function CheckoutSuccess() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const order = location.state?.order;
  const product = location.state?.product;
  const quantity = location.state?.quantity || 1;

  if (!order || !product) {
    navigate('/');
    return null;
  }

  return (
    <>
  
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your order has been confirmed and will be processed soon.
              </p>
            </div>

            {/* Order Details */}
            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                      <dd className="text-sm text-gray-900">{order.orderNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                      <dd className="text-sm text-gray-900 font-semibold">${order.total.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                  <div className="text-sm text-gray-900">
                    <p>{order.firstName} {order.lastName}</p>
                    <p>{order.shippingAddress}</p>
                    <p>{order.city}, {order.state} {order.zipCode}</p>
                    <p>{order.email}</p>
                    {order.phone && <p>{order.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ordered</h3>
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img
                  src={product.images?.[0] || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-gray-500">${product.price} each</p>
                  <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(product.price * quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-blue-700 mb-2">
                <TruckIcon className="h-5 w-5" />
                <span className="font-medium">Delivery Information</span>
              </div>
              <p className="text-sm text-blue-600">
                Your order will be delivered within 2-3 business days. 
                You'll receive tracking information via email once your order ships.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/orders"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
              >
                View All Orders
              </Link>
              <Link
                to="/"
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Help Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600">
                    If you have questions about your order, please contact our customer service team.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Returns & Exchanges</h4>
                  <p className="text-sm text-gray-600">
                    Once your order is delivered, you'll be able to request returns directly from your order history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
  );
} 