import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { TrustSidebar, TrustSummary, TrustBadge } from '../components/trust';
import { Pagination } from '../components/ui';
import { productsApi, reviewsApi } from '../services/api';
import { 
  Star, 
  Heart,
  Share2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Mic,
  Play,
  Pause,
  Volume2,
  Eye,
  QrCode,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  Flag,
  ExternalLink,
  Zap,
  Package,
  Truck,
  RotateCcw,
  Award,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Filter,
  Clock,
  Camera
} from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [voiceQuery, setVoiceQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch product data (without reviews)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsApi.getProduct(id);
        
        // Map API response to component state
        setProduct({
          id: response.id,
          name: response.name,
          description: response.description,
          price: response.price,
          originalPrice: response.price * 1.3, // Calculate 30% markup for original price
          brand: response.seller?.name || 'Unknown Brand',
          category: response.category,
          stock: response.stock,
          trustScore: Math.round(response.trustScore) || 37,
          trustBadge: response.trustScore > 70 ? "trusted" : response.trustScore > 40 ? "verified" : "caution",
          rating: response.averageRating || 4.26,
          reviewsCount: response._count?.reviewInfos || response.reviewCount || 0,
          images: response.images?.length ? response.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
          colors: ['Default'], // Since no color data in API
          sizes: ['One Size'], // Since no size data in API
          highlights: [
            response.description || 'High-quality product',
            'Verified seller',
            response.stock > 50 ? 'In stock' : 'Limited stock',
            `${response.reviewCount || 0} customer reviews`
          ],
          specifications: {
            'Brand': response.seller?.name || 'Unknown',
            'Category': response.category || 'General',
            'Stock': response.stock?.toString() || 'N/A',
            'Product ID': response.id,
            'Created': new Date(response.createdAt).toLocaleDateString() || 'N/A'
          },
          fakeProbability: response.fakeProbability || 0,
          sellerId: response.sellerId,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        });
        
        // Set default selections based on available options
        setSelectedColor('Default');
        setSelectedSize('One Size');
        
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch reviews separately with pagination
  const fetchReviews = async (page = 1) => {
    if (!id) return;
    
    try {
      setReviewsLoading(true);
      const response = await reviewsApi.getProductReviews(id, { 
        page, 
        perPage: reviewsPagination.perPage 
      });

      // Map reviews data
      const mappedReviews = response.data?.map(review => ({
        id: review.id,
        user: `Reviewer ${review.reviewerId}`,
        rating: review.reviewRating,
        review: review.reviewBody,
        title: review.reviewTitle || '',
        date: new Date(review.reviewDate).toLocaleDateString(),
        verified: !review.isAiGenerated, // Non-AI generated reviews are verified
        authentic: !review.isAiGenerated, // Non-AI generated reviews are authentic
        helpful: review.numberOfHelpful || 0,
        aiGenerated: review.isAiGenerated || false,
        aiScore: review.aiGeneratedScore || 0
      })) || [];

      setReviews(mappedReviews);
      setReviewsPagination(response.pagination);
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Load reviews when component mounts or active tab changes
  useEffect(() => {
    if (activeTab === 'reviews' && id) {
      fetchReviews(reviewsPagination.page);
    }
  }, [id, activeTab, reviewsPagination.page]);

  // Handle review page change
  const handleReviewPageChange = (page) => {
    setReviewsPagination(prev => ({ ...prev, page }));
  };

  // Trust breakdown based on actual API data
  const trustBreakdown = product ? {
    reviews: Math.max(20, Math.round(100 - (product.fakeProbability * 100))), // Higher fake probability = lower review trust
    seller: Math.round(product.trustScore * 0.8), // Seller score based on trust score
    product: Math.round(product.trustScore * 1.1), // Product score slightly higher
    authenticity: Math.round(100 - (product.fakeProbability * 100)) // Authenticity inversely related to fake probability
  } : { reviews: 92, seller: 78, product: 91, authenticity: 85 };

  // Keep existing alternatives as dummy data since not provided by API
  const alternatives = [
    {
      id: 2,
      name: "Similar Product 1",
      price: 9999,
      trustScore: 95,
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Similar Product 2",
      price: 7999,
      trustScore: 89,
      image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=300&h=300&fit=crop"
    },
    {
      id: 4,
      name: "Similar Product 3",
      price: 8499,
      trustScore: 92,
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop"
    }
  ];

  // Generate trust history based on current trust score
  const trustHistory = product ? [
    { date: '2024-01-15', score: product.trustScore - 5 },
    { date: '2024-01-20', score: product.trustScore - 3 },
    { date: '2024-01-25', score: product.trustScore - 2 },
    { date: '2024-01-30', score: product.trustScore - 1 },
    { date: '2024-02-05', score: product.trustScore },
    { date: '2024-02-10', score: product.trustScore + 1 },
    { date: '2024-02-15', score: product.trustScore }
  ] : [
    { date: '2024-01-15', score: 89 },
    { date: '2024-01-20', score: 87 },
    { date: '2024-01-25', score: 85 },
    { date: '2024-01-30', score: 87 },
    { date: '2024-02-05', score: 88 },
    { date: '2024-02-10', score: 87 },
    { date: '2024-02-15', score: 87 }
  ];

  const handleVoiceQuery = (query) => {
    setVoiceQuery(query);
    // Simulate AI response
    setTimeout(() => {
      setVoiceQuery('');
      alert(`AI Response for "${query}": This product has a trust score of ${product?.trustScore || 85} and ${reviews.length} reviews. Fake probability is ${Math.round((product?.fakeProbability || 0) * 100)}%.`);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-7xl mx-auto p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
              <div className="bg-white rounded-xl p-8">
                <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xl">Product not found</div>;
  }

  return (
  <>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">Home</a> &gt; 
            <a href="#" className="hover:text-blue-600 ml-1">{product.category}</a> &gt; 
            <span className="ml-1 text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-9xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - 75% */}
          <div className="lg:col-span-9 space-y-8">
            {/* Top Section - Images and Pricing Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images - 35% of left side */}
              <div className="space-y-4">
                {/* Main Product Image */}
                <div className={`relative aspect-square w-full rounded-2xl overflow-hidden cursor-zoom-${isZoomed ? 'out' : 'in'} bg-white shadow-sm border border-gray-100`}>
                  <img 
                    src={product.images[selectedImage]} 
                    alt="Product"
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                  <button 
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white shadow-lg transition-all duration-200"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart 
                      size={18} 
                      className={isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'} 
                    />
                  </button>
                  <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white shadow-lg transition-all duration-200">
                    <Share2 size={18} className="text-gray-600" />
                  </button>
                </div>
                
                {/* Thumbnail Images */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
            </div>

                {/* Trust Summary Block */}
                <TrustSummary product={product} trustBreakdown={trustBreakdown} />
          </div>

              {/* Product Details and Pricing - 35% of left side */}
              <div className="space-y-6">
                {/* Trust Badge */}
                <div className="flex justify-start">
                  <TrustBadge badge={product.trustBadge} score={product.trustScore} />
                </div>
              
                {/* Product Title & Brand */}
                <div className="space-y-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                  <p className="text-gray-600">by <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">{product.brand}</a></p>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                  <span className="font-semibold text-gray-900">{product.rating.toFixed(1)}</span>
                  <a href="#reviews" className="text-blue-600 hover:text-blue-800 hover:underline">
                  ({product.reviewsCount.toLocaleString()} reviews)
                </a>
              </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                    <span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
                  <p className="text-green-600 font-semibold">You save ${(product.originalPrice - product.price).toFixed(2)}</p>
              </div>

                {/* Product Options */}
                <div className="space-y-5">
              {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Color: <span className="font-normal text-gray-600">{selectedColor}</span></label>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 text-sm border-2 rounded-lg transition-all duration-200 ${
                        selectedColor === color
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Size: <span className="font-normal text-gray-600">{selectedSize}</span></label>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 text-sm border-2 rounded-lg transition-all duration-200 ${
                        selectedSize === size
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
                    <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200"
                  >
                    -
                  </button>
                      <span className="w-16 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center font-semibold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200"
                  >
                    +
                  </button>
                    </div>
                </div>
              </div>

              {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                  Add to Cart
                </button>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                  Buy Now
                </button>
              </div>

              {/* Delivery Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="text-green-600" size={16} />
                </div>
                    <span className="text-gray-700">
                      {product.stock > 10 ? 'Free delivery by Tomorrow' : 'Limited stock - Order soon'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="text-blue-600" size={16} />
                </div>
                    <span className="text-gray-700">Easy 30-day returns</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="text-purple-600" size={16} />
                    </div>
                    <span className="text-gray-700">
                      Stock: {product.stock} items available
                    </span>
                </div>
              </div>
            </div>
          </div>

            {/* Product Information Tabs - Bottom section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex">
                  {['description', 'specifications', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium capitalize transition-all duration-200 relative ${
                        activeTab === tab 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">About this item</h3>
                    <div className="prose text-gray-700 leading-relaxed">
                      <p>{product.description}</p>
                    </div>
                    <ul className="space-y-3 mt-6">
                      {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {activeTab === 'specifications' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex py-3 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700 w-1/3">{key}</span>
                          <span className="text-gray-600 w-2/3">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Customer Reviews
                        {reviewsPagination.total > 0 && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            ({reviewsPagination.total} total)
                          </span>
                        )}
                      </h3>
                      <select 
                        value={reviewFilter}
                        onChange={(e) => setReviewFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                      >
                        <option value="all">All Reviews</option>
                        <option value="verified">Verified Only</option>
                        <option value="authentic">Authentic Only</option>
                      </select>
                    </div>
                    
                    {reviewsLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-5 animate-pulse">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-20 h-4 bg-gray-200 rounded"></div>
                              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="flex gap-1 mb-3">
                              {[...Array(5)].map((_, j) => (
                                <div key={j} className="w-4 h-4 bg-gray-200 rounded"></div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <div className="w-full h-4 bg-gray-200 rounded"></div>
                              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-500">Be the first to review this product!</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-6">
                          {reviews
                            .filter(review => {
                              if (reviewFilter === 'verified') return review.verified;
                              if (reviewFilter === 'authentic') return review.authentic;
                              return true;
                            })
                            .map((review) => (
                            <div key={review.id} className={`rounded-xl p-5 space-y-3 ${
                              review.aiGenerated ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                            }`}>
                              {/* AI Generated Warning */}
                              {review.aiGenerated && (
                                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-white text-xs font-bold">!</span>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-red-800 font-medium text-sm">⚠️ AI Generated Review Detected</p>
                                      <p className="text-red-700 text-xs">
                                        This review has been flagged as potentially AI-generated with {Math.round(review.aiScore * 100)}% confidence. 
                                        Exercise caution when considering this feedback for your purchase decision.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-gray-900">{review.user}</span>
                                  {review.verified && !review.aiGenerated && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                      ✓ Verified Purchase
                                    </span>
                                  )}
                                  {review.aiGenerated && (
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                      🤖 AI Generated ({Math.round(review.aiScore * 100)}%)
                                    </span>
                                  )}
                                  {!review.authentic && !review.aiGenerated && (
                                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                                      ⚠️ Flagged
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
                                ))}
                              </div>
                              
                              {review.title && (
                                <h4 className={`font-medium ${review.aiGenerated ? 'text-red-900' : 'text-gray-900'}`}>
                                  {review.title}
                                </h4>
                              )}
                              
                              <p className={`leading-relaxed ${review.aiGenerated ? 'text-red-800' : 'text-gray-700'}`}>
                                {review.review}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                  <ThumbsUp size={14} />
                                  Helpful ({review.helpful})
                                </button>
                                <button className="flex items-center gap-2 hover:text-red-600 transition-colors">
                                  <Flag size={14} />
                                  Report
                                </button>
                                {review.aiGenerated && (
                                  <span className="text-red-600 text-xs font-medium">
                                    ⚠️ Use caution - AI generated content
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {reviewsPagination.totalPages > 1 && (
                          <div className="border-t border-gray-200 pt-6">
                            <Pagination
                              currentPage={reviewsPagination.page}
                              totalPages={reviewsPagination.totalPages}
                              totalItems={reviewsPagination.total}
                              itemsPerPage={reviewsPagination.perPage}
                              onPageChange={handleReviewPageChange}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Trust Sidebar - 25% */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <TrustSidebar 
                product={product}
                trustBreakdown={trustBreakdown}
                alternatives={alternatives}
                trustHistory={trustHistory}
                reviews={reviews}
              />
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customers who viewed this item also viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {alternatives.concat([
              {
                id: 5,
                name: "Studio Monitor Headphones",
                price: 6999,
                trustScore: 83,
                image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop"
              }
            ]).map((alternativeProduct) => (
              <div key={alternativeProduct.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={alternativeProduct.image} 
                    alt={alternativeProduct.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Trust: {alternativeProduct.trustScore}/100
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{alternativeProduct.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${alternativeProduct.price.toLocaleString()}</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      </>
  );
};

export default ProductDetailPage;