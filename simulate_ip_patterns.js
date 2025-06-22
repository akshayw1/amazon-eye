const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

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
      console.error(`❌ Error updating IP for review ${reviewId}:`, error.response?.data?.message || error.message);
      return false;
    }
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  async findProductInDatabase(originalProductId) {
    try {
      // Use the specific endpoint to find product by original ID
      const response = await axios.get(`${API_BASE_URL}/products/by-original-id/${originalProductId}`);
      return response.data.id;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`   ⚠️  Product with original ID ${originalProductId} not found in database`);
      } else {
        console.error(`❌ Error finding product ${originalProductId} in database:`, error.response?.data?.message || error.message);
      }
      return null;
    }
  }

  async simulateIPPatterns() {
    console.log('🎭 Starting IP pattern simulation...');
    console.log(`Processing ${this.products.length} products...\n`);

    for (let i = 0; i < this.products.length; i++) {
      const product = this.products[i];
      console.log(`\n📦 Processing product ${i + 1}/${this.products.length} (ID: ${product.productId})`);
      
      // Find the actual product ID in the database
      const dbProductId = await this.findProductInDatabase(product.productId.toString());
      
      if (!dbProductId) {
        console.log(`⚠️  Product ${product.productId} not found in database, skipping...`);
        continue;
      }

      console.log(`   Database ID: ${dbProductId}`);
      
      // Get reviews for this product
      const reviews = await this.getProductReviews(dbProductId);
      
      if (reviews.length === 0) {
        console.log(`   ⚠️  No reviews found for product ${product.productId}`);
        continue;
      }

      console.log(`   📝 Found ${reviews.length} reviews`);

      // Determine pattern based on index for 120 products
      // Products 1-24 (20%): Suspicious patterns (heavy IP clustering)
      // Products 25-72 (40%): Mixed patterns (some clustering)
      // Products 73-120 (40%): Legitimate patterns (diverse IPs)
      
      let updatePromises = [];
      const totalProducts = this.products.length;
      const suspiciousThreshold = Math.floor(totalProducts * 0.2); // 20%
      const mixedThreshold = Math.floor(totalProducts * 0.6); // 60%
      
      if (i < suspiciousThreshold) {
        // Suspicious pattern - heavy IP clustering
        console.log(`   🚨 Applying SUSPICIOUS pattern (heavy IP clustering)`);
        const suspiciousIP = this.getRandomElement(SUSPICIOUS_IPS);
        const clusterSize = Math.min(Math.ceil(reviews.length * 0.7), reviews.length); // 70% clustering
        
        for (let j = 0; j < clusterSize; j++) {
          updatePromises.push(this.updateReviewIP(reviews[j].id, suspiciousIP));
        }
        
        // Rest get different suspicious IPs
        for (let j = clusterSize; j < reviews.length; j++) {
          const ip = this.getRandomElement(SUSPICIOUS_IPS);
          updatePromises.push(this.updateReviewIP(reviews[j].id, ip));
        }
      } 
      else if (i < mixedThreshold) {
        // Mixed pattern - moderate clustering with legitimate diversity
        console.log(`   ⚖️  Applying MIXED pattern (moderate clustering)`);
        const clusterSize = Math.min(Math.ceil(reviews.length * 0.4), reviews.length); // 40% clustering
        const suspiciousIP = this.getRandomElement(SUSPICIOUS_IPS);
        
        // Create moderate cluster
        for (let j = 0; j < clusterSize; j++) {
          updatePromises.push(this.updateReviewIP(reviews[j].id, suspiciousIP));
        }
        
        // Rest get legitimate diverse IPs
        for (let j = clusterSize; j < reviews.length; j++) {
          const ip = this.getRandomElement(LEGITIMATE_IPS);
          updatePromises.push(this.updateReviewIP(reviews[j].id, ip));
        }
      } 
      else {
        // Legitimate pattern - fully diverse IPs
        console.log(`   ✅ Applying LEGITIMATE pattern (fully diverse IPs)`);
        for (let j = 0; j < reviews.length; j++) {
          const ip = this.getRandomElement(LEGITIMATE_IPS);
          updatePromises.push(this.updateReviewIP(reviews[j].id, ip));
        }
      }

      // Execute all updates for this product
      const results = await Promise.all(updatePromises);
      const successCount = results.filter(r => r).length;
      console.log(`   ✅ Updated ${successCount}/${reviews.length} review IPs`);
      
      this.processedCount++;
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 Simulation complete!`);
    console.log(`📊 Processed ${this.processedCount}/${this.products.length} products`);
    
    const totalProducts = this.products.length;
    const suspiciousCount = Math.floor(totalProducts * 0.2);
    const mixedCount = Math.floor(totalProducts * 0.4);
    const legitimateCount = totalProducts - suspiciousCount - mixedCount;
    
    console.log(`\n📋 Pattern Distribution:`);
    console.log(`   🚨 Products 1-${suspiciousCount}: SUSPICIOUS patterns (70% IP clustering)`);
    console.log(`   ⚖️  Products ${suspiciousCount + 1}-${suspiciousCount + mixedCount}: MIXED patterns (40% clustering)`);
    console.log(`   ✅ Products ${suspiciousCount + mixedCount + 1}-${totalProducts}: LEGITIMATE patterns (fully diverse IPs)`);
    console.log(`\n📈 Expected Trust Factor Impact:`);
    console.log(`   • ${suspiciousCount} products should show LOW trust scores`);
    console.log(`   • ${mixedCount} products should show MODERATE trust scores`);
    console.log(`   • ${legitimateCount} products should show HIGH trust scores`);
  }

  async run() {
    try {
      await this.loadProducts();
      await this.simulateIPPatterns();
    } catch (error) {
      console.error('❌ Simulation failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the simulation
const simulator = new IPPatternSimulator();
simulator.run().catch(console.error); 