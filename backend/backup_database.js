const { PrismaClient } = require('./src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `amazon_eye_backup_${timestamp}.json`);
    
    // Fetch all data from all tables
    console.log('📊 Fetching users...');
    const users = await prisma.user.findMany({
      include: {
        products: true,
        orders: true,
        returnRequests: true,
        productEdits: true
      }
    });
    
    console.log('📦 Fetching products...');
    const products = await prisma.product.findMany({
      include: {
        seller: true,
        reviewInfos: true,
        orderItems: true,
        returnRequests: true,
        editHistory: true
      }
    });
    
    console.log('⭐ Fetching reviews...');
    const reviews = await prisma.reviewInfo.findMany({
      include: {
        product: true
      }
    });
    
    console.log('🛒 Fetching orders...');
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        },
        returnRequests: {
          include: {
            product: true,
            user: true
          }
        }
      }
    });
    
    console.log('📝 Fetching order items...');
    const orderItems = await prisma.orderItem.findMany({
      include: {
        order: true,
        product: true
      }
    });
    
    console.log('🔄 Fetching return requests...');
    const returnRequests = await prisma.returnRequest.findMany({
      include: {
        order: true,
        user: true,
        product: true
      }
    });
    
    console.log('📋 Fetching product edit history...');
    const productEditHistory = await prisma.productEditHistory.findMany({
      include: {
        product: true,
        editor: true
      }
    });
    
    // Create backup object
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        description: 'Amazon Eye Database Backup',
        totalRecords: {
          users: users.length,
          products: products.length,
          reviews: reviews.length,
          orders: orders.length,
          orderItems: orderItems.length,
          returnRequests: returnRequests.length,
          productEditHistory: productEditHistory.length
        }
      },
      data: {
        users,
        products,
        reviews,
        orders,
        orderItems,
        returnRequests,
        productEditHistory
      }
    };
    
    // Write to file
    console.log('💾 Writing backup to file...');
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log('✅ Database backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`📊 Total records backed up: ${Object.values(backup.metadata.totalRecords).reduce((a, b) => a + b, 0)}`);
    
    // Create a summary file
    const summaryFile = path.join(backupDir, `backup_summary_${timestamp}.txt`);
    const summary = `
Amazon Eye Database Backup Summary
=================================
Date: ${new Date().toLocaleString()}
Backup File: ${path.basename(backupFile)}
File Size: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB

Records Count:
- Users: ${users.length}
- Products: ${products.length}
- Reviews: ${reviews.length}
- Orders: ${orders.length}
- Order Items: ${orderItems.length}
- Return Requests: ${returnRequests.length}
- Product Edit History: ${productEditHistory.length}

Total Records: ${Object.values(backup.metadata.totalRecords).reduce((a, b) => a + b, 0)}

Features Included:
✅ User accounts and authentication data
✅ Product listings with seller information
✅ Customer reviews and ratings
✅ Order management system
✅ Return request system with call tracking
✅ Product edit history with audit trail
✅ AI call analysis summaries

To restore this backup, use the restore_database.js script.
`;
    
    fs.writeFileSync(summaryFile, summary);
    console.log(`📋 Summary saved to: ${summaryFile}`);
    
  } catch (error) {
    console.error('❌ Error during backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backup
backupDatabase(); 