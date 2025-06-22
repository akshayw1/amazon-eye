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

// Get product by original product ID
router.get('/by-original-id/:originalId', async (req, res) => {
  try {
    const originalProductId = parseInt(req.params.originalId);
    
    if (isNaN(originalProductId)) {
      return res.status(400).json({ message: 'Invalid original product ID' });
    }

    const product = await prisma.product.findFirst({
      where: { originalProductId },
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

    res.json(product);
  } catch (error) {
    console.error('Error fetching product by original ID:', error);
    res.status(400).json({ message: 'Error fetching product' });
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
          { description: { contains: search, mode: 'insensitive' } },
          // Search by original product ID if search is numeric
          ...(isNaN(parseInt(search)) ? [] : [{ originalProductId: parseInt(search) }])
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

// Get seller's products
router.get('/seller/my-products', auth, async (req, res) => {
  try {
    const { page = 1, perPage = 10, search } = req.query;
    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    // Build where clause for seller's products
    const where = {
      sellerId: req.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Get total count for pagination
    const totalProducts = await prisma.product.count({ where });

    // Get seller's products
    const products = await prisma.product.findMany({
      where,
      include: {
        _count: {
          select: { 
            reviewInfos: true,
            orderItems: true,
            editHistory: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: (pageNum - 1) * perPageNum,
      take: perPageNum,
    });

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
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Update product with history tracking
router.put('/:id', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const { editReason, ...updateData } = req.body;

    // Get current product data
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (currentProduct.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    // Track changes
    const changes = [];
    const fieldsToTrack = ['name', 'description', 'price', 'stock', 'category', 'images'];
    
    for (const field of fieldsToTrack) {
      if (updateData[field] !== undefined) {
        const oldValue = currentProduct[field];
        const newValue = updateData[field];
        
        // Convert to string for comparison and storage
        const oldValueStr = Array.isArray(oldValue) ? JSON.stringify(oldValue) : String(oldValue);
        const newValueStr = Array.isArray(newValue) ? JSON.stringify(newValue) : String(newValue);
        
        if (oldValueStr !== newValueStr) {
          changes.push({
            fieldChanged: field,
            oldValue: oldValueStr,
            newValue: newValueStr,
            editReason: editReason || `Updated ${field}`,
            editType: 'UPDATE'
          });
        }
      }
    }

    // Use transaction to update product and create history records
    const result = await prisma.$transaction(async (tx) => {
      // Update the product
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          seller: {
            select: { id: true, name: true }
          },
          _count: {
            select: { 
              reviewInfos: true,
              orderItems: true,
              editHistory: true
            }
          }
        }
      });

      // Create history records for each change
      if (changes.length > 0) {
        await tx.productEditHistory.createMany({
          data: changes.map(change => ({
            ...change,
            productId: productId,
            editedBy: req.user.id
          }))
        });
      }

      return updatedProduct;
    });

    res.json({
      product: result,
      changesTracked: changes.length,
      message: `Product updated successfully. ${changes.length} changes tracked.`
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Get product edit history
router.get('/:id/history', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const { page = 1, perPage = 20 } = req.query;
    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    // Verify product exists and user has access
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sellerId: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view edit history' });
    }

    // Get total count
    const totalHistory = await prisma.productEditHistory.count({
      where: { productId }
    });

    // Get edit history with editor info
    const history = await prisma.productEditHistory.findMany({
      where: { productId },
      include: {
        editor: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * perPageNum,
      take: perPageNum
    });

    res.json({
      product: {
        id: product.id,
        name: product.name
      },
      data: history,
      pagination: {
        total: totalHistory,
        page: pageNum,
        perPage: perPageNum,
        totalPages: Math.ceil(totalHistory / perPageNum)
      }
    });

  } catch (error) {
    console.error('Error fetching product history:', error);
    res.status(500).json({ message: 'Error fetching edit history' });
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