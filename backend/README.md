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