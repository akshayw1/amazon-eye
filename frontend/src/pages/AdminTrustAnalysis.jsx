import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Network,
  Edit3,
  RotateCcw,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Users,
  BarChart3,
  FileText,
  Star,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { api, productsApi } from '../services/api';

const AdminTrustAnalysis = ({ onBack }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [trustData, setTrustData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    ipAnalysis: true,
    editAnalysis: true,
    returnAnalysis: true,
    reviewAnalysis: true,
    networkAnalysis: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productsApi.getProducts({ page: 1, perPage: 100 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchTrustAnalysis = async (productId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://13.201.221.97:5000/api/trust/enhanced/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch trust analysis');
      const data = await response.json();
      setTrustData(data);
    } catch (error) {
      console.error('Failed to fetch trust analysis:', error);
      setTrustData(null);
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    fetchTrustAnalysis(product.id);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrustScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrustIcon = (score) => {
    if (score >= 70) return CheckCircle;
    if (score >= 40) return AlertTriangle;
    return XCircle;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-white" size={20} />
                  </div>
                  Trust Analysis Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">Comprehensive product trust analysis with detailed insights</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-700 font-medium">Admin Access</div>
                <div className="text-xs text-orange-600">Trust Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Product Selection */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Selection</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {productsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => selectProduct(product)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedProduct?.id === product.id
                        ? 'bg-orange-50 border-orange-200 shadow-md'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            ${product.price} • {product.reviewCount} reviews
                          </p>
                          {product.trustScore !== undefined && (
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustScoreColor(product.trustScore)}`}>
                              {Math.round(product.trustScore)}%
                            </div>
                          )}
                        </div>
                        {product.fakeProbability !== undefined && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              product.fakeProbability < 0.2 ? 'bg-green-500' : 
                              product.fakeProbability < 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-xs text-gray-500">
                              {product.fakeProbability < 0.2 ? 'Low Risk' : 
                               product.fakeProbability < 0.4 ? 'Medium Risk' : 'High Risk'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Analysis Display */}
        <div className="flex-1 overflow-y-auto">
          {!selectedProduct ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product</h3>
                <p className="text-gray-500">Choose a product from the sidebar to view detailed trust analysis</p>
              </div>
            </div>
          ) : loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : trustData && trustData.analysis_details ? (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {trustData.images && trustData.images[0] && (
                      <img
                        src={trustData.images[0]}
                        alt={trustData.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{trustData.name}</h1>
                      <p className="text-gray-600 mb-3">${trustData.price} • {trustData.category}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📊 {trustData.total_reviews} reviews</span>
                        <span>🔄 {trustData.total_returns} returns</span>
                        <span>📅 Analyzed: {formatDate(trustData.analyzedAt)}</span>
                        <span>🏷️ Product ID: {trustData.product_ID}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trustData.fake ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {trustData.fake ? 'Flagged as Fake' : 'Authentic Product'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trustData.network_summary.cluster_risk === 'TRUSTWORTHY' ? 'bg-green-100 text-green-700' :
                          trustData.network_summary.cluster_risk === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {trustData.network_summary.cluster_risk} Cluster
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getTrustScoreColor(trustData.trust_score)}`}>
                      {React.createElement(getTrustIcon(trustData.trust_score), { size: 20 })}
                      {Math.round(trustData.trust_score)}/100
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Overall Trust Score</p>
                  </div>
                </div>
              </div>

              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">IP Trust Score</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(trustData.IP_score * 100)}</p>
                      <p className="text-xs text-gray-500 mt-1">{trustData.trust_summary.IP_score.label}</p>
                    </div>
                    <MapPin className="text-blue-500" size={24} />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Listing Score</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(trustData.Listing_score * 100)}</p>
                      <p className="text-xs text-gray-500 mt-1">{trustData.trust_summary.Listing_score.label}</p>
                    </div>
                    <Edit3 className="text-purple-500" size={24} />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Fake Reviews</p>
                      <p className="text-2xl font-bold text-red-600">{trustData.trust_summary.fake_reviews_percentage.value}%</p>
                      <p className="text-xs text-gray-500 mt-1">{trustData.trust_summary.fake_reviews_percentage.label}</p>
                    </div>
                    <MessageSquare className="text-red-500" size={24} />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Return Score</p>
                      <p className="text-2xl font-bold text-orange-600">{Math.round(trustData.return_request_score * 100)}</p>
                      <p className="text-xs text-gray-500 mt-1">Quality: {trustData.analysis_details.return_analysis.qualityIssueCount}/{trustData.total_returns}</p>
                    </div>
                    <RotateCcw className="text-orange-500" size={24} />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Network Risk</p>
                      <p className="text-lg font-bold text-gray-900">{trustData.network_summary.cluster_risk}</p>
                      <p className="text-xs text-gray-500 mt-1">Cluster {trustData.cluster_ID}</p>
                    </div>
                    <Network className={`${
                      trustData.network_summary.cluster_risk === 'TRUSTWORTHY' ? 'text-green-500' :
                      trustData.network_summary.cluster_risk === 'MODERATE' ? 'text-yellow-500' :
                      'text-red-500'
                    }`} size={24} />
                  </div>
                </div>
              </div>

              {/* Trust Summary Dashboard */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <Shield className="text-indigo-600" size={24} />
                    Comprehensive Trust Analysis
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Detailed breakdown of all trust indicators and risk factors</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Trust Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* IP Analysis Summary */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="text-blue-600" size={20} />
                        <h3 className="font-semibold text-blue-900">IP Analysis</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Score:</span>
                          <span className="font-medium text-blue-900">{Math.round(trustData.IP_score * 100)}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Status:</span>
                          <span className="font-medium text-blue-900">{trustData.trust_summary.IP_score.label}</span>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">{trustData.trust_summary.IP_score.explanation}</p>
                      </div>
                    </div>

                    {/* Listing Analysis Summary */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Edit3 className="text-purple-600" size={20} />
                        <h3 className="font-semibold text-purple-900">Listing Analysis</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-700">Score:</span>
                          <span className="font-medium text-purple-900">{Math.round(trustData.Listing_score * 100)}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-700">Status:</span>
                          <span className="font-medium text-purple-900">{trustData.trust_summary.Listing_score.label}</span>
                        </div>
                        <p className="text-xs text-purple-700 mt-2">{trustData.trust_summary.Listing_score.explanation}</p>
                      </div>
                    </div>

                    {/* Review Quality Summary */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="text-red-600" size={20} />
                        <h3 className="font-semibold text-red-900">Review Quality</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-red-700">Fake Reviews:</span>
                          <span className="font-medium text-red-900">{trustData.trust_summary.fake_reviews_percentage.value}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-700">Severity:</span>
                          <span className="font-medium text-red-900">{trustData.trust_summary.fake_reviews_percentage.label}</span>
                        </div>
                        <p className="text-xs text-red-700 mt-2">{trustData.trust_summary.fake_reviews_percentage.explanation}</p>
                      </div>
                    </div>

                    {/* Network Analysis Summary */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Network className="text-green-600" size={20} />
                        <h3 className="font-semibold text-green-900">Network Analysis</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Risk Level:</span>
                          <span className="font-medium text-green-900">{trustData.network_summary.cluster_risk}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Fake Score:</span>
                          <span className="font-medium text-green-900">{Math.round(trustData.network_summary.fake_score_processed * 100)}/100</span>
                        </div>
                        <p className="text-xs text-green-700 mt-2">{trustData.trust_summary.network_summ.explanation}</p>
                      </div>
                    </div>

                    {/* Return Analysis Summary */}
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center gap-3 mb-3">
                        <RotateCcw className="text-orange-600" size={20} />
                        <h3 className="font-semibold text-orange-900">Return Analysis</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-700">Total Returns:</span>
                          <span className="font-medium text-orange-900">{trustData.trust_summary.returns.count}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-700">Quality Issues:</span>
                          <span className="font-medium text-orange-900">{trustData.trust_summary.returns.quality_issues}</span>
                        </div>
                        <p className="text-xs text-orange-700 mt-2">{trustData.trust_summary.returns.explanation}</p>
                      </div>
                    </div>

                    {/* Review Call Analysis Summary */}
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Star className="text-teal-600" size={20} />
                        <h3 className="font-semibold text-teal-900">Review Quality</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-teal-700">Score:</span>
                          <span className="font-medium text-teal-900">{Math.round(trustData.review_call_score * 100)}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-teal-700">Status:</span>
                          <span className="font-medium text-teal-900">{trustData.trust_summary.review_call_score.label}</span>
                        </div>
                        <p className="text-xs text-teal-700 mt-2">{trustData.trust_summary.review_call_score.explanation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Network Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Network Cluster Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{trustData.network_summary.cluster_id}</p>
                        <p className="text-xs text-gray-600">Cluster ID</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{trustData.network_summary.cluster_total_products.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Total Products</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{trustData.network_summary.cluster_fake_percent}%</p>
                        <p className="text-xs text-gray-600">Cluster Fake Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{trustData.network_summary.w_degree}</p>
                        <p className="text-xs text-gray-600">Weighted Degree</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* IP Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer border-b border-gray-200"
                  onClick={() => toggleSection('ipAnalysis')}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="text-blue-600" size={24} />
                    <h2 className="text-xl font-semibold text-gray-900">IP Address Analysis</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trustData.analysis_details?.ip_analysis?.trustScore >= 70 ? 'bg-green-100 text-green-700' :
                      trustData.analysis_details?.ip_analysis?.trustScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Score: {trustData.analysis_details?.ip_analysis?.trustScore || 'N/A'}/100
                    </span>
                  </div>
                  {expandedSections.ipAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.ipAnalysis && (
                  <div className="p-6 space-y-6">
                    {/* IP Analysis Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{trustData.analysis_details?.ip_analysis?.breakdown?.totalReviews || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Total Reviews</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{trustData.analysis_details?.ip_analysis?.breakdown?.uniqueIPs || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Unique IPs</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{trustData.analysis_details?.ip_analysis?.breakdown?.ipDiversityScore || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Diversity Score</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{trustData.analysis_details?.ip_analysis?.breakdown?.clusteringScore || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Clustering Score</p>
                      </div>
                    </div>

                    {/* IP Breakdown Table */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top IP Addresses</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Count</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Review</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {trustData.analysis_details?.ip_analysis?.ipBreakdown ? 
                              Object.entries(trustData.analysis_details.ip_analysis.ipBreakdown)
                                .sort(([,a], [,b]) => b.reviewCount - a.reviewCount)
                                .slice(0, 10)
                                .map(([ip, data]) => (
                              <tr key={ip}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{ip}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    data.reviewCount > 3 ? 'bg-red-100 text-red-800' :
                                    data.reviewCount > 1 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {data.reviewCount} reviews
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    data.isSuspicious ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {data.isSuspicious ? 'Suspicious' : 'Normal'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(data.reviews[data.reviews.length - 1]?.date)}
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                  No IP breakdown data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {trustData.analysis_details?.ip_analysis?.recommendations?.length > 0 ? 
                          trustData.analysis_details.ip_analysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-800">• {rec}</li>
                          )) : (
                            <li className="text-sm text-gray-500">No recommendations available</li>
                          )
                        }
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Review Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer border-b border-gray-200"
                  onClick={() => toggleSection('reviewAnalysis')}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-green-600" size={24} />
                    <h2 className="text-xl font-semibold text-gray-900">Review Analysis & Authenticity</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trustData.analysis_details?.review_analysis?.score >= 0.7 ? 'bg-green-100 text-green-700' :
                      trustData.analysis_details?.review_analysis?.score >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Score: {trustData.analysis_details?.review_analysis?.score ? 
                        Math.round(trustData.analysis_details.review_analysis.score * 100) : 'N/A'}/100
                    </span>
                  </div>
                  {expandedSections.reviewAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.reviewAnalysis && (
                  <div className="p-6 space-y-6">
                    {/* Review Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {trustData.analysis_details?.review_analysis?.authenticity_indicators?.genuine_reviews_ratio ? 
                            Math.round(trustData.analysis_details.review_analysis.authenticity_indicators.genuine_reviews_ratio * 100) : 'N/A'}%
                        </p>
                        <p className="text-sm text-gray-600">Genuine Reviews</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {trustData.reviews ? trustData.reviews.filter(r => r.ai_generated).length : 0}
                        </p>
                        <p className="text-sm text-gray-600">AI Generated</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {trustData.analysis_details?.review_analysis?.authenticity_indicators?.common_praise?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Common Praise Patterns</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                          {trustData.analysis_details?.review_analysis?.authenticity_indicators?.common_complaints?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Common Complaints</p>
                      </div>
                    </div>

                    {/* Common Patterns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">Common Praise Patterns</h4>
                        <ul className="space-y-1">
                          {trustData.analysis_details?.review_analysis?.authenticity_indicators?.common_praise?.map((praise, index) => (
                            <li key={index} className="text-sm text-green-800">• {praise}</li>
                          )) || <li className="text-sm text-gray-500">No patterns available</li>}
                        </ul>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-3">Common Complaints</h4>
                        <ul className="space-y-1">
                          {trustData.analysis_details?.review_analysis?.authenticity_indicators?.common_complaints?.map((complaint, index) => (
                            <li key={index} className="text-sm text-red-800">• {complaint}</li>
                          )) || <li className="text-sm text-gray-500">No complaints available</li>}
                        </ul>
                      </div>
                    </div>

                    {/* Recent Reviews Sample */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Recent Reviews Sample (Latest 5)</h4>
                      <div className="space-y-4">
                        {trustData.reviews?.slice(0, 5).map((review, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${
                            review.ai_generated ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={16} 
                                      className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium">{review.rating}/5</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  review.ai_generated ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {review.ai_generated ? 'AI Generated' : 'Human'}
                                </span>
                                <span className="text-xs text-gray-500">{review.date}</span>
                              </div>
                            </div>
                            <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
                            <p className="text-sm text-gray-700 mb-2 line-clamp-3">{review.review_text}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>IP: {review.ip_address}</span>
                              <span>Generated Score: {Math.round(review.generated_score * 100)}%</span>
                              <span>Helpful: {review.helpful_votes}</span>
                            </div>
                          </div>
                        )) || <p className="text-gray-500">No reviews available</p>}
                      </div>
                    </div>

                    {/* Analysis Summary */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Analysis Summary</h4>
                      <p className="text-sm text-blue-800">{trustData.reviewcall_summary}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Analysis Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Edit Analysis Summary */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Edit3 className="text-purple-600" size={20} />
                    <h3 className="font-semibold text-gray-900">Edit Analysis</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Edits:</span>
                      <span className="font-medium">{trustData.analysis_details?.edit_analysis?.editAnalysis?.totalEdits || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Trust Score:</span>
                      <span className={`font-medium ${
                        trustData.analysis_details?.edit_analysis?.editTrustScore >= 70 ? 'text-green-600' :
                        trustData.analysis_details?.edit_analysis?.editTrustScore >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {trustData.analysis_details?.edit_analysis?.editTrustScore || 'N/A'}/100
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {trustData.analysis_details?.edit_analysis?.editAnalysis?.suspiciousPatterns?.length || 0} suspicious patterns detected
                    </div>
                  </div>
                </div>

                {/* Return Analysis Summary */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <RotateCcw className="text-orange-600" size={20} />
                    <h3 className="font-semibold text-gray-900">Return Analysis</h3>
                </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Returns:</span>
                      <span className="font-medium">{trustData.analysis_details?.return_analysis?.totalReturns || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quality Issues:</span>
                      <span className="font-medium text-red-600">{trustData.analysis_details?.return_analysis?.qualityIssueCount || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quality Ratio:</span>
                      <span className="font-medium text-orange-600">
                        {trustData.analysis_details?.return_analysis?.qualityIssueRatio ? 
                          Math.round(trustData.analysis_details.return_analysis.qualityIssueRatio * 100) : 'N/A'}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      AI Score: {trustData.analysis_details?.return_analysis?.aiAnalysis?.score ? 
                        Math.round(trustData.analysis_details.return_analysis.aiAnalysis.score * 100) : 'N/A'}/100
                    </div>
                  </div>
                  {/* Common Return Reasons */}
                  {trustData.analysis_details?.return_analysis?.commonReasons && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Common Reasons:</h5>
                      <div className="space-y-1">
                        {trustData.analysis_details.return_analysis.commonReasons.map((reason, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-600">{reason.reason}</span>
                            <span className="font-medium text-gray-900">{reason.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Review Analysis Summary */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="text-green-600" size={20} />
                    <h3 className="font-semibold text-gray-900">Review Analysis</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Genuine Reviews:</span>
                      <span className="font-medium text-green-600">
                        {trustData.analysis_details?.review_analysis?.authenticity_indicators?.genuine_reviews_ratio ? 
                          Math.round(trustData.analysis_details.review_analysis.authenticity_indicators.genuine_reviews_ratio * 100) : 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Analysis Score:</span>
                      <span className="font-medium">
                        {trustData.analysis_details?.review_analysis?.score ? 
                          Math.round(trustData.analysis_details.review_analysis.score * 100) : 'N/A'}/100
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Common praise: {trustData.analysis_details?.review_analysis?.authenticity_indicators?.common_praise?.length || 0} patterns
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Return Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer border-b border-gray-200"
                  onClick={() => toggleSection('returnAnalysis')}
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="text-orange-600" size={24} />
                    <h2 className="text-xl font-semibold text-gray-900">Return Analysis & AI Insights</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trustData.return_request_score >= 0.7 ? 'bg-green-100 text-green-700' :
                      trustData.return_request_score >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Score: {Math.round(trustData.return_request_score * 100)}/100
                    </span>
                  </div>
                  {expandedSections.returnAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.returnAnalysis && (
                  <div className="p-6 space-y-6">
                    {/* Return Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{trustData.analysis_details?.return_analysis?.totalReturns || 0}</p>
                        <p className="text-sm text-gray-600">Total Returns</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{trustData.analysis_details?.return_analysis?.qualityIssueCount || 0}</p>
                        <p className="text-sm text-gray-600">Quality Issues</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                          {trustData.analysis_details?.return_analysis?.qualityIssueRatio ? 
                            Math.round(trustData.analysis_details.return_analysis.qualityIssueRatio * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-600">Quality Issue Ratio</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{trustData.analysis_details?.return_analysis?.processedCallCount || 0}</p>
                        <p className="text-sm text-gray-600">Processed Calls</p>
                      </div>
                    </div>

                    {/* AI Analysis Summary */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">AI Analysis Summary</h4>
                      <p className="text-sm text-blue-800 mb-3">{trustData.analysis_details?.return_analysis?.aiAnalysis?.summary}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-700">AI Confidence Score:</span>
                        <span className="font-medium text-blue-900">
                          {trustData.analysis_details?.return_analysis?.aiAnalysis?.score ? 
                            Math.round(trustData.analysis_details.return_analysis.aiAnalysis.score * 100) : 'N/A'}/100
                        </span>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-3">Risk Factors</h4>
                      <ul className="space-y-1">
                        {trustData.analysis_details?.return_analysis?.aiAnalysis?.risk_factors?.map((risk, index) => (
                          <li key={index} className="text-sm text-red-800">• {risk}</li>
                        )) || <li className="text-sm text-gray-500">No risk factors identified</li>}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">AI Recommendations</h4>
                      <ul className="space-y-1">
                        {trustData.analysis_details?.return_analysis?.aiAnalysis?.recommendations?.map((rec, index) => (
                          <li key={index} className="text-sm text-green-800">• {rec}</li>
                        )) || <li className="text-sm text-gray-500">No recommendations available</li>}
                      </ul>
                    </div>

                    {/* Return Status Breakdown */}
                    {trustData.analysis_details?.return_analysis?.returnStatuses && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Return Status Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(trustData.analysis_details.return_analysis.returnStatuses).map(([status, count]) => (
                            <div key={status} className="text-center">
                              <p className="text-lg font-bold text-gray-900">{count}</p>
                              <p className="text-xs text-gray-600">{status}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Return Summary */}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">Return Summary</h4>
                      <p className="text-sm text-orange-800">{trustData.return_summary}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Network Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer border-b border-gray-200"
                  onClick={() => toggleSection('networkAnalysis')}
                >
                  <div className="flex items-center gap-3">
                    <Network className="text-indigo-600" size={24} />
                    <h2 className="text-xl font-semibold text-gray-900">Network Analysis & Graph Metrics</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trustData.network_summary.cluster_risk === 'TRUSTWORTHY' ? 'bg-green-100 text-green-700' :
                      trustData.network_summary.cluster_risk === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {trustData.network_summary.cluster_risk}
                    </span>
                  </div>
                  {expandedSections.networkAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.networkAnalysis && (
                  <div className="p-6 space-y-6">
                    {/* Network Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">
                          {trustData.pagerank ? trustData.pagerank.toFixed(6) : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">PageRank</p>
                        <p className="text-xs text-gray-500 mt-1">{trustData.network_summary.pagerank_desc}</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">
                          {trustData.eigenvector_cent ? trustData.eigenvector_cent.toFixed(8) : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Eigenvector Centrality</p>
                        <p className="text-xs text-gray-500 mt-1">{trustData.network_summary.eigenvector_cent_desc}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">
                          {trustData.clustering_coef ? trustData.clustering_coef.toFixed(4) : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Clustering Coefficient</p>
                        <p className="text-xs text-gray-500 mt-1">{trustData.network_summary.clustering_coef_desc}</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-lg font-bold text-orange-600">{trustData.w_degree || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Weighted Degree</p>
                        <p className="text-xs text-gray-500 mt-1">{trustData.network_summary.w_degree_desc}</p>
                      </div>
                    </div>

                    {/* Cluster Information */}
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 mb-3">Cluster Analysis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600">{trustData.cluster_ID}</p>
                          <p className="text-sm text-gray-600">Cluster ID</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600">{trustData.network_summary.cluster_total_products.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Total Products</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600">{trustData.network_summary.cluster_fake_percent}%</p>
                          <p className="text-sm text-gray-600">Fake Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600">{trustData.network_summary.cluster_risk}</p>
                          <p className="text-sm text-gray-600">Risk Level</p>
                        </div>
                      </div>
                    </div>

                    {/* Fake Score Analysis */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-3">Fake Score Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{Math.round(trustData.fake_score * 100)}</p>
                          <p className="text-sm text-gray-600">Raw Fake Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{Math.round(trustData.network_summary.fake_score_processed * 100)}</p>
                          <p className="text-sm text-gray-600">Processed Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{trustData.fake ? 'YES' : 'NO'}</p>
                          <p className="text-sm text-gray-600">Flagged as Fake</p>
                        </div>
                      </div>
                      <p className="text-xs text-red-700 mt-3">{trustData.network_summary.fake_score_desc}</p>
                    </div>

                    {/* Network Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Network Summary</h4>
                      <p className="text-sm text-gray-800">{trustData.trust_summary.network_summ.explanation}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Seller Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <Users className="text-gray-600" size={24} />
                  Seller Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Seller Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{trustData.seller_info?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium text-xs">{trustData.seller_info?.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-xs">{trustData.seller_info?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Product Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Trust Score:</span>
                        <span className="font-medium text-blue-900">{Math.round(trustData.trust_score)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Reviews:</span>
                        <span className="font-medium text-blue-900">{trustData.total_reviews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Returns:</span>
                        <span className="font-medium text-blue-900">{trustData.total_returns}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Analysis Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Analyzed:</span>
                        <span className="font-medium text-green-900">{formatDate(trustData.analyzedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Product ID:</span>
                        <span className="font-medium text-green-900">{trustData.product_ID}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Category:</span>
                        <span className="font-medium text-green-900">{trustData.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : trustData ? (
            <div className="p-6 space-y-6">
              {/* Incomplete Trust Data */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {selectedProduct.images && selectedProduct.images[0] && (
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{trustData.name || selectedProduct.name}</h1>
                      <p className="text-gray-600 mb-3">${trustData.price || selectedProduct.price} • {trustData.category || selectedProduct.category}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📊 {trustData.total_reviews || selectedProduct.reviewCount || 0} reviews</span>
                        <span>⭐ {selectedProduct.averageRating ? selectedProduct.averageRating.toFixed(2) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {trustData.trust_score !== undefined ? (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getTrustScoreColor(trustData.trust_score)}`}>
                        {React.createElement(getTrustIcon(trustData.trust_score), { size: 20 })}
                        {Math.round(trustData.trust_score)}/100
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold bg-gray-100 text-gray-600">
                        <AlertCircle size={20} />
                        Incomplete
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Trust Score</p>
                  </div>
                </div>
              </div>

              {/* Incomplete Analysis Notice */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="text-yellow-600" size={24} />
                  <h3 className="text-lg font-semibold text-yellow-900">Incomplete Analysis Data</h3>
                </div>
                <p className="text-yellow-800">
                  The trust analysis was partially retrieved but detailed analysis data is missing. 
                  Basic trust score: {trustData.trust_score ? Math.round(trustData.trust_score) : 'N/A'}/100
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Basic Product Info Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {selectedProduct.images && selectedProduct.images[0] && (
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                      <p className="text-gray-600 mb-3">${selectedProduct.price} • {selectedProduct.category}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📊 {selectedProduct.reviewCount || 0} reviews</span>
                        <span>⭐ {selectedProduct.averageRating ? selectedProduct.averageRating.toFixed(2) : 'N/A'}</span>
                        <span>📦 Stock: {selectedProduct.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedProduct.trustScore !== undefined ? (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getTrustScoreColor(selectedProduct.trustScore)}`}>
                        {React.createElement(getTrustIcon(selectedProduct.trustScore), { size: 20 })}
                        {Math.round(selectedProduct.trustScore)}/100
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold bg-gray-100 text-gray-600">
                        <AlertCircle size={20} />
                        No Score
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Trust Score</p>
                  </div>
                </div>
              </div>

              {/* Basic Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Trust Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedProduct.trustScore ? Math.round(selectedProduct.trustScore) : 'N/A'}
                      </p>
                    </div>
                    <Shield className={`${selectedProduct.trustScore ? 
                      selectedProduct.trustScore >= 70 ? 'text-green-500' : 
                      selectedProduct.trustScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                      : 'text-gray-400'}`} size={24} />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Fake Probability</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedProduct.fakeProbability ? Math.round(selectedProduct.fakeProbability * 100) : 'N/A'}%
                      </p>
                    </div>
                    <AlertTriangle className={`${selectedProduct.fakeProbability ? 
                      selectedProduct.fakeProbability < 0.2 ? 'text-green-500' : 
                      selectedProduct.fakeProbability < 0.4 ? 'text-yellow-500' : 'text-red-500'
                      : 'text-gray-400'}`} size={24} />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Review Count</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedProduct.reviewCount || 0}</p>
                    </div>
                    <MessageSquare className="text-blue-500" size={24} />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Cluster ID</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedProduct.clusterId || 'N/A'}</p>
                    </div>
                    <Network className="text-purple-500" size={24} />
                  </div>
                </div>
              </div>

              {/* Network Analysis Card */}
              {selectedProduct.pageRank !== undefined && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <Network className="text-purple-600" size={24} />
                    Network Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">
                        {selectedProduct.pageRank ? selectedProduct.pageRank.toFixed(6) : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">PageRank</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">
                        {selectedProduct.eigenvectorCent ? selectedProduct.eigenvectorCent.toFixed(8) : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Eigenvector Centrality</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">
                        {selectedProduct.clusteringCoef ? selectedProduct.clusteringCoef.toFixed(4) : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Clustering Coefficient</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-lg font-bold text-orange-600">{selectedProduct.weightedDegree || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Weighted Degree</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Analysis Notice */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="text-orange-600" size={24} />
                  <h3 className="text-lg font-semibold text-orange-900">Enhanced Analysis Unavailable</h3>
                </div>
                <p className="text-orange-800 mb-4">
                  The detailed trust analysis service is currently unavailable. The basic trust metrics shown above 
                  are derived from the product database. For comprehensive IP analysis, review patterns, seller behavior, 
                  and network connections, please try again later.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg opacity-50">
                    <MapPin className="mx-auto text-gray-400 mb-2" size={20} />
                    <p className="text-xs font-medium text-gray-500">IP Analysis</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg opacity-50">
                    <Edit3 className="mx-auto text-gray-400 mb-2" size={20} />
                    <p className="text-xs font-medium text-gray-500">Edit History</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg opacity-50">
                    <RotateCcw className="mx-auto text-gray-400 mb-2" size={20} />
                    <p className="text-xs font-medium text-gray-500">Return Analysis</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg opacity-50">
                    <Activity className="mx-auto text-gray-400 mb-2" size={20} />
                    <p className="text-xs font-medium text-gray-500">Detailed Insights</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTrustAnalysis; 