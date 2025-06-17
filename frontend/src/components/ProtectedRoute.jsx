import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user's actual role
        switch (user?.role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'SELLER':
            navigate('/seller/dashboard');
            break;
          case 'CUSTOMER':
          default:
            navigate('/');
            break;
        }
        return;
      }
    }
  }, [isAuthenticated, user, requiredRole, navigate, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mb-4 shadow-lg">
            <Shield className="text-white animate-pulse" size={32} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show role mismatch message if user doesn't have required role
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="text-yellow-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
          <p className="text-gray-600 mb-6">
            You don't have the required permissions to access this page. 
            Required role: {requiredRole}, Your role: {user?.role}
          </p>
          <button
            onClick={() => {
              switch (user?.role) {
                case 'ADMIN':
                  navigate('/admin/dashboard');
                  break;
                case 'SELLER':
                  navigate('/seller/dashboard');
                  break;
                case 'CUSTOMER':
                default:
                  navigate('/');
                  break;
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render the protected content if all checks pass
  return children;
};

export default ProtectedRoute; 