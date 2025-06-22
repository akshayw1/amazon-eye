require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// IP pools for simulation
const SUSPICIOUS_IPS = [
  '192.168.1.100',
  '192.168.1.101', 
  '192.168.1.102',
  '10.0.0.50',
  '10.0.0.51'
];

const LEGITIMATE_IPS = [
  '203.0.113.1',
  '198.51.100.2',
  '203.0.113.5',
  '198.51.100.10',
  '203.0.113.15',
  '198.51.100.25',
  '203.0.113.30',
  '198.51.100.35',
  '203.0.113.40',
  '198.51.100.45',
  '203.0.113.50',
  '198.51.100.55',
  '203.0.113.60',
  '198.51.100.65',
  '203.0.113.70',
  '198.51.100.75',
  '203.0.113.80',
  '198.51.100.85',
  '203.0.113.90',
  '198.51.100.95'
];

class IPPatternSimulator {
  constructor() {
    this.products = [];
    this.processedCount = 0;
  }

  async loadProducts() {
    try {
      console.log('📊 Loading products from CSV...');
      const products = [];
      
      return new Promise((resolve, reject) => {
        fs.createReadStream('product_clean/selected_120_products.csv')
          .pipe(csv())
          .on('data', (row) => {
            // Only take products with decent number of reviews
            if (parseInt(row.n_of_reviews) >= 5) {
              products.push({
                productId: row.product_ID,
                reviewCount: parseInt(row.n_of_reviews),
                trustScore: parseFloat(row.trust_score),
                fakeScore: parseFloat(row.fake_score)
              });
            }
          })
          .on('end', () => {
            // Sort by review count and take all products
            this.products = products
              .sort((a, b) => b.reviewCount - a.reviewCount);
            
            console.log(`✅ Loaded ${this.products.length} products`);
            console.log('Top 5 products:', this.products.slice(0, 5).map(p => 
              `ID: ${p.productId}, Reviews: ${p.reviewCount}, Trust: ${p.trustScore}`
            ));
            resolve();
          })
          .on('error', reject);
      });
    } catch (error) {
      console.error('❌ Error loading products:', error.message);
      throw error;
    }
  }

  async getProductReviews(productIdInDb) {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/product/${productIdInDb}?perPage=1000`);
      return response.data.data || [];
    } catch (error) {
      console.error(`❌ Error fetching reviews for product ${productIdInDb}:`, error.response?.data?.message || error.message);
      return [];
    }
  }

  async updateReviewIP(reviewId, ipAddress) {
    try {
      await axios.put(`${API_BASE_URL}/reviews/${reviewId}/ip`, 
        { ipAddress }
      );
      return true;
    } catch (error) {
      console.error(`❌ Error updating review IP:`, error.message);
      return false;
    }
  }
}

module.exports = IPPatternSimulator;