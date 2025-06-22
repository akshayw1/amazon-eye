import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Flag,
  ExternalLink,
  Eye,
  MapPin,
  QrCode,
  Phone,
  Camera,
  Network,
  Users,
  BarChart3,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  MessageSquare
} from 'lucide-react';

const TrustSidebar = ({ product, alternatives = [], trustHistory = [] }) => {
  const [trustData, setTrustData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getTrustScoreColor = (score) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustScoreGradient = (score) => {
    if (score >= 0.7) return 'from-green-400 to-green-600';
    if (score >= 0.4) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getTrustLabel = (score) => {
    if (score >= 0.7) return 'TRUSTED';
    if (score >= 0.4) return 'CAUTION';
    return 'RISKY';
  };

  const getReviewHealthStatus = (fakePercent, ipScore, fakeScore) => {
    const avgScore = ((100 - fakePercent) / 100 + ipScore + (1 - fakeScore)) / 3;
    if (avgScore >= 0.7) return { label: 'Healthy', color: 'green', icon: CheckCircle };
    if (avgScore >= 0.4) return { label: 'Suspicious', color: 'yellow', icon: AlertCircle };
    return { label: 'Problematic', color: 'red', icon: XCircle };
  };

  const getListingHealthStatus = (listingScore) => {
    if (listingScore >= 0.8) return { label: 'Clean', color: 'green', icon: CheckCircle };
    if (listingScore >= 0.6) return { label: 'Minor Issues', color: 'yellow', icon: AlertCircle };
    return { label: 'Suspicious Activity', color: 'red', icon: XCircle };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="border-b border-gray-200 pb-6">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="w-28 h-28 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          <span className="font-medium">Failed to load trust data</span>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!trustData) return null;

  const trustScorePercent = Math.round(trustData.trust_score * 100);
  const trustScoreColor = getTrustScoreColor(trustData.trust_score);
  const trustLabel = getTrustLabel(trustData.trust_score);

  const reviewHealth = getReviewHealthStatus(
    trustData.components.fake_reviews_percentage,
    trustData.components.IP_score,
    trustData.components.fake_score
  );

  const listingHealth = getListingHealthStatus(trustData.components.Listing_score);

  return (
    <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {/* Trust Score */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="font-bold text-gray-900 mb-6">Overall Trust Score</h3>
        <div className="relative mb-6">
          <div className="w-32 h-32 mx-auto relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f3f4f6"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#trustGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - trustData.trust_score)}`}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={trustData.trust_score >= 0.7 ? "#10b981" : trustData.trust_score >= 0.4 ? "#f59e0b" : "#ef4444"} />
                  <stop offset="100%" stopColor={trustData.trust_score >= 0.7 ? "#059669" : trustData.trust_score >= 0.4 ? "#d97706" : "#dc2626"} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${trustScoreColor}`}>{trustScorePercent}</span>
              <span className={`text-xs font-bold ${trustScoreColor}`}>{trustLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Analysis - Consolidated */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Review Analysis</h3>
          </div>
          <div className="flex items-center gap-2">
            {React.createElement(reviewHealth.icon, { 
              size: 16, 
              className: `text-${reviewHealth.color}-500` 
            })}
            <span className={`px-2 py-1 rounded text-xs font-medium bg-${reviewHealth.color}-100 text-${reviewHealth.color}-700`}>
              {reviewHealth.label}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Main Issues Summary */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Fake Reviews Detected</span>
              <span className="text-xl font-bold text-red-600">{trustData.components.fake_reviews_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${trustData.components.fake_reviews_percentage}%` }}
              ></div>
            </div>

            {/* IP Analysis Summary */}
            <div className="text-sm text-gray-700 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-orange-500" />
                <span className="font-medium">IP Pattern Analysis:</span>
              </div>
              <p className="text-xs text-gray-600 ml-5">
                {trustData.components.IP_score < 0.5 ? 
                  "Multiple reviews from same IP addresses detected - indicates coordinated fake reviewing" :
                  trustData.components.IP_score < 0.8 ?
                  "Some reviews share IP addresses - moderate suspicious activity" :
                  "Reviews come from diverse IP addresses - normal pattern"
                }
              </p>
            </div>

            {/* See More Button */}
            <button 
              onClick={() => toggleSection('reviewDetails')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <span>See detailed analysis</span>
              {expandedSections.reviewDetails ? 
                <ChevronUp size={16} /> : 
                <ChevronDown size={16} />
              }
            </button>

            {/* Expanded Details */}
            {expandedSections.reviewDetails && (
              <div className="mt-4 pt-4 border-t border-orange-200 space-y-3">
                <div className="text-xs text-gray-600">
                  <h4 className="font-medium text-gray-800 mb-2">Detailed Breakdown:</h4>
                  
                  <div className="bg-white rounded p-3 space-y-2">
                    <div className="flex justify-between">
                      <span>Fake Review Score:</span>
                      <span className="font-medium">{Math.round(trustData.components.fake_score * 100)}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP Diversity Score:</span>
                      <span className="font-medium">{Math.round(trustData.components.IP_score * 100)}/100</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="font-medium text-gray-700 mb-1">Example fake review pattern:</p>
                    <p className="bg-gray-100 p-2 rounded text-xs italic">
                      "{trustData.trust_summary.fake_reviews_percentage?.explanation?.split('Example: ')[1]?.substring(0, 150) || 'AI-generated content detected'}..."
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="font-medium text-gray-700 mb-1">IP Analysis Details:</p>
                    <p>{trustData.trust_summary.IP_score?.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Review Call Analysis */}
          {trustData.trust_summary.review_call_score && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Review Pattern Analysis</span>
              </div>
              <p className="text-xs text-blue-700">
                {trustData.trust_summary.review_call_score.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Listing Monitoring */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit3 size={20} className="text-purple-600" />
            <h3 className="font-semibold text-gray-900">Listing Monitoring</h3>
          </div>
          <div className="flex items-center gap-2">
            {React.createElement(listingHealth.icon, { 
              size: 16, 
              className: `text-${listingHealth.color}-500` 
            })}
            <span className={`px-2 py-1 rounded text-xs font-medium bg-${listingHealth.color}-100 text-${listingHealth.color}-700`}>
              {listingHealth.label}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Seller Edit Activity</span>
            <span className="text-lg font-bold text-purple-600">{Math.round(trustData.components.Listing_score * 100)}/100</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${getTrustScoreGradient(trustData.components.Listing_score)}`}
              style={{ width: `${trustData.components.Listing_score * 100}%` }}
            ></div>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            {trustData.trust_summary.Listing_score?.explanation}
          </p>

          <button 
            onClick={() => toggleSection('listingDetails')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            <span>View edit history</span>
            {expandedSections.listingDetails ? 
              <ChevronUp size={16} /> : 
              <ChevronDown size={16} />
            }
          </button>

          {expandedSections.listingDetails && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="text-xs text-gray-600">
                <h4 className="font-medium text-gray-800 mb-2">What we monitor:</h4>
                <ul className="space-y-1 ml-4">
                  <li>• Suspicious bulk edits at same timestamp</li>
                  <li>• Rapid price changes to mislead buyers</li>
                  <li>• Title/description modifications after reviews</li>
                  <li>• Category switching to game algorithms</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Network Analysis */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Network size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Network Analysis</h3>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Cluster Risk Level</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              trustData.network_summary.cluster_risk === 'TRUSTWORTHY' ? 'bg-green-100 text-green-700' :
              trustData.network_summary.cluster_risk === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {trustData.network_summary.cluster_risk}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cluster #</span>
              <p className="font-bold text-gray-900">{trustData.network_summary.cluster_id}</p>
            </div>
            <div>
              <span className="text-gray-600">Fake Rate</span>
              <p className="font-bold text-red-600">{trustData.network_summary.cluster_fake_percent}%</p>
            </div>
            <div>
              <span className="text-gray-600">Similar Products</span>
              <p className="font-bold text-gray-900">{trustData.network_summary.cluster_total_products.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Connections</span>
              <p className="font-bold text-gray-900">{trustData.network_summary.w_degree}</p>
            </div>
          </div>
          
          <button 
            onClick={() => toggleSection('networkDetails')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <span>Learn about network analysis</span>
            {expandedSections.networkDetails ? 
              <ChevronUp size={16} /> : 
              <ChevronDown size={16} />
            }
          </button>

          {expandedSections.networkDetails && (
            <div className="text-xs text-gray-600 space-y-2 pt-3 border-t border-blue-200">
              <div className="flex items-start gap-2">
                <BarChart3 size={12} className="text-blue-500 mt-0.5" />
                <span>{trustData.network_summary.clustering_coef_desc}</span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp size={12} className="text-green-500 mt-0.5" />
                <span>{trustData.network_summary.pagerank_desc}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Analysis */}
      {(trustData.trust_summary.returns || trustData.trust_summary.trustworthiness_score) && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Additional Insights</h3>
          <div className="space-y-3">
            {trustData.trust_summary.returns && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Return Analysis</span>
                </div>
                <p className="text-xs text-yellow-700">
                  {trustData.trust_summary.returns.explanation}
                </p>
              </div>
            )}

            {trustData.trust_summary.trustworthiness_score && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Camera size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Image Authenticity</span>
                </div>
                <p className="text-xs text-purple-700">
                  {trustData.trust_summary.trustworthiness_score.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification Tools */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Verification Tools</h3>
        <div className="grid grid-cols-1 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200 border border-blue-200">
            <QrCode size={18} />
            <span className="font-medium">Scan for Authenticity</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-200 border border-green-200">
            <Phone size={18} />
            <span className="font-medium">Verify with Seller</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all duration-200 border border-purple-200">
            <Camera size={18} />
            <span className="font-medium">Reverse Image Search</span>
          </button>
        </div>
      </div>

      {/* Trust Actions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Trust Actions</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg transition-all duration-200">
            <Eye size={16} />
            <span className="font-medium">Add to Watchlist</span>
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-all duration-200">
            <Flag size={16} />
            <span className="font-medium">Report Suspicious Activity</span>
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-all duration-200">
            <ExternalLink size={16} />
            <span className="font-medium">Share Trust Report</span>
          </button>
        </div>
        
        {trustData.network_summary.cluster_fake_percent > 5 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <MapPin className="text-orange-600 mt-0.5" size={16} />
              <div>
                <h4 className="text-sm font-medium text-orange-800">High Risk Cluster Alert</h4>
                <p className="text-xs text-orange-700 mt-1">
                  This product belongs to a cluster with {trustData.network_summary.cluster_fake_percent}% fake rate. Exercise extra caution before purchasing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrustSidebar; 