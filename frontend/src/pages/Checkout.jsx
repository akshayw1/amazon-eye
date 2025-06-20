import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheckIcon, TruckIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import Layout from '../components/layout/Layout';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get product data from navigation state
  const productData = location.state?.product;
  const quantity = location.state?.quantity || 1;

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'Credit Card',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          returnTo: '/checkout',
          message: 'Please login to complete your purchase' 
        }
      });
      return;
    }

    if (!productData) {
      navigate('/');
      return;
    }
  }, [user, productData, navigate]);

  if (!productData) {
    return null;
  }

  const subtotal = productData.price * quantity;
  const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: [
          {
            productId: productData.id,
            quantity: quantity
          }
        ],
        shippingAddress: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod
      };

      const order = await ordersApi.createOrder(orderData);
      
      // Navigate to success page
      navigate('/checkout/success', { 
        state: { 
          order,
          product: productData,
          quantity 
        }
      });
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                  <h2 className="text-2xl font-bold">Secure Checkout</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                          Card Number
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CreditCardIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="cardNumber"
                            required
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                            placeholder="**** **** **** ****"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#232f3e] focus:ring-[#232f3e]"
                          placeholder="***"
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#232f3e] text-white py-3 px-4 rounded-md hover:bg-[#131921] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#232f3e] disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <img
                      src={productData.images?.[0] || "/placeholder-product.jpg"}
                      alt={productData.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{productData.name}</h4>
                      <p className="text-[#B12704]">${productData.price}</p>
                      <div className="flex items-center space-x-1">
                        <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">Trust Score: {productData.trustScore}/100</span>
                      </div>
                    </div>
                    <div className="text-gray-500">x{quantity}</div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-green-500" : ""}>
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 text-green-500">
                  <TruckIcon className="h-5 w-5" />
                  <span>Free Prime Delivery</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Estimated delivery: 2-3 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
  );
} 