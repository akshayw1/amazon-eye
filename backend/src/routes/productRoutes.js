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
        images: images || [],
        sellerId: req.user.id,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product' });
  }
});

// Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, perPage = 12, category, search } = req.query;
    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    // Build where clause for filtering
    const where = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Get total count for pagination
    const totalProducts = await prisma.product.count({ where });

    // Get paginated products
    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { reviewInfos: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * perPageNum,
      take: perPageNum,
    });

    // Return products with pagination info
    res.json({
      data: products,
      pagination: {
        total: totalProducts,
        page: pageNum,
        perPage: perPageNum,
        totalPages: Math.ceil(totalProducts / perPageNum)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(400).json({ message: 'Error fetching products' });
  }
});

// Get single product with paginated reviews
router.get('/:id', async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    // First get the product with basic info
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { reviewInfos: true }
        }
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Then get paginated reviews
    const reviews = await prisma.reviewInfo.findMany({
      where: { productId: req.params.id },
      orderBy: { reviewDate: 'desc' },
      skip: (pageNum - 1) * perPageNum,
      take: perPageNum,
    });

    // Combine product and reviews data
    const response = {
      ...product,
      reviews: {
        data: reviews,
        pagination: {
          total: product._count.reviewInfos,
          page: pageNum,
          perPage: perPageNum,
          totalPages: Math.ceil(product._count.reviewInfos / perPageNum)
        }
      }
    };

    res.json(response);
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

    // Delete associated reviews first
    await prisma.reviewInfo.deleteMany({
      where: { productId: req.params.id },
    });

    // Then delete the product
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product' });
  }
});

module.exports = router; 