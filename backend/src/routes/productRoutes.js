const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create product
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, stock, category, images } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        images,
        sellerId: req.user.id,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product' });
  }
});

// Get all products with optional analysis and review info
router.get('/', async (req, res) => {
  try {
    const { includeAnalysis, includeReviewInfo, includeTrust } = req.query;
    
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        ...(includeTrust === 'true' && {
          trust: true
        }),
        ...(includeAnalysis === 'true' && {
          analysis: true
        }),
        ...(includeReviewInfo === 'true' && {
          reviewInfos: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        })
      },
    });

    // Calculate average rating for each product
    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0,
    }));

    res.json(productsWithRating);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(400).json({ message: 'Error fetching products' });
  }
});

// Get single product with optional analysis and review info
router.get('/:id', async (req, res) => {
  try {
    const { includeAnalysis, includeReviewInfo, includeTrust } = req.query;

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        ...(includeTrust === 'true' && {
          trust: true
        }),
        ...(includeAnalysis === 'true' && {
          analysis: true
        }),
        ...(includeReviewInfo === 'true' && {
          reviewInfos: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        })
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(400).json({ message: 'Error fetching product' });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product' });
  }
});

module.exports = router; 