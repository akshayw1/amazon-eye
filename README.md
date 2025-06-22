# Amazon Eye - E-commerce Platform

A comprehensive e-commerce platform with advanced features including AI-powered call analysis, product trust scoring, and automated customer service.

## 🚀 Features

### Core E-commerce
- **User Authentication**: Secure registration/login with phone numbers
- **Product Management**: Complete CRUD operations with seller dashboard
- **Order System**: Full checkout flow with status tracking
- **Review System**: Customer reviews with IP tracking and trust analysis

### Advanced Features
- **Return Management**: Automated return requests with outbound calling
- **AI Call Analysis**: Google Gemini-powered call transcript analysis
- **Product Edit History**: Complete audit trail of all product changes
- **Trust Scoring**: AI-powered product and seller trust analysis
- **Network Visualization**: Interact   ive trust network graphs

### Technical Features
- **Database Backup/Restore**: Comprehensive data protection system
- **Real-time Updates**: Live order and call status updates
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **API Documentation**: RESTful API with comprehensive endpoints

## 📁 Project Structure

```
amazon-eye/
├── backend/           # Node.js API server with Prisma ORM
├── frontend/          # React.js web application
├── calling-engine/    # Outbound calling service
├── extension/         # Browser extension for Amazon
└── cluster_analysis_output/  # Trust network analysis data
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### 1. Database Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your database and API keys
npm run prisma:migrate
npm run prisma:generate
```

### 2. Start Backend
```bash
cd backend
npm run dev  # Development mode
# or
npm start    # Production mode
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev  # Development mode
# or
npm run build && npm run preview  # Production build
```

### 4. Start Calling Engine (Optional)
```bash
cd calling-engine
npm install
npm start
```

## 💾 Database Backup & Restore

### Create Backup
```bash
cd backend
node backup_database.js
```

**What gets backed up:**
- ✅ All user accounts and authentication data
- ✅ Complete product catalog with seller information  
- ✅ Customer reviews and ratings (15,000+ records)
- ✅ Order management data with shipping details
- ✅ Return requests with call tracking and AI summaries
- ✅ Product edit history with complete audit trail

### Restore Database
```bash
cd backend
node restore_database.js ./backups/amazon_eye_backup_YYYY-MM-DDTHH-MM-SS-sssZ.json
```

⚠️ **Warning**: Restore will delete all existing data. You have 5 seconds to cancel.

### Backup Best Practices
1. **Regular Backups**: Create backups before major updates
2. **Multiple Versions**: Keep backups for different time periods  
3. **Secure Storage**: Store backups in encrypted, secure locations
4. **Test Restores**: Periodically verify backup integrity

### Automated Backups
```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * cd /path/to/amazon-eye/backend && node backup_database.js

# Weekly cleanup (keep last 4 weeks)
0 3 * * 0 cd /path/to/amazon-eye/backend && find backups/ -name "*.json" -mtime +28 -delete
```

## 🔧 Configuration

### Backend Environment Variables
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/amazon_eye"
PORT=3000
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="24h"
GEMINI_API_KEY="your-google-gemini-api-key"
CALLING_SERVICE_URL="https://your-calling-service-url.com/outbound-call"
```

### Frontend Environment Variables
```env
VITE_API_URL="http://localhost:3000/api"
VITE_CALLING_ENGINE_URL="http://localhost:8080"
```

## 📊 Database Schema

### Core Models
- **User**: Authentication, profile, orders, return requests
- **Product**: Listings, seller info, reviews, edit history
- **Order**: Checkout data, shipping, payment, status tracking
- **ReturnRequest**: Return management with call tracking
- **ProductEditHistory**: Complete audit trail of changes

### Advanced Features
- **AI Call Analysis**: Automated transcript analysis with Gemini
- **IP Tracking**: Review authenticity verification
- **Trust Scoring**: Product and seller reliability metrics
- **Call Integration**: Automated outbound calling system

## 🤖 AI Integration

### Call Analysis Features
- **Automatic Transcription**: Real-time call-to-text conversion
- **Sentiment Analysis**: Customer emotion and satisfaction tracking
- **Issue Classification**: Automatic categorization of customer problems
- **Resolution Tracking**: Success rate and follow-up recommendations

### AI Models Used
- **Google Gemini 2.0 Flash**: Call analysis and content generation
- **Custom Trust Algorithm**: Product and seller reliability scoring
- **Network Analysis**: Trust relationship mapping

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get user profile

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (seller only)
- `GET /api/products/:id/history` - Get edit history

### Orders & Returns
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `POST /api/orders/:id/return` - Create return request
- `GET /api/orders/admin` - Admin order management

## 📱 Frontend Components

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Elements**: Real-time updates and animations
- **Accessibility**: WCAG 2.1 compliant components

### Key Pages
- **Product Catalog**: Advanced filtering and search
- **Product Details**: Reviews, trust scores, purchase flow
- **Checkout**: Multi-step form with validation
- **Order Management**: Status tracking and return requests
- **Seller Dashboard**: Product management and analytics
- **Admin Panel**: Order oversight and call monitoring

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-based Access**: User, Seller, Admin permissions
- **Phone Verification**: Multi-factor authentication support

### Data Protection
- **Input Validation**: Comprehensive request sanitization
- **SQL Injection Prevention**: Prisma ORM protection
- **Rate Limiting**: API abuse prevention
- **IP Tracking**: Review authenticity verification

## 🚀 Deployment

### Production Checklist
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up automated backups
- [ ] Configure monitoring and logging
- [ ] Test restore procedures

### Environment Setup
1. **Database**: PostgreSQL 13+ with proper indexing
2. **API Keys**: Google Gemini, calling service credentials
3. **Storage**: Backup storage with encryption
4. **Monitoring**: Error tracking and performance monitoring

## 📈 Performance & Monitoring

### Database Optimization
- **Indexing**: Optimized queries for large datasets
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Prisma query optimization

### Backup Performance
- **Incremental Backups**: For large datasets (planned feature)
- **Compression**: Backup file optimization
- **Parallel Processing**: Multi-threaded backup operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
1. **Database Connection**: Check PostgreSQL service and credentials
2. **Backup Errors**: Verify file permissions and disk space
3. **API Errors**: Check environment variables and API keys
4. **Frontend Issues**: Clear cache and check API connectivity

### Getting Help
- Check the individual README files in each directory
- Review the API documentation
- Test with provided backup/restore scripts
- Verify environment configuration

---

**Built with ❤️ using Node.js, React, PostgreSQL, and AI** 