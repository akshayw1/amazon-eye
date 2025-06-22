import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Truck, 
  RotateCcw, 
  Zap,
  CheckCircle,
  Award,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Network,
  MessageSquare,
  Edit3
} from 'lucide-react';

const TrustSummary = ({ product }) => {
  const [trustData, setTrustData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrustData = async () => {
      if (!product?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://13.201.221.97:5000/trust-score/${product.id}`);
        if (!response.ok) throw new Error('Failed to fetch trust data');
        const data = await response.json();
        setTrustData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrustData();
  }, [product?.id]);

  const getTrustColor = (score) => {
    if (score >= 0.7) return { bg: 'from-green-50 to-emerald-50', border: 'border-green-100', text: 'text-green-600', accent: 'text-green-700' };
    if (score >= 0.4) return { bg: 'from-yellow-50 to-orange-50', border: 'border-yellow-100', text: 'text-yellow-600', accent: 'text-yellow-700' };
    return { bg: 'from-red-50 to-pink-50', border: 'border-red-100', text: 'text-red-600', accent: 'text-red-700' };
  };

  const getTrustIcon = (score) => {
    if (score >= 0.7) return CheckCircle;
    if (score >= 0.4) return AlertTriangle;
    return XCircle;
  };

  const getTrustLabel = (score) => {
    if (score >= 0.7) return 'TRUSTED';
    if (score >= 0.4) return 'CAUTION';
    return 'HIGH RISK';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-16"></div>
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !trustData) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle size={18} />
          <span className="font-medium">Trust data unavailable</span>
        </div>
        <p className="text-red-600 text-sm mt-2">Unable to verify product trustworthiness</p>
      </div>
    );
  }

  const trustScore = Math.round(trustData.trust_score * 100);
  const trustColors = getTrustColor(trustData.trust_score);
  const TrustIcon = getTrustIcon(trustData.trust_score);
  const trustLabel = getTrustLabel(trustData.trust_score);

  return (
    <div className={`bg-gradient-to-r ${trustColors.bg} rounded-xl p-4 border ${trustColors.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
          <TrustIcon className={trustColors.text} size={18} />
          Trust Summary
        </h4>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 ${trustData.trust_score >= 0.7 ? 'bg-green-500' : trustData.trust_score >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
          <span className={`text-sm font-bold ${trustColors.accent}`}>{trustScore}/100</span>
          <span className={`text-xs font-bold ${trustColors.text} ml-1`}>{trustLabel}</span>
        </div>
      </div>
      
      {/* Trust Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/70 rounded-lg p-3 text-center border border-white/50">
          <div className={`text-lg font-bold ${trustColors.text}`}>
            {Math.round((100 - trustData.components.fake_reviews_percentage))}%
          </div>
          <div className="text-xs text-gray-600 font-medium">Real Reviews</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-white/50">
          <div className={`text-lg font-bold ${Math.round(trustData.components.IP_score * 100) >= 70 ? 'text-green-600' : Math.round(trustData.components.IP_score * 100) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
            {Math.round(trustData.components.IP_score * 100)}/100
          </div>
          <div className="text-xs text-gray-600 font-medium">IP Trust</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-white/50">
          <div className={`text-lg font-bold ${Math.round(trustData.components.Listing_score * 100) >= 70 ? 'text-green-600' : Math.round(trustData.components.Listing_score * 100) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
            {Math.round(trustData.components.Listing_score * 100)}/100
          </div>
          <div className="text-xs text-gray-600 font-medium">Listing</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-white/50">
          <div className={`text-lg font-bold ${trustData.network_summary.cluster_risk === 'TRUSTWORTHY' ? 'text-green-600' : trustData.network_summary.cluster_risk === 'MODERATE' ? 'text-yellow-600' : 'text-red-600'}`}>
            {trustData.network_summary.cluster_fake_percent}%
          </div>
          <div className="text-xs text-gray-600 font-medium">Cluster Risk</div>
        </div>
      </div>
      
      {/* Key Trust Indicators */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className={trustData.components.fake_reviews_percentage <= 20 ? "text-green-500" : trustData.components.fake_reviews_percentage <= 50 ? "text-yellow-500" : "text-red-500"} />
            <span className="text-xs font-medium text-gray-700">Review Quality</span>
          </div>
          <span className={`text-xs font-bold ${trustData.components.fake_reviews_percentage <= 20 ? "text-green-600" : trustData.components.fake_reviews_percentage <= 50 ? "text-yellow-600" : "text-red-600"}`}>
            {trustData.components.fake_reviews_percentage <= 20 ? "Excellent" : trustData.components.fake_reviews_percentage <= 50 ? "Moderate" : "Poor"}
          </span>
        </div>
        
        <div className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Edit3 size={14} className={trustData.components.Listing_score >= 0.8 ? "text-green-500" : trustData.components.Listing_score >= 0.6 ? "text-yellow-500" : "text-red-500"} />
            <span className="text-xs font-medium text-gray-700">Seller Behavior</span>
          </div>
          <span className={`text-xs font-bold ${trustData.components.Listing_score >= 0.8 ? "text-green-600" : trustData.components.Listing_score >= 0.6 ? "text-yellow-600" : "text-red-600"}`}>
            {trustData.components.Listing_score >= 0.8 ? "Clean" : trustData.components.Listing_score >= 0.6 ? "Suspicious" : "Problematic"}
          </span>
        </div>
        
        <div className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Network size={14} className={trustData.network_summary.cluster_risk === 'TRUSTWORTHY' ? "text-green-500" : trustData.network_summary.cluster_risk === 'MODERATE' ? "text-yellow-500" : "text-red-500"} />
            <span className="text-xs font-medium text-gray-700">Network Analysis</span>
          </div>
          <span className={`text-xs font-bold ${trustData.network_summary.cluster_risk === 'TRUSTWORTHY' ? "text-green-600" : trustData.network_summary.cluster_risk === 'MODERATE' ? "text-yellow-600" : "text-red-600"}`}>
            {trustData.network_summary.cluster_risk.toLowerCase()}
          </span>
        </div>
      </div>
      
      {/* Trust Status Badges */}
      <div className="flex items-center justify-between text-xs">
        {trustData.trust_score >= 0.7 ? (
          <div className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500" />
            <span className="text-green-700 font-medium">Verified Safe</span>
          </div>
        ) : trustData.trust_score >= 0.4 ? (
          <div className="flex items-center gap-1">
            <AlertTriangle size={12} className="text-yellow-500" />
            <span className="text-yellow-700 font-medium">Proceed with Caution</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <XCircle size={12} className="text-red-500" />
            <span className="text-red-700 font-medium">High Risk Product</span>
          </div>
        )}
        
        {trustData.components.fake_reviews_percentage <= 30 ? (
          <div className="flex items-center gap-1">
            <Award size={12} className="text-blue-500" />
            <span className="text-blue-700 font-medium">Quality Reviews</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <AlertTriangle size={12} className="text-orange-500" />
            <span className="text-orange-700 font-medium">Fake Reviews Detected</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-3 pt-3 border-t border-white/50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>🔍 Cluster #{trustData.network_summary.cluster_id}</span>
          <span>📊 {trustData.network_summary.cluster_total_products.toLocaleString()} similar products</span>
        </div>
        {trustData.network_summary.cluster_fake_percent > 5 && (
          <div className="mt-2 text-xs text-orange-700 font-medium">
            ⚠️ High-risk cluster detected ({trustData.network_summary.cluster_fake_percent}% fake rate)
          </div>
        )}
      </div>

      {/* Trust Score Call to Action */}
      {trustData.trust_score < 0.7 && (
        <div className="mt-3 pt-3 border-t border-white/50">
          <div className="text-xs font-medium text-gray-700 mb-1">
            💡 Trust Tip: {trustData.trust_score < 0.4 ? "Consider alternative products" : "Verify seller and reviews before purchase"}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustSummary; 