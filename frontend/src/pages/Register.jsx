import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  User,
  Chrome,
  Facebook,
  Apple,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  
  const navigate = useNavigate();
  const { register, isAuthenticated, getDashboardRoute } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const dashboardRoute = getDashboardRoute();
      navigate(dashboardRoute);
    }
  }, [isAuthenticated, navigate, getDashboardRoute]);

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async () => {
    setIsLoading(true);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      toast.error('Please meet all password requirements');
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the Terms and Conditions');
      setIsLoading(false);
      return;
    }

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const result = await register(fullName, formData.email, formData.password, formData.role, formData.phone);
      
      if (result.success) {
        toast.success('Registration successful! Welcome to Amazon Eye!');
        
        // Use user data directly from register response instead of context state
        const userRole = result?.user?.role;
        let dashboardRoute = '/';
        
        switch (userRole) {
          case 'ADMIN':
            dashboardRoute = '/admin/dashboard';
            break;
          case 'SELLER':
            dashboardRoute = '/seller/dashboard';
            break;
          case 'CUSTOMER':
          default:
            dashboardRoute = '/';
            break;
        }
        
        navigate(dashboardRoute);
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    alert(`${provider} registration would be implemented here`);
  };

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
       
            <div className="flex items-center gap-3">
              <img 
                src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                alt="Amazon Logo" 
                className="h-8 w-auto"
              />
              {/* <span className="text-xl font-bold text-white">TrustCommerce</span> */}
            </div>
          </div>
          <div className="text-sm text-gray-300">
            Already have an account? <button onClick={() => navigate('/login')} className="text-orange-400 hover:text-orange-300 transition-colors">Sign in</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mb-4 shadow-lg">
              <Shield className="text-white" size={36} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Create account</h2>
            <p className="text-gray-600">Join TrustCommerce for secure shopping</p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone number (optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-white"
                    required
                  >
                    <option value="CUSTOMER">Customer - I want to buy products</option>
                    <option value="SELLER">Seller - I want to sell products</option>
                    <option value="ADMIN">Admin - I want to manage the platform</option>

                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Choose your account type. You can change this later in your profile settings.
                </p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Password requirements:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center text-sm">
                          {req.met ? (
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                          )}
                          <span className={req.met ? 'text-green-700 font-medium' : 'text-red-700'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                    )}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center text-sm">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-700 font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-red-700">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="agree-terms" className="ml-3 block text-sm text-gray-700">
                    I agree to TrustCommerce's{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">Terms and Conditions</a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">Privacy Policy</a> *
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    id="subscribe-newsletter"
                    name="subscribe-newsletter"
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="subscribe-newsletter" className="ml-3 block text-sm text-gray-700">
                    Send me updates about deals, promotions, and new features
                  </label>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="button"
                onClick={handleRegister}
                disabled={isLoading || !isPasswordValid || !passwordsMatch || !agreeToTerms}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create your TrustCommerce account'
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-600 text-center">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Conditions of Use
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Privacy Notice
                </a>
                .
              </p>
            </div>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or create account with</span>
                </div>
              </div>
            </div>

            {/* Social Registration */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialRegister('Google')}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-red-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Chrome className="h-5 w-5 text-red-500" />
              </button>
              <button
                onClick={() => handleSocialRegister('Facebook')}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
              </button>
              <button
                onClick={() => handleSocialRegister('Apple')}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Apple className="h-5 w-5 text-gray-900" />
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-blue-800">Your data is secure</h3>
                <p className="text-xs text-blue-700 mt-1">
                  We use industry-standard encryption to protect your personal information and never share your data with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Conditions of Use</a>
            <a href="#" className="hover:text-gray-900">Privacy Notice</a>
            <a href="#" className="hover:text-gray-900">Help</a>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            © 2025 TrustCommerce or its affiliates
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;