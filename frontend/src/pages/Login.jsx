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
  Chrome,
  Facebook,
  Apple
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated, getDashboardRoute ,user} = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    try {
      if (isAuthenticated()) {
        const dashboardRoute = getDashboardRoute();
        console.log('useEffect navigating to:', dashboardRoute);
        navigate(dashboardRoute);
      }
    } catch (error) {
      console.error('useEffect navigation error:', error);
      toast.error('Navigation error occurred');
    }
  }, [isAuthenticated, navigate, getDashboardRoute]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Login successful!');
        // Navigation will be handled by useEffect when isAuthenticated() becomes true
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} login would be implemented here`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              {/* <ArrowLeft size={24} /> */}
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="https://www.pngplay.com/wp-content/uploads/3/White-Amazon-Logo-PNG-HD-Quality.png" 
                alt="Amazon Logo" 
                className="h-8 w-auto"
              />
              {/* <span className="text-xl font-bold text-white">Amazon Eye</span> */}
            </div>
          </div>
          <div className="text-sm text-gray-300">
            Need help? <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">Contact us</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mb-4 shadow-lg">
              <Shield className="text-white" size={36} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your Amazon Eye account</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Email/Phone Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter mobile number or email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter email or mobile number"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter your password"
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Keep me signed in
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-600 text-center">
                By continuing, you agree to Amazon Eye's{' '}
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
                  <span className="px-4 bg-white text-gray-500 font-medium">New to Amazon Eye?</span>
                </div>
              </div>
            </div>

            {/* Create Account Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full flex justify-center py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Create your Amazon Eye account
              </button>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-blue-50 via-white to-orange-50 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-red-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Chrome className="h-5 w-5 text-red-500" />
              </button>
              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
              </button>
              <button
                onClick={() => handleSocialLogin('Apple')}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Apple className="h-5 w-5 text-gray-900" />
              </button>
            </div>
          </div>

          {/* Business Account */}
          <div className="mt-8 text-center">
            <div className="text-sm text-gray-600 mb-2">Buying for work?</div>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
              Create a free business account
            </a>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-blue-800">Secure Login</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Your information is protected with bank-level security and encryption.
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
            © 2025 Amazon Eye or its affiliates
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;