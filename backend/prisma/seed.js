const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // Create a demo user/seller
  const demoSeller = await prisma.user.create({
    data: {
      email: 'seller@demo.com',
      password: '$2b$10$EprqoqFyl5wZ5Q.pbSmPYORXMXmKx5YMtg/X3.H3VgQoQ8H8u2tdW', // hashed 'password123'
      name: 'Demo Seller',
      role: 'USER'
    }
  });

  // Demo Products
  const products = [
    {
      name: 'Premium Wireless Headphones',
      description: 'High-quality noise-canceling headphones with 30-hour battery life',
      price: 299.99,
      stock: 50,
      category: 'Electronics',
      images: ['headphones1.jpg', 'headphones2.jpg'],
      trust: {
        create: {
          overallTrustScore: 95,
          reviewTrustScore: 92,
          sellerTrustScore: 98,
          productTrustScore: 95,
          trustBadge: 'TRUSTED',
          trustBadgeColor: 'green',
          badgeDisplayText: 'Trusted Product',
          confidenceLevel: 0.95,
          totalReviews: 245,
          authenticReviews: 240,
          suspiciousReviews: 5,
          reviewQualityScore: 0.92,
          aiGeneratedProbability: 0.02,
          counterfeiteRisk: 0.01,
          imageAnalysisScore: 0.99,
          sellerReliabilityScore: 0.98
        }
      },
      analysis: {
        create: {
          n_of_reviews: 245,
          avg_review_rating: 4.8,
          avg_days_between_reviews: 1.5,
          max_days_between_reviews: 5,
          min_days_between_reviews: 0,
          cluster_ID: 1,
          pagerank: 0.85,
          eigenvector_cent: 0.92,
          clustering_coef: 0.78,
          w_degree: 156,
          fake_score: 0.02,
          fake: 0
        }
      }
    },
    {
      name: 'Suspicious Smart Watch',
      description: 'Too-good-to-be-true smartwatch with unrealistic features',
      price: 39.99,
      stock: 1000,
      category: 'Electronics',
      images: ['watch1.jpg'],
      trust: {
        create: {
          overallTrustScore: 35,
          reviewTrustScore: 30,
          sellerTrustScore: 40,
          productTrustScore: 35,
          trustBadge: 'RISK',
          trustBadgeColor: 'red',
          badgeDisplayText: 'High Risk',
          badgeReason: 'Suspicious review patterns and pricing',
          confidenceLevel: 0.89,
          totalReviews: 1500,
          authenticReviews: 450,
          suspiciousReviews: 1050,
          reviewQualityScore: 0.3,
          aiGeneratedProbability: 0.85,
          counterfeiteRisk: 0.92,
          imageAnalysisScore: 0.45,
          sellerReliabilityScore: 0.4
        }
      },
      analysis: {
        create: {
          n_of_reviews: 1500,
          avg_review_rating: 4.9,
          avg_days_between_reviews: 0.1,
          max_days_between_reviews: 1,
          min_days_between_reviews: 0,
          cluster_ID: 2,
          pagerank: 0.45,
          eigenvector_cent: 0.38,
          clustering_coef: 0.92,
          w_degree: 890,
          fake_score: 0.92,
          fake: 1
        }
      }
    },
    {
      name: 'Organic Cotton T-Shirt',
      description: 'Sustainably sourced, 100% organic cotton t-shirt',
      price: 29.99,
      stock: 200,
      category: 'Clothing',
      images: ['tshirt1.jpg', 'tshirt2.jpg', 'tshirt3.jpg'],
      trust: {
        create: {
          overallTrustScore: 88,
          reviewTrustScore: 85,
          sellerTrustScore: 90,
          productTrustScore: 89,
          trustBadge: 'TRUSTED',
          trustBadgeColor: 'green',
          badgeDisplayText: 'Verified Authentic',
          confidenceLevel: 0.88,
          totalReviews: 156,
          authenticReviews: 152,
          suspiciousReviews: 4,
          reviewQualityScore: 0.85,
          aiGeneratedProbability: 0.05,
          counterfeiteRisk: 0.08,
          imageAnalysisScore: 0.95,
          sellerReliabilityScore: 0.9
        }
      },
      analysis: {
        create: {
          n_of_reviews: 156,
          avg_review_rating: 4.6,
          avg_days_between_reviews: 2.3,
          max_days_between_reviews: 8,
          min_days_between_reviews: 0,
          cluster_ID: 3,
          pagerank: 0.72,
          eigenvector_cent: 0.68,
          clustering_coef: 0.65,
          w_degree: 98,
          fake_score: 0.08,
          fake: 0
        }
      }
    },
    {
      name: 'Questionable Designer Bag',
      description: 'Designer bag at suspiciously low price',
      price: 89.99,
      stock: 500,
      category: 'Fashion',
      images: ['bag1.jpg'],
      trust: {
        create: {
          overallTrustScore: 45,
          reviewTrustScore: 42,
          sellerTrustScore: 48,
          productTrustScore: 45,
          trustBadge: 'CAUTION',
          trustBadgeColor: 'yellow',
          badgeDisplayText: 'Exercise Caution',
          badgeReason: 'Potential counterfeit product',
          confidenceLevel: 0.82,
          totalReviews: 89,
          authenticReviews: 45,
          suspiciousReviews: 44,
          reviewQualityScore: 0.42,
          aiGeneratedProbability: 0.65,
          counterfeiteRisk: 0.78,
          imageAnalysisScore: 0.55,
          sellerReliabilityScore: 0.48
        }
      },
      analysis: {
        create: {
          n_of_reviews: 89,
          avg_review_rating: 4.8,
          avg_days_between_reviews: 0.8,
          max_days_between_reviews: 3,
          min_days_between_reviews: 0,
          cluster_ID: 2,
          pagerank: 0.52,
          eigenvector_cent: 0.48,
          clustering_coef: 0.82,
          w_degree: 65,
          fake_score: 0.78,
          fake: 1
        }
      }
    },
    {
      name: 'Genuine Gaming Console',
      description: 'Latest generation gaming console with 1TB storage',
      price: 499.99,
      stock: 25,
      category: 'Electronics',
      images: ['console1.jpg', 'console2.jpg', 'console3.jpg', 'console4.jpg'],
      trust: {
        create: {
          overallTrustScore: 98,
          reviewTrustScore: 96,
          sellerTrustScore: 99,
          productTrustScore: 99,
          trustBadge: 'TRUSTED',
          trustBadgeColor: 'green',
          badgeDisplayText: 'Verified Authentic',
          confidenceLevel: 0.99,
          totalReviews: 892,
          authenticReviews: 885,
          suspiciousReviews: 7,
          reviewQualityScore: 0.96,
          aiGeneratedProbability: 0.01,
          counterfeiteRisk: 0.01,
          imageAnalysisScore: 0.99,
          sellerReliabilityScore: 0.99
        }
      },
      analysis: {
        create: {
          n_of_reviews: 892,
          avg_review_rating: 4.7,
          avg_days_between_reviews: 0.5,
          max_days_between_reviews: 2,
          min_days_between_reviews: 0,
          cluster_ID: 1,
          pagerank: 0.95,
          eigenvector_cent: 0.92,
          clustering_coef: 0.68,
          w_degree: 456,
          fake_score: 0.01,
          fake: 0
        }
      }
    }
  ];

  // Create products with their trust and analysis data
  for (const productData of products) {
    await prisma.product.create({
      data: {
        ...productData,
        sellerId: demoSeller.id
      }
    });
  }

  // Add some review info for each product
  const allProducts = await prisma.product.findMany();
  
  for (const product of allProducts) {
    const numberOfReviews = Math.floor(Math.random() * 5) + 3; // 3-7 reviews per product
    
    for (let i = 0; i < numberOfReviews; i++) {
      await prisma.reviewInfo.create({
        data: {
          reviewRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          numberOfHelpful: Math.floor(Math.random() * 50),
          reviewBody: `This is a detailed review for ${product.name}. The product quality is excellent and meets all expectations.`,
          reviewTitle: `Great ${product.category} product`,
          reviewDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
          productId: product.id,
          reviewerId: demoSeller.id
        }
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 