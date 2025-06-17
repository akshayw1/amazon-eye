import React from 'react';
import { 
  Shield, 
  Truck, 
  RotateCcw, 
  Zap,
  CheckCircle,
  Award
} from 'lucide-react';

const TrustSummary = ({ product, trustBreakdown }) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
          <Shield className="text-green-600" size={18} />
          Trust Summary
        </h4>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-green-700">{product.trustScore}/100</span>
        </div>
      </div>
      
      {/* Trust Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/70 rounded-lg p-3 text-center border border-white/50">
          <div className="text-lg font-bold text-green-600">{trustBreakdown.reviews}</div>
          <div className="text-xs text-gray-600 font-medium">Reviews</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-white/50">
          <div className="text-lg font-bold text-blue-600">{trustBreakdown.authenticity}</div>
          <div className="text-xs text-gray-600 font-medium">Authentic</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-white/50">
          <div className="text-lg font-bold text-purple-600">4.8★</div>
          <div className="text-xs text-gray-600 font-medium">Rating</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-white/50">
          <div className="text-lg font-bold text-orange-600">2.8K</div>
          <div className="text-xs text-gray-600 font-medium">Verified</div>
        </div>
      </div>
      
      {/* Additional Trust Points */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-green-500" />
            <span className="text-xs font-medium text-gray-700">Delivery Trust</span>
          </div>
          <span className="text-xs font-bold text-green-600">96%</span>
        </div>
        <div className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <RotateCcw size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-gray-700">Return Policy</span>
          </div>
          <span className="text-xs font-bold text-blue-600">Excellent</span>
        </div>
        <div className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-yellow-500" />
            <span className="text-xs font-medium text-gray-700">AI Verified</span>
          </div>
          <span className="text-xs font-bold text-yellow-600">2 hrs ago</span>
        </div>
      </div>
      
      {/* Trust Badges */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <CheckCircle size={12} className="text-green-500" />
          <span className="text-green-700 font-medium">Verified Seller</span>
        </div>
        <div className="flex items-center gap-1">
          <Award size={12} className="text-blue-500" />
          <span className="text-blue-700 font-medium">Quality Assured</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-3 pt-3 border-t border-white/50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>📦 4K+ sold this month</span>
          <span>🔒 Price verified ✓</span>
        </div>
      </div>
    </div>
  );
};

export default TrustSummary; 