# Amazon Clone Backend

This is the backend service for an Amazon clone e-commerce platform built with Node.js, Express, and Prisma with PostgreSQL.

## Features

- User Authentication (Register/Login)
- Product Management (CRUD operations)
- Review System with IP tracking
- PostgreSQL Database with Prisma ORM
- JWT-based authentication

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
- User (for authentication and user management)
- Product (for product listings)
- Review (for product reviews with IP tracking)

Check `prisma/schema.prisma` for the complete schema definition. 