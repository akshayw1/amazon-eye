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

  const getTrustBadge = (badge, score) => {
    const badges = {
      trusted: { 
        color: 'bg-green-600', 
        icon: Shield, 
        text: 'Trusted',
        textColor: 'text-white'
      },
      caution: { 
        color: 'bg-yellow-500', 
        icon: AlertTriangle, 
        text: 'Caution',
        textColor: 'text-white'
      },
      risk: { 
        color: 'bg-red-500', 
        icon: AlertCircle, 
        text: 'Risk',
        textColor: 'text-white'
      }
    };
    
    const BadgeIcon = badges[badge].icon;
    return (
      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${badges[badge].color} ${badges[badge].textColor} shadow-lg`}>
        <BadgeIcon size={12} />
        <span>{badges[badge].text}</span>
        <span className="ml-1 opacity-90">{score}</span>
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
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative group border border-gray-100 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        <div className="absolute top-3 left-3">
          {getTrustBadge(product.trustBadge, product.trustScore)}
        </div>
        
        {product.bestseller && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Award size={12} />
            Bestseller
          </div>
        )}
        
        <div className="absolute top-12 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button 
            className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white shadow-lg mb-2 transform hover:scale-110 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart size={18} className="text-gray-700" />
          </button>
          <button 
            className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white shadow-lg transform hover:scale-110 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={18} className="text-gray-700" />
          </button>
        </div>
        
        {product.originalPrice > product.price && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${getTrustScoreColor(product.trustScore)}`}>
            {product.trustScore}/100
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2 text-lg leading-tight">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-sm text-gray-600 font-medium">{product.rating}</span>
          <span className="text-sm text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        
        <button 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          Add to Cart
        </button>
      </div>

      {/* Enhanced Hover Popup */}
      {isHovered && (
        <div className="absolute top-full left-0 right-0 bg-white border shadow-2xl rounded-xl p-4 z-20 mt-2 border-gray-200">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-800 border-b pb-2">Trust Analysis</div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Product Quality:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${product.trustScore >= 80 ? 'bg-green-500' : product.trustScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${product.trustScore}%` }}></div>
                  </div>
                  <span className="font-medium text-gray-800">{product.trustScore}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Seller Rating:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.max(80, product.trustScore - 5)}%` }}></div>
                  </div>
                  <span className="font-medium text-gray-800">{Math.max(80, product.trustScore - 5)}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Review Authenticity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '95%' }}></div>
                  </div>
                  <span className="font-medium text-gray-800">95%</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-green-600 text-sm font-medium">Verified Purchase Reviews</span>
            </div>
            
            <div className="text-gray-500 text-xs">
              Trust score updated 2 hours ago
            </div>
            
            <button className="text-blue-600 text-sm hover:underline font-medium flex items-center gap-1">
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