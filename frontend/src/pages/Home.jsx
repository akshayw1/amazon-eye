import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/product';
import { productsApi } from '../services/api';
import { 
  Shield, 
  ChevronLeft,
  ChevronRight,
  Eye,
  Zap
} from 'lucide-react';

const TrustCommerce = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getProducts({ page: 1, perPage: 12 });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const bannerSlides = [
    {
      id: 1,
      title: "Starting ₹99",
      subtitle: "Bottles & lunch boxes",
      image: "/main1.jpg",
      cta: "Shop Now"
    },
    {
      id: 2,
      title: "Up to 50% Off",
      subtitle: "Electronics & Gadgets",
      image: "/main2.jpg",
      cta: "Explore Deals"
    },
    {
      id: 3,
      title: "New Arrivals",
      subtitle: "Fashion & Lifestyle",
      image: "/main3.jpg",
      cta: "Discover More"
    },
    {
      id: 4,
      title: "Best Deals",
      subtitle: "Home & Kitchen",
      image: "/main4.jpg",
      cta: "Shop Now"
    }
  ];

  const categories = [
    { name: "Electronics", icon: "📱", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop" },
    { name: "Fashion", icon: "👔", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop" },
    { name: "Home & Garden", icon: "🏠", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop" },
    { name: "Sports", icon: "⚽", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" },
    { name: "Books", icon: "📚", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop" },
    { name: "Beauty", icon: "💄", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Banner */}
      <section className="relative">
        <div className="relative h-[28rem] overflow-hidden">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Text overlay with subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
                  <div className="text-white max-w-lg">
                    <h2 className="text-5xl font-bold mb-4 leading-tight drop-shadow-lg">{slide.title}</h2>
                    <p className="text-2xl mb-6 text-gray-100 drop-shadow-md">{slide.subtitle}</p>
                    <button className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg">
                      {slide.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slide controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-3 rounded-full hover:bg-white transition-all duration-300 shadow-xl"
        >
          <ChevronLeft size={28} className="text-gray-800" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-3 rounded-full hover:bg-white transition-all duration-300 shadow-xl"
        >
          <ChevronRight size={28} className="text-gray-800" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-blue-600 shadow-lg scale-125' : 'bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Explore Categories</h2>
          <p className="text-xl text-gray-600">Discover amazing products across different categories</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="group cursor-pointer">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-800 text-lg">{category.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                <div className="w-full h-56 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  trustScore: product.trustScore || 85, // Default if not provided
                  trustBadge: product.trustBadge || "trusted", // Default if not provided
                  rating: product.rating || 4.5, // Default if not provided
                  reviews: product._count?.reviewInfos || 0,
                  bestseller: product.bestseller || false,
                  originalPrice: product.originalPrice || Math.round(product.price * 1.2), // Default if not provided
                  image: product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop", // Default if not provided
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trust Features */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Trust Amazon Eye?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our AI-powered platform ensures you make informed decisions with complete transparency</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Shield className="text-green-600" size={40} />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-gray-800">Verified Products</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Every product undergoes our comprehensive AI-powered verification process to ensure authenticity and quality</p>
            </div>
            <div className="text-center group">
              <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Eye className="text-blue-600" size={40} />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-gray-800">Transparent Reviews</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Advanced AI algorithms analyze and filter reviews to show you only genuine customer feedback</p>
            </div>
            <div className="text-center group">
              <div className="bg-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Zap className="text-orange-600" size={40} />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-gray-800">Real-time Trust Score</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Dynamic trust scoring based on multiple factors including reviews, seller history, and product quality</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default TrustCommerce;