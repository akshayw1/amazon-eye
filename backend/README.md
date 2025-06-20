# Amazon Eye Backend

This is the backend service for an Amazon Eye e-commerce platform built with Node.js, Express, and Prisma with PostgreSQL.

## Features

- User Authentication (Register/Login with phone number)
- Product Management (CRUD operations)
- Review System with IP tracking
- Order Management System with status tracking
- Return Request System with automated calling
- AI-powered Call Analysis using Google Gemini
- PostgreSQL Database with Prisma ORM
- JWT-based authentication
- Automated outbound calling integration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/amazon_clone?schema=public"
PORT=3000
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
GEMINI_API_KEY="your-google-gemini-api-key"
CALLING_SERVICE_URL="https://your-calling-service-url.com/outbound-call"
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

5. Start the server:
```bash
# For development with auto-reload
npm run dev

# For production
npm start
```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- GET `/api/users/me` - Get user profile (Protected)

### Products
- POST `/api/products` - Create a product (Protected)
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- PUT `/api/products/:id` - Update product (Protected)
- DELETE `/api/products/:id` - Delete product (Protected)

### Reviews
- POST `/api/reviews/:productId` - Create a review (Protected)
- GET `/api/reviews/product/:productId` - Get reviews for a product
- PUT `/api/reviews/:id` - Update review (Protected)
- DELETE `/api/reviews/:id` - Delete review (Protected)

### Orders
- POST `/api/orders` - Create a new order (Protected)
- GET `/api/orders` - Get user's orders (Protected)
- GET `/api/orders/:id` - Get specific order (Protected)
- PUT `/api/orders/:id/status` - Update order status (Admin only)
- GET `/api/orders/admin` - Get all orders (Admin only)

### Return Requests
- POST `/api/orders/:id/return` - Create return request (Protected)
- GET `/api/orders/returns/my` - Get user's return requests (Protected)
- PUT `/api/orders/returns/call/:callSid/status` - Update call status by callSid
- PUT `/api/orders/returns/:id/call-status` - Update call status by return request ID
- GET `/api/orders/returns/:id` - Get specific return request (Protected)

## Development

To start the development server with hot-reload:
```bash
npm run dev
```

To access the Prisma Studio (database GUI):
```bash
npm run prisma:studio
```

## Production

For production deployment:
```bash
npm start
```

## Database Schema

The database includes the following models:
- User (for authentication and user management with phone numbers)
- Product (for product listings)
- Review (for product reviews with IP tracking)
- Order (for order management with shipping and payment info)
- OrderItem (for individual items within orders)
- ReturnRequest (for return requests with call tracking and AI analysis)

Check `prisma/schema.prisma` for the complete schema definition.

## AI Analysis Feature

The system includes AI-powered call analysis using Google Gemini:

1. **Automatic Analysis**: When a call transcript is received and marked as "completed", the system automatically generates an AI summary
2. **Comprehensive Insights**: The AI provides structured analysis including:
   - Call summary and customer issue
   - Customer sentiment analysis
   - Resolution offered and next steps
   - Call quality assessment
   - Key insights for management

3. **Reusable Utility**: The `geminiAnalysis.js` utility provides functions for:
   - `analyzeCallTranscript()` - Analyze customer service calls
   - `analyzeProductReviews()` - Analyze product review patterns
   - `generateContent()` - General AI content generation

## Calling Integration

The system integrates with an outbound calling service:

1. **Automatic Calls**: When return requests are created, the system automatically initiates calls
2. **Call Tracking**: Tracks call status (pending, initiated, completed, failed)
3. **Transcript Storage**: Stores conversation transcripts in JSON format
4. **AI Analysis**: Automatically analyzes completed calls for insights

## Database Backup & Restore

The system includes comprehensive backup and restore functionality to protect your data.

### Creating a Backup

To create a complete backup of your database:

```bash
node backup_database.js
```

This will:
- ✅ Create a timestamped JSON backup file in the `./backups/` directory
- ✅ Include all data: users, products, reviews, orders, return requests, and edit history
- ✅ Generate a summary file with backup statistics
- ✅ Preserve all relationships and foreign key constraints

**Example Output:**
```
🔄 Starting database backup...
📊 Fetching users...
📦 Fetching products...
⭐ Fetching reviews...
🛒 Fetching orders...
📝 Fetching order items...
🔄 Fetching return requests...
📋 Fetching product edit history...
💾 Writing backup to file...
✅ Database backup completed successfully!
📁 Backup saved to: ./backups/amazon_eye_backup_2025-06-20T22-20-23-920Z.json
📊 Total records backed up: 15319
```

### Backup Contents

Each backup includes:
- **Users**: All user accounts and authentication data
- **Products**: Complete product catalog with seller information
- **Reviews**: Customer reviews and ratings with IP tracking
- **Orders**: Order management system data with shipping info
- **Order Items**: Individual order line items with pricing
- **Return Requests**: Return requests with call tracking and AI summaries
- **Product Edit History**: Complete audit trail of product changes

### Restoring from Backup

To restore your database from a backup file:

```bash
node restore_database.js ./backups/amazon_eye_backup_2025-06-20T22-20-23-920Z.json
```

**⚠️ Important Notes:**
- The restore process will **DELETE ALL EXISTING DATA** before restoring
- You have a 5-second window to cancel with `Ctrl+C`
- The restore maintains all relationships and foreign key constraints
- Data is restored in the correct order to avoid constraint violations

**Example Restore Process:**
```
🔄 Starting database restore...
📖 Reading backup file...
📊 Backup metadata:
- Created: 2025-06-20T22:20:23.920Z
- Version: 1.0
- Description: Amazon Eye Database Backup

⚠️  WARNING: This will delete all existing data!
Press Ctrl+C to cancel, or wait 5 seconds to continue...

🗑️  Clearing existing data...
✅ Existing data cleared

📥 Restoring data...
👥 Restoring users...
✅ Restored 6 users
📦 Restoring products...
✅ Restored 120 products
⭐ Restoring reviews...
✅ Restored 15178 reviews
🛒 Restoring orders...
✅ Restored 4 orders
📝 Restoring order items...
✅ Restored 4 order items
🔄 Restoring return requests...
✅ Restored 3 return requests
📋 Restoring product edit history...
✅ Restored 4 edit history records

🎉 Database restore completed successfully!
```

### Backup Best Practices

1. **Regular Backups**: Create backups before major updates or migrations
2. **Version Control**: Keep multiple backup versions for different time periods
3. **Test Restores**: Periodically test restore process in development environment
4. **Secure Storage**: Store backup files in secure, encrypted locations
5. **Automated Backups**: Consider setting up automated daily/weekly backups

### Backup File Structure

The backup files are JSON formatted with the following structure:

```json
{
  "metadata": {
    "timestamp": "2025-06-20T22:20:23.920Z",
    "version": "1.0",
    "description": "Amazon Eye Database Backup",
    "totalRecords": {
      "users": 6,
      "products": 120,
      "reviews": 15178,
      "orders": 4,
      "orderItems": 4,
      "returnRequests": 3,
      "productEditHistory": 4
    }
  },
  "data": {
    "users": [...],
    "products": [...],
    "reviews": [...],
    "orders": [...],
    "orderItems": [...],
    "returnRequests": [...],
    "productEditHistory": [...]
  }
}
```

### Alternative Backup Methods

For additional backup options, you can also use:

**PostgreSQL pg_dump** (if available):
```bash
pg_dump -h localhost -U postgres -d amazon_eye -f amazon_eye_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Docker PostgreSQL Backup**:
```bash
docker exec -t $(docker ps -q --filter "name=postgres") pg_dump -U postgres amazon_eye > amazon_eye_sql_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Troubleshooting

**Common Issues:**

1. **Permission Errors**: Ensure the `backups/` directory has write permissions
2. **Memory Issues**: For very large databases, consider increasing Node.js memory limit:
   ```bash
   node --max-old-space-size=4096 backup_database.js
   ```
3. **Connection Errors**: Verify database connection and Prisma configuration
4. **Foreign Key Violations**: The restore script handles constraint order automatically

**Recovery from Failed Restore:**
If a restore fails midway, you can:
1. Check the error message for specific issues
2. Restore from a previous backup
3. Use the database migration system to rebuild schema if needed

### Quick Reference

**Create Backup:**
```bash
# Create a complete database backup
node backup_database.js

# Check backup files
ls -la backups/
```

**Restore Database:**
```bash
# Restore from specific backup file
node restore_database.js ./backups/amazon_eye_backup_YYYY-MM-DDTHH-MM-SS-sssZ.json

# List available backups
ls -la backups/*.json
```

**Backup Schedule Example:**
```bash
# Daily backup (add to crontab)
0 2 * * * cd /path/to/backend && node backup_database.js

# Weekly backup with cleanup (keep last 4 weeks)
0 3 * * 0 cd /path/to/backend && node backup_database.js && find backups/ -name "*.json" -mtime +28 -delete
``` 