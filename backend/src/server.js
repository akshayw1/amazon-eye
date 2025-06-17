const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');
const config = require('./config/config');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Test database connection and start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✨ Successfully connected to Prisma');
    
    app.listen(config.PORT, () => {
      console.log(`🚀 Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

startServer(); 