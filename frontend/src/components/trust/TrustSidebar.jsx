import React, { useState } from 'react';
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
  Camera
} from 'lucide-react';

const TrustSidebar = ({ product, trustBreakdown, alternatives, trustHistory, reviews }) => {
  const [trustHistoryPeriod, setTrustHistoryPeriod] = useState('30');

  return (
    <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {/* Trust Score */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="font-bold text-gray-900 mb-6">Trust Score</h3>
        <div className="relative mb-6">
          <div className="w-28 h-28 mx-auto relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f3f4f6"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#trustGradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - product.trustScore / 100)}`}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-green-600">{product.trustScore}</span>
              <span className="text-xs text-gray-500 font-medium">TRUSTED</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries(trustBreakdown).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="capitalize text-sm font-medium text-gray-700">{key}</span>
                <span className="text-sm font-bold text-gray-900">{value}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-lg transition-all duration-200">
          Why this score? ↓
        </button>
      </div>

      {/* Trust History */}
      <div className="border-b pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Trust History</h3>
          <select 
            value={trustHistoryPeriod}
            onChange={(e) => setTrustHistoryPeriod(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </div>
        
        <div className="relative h-32 bg-gray-50 rounded-lg p-3">
          <svg className="w-full h-full" viewBox="0 0 300 100">
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={trustHistory.map((item, index) => 
                `${(index * 280) / (trustHistory.length - 1) + 10},${90 - (item.score - 80) * 2}`
              ).join(' ')}
            />
            {trustHistory.map((item, index) => (
              <circle
                key={index}
                cx={(index * 280) / (trustHistory.length - 1) + 10}
                cy={90 - (item.score - 80) * 2}
                r="3"
                fill="#3b82f6"
              />
            ))}
          </svg>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{trustHistory[0]?.date}</span>
          <span>{trustHistory[trustHistory.length - 1]?.date}</span>
        </div>
      </div>

      {/* Alternative Products */}
      <div className="border-b pb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Higher Trust Alternatives</h3>
        <div className="space-y-3">
          {alternatives.map((alt) => (
            <div key={alt.id} className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex gap-4">
                <img src={alt.image} alt={alt.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">{alt.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-gray-900">₹{alt.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">
                        {alt.trustScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 py-3 px-4 rounded-lg transition-all duration-200">
          Upgrade to 95+ trust score →
        </button>
      </div>

      {/* Verification Tools */}
      <div className="border-b pb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Verification Tools</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
            <QrCode size={18} />
            Scan QR for Authenticity
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors">
            <Phone size={18} />
            Call Seller
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors">
            <Camera size={18} />
            Reverse Image Search
          </button>
        </div>
      </div>

      {/* Review Analysis */}
      <div className="border-b pb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Review Analysis</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Authentic reviews:</span>
            <span className="text-sm font-medium text-green-600">890 out of 1000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Flagged reviews:</span>
            <span className="text-sm font-medium text-red-600">15 detected</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle size={12} className="text-yellow-500" />
              <span>Review spike detected on Nov 15</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-green-500" />
              <span>Consistent review pattern</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Tools */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Trust Tools</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-md transition-colors">
            <Eye size={16} />
            Add to Watchlist
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors">
            <Flag size={16} />
            Report Issue
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors">
            <ExternalLink size={16} />
            Share Trust Report
          </button>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MapPin className="text-orange-600 mt-0.5" size={14} />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Location Alert</h4>
                <p className="text-xs text-orange-700 mt-1">
                  2 fraud reports in Mumbai region this month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSidebar; 