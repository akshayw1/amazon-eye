const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');
const { getClientIpAddress } = require('../utils/ipUtils');
const { verifyProductImage } = require('../utils/imageVerification');
const multer = require('multer');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Database protection middleware - prevent dangerous operations
const preventDangerousOperations = (req, res, next) => {
  const dangerousOperations = ['DELETE', 'TRUNCATE', 'DROP', 'RESET'];
  const bodyString = JSON.stringify(req.body).toUpperCase();
  const queryString = req.url.toUpperCase();
  
  for (const operation of dangerousOperations) {
    if (bodyString.includes(operation) || queryString.includes(operation)) {
      return res.status(403).json({ 
        message: 'Database modification operations are not allowed',
        error: 'OPERATION_BLOCKED'
      });
    }
  }
  next();
};

// Apply protection middleware to all routes
router.use(preventDangerousOperations);

// Create review with image verification
router.post('/:productId', auth, upload.single('reviewerImage'), async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const productId = req.params.productId;
    const clientIp = getClientIpAddress(req);
    const reviewerImage = req.file;

    // Debug logging for request data
    console.log('🔍 Review submission debug info:');
    console.log('  - Product ID:', productId);
    console.log('  - Raw rating:', rating, typeof rating);
    console.log('  - Comment:', comment, typeof comment);
    console.log('  - Title:', title, typeof title);
    console.log('  - User ID:', req.user?.id);
    console.log('  - Has image:', !!reviewerImage);

    // Parse rating as integer
    const parsedRating = parseInt(rating, 10);
    console.log('  - Parsed rating:', parsedRating, typeof parsedRating);

    // Validate input with better checks
    if (isNaN(parsedRating) || parsedRating === 0) {
      console.log('❌ Rating validation failed:', parsedRating);
      return res.status(400).json({ message: 'Rating is required and must be a valid number' });
    }

    if (!comment || comment.trim() === '') {
      console.log('❌ Comment validation failed:', comment);
      return res.status(400).json({ message: 'Comment is required and cannot be empty' });
    }

    if (!title || title.trim() === '') {
      console.log('❌ Title validation failed:', title);
      return res.status(400).json({ message: 'Title is required and cannot be empty' });
    }

    if (parsedRating < 1 || parsedRating > 5) {
      console.log('❌ Rating range validation failed:', parsedRating);
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if product exists and get its first image
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        images: true,
      },
    });

    if (!product) {
      console.log('❌ Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('✅ Product found:', product.id);

    // Initialize image verification data
    let imageVerificationData = null;

    // If reviewer uploaded an image and product has images, verify authenticity
    if (reviewerImage && product.images && product.images.length > 0) {
      try {
        console.log('🖼️ Starting image verification...');
        imageVerificationData = await verifyProductImage(
          product.images[0], // Use first product image
          reviewerImage.buffer
        );
        console.log('✅ Image verification completed:', imageVerificationData);
      } catch (error) {
        console.error('❌ Image verification failed:', error);
        // Continue without image verification if it fails
      }
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.reviewInfo.findFirst({
      where: {
        AND: [
          { productId },
          { reviewerId: req.user.id },
        ],
      },
    });

    if (existingReview) {
      console.log('❌ User already reviewed this product:', req.user.id, productId);
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const reviewData = {
      reviewRating: parsedRating,
      reviewBody: comment.trim(),
      reviewTitle: title.trim(),
      reviewDate: new Date(),
      reviewerId: req.user.id,
      productId,
      numberOfHelpful: 0,
      isAiGenerated: false,
      aiGeneratedScore: 0,
      ipAddress: clientIp,
      // Add image verification data if available
      ...(imageVerificationData && {
        reviewerImage: reviewerImage ? reviewerImage.buffer.toString('base64') : null,
        imageAuthScore: imageVerificationData.authenticity_score,
        imageAnalysis: imageVerificationData.analysis,
      }),
    };

    console.log('💾 Saving review to database:', {
      ...reviewData,
      reviewerImage: reviewData.reviewerImage ? '[base64 data]' : null
    });

    const review = await prisma.reviewInfo.create({
      data: reviewData,
    });

    console.log('✅ Review saved successfully with ID:', review.id);

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review.id,
        rating: review.reviewRating,
        title: review.reviewTitle,
        body: review.reviewBody,
        date: review.reviewDate,
        helpful: review.numberOfHelpful,
        ipAddress: review.ipAddress,
        imageAuthScore: review.imageAuthScore,
        imageAnalysis: review.imageAnalysis,
      }
    });
  } catch (error) {
    console.error('❌ Error creating review:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ 
      message: 'Error creating review', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get reviews for a product with pagination
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    // Get total count for pagination
    const totalReviews = await prisma.reviewInfo.count({
      where: { productId: req.params.productId }
    });

    // Get paginated reviews
    const reviews = await prisma.reviewInfo.findMany({
      where: {
        productId: req.params.productId,
      },
      orderBy: {
        reviewDate: 'desc',
      },
      skip: (pageNum - 1) * perPageNum,
      take: perPageNum,
    });

    // Return reviews with pagination info
    res.json({
      data: reviews,
      pagination: {
        total: totalReviews,
        page: pageNum,
        perPage: perPageNum,
        totalPages: Math.ceil(totalReviews / perPageNum)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(400).json({ message: 'Error fetching reviews' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await prisma.reviewInfo.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedReview = await prisma.reviewInfo.update({
      where: { id: req.params.id },
      data: {
        reviewRating: req.body.rating,
        reviewBody: req.body.comment,
        reviewTitle: req.body.title,
      },
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(400).json({ message: 'Error updating review' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await prisma.reviewInfo.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.reviewInfo.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(400).json({ message: 'Error deleting review' });
  }
});

// Public endpoint to update review IP address (for testing trust factor)
router.put('/:id/ip', async (req, res) => {
  try {
    const { ipAddress } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({ message: 'IP address is required' });
    }

    const review = await prisma.reviewInfo.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updatedReview = await prisma.reviewInfo.update({
      where: { id: req.params.id },
      data: {
        ipAddress: ipAddress,
      },
    });

    res.json({
      message: 'Review IP address updated successfully',
      review: {
        id: updatedReview.id,
        ipAddress: updatedReview.ipAddress,
      }
    });
  } catch (error) {
    console.error('Error updating review IP address:', error);
    res.status(400).json({ message: 'Error updating review IP address' });
  }
});

module.exports = router; 