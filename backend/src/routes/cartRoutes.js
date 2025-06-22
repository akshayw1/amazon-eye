const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      // Create a new cart if it doesn't exist
      return res.json({
        id: null,
        items: [],
        total: 0
      });
    }

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Add item to cart
router.post('/items', auth, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Get or create cart
    let cart = await prisma.cart.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        total: 0
      },
      update: {}
    });

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId
      }
    });

    let cartItem;
    if (existingItem) {
      // Update quantity if item exists
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        },
        include: {
          product: true
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: product.price
        },
        include: {
          product: true
        }
      });
    }

    // Update cart total
    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        total: {
          increment: product.price * quantity
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
});

// Update cart item quantity
router.put('/items/:itemId', auth, async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Verify cart ownership
    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedCart = await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: {
        items: {
          update: {
            where: { id: itemId },
            data: { quantity }
          }
        },
        total: {
          set: prisma.cartItem.aggregate({
            where: { cartId: cartItem.cartId },
            _sum: {
              total: true
            }
          })
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
});

// Remove item from cart
router.delete('/items/:itemId', auth, async (req, res) => {
  const { itemId } = req.params;

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Verify cart ownership
    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete cart item and update cart total
    const updatedCart = await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: {
        items: {
          delete: {
            id: itemId
          }
        },
        total: {
          decrement: cartItem.price * cartItem.quantity
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Error removing cart item' });
  }
});

module.exports = router; 