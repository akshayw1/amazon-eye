import React, { useState, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { TrustSidebar, TrustSummary, TrustBadge } from '../components/trust';
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

  // Mock product data
  const product = {
    id: 1,
    name: "Boult Q Over Ear Bluetooth Headphones with 70H Playtime, 40mm Bass Drivers, Zen™ ENC Mic, Type-C Fast Charging, 4 EQ Modes, BTv 5.4, AUX Option",
    brand: "SoundTech Pro",
    price: 8999,
    originalPrice: 12999,
    rating: 4.3,
    reviewsCount: 2847,
    trustScore: 87,
    trustBadge: "trusted",
    inStock: true,
    category: "Electronics > Audio > Headphones",
    sku: "ST-WH-2024-001",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop", 
      "https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop"
    ],
    colors: ['Black', 'White', 'Silver', 'Blue'],
    sizes: ['S', 'M', 'L'],
    highlights: [
      'Premium 40mm drivers for exceptional sound quality',
      'Active Noise Cancellation technology',
      'Up to 30 hours battery life with ANC off',
      'Quick charge: 5 minutes for 2 hours playback',
      'Comfortable over-ear design',
      'Built-in microphone for calls'
    ],
    specifications: {
      'Driver Size': '40mm',
      'Frequency Response': '20Hz - 20kHz',
      'Battery Life': '30 hours (ANC off), 20 hours (ANC on)',
      'Charging Time': '2 hours',
      'Weight': '280g',
      'Connectivity': 'Bluetooth 5.0, 3.5mm jack',
      'Warranty': '1 year'
    }
  };

  const trustBreakdown = {
    reviews: 92,
    seller: 78,
    product: 91,
    authenticity: 85
  };

  const alternatives = [
    {
      id: 2,
      name: "Audio Elite Pro Max",
      price: 9999,
      trustScore: 95,
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      name: "SoundWave Premium",
      price: 7999,
      trustScore: 89,
      image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=300&h=300&fit=crop"
    },
    {
      id: 4,
      name: "Bass Master Pro",
      price: 8499,
      trustScore: 92,
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop"
    }
  ];

  const reviews = [
    {
      id: 1,
      user: "Rahul Kumar",
      rating: 5,
      date: "2 days ago",
      verified: true,
      helpful: 23,
      review: "Excellent sound quality and comfortable to wear for long periods. The noise cancellation works really well.",
      authentic: true
    },
    {
      id: 2,
      user: "Priya Singh",
      rating: 4,
      date: "1 week ago",
      verified: true,
      helpful: 15,
      review: "Good headphones but the bass could be better. Battery life is impressive though.",
      authentic: true
    },
    {
      id: 3,
      user: "TechReviewer2024",
      rating: 5,
      date: "2 weeks ago",
      verified: false,
      helpful: 2,
      review: "Amazing product! Best headphones ever! 5 stars!",
      authentic: false
    }
  ];

  const trustHistory = [
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
      alert(`AI Response for "${query}": This product has a high trust score and excellent reviews. It's verified by our authentication system.`);
    }, 2000);
  };

  return (
  <>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">Home</a> &gt; 
            <a href="#" className="hover:text-blue-600 ml-1">Electronics</a> &gt; 
            <a href="#" className="hover:text-blue-600 ml-1">Audio</a> &gt; 
            <span className="ml-1 text-gray-900">Headphones</span>
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
                  <span className="font-semibold text-gray-900">{product.rating}</span>
                  <a href="#reviews" className="text-blue-600 hover:text-blue-800 hover:underline">
                  ({product.reviewsCount.toLocaleString()} reviews)
                </a>
              </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    <span className="text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
                  <p className="text-green-600 font-semibold">You save ₹{(product.originalPrice - product.price).toLocaleString()}</p>
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
                    <span className="text-gray-700">Free delivery by <strong>Tomorrow</strong></span>
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
                    <span className="text-gray-700">1 year warranty included</span>
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
                    <ul className="space-y-3">
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
                      <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
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
                    
                    <div className="space-y-6">
                      {reviews
                        .filter(review => {
                          if (reviewFilter === 'verified') return review.verified;
                          if (reviewFilter === 'authentic') return review.authentic;
                          return true;
                        })
                        .map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded-xl p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">{review.user}</span>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Verified Purchase
                                </span>
                              )}
                              {!review.authentic && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Flagged
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
                          <p className="text-gray-700 leading-relaxed">{review.review}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                              <ThumbsUp size={14} />
                              Helpful ({review.helpful})
                            </button>
                            <button className="flex items-center gap-2 hover:text-red-600 transition-colors">
                              <Flag size={14} />
                              Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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
            ]).map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Trust: {product.trustScore}/100
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
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