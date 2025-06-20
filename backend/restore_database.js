const { PrismaClient } = require('./src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreDatabase(backupFilePath) {
  try {
    console.log('🔄 Starting database restore...');
    
    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      console.error('❌ Backup file not found:', backupFilePath);
      return;
    }
    
    // Read backup file
    console.log('📖 Reading backup file...');
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    
    console.log('📊 Backup metadata:');
    console.log(`- Created: ${backupData.metadata.timestamp}`);
    console.log(`- Version: ${backupData.metadata.version}`);
    console.log(`- Description: ${backupData.metadata.description}`);
    
    // Warning about data loss
    console.log('\n⚠️  WARNING: This will delete all existing data!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🗑️  Clearing existing data...');
    
    // Delete all data in reverse order (respecting foreign key constraints)
    await prisma.productEditHistory.deleteMany();
    await prisma.returnRequest.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.reviewInfo.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Existing data cleared');
    
    // Restore data in correct order
    console.log('\n📥 Restoring data...');
    
    // Restore users first (no dependencies)
    console.log('👥 Restoring users...');
    for (const user of backupData.data.users) {
      const { products, orders, returnRequests, productEdits, ...userData } = user;
      await prisma.user.create({ data: userData });
    }
    console.log(`✅ Restored ${backupData.data.users.length} users`);
    
    // Restore products (depends on users)
    console.log('📦 Restoring products...');
    for (const product of backupData.data.products) {
      const { seller, reviewInfos, orderItems, returnRequests, editHistory, ...productData } = product;
      await prisma.product.create({ data: productData });
    }
    console.log(`✅ Restored ${backupData.data.products.length} products`);
    
    // Restore reviews (depends on products)
    console.log('⭐ Restoring reviews...');
    for (const review of backupData.data.reviews) {
      const { product, ...reviewData } = review;
      await prisma.reviewInfo.create({ data: reviewData });
    }
    console.log(`✅ Restored ${backupData.data.reviews.length} reviews`);
    
    // Restore orders (depends on users)
    console.log('🛒 Restoring orders...');
    for (const order of backupData.data.orders) {
      const { user, items, returnRequests, ...orderData } = order;
      await prisma.order.create({ data: orderData });
    }
    console.log(`✅ Restored ${backupData.data.orders.length} orders`);
    
    // Restore order items (depends on orders and products)
    console.log('📝 Restoring order items...');
    for (const item of backupData.data.orderItems) {
      const { order, product, ...itemData } = item;
      await prisma.orderItem.create({ data: itemData });
    }
    console.log(`✅ Restored ${backupData.data.orderItems.length} order items`);
    
    // Restore return requests (depends on orders, users, and products)
    console.log('🔄 Restoring return requests...');
    for (const returnRequest of backupData.data.returnRequests) {
      const { order, user, product, ...returnData } = returnRequest;
      await prisma.returnRequest.create({ data: returnData });
    }
    console.log(`✅ Restored ${backupData.data.returnRequests.length} return requests`);
    
    // Restore product edit history (depends on products and users)
    console.log('📋 Restoring product edit history...');
    for (const edit of backupData.data.productEditHistory) {
      const { product, editor, ...editData } = edit;
      await prisma.productEditHistory.create({ data: editData });
    }
    console.log(`✅ Restored ${backupData.data.productEditHistory.length} edit history records`);
    
    console.log('\n🎉 Database restore completed successfully!');
    
    // Verify restoration
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.reviewInfo.count(),
      prisma.order.count(),
      prisma.orderItem.count(),
      prisma.returnRequest.count(),
      prisma.productEditHistory.count()
    ]);
    
    console.log('\n📊 Verification:');
    console.log(`- Users: ${counts[0]}`);
    console.log(`- Products: ${counts[1]}`);
    console.log(`- Reviews: ${counts[2]}`);
    console.log(`- Orders: ${counts[3]}`);
    console.log(`- Order Items: ${counts[4]}`);
    console.log(`- Return Requests: ${counts[5]}`);
    console.log(`- Product Edit History: ${counts[6]}`);
    
  } catch (error) {
    console.error('❌ Error during restore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get backup file path from command line argument
const backupFilePath = process.argv[2];

if (!backupFilePath) {
  console.log('Usage: node restore_database.js <backup-file-path>');
  console.log('Example: node restore_database.js ./backups/amazon_eye_backup_2024-06-20T21-30-00-000Z.json');
  process.exit(1);
}

// Run the restore
restoreDatabase(backupFilePath); 