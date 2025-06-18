const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper function to clean JSON data
function cleanJsonData(data) {
  return data.replace(/:\s*NaN\s*([,}])/g, ': null$1');
}

async function importData() {
  try {
    const sellerId = '4e93dcaa-70b8-4b1f-8755-05a8691b30d2';

    // Check if seller exists first
    let seller = await prisma.user.findUnique({
      where: { id: sellerId }
    });

    // Create the seller user if doesn't exist
    if (!seller) {
      seller = await prisma.user.create({
        data: {
          id: sellerId,
          email: 'seller@example.com',
          password: 'hashedpassword123', // In production, this should be properly hashed
          name: 'Test Seller',
          role: 'SELLER'
        }
      });
      console.log('Created seller user:', seller.name);
    } else {
      console.log('Using existing seller:', seller.name);
    }

    // Read and clean the JSON data
    const rawData = fs.readFileSync(path.join(__dirname, '../../product_clean/combined_products.json'), 'utf8');
    const cleanedData = cleanJsonData(rawData);
    const products = JSON.parse(cleanedData);
    
    console.log(`Found ${products.length} products to import`);

    // Delete existing data in the correct order
    console.log('Cleaning up existing data...');
    await prisma.productAnalysis.deleteMany();
    await prisma.productTrust.deleteMany();
    await prisma.reviewInfo.deleteMany();
    await prisma.product.deleteMany();
    console.log('Cleared existing data');

    for (const productData of products) {
      try {
        // Clean up any null or undefined values
        const cleanProduct = {
          ...productData,
          stock: productData.stock || 100,
          images: productData.images || [],
          category: productData.category || 'Uncategorized',
          reviews: productData.reviews.map(review => ({
            ...review,
            rating: review.rating || 3,
            helpful_votes: review.helpful_votes || 0,
            title: review.title || 'No Title',
            review_text: review.review_text || 'No Review Text',
            ai_generated: review.ai_generated || false,
            generated_score: review.generated_score || 0
          }))
        };

        // Create the product
        const product = await prisma.product.create({
          data: {
            id: cleanProduct.id,
            name: cleanProduct.name,
            description: cleanProduct.description,
            price: cleanProduct.price,
            stock: cleanProduct.stock,
            images: cleanProduct.images,
            category: cleanProduct.category,
            sellerId: sellerId,
            // Additional fields from JSON
            originalProductId: cleanProduct.product_ID,
            fakeProbability: cleanProduct.fake_score,
            trustScore: cleanProduct.trust_score,
            reviewCount: cleanProduct.n_of_reviews,
            averageRating: cleanProduct.avg_review_rating,
            // Create reviews for the product
            reviewInfos: {
              create: cleanProduct.reviews.map(review => ({
                reviewRating: review.rating,
                numberOfHelpful: review.helpful_votes,
                reviewBody: review.review_text,
                reviewTitle: review.title,
                reviewDate: new Date(review.date), // This will properly parse YYYY-MM-DD format
                reviewerId: review.reviewer_id.toString(), // Using the original reviewer ID
                // Additional fields from JSON
                isAiGenerated: review.ai_generated,
                aiGeneratedScore: review.generated_score
              }))
            }
          }
        });
        console.log(`Created product: ${product.name} with ${cleanProduct.reviews.length} reviews`);
      } catch (error) {
        console.error(`Error creating product ${productData.name}:`, error);
      }
    }

    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData(); 