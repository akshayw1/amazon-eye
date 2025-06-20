const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');
const axios = require('axios');
const { analyzeCallTranscript } = require('../utils/geminiAnalysis');

const router = express.Router();
const prisma = new PrismaClient();

// Create a new order (POST /api/orders)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items, // Array of {productId, quantity}
      shippingAddress,
      city,
      state,
      zipCode,
      firstName,
      lastName,
      email,
      phone,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!shippingAddress || !city || !state || !zipCode || !firstName || !lastName || !email) {
      return res.status(400).json({ message: 'All shipping information fields are required' });
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const total = subtotal + tax + shipping;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress,
        city,
        state,
        zipCode,
        firstName,
        lastName,
        email,
        phone,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all orders (GET /api/orders/admin) - Admin only
router.get('/admin', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  category: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          returnRequests: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage
      }),
      prisma.order.count()
    ]);

    res.json({
      data: orders,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's orders (GET /api/orders)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  category: true
                }
              }
            }
          },
          returnRequests: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage
      }),
      prisma.order.count({
        where: { userId }
      })
    ]);

    res.json({
      data: orders,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific order (GET /api/orders/:id)
router.get('/:id', auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId // Ensure user can only access their own orders
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        returnRequests: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update order status (PUT /api/orders/:id/status) - Admin only
router.put('/:id/status', auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    
    // Set delivery timestamp if status is DELIVERED
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }
    
    // Set shipped timestamp if status is SHIPPED
    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create return request (POST /api/orders/:id/return)
router.post('/:id/return', auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { productId, title, reason, description } = req.body;

    // Validate required fields
    if (!productId || !title || !reason) {
      return res.status(400).json({ message: 'Product ID, title, and reason are required' });
    }

    // Verify order belongs to user and is delivered
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: 'DELIVERED'
      },
      include: {
        items: {
          where: { productId }
        },
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not delivered' });
    }

    if (order.items.length === 0) {
      return res.status(400).json({ message: 'Product not found in this order' });
    }

    // Check if return request already exists for this product
    const existingReturn = await prisma.returnRequest.findFirst({
      where: {
        orderId,
        productId,
        userId
      }
    });

    if (existingReturn) {
      return res.status(400).json({ message: 'Return request already exists for this product' });
    }

    // Get product details for the call
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        price: true
      }
    });

    // Create return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        userId,
        productId,
        title,
        reason,
        description,
        isCalled: order.user.phone ? "initiated" : "pending" // Set based on phone availability
      },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            price: true
          }
        },
        order: {
          select: {
            orderNumber: true
          }
        }
      }
    });

    // Make outbound call if user has phone number
    if (order.user.phone) {
      try {
        const callPrompt = `You're Sakshi from Amazon; call ${order.user.name} about return (Order: ${order.orderNumber}, Product: ${product.name}, Issue: ${title}, Reason: ${reason}); greet warmly, ask what happened, when it started, if they tried fixes, their ideal outcome, and if they need anything else — stay friendly, empathetic, and solution-focused.`;

        
        const firstMessage = `Hi ${order.user.name}! This is Sakshi calling from Amazon customer service. I hope you're having a good day! I noticed you submitted a return request for your ${product.name}, and I wanted to personally reach out to make sure we take care of you properly. Do you have a few minutes to talk about what happened?`;
      
        const callResponse = await axios.post('https://saying-crown-athletics-nominated.trycloudflare.com/outbound-call', {
          number: order.user.phone,
          prompt: callPrompt,
          first_message: firstMessage
        });

        console.log(callResponse.data);


        // Store the callSid in the return request
        if (callResponse.data && callResponse.data.callSid) {
          await prisma.returnRequest.update({
            where: { id: returnRequest.id },
            data: { callSid: callResponse.data.callSid }
          });
        }

        console.log('Outbound call initiated for return request:', returnRequest.id, 'with callSid:', callResponse.data?.callSid);
      } catch (callError) {
        console.error('Error making outbound call:', callError.message);
        // Update isCalled to failed if call failed
        await prisma.returnRequest.update({
          where: { id: returnRequest.id },
          data: { isCalled: "failed" }
        });
      }
    }

    res.status(201).json(returnRequest);
  } catch (error) {
    console.error('Error creating return request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get return requests for user (GET /api/orders/returns)
router.get('/returns/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const returnRequests = await prisma.returnRequest.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            price: true
          }
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(returnRequests);
  } catch (error) {
    console.error('Error fetching return requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update call status and transcript by callSid (PUT /api/orders/returns/call/:callSid/status)
router.put('/returns/call/:callSid/status', async (req, res) => {
  try {
    const callSid = req.params.callSid;
    const { isCalled, transcript } = req.body;

    // Validate input
    if (typeof isCalled !== 'string') {
      return res.status(400).json({ message: 'isCalled must be a string' });
    }

    const validCallStatuses = ['pending', 'initiated', 'completed', 'failed'];
    if (!validCallStatuses.includes(isCalled)) {
      return res.status(400).json({ 
        message: 'isCalled must be one of: pending, initiated, completed, failed' 
      });
    }

    if (transcript && !Array.isArray(transcript)) {
      return res.status(400).json({ message: 'transcript must be an array' });
    }

    // Validate transcript format if provided
    if (transcript) {
      for (const message of transcript) {
        if (!message.type || !message.text || !message.timestamp) {
          return res.status(400).json({ 
            message: 'Each transcript message must have type, text, and timestamp' 
          });
        }
        if (!['agent', 'user'].includes(message.type)) {
          return res.status(400).json({ 
            message: 'transcript message type must be either "agent" or "user"' 
          });
        }
      }
    }

    // Update return request by callSid
    const updatedReturnRequest = await prisma.returnRequest.update({
      where: { callSid: callSid },
      data: {
        isCalled,
        transcript: transcript || undefined,
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            price: true
          }
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Generate AI summary if transcript is provided and call is completed
    if (transcript && transcript.length > 0 && isCalled === 'completed') {
      try {
        console.log('Generating AI summary for call:', callSid);
        
        const context = {
          productName: updatedReturnRequest.product.name,
          returnReason: updatedReturnRequest.reason,
          orderNumber: updatedReturnRequest.order.orderNumber
        };

        const aiSummary = await analyzeCallTranscript(transcript, context);
        
        // Update the return request with AI summary
        await prisma.returnRequest.update({
          where: { callSid: callSid },
          data: {
            aiSummary: aiSummary,
            updatedAt: new Date()
          }
        });

        console.log('AI summary generated successfully for call:', callSid);
      } catch (error) {
        console.error('Error generating AI summary for call:', callSid, error);
        // Don't fail the main request if AI summary generation fails
      }
    }

    res.json({
      message: 'Call status updated successfully',
      returnRequest: updatedReturnRequest
    });
  } catch (error) {
    console.error('Error updating call status by callSid:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Return request not found for this callSid' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update call status and transcript by return request ID (PUT /api/orders/returns/:id/call-status)
router.put('/returns/:id/call-status', async (req, res) => {
  try {
    const returnRequestId = req.params.id;
    const { isCalled, transcript } = req.body;

    // Validate input
    if (typeof isCalled !== 'string') {
      return res.status(400).json({ message: 'isCalled must be a string' });
    }

    const validCallStatuses = ['pending', 'initiated', 'completed', 'failed'];
    if (!validCallStatuses.includes(isCalled)) {
      return res.status(400).json({ 
        message: 'isCalled must be one of: pending, initiated, completed, failed' 
      });
    }

    if (transcript && !Array.isArray(transcript)) {
      return res.status(400).json({ message: 'transcript must be an array' });
    }

    // Validate transcript format if provided
    if (transcript) {
      for (const message of transcript) {
        if (!message.type || !message.text || !message.timestamp) {
          return res.status(400).json({ 
            message: 'Each transcript message must have type, text, and timestamp' 
          });
        }
        if (!['agent', 'user'].includes(message.type)) {
          return res.status(400).json({ 
            message: 'transcript message type must be either "agent" or "user"' 
          });
        }
      }
    }

    // Update return request
    const updatedReturnRequest = await prisma.returnRequest.update({
      where: { id: returnRequestId },
      data: {
        isCalled,
        transcript: transcript || undefined,
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            price: true
          }
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Generate AI summary if transcript is provided and call is completed
    if (transcript && transcript.length > 0 && isCalled === 'completed') {
      try {
        console.log('Generating AI summary for return request:', returnRequestId);
        
        const context = {
          productName: updatedReturnRequest.product.name,
          returnReason: updatedReturnRequest.reason,
          orderNumber: updatedReturnRequest.order.orderNumber
        };

        const aiSummary = await analyzeCallTranscript(transcript, context);
        
        // Update the return request with AI summary
        await prisma.returnRequest.update({
          where: { id: returnRequestId },
          data: {
            aiSummary: aiSummary,
            updatedAt: new Date()
          }
        });

        console.log('AI summary generated successfully for return request:', returnRequestId);
      } catch (error) {
        console.error('Error generating AI summary for return request:', returnRequestId, error);
        // Don't fail the main request if AI summary generation fails
      }
    }

    res.json({
      message: 'Call status updated successfully',
      returnRequest: updatedReturnRequest
    });
  } catch (error) {
    console.error('Error updating call status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Return request not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific return request with transcript (GET /api/orders/returns/:id)
router.get('/returns/:id', auth, async (req, res) => {
  try {
    const returnRequestId = req.params.id;
    const userId = req.user.id;

    const returnRequest = await prisma.returnRequest.findFirst({
      where: {
        id: returnRequestId,
        userId // Ensure user can only access their own return requests
      },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            price: true
          }
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true
          }
        }
      }
    });

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    res.json(returnRequest);
  } catch (error) {
    console.error('Error fetching return request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 