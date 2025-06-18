import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Shield, 
  AlertTriangle, 
  AlertCircle,
  Heart,
  Eye,
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const getTrustBadge = (score) => {
    const roundedScore = Math.round(score);
    
    let badgeConfig;
    if (score >= 85) {
      badgeConfig = {
        color: 'bg-green-600', 
        icon: Shield, 
        text: 'Trusted',
        textColor: 'text-white'
      };
    } else if (score >= 70) {
      badgeConfig = {
        color: 'bg-blue-600', 
        icon: Shield, 
        text: 'Good',
        textColor: 'text-white'
      };
    } else if (score >= 50) {
      badgeConfig = {
        color: 'bg-yellow-500', 
        icon: AlertTriangle, 
        text: 'Caution',
        textColor: 'text-white'
      };
    } else if (score >= 30) {
      badgeConfig = {
        color: 'bg-orange-500', 
        icon: AlertCircle, 
        text: 'Risk',
        textColor: 'text-white'
      };
    } else {
      badgeConfig = {
        color: 'bg-red-500', 
        icon: AlertCircle, 
        text: 'High Risk',
        textColor: 'text-white'
      };
    }
    
    const BadgeIcon = badgeConfig.icon;
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badgeConfig.color} ${badgeConfig.textColor} shadow-lg`}>
        <BadgeIcon size={12} />
        <span>{badgeConfig.text}</span>
        <span className="ml-0.5 opacity-90">{roundedScore}</span>
      </div>
    );
  };

  const getTrustScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative group border border-gray-100 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute top-3 left-3">
          {getTrustBadge(product.trustScore)}
        </div>
        
        {product.bestseller && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <Award size={12} />
            <span>Bestseller</span>
          </div>
        )}
        
        <div className="absolute top-14 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button 
            className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full hover:bg-white shadow-lg mb-2 transform hover:scale-110 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart size={16} className="text-gray-700 hover:text-red-500 transition-colors" />
          </button>
          <button 
            className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full hover:bg-white shadow-lg transform hover:scale-110 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={16} className="text-gray-700 hover:text-blue-500 transition-colors" />
          </button>
        </div>
        
        {product.originalPrice > product.price && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{product.category}</span>
          <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getTrustScoreColor(product.trustScore)}`}>
            {product.trustScore}/100
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-800 line-clamp-2 text-lg leading-snug">{product.name}</h3>
        
        <div className="flex items-center gap-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-sm text-gray-700 font-medium">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviews.toLocaleString()})</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        
        <button 
          className="w-full bg-[#1F2937] text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          Add to Cart
        </button>
      </div>

      {/* Enhanced Hover Popup */}
      {isHovered && (
        <div className="absolute top-full left-0 right-0 bg-white border shadow-2xl rounded-xl p-5 z-20 mt-2 border-gray-200">
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Trust Analysis</div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Product Quality:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${product.trustScore >= 80 ? 'bg-green-500' : product.trustScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${product.trustScore}%` }}></div>
                  </div>
                  <span className="font-semibold text-gray-800">{product.trustScore}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Seller Rating:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.max(80, product.trustScore - 5)}%` }}></div>
                  </div>
                  <span className="font-semibold text-gray-800">{Math.max(80, product.trustScore - 5)}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Review Authenticity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '95%' }}></div>
                  </div>
                  <span className="font-semibold text-gray-800">95%</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-green-600 text-sm font-medium">Verified Purchase Reviews</span>
            </div>
            
            <div className="text-gray-500 text-xs">
              Trust score updated 2 hours ago
            </div>
            
            <button className="text-[#1F2937] text-sm hover:underline font-medium flex items-center gap-1.5 hover:text-gray-800 transition-colors">
              <TrendingUp size={14} />
              View detailed analysis →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard; 