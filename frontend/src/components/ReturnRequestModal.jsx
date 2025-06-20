import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ordersApi } from '../services/api';

export default function ReturnRequestModal({ isOpen, onClose, order, item, onSubmitted }) {
  const [formData, setFormData] = useState({
    title: '',
    reason: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const returnReasons = [
    'Defective or damaged product',
    'Product not as described',
    'Wrong item received',
    'Size/color not suitable',
    'Quality issues',
    'Changed my mind',
    'Better price found elsewhere',
    'No longer needed',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const returnData = {
        productId: item.product.id,
        title: formData.title.trim(),
        reason: formData.reason.trim(),
        description: formData.description.trim()
      };

      await ordersApi.createReturnRequest(order.id, returnData);
      
      // Reset form
      setFormData({
        title: '',
        reason: '',
        description: ''
      });

      // Notify parent component
      onSubmitted();
      
      // Close modal
      onClose();
    } catch (err) {
      console.error('Error creating return request:', err);
      setError(err.response?.data?.message || 'Failed to submit return request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReasonChange = (reason) => {
    setFormData({ ...formData, reason });
    
    // Auto-generate title based on reason
    if (!formData.title.trim()) {
      setFormData(prev => ({
        ...prev,
        reason,
        title: `Return request: ${reason}`
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal container */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Request Return</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Product info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={item.product.images?.[0] || "/placeholder-product.jpg"}
                alt={item.product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div>
                <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                <p className="text-sm text-gray-500">
                  Order #{order.orderNumber} • ${item.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Title field */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Return Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief title for your return request"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Reason dropdown */}
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Return <span className="text-red-500">*</span>
              </label>
              <select
                id="reason"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.reason}
                onChange={(e) => handleReasonChange(e.target.value)}
              >
                <option value="">Select a reason</option>
                {returnReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Description field */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide any additional details about your return request..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </form>

          {/* Help text */}
          <div className="mt-4 text-xs text-gray-500">
            <p>
              Your return request will be reviewed by our team. You'll receive an email confirmation
              and updates on the status of your request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 