const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');
const { getClientIpAddress } = require('../utils/ipUtils');

const router = express.Router();
const prisma = new PrismaClient();

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

// Create review
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const productId = req.params.productId;
    const clientIp = getClientIpAddress(req);

    // Debug logging for IP address
    console.log('🔍 Review submission debug info:');
    console.log('  - Client IP:', clientIp);
    console.log('  - Headers:', JSON.stringify({
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'x-client-ip': req.headers['x-client-ip'],
    }, null, 2));
    console.log('  - Connection remote:', req.connection?.remoteAddress);
    console.log('  - Socket remote:', req.socket?.remoteAddress);
    console.log('  - req.ip:', req.ip);

    // Validate input
    if (!rating || !comment || !title) {
      return res.status(400).json({ message: 'Rating, comment, and title are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product (based on reviewerId)
    const existingReview = await prisma.reviewInfo.findFirst({
      where: {
        AND: [
          { productId },
          { reviewerId: req.user.id },
        ],
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const reviewData = {
      reviewRating: rating,
      reviewBody: comment,
      reviewTitle: title,
      reviewDate: new Date(),
      reviewerId: req.user.id,
      productId,
      numberOfHelpful: 0,
      isAiGenerated: false,
      aiGeneratedScore: 0,
      ipAddress: clientIp,
    };

    console.log('💾 Saving review to database with IP:', clientIp);

    const review = await prisma.reviewInfo.create({
      data: reviewData,
    });

    console.log('✅ Review saved successfully with ID:', review.id, 'and IP:', review.ipAddress);

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review.id,
        rating: review.reviewRating,
        title: review.reviewTitle,
        body: review.reviewBody,
        date: review.reviewDate,
        helpful: review.numberOfHelpful,
        ipAddress: review.ipAddress // Include IP in response for debugging
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ message: 'Error creating review' });
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