const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create review
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        AND: [
          { productId },
          { userId: req.user.id },
        ],
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        ipAddress,
        userId: req.user.id,
        productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error creating review' });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId: req.params.productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching reviews' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        rating: req.body.rating,
        comment: req.body.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: 'Error updating review' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.review.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting review' });
  }
});

module.exports = router; 