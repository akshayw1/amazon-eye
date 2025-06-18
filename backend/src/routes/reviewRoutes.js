const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create review
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const productId = req.params.productId;

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

    const review = await prisma.reviewInfo.create({
      data: {
        reviewRating: rating,
        reviewBody: comment,
        reviewTitle: title || 'Review',
        reviewDate: new Date(),
        reviewerId: req.user.id,
        productId,
        numberOfHelpful: 0,
        isAiGenerated: false,
        aiGeneratedScore: 0,
      },
    });

    res.status(201).json(review);
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

module.exports = router; 