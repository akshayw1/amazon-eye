# Amazon Eye Frontend

A modern, visually stunning e-commerce frontend inspired by Amazon, with a focus on trust verification and user experience.

## Features

- **Authentication**
  - Clean and modern login/register forms
  - OAuth integration
  - Secure session management

- **Product Browsing**
  - Advanced search with autosuggest
  - Category filtering
  - Trust score filtering
  - Price range filtering
  - Sort by various criteria

- **Trust Verification System**
  - Trust badges (High, Medium, Low)
  - Detailed trust score breakdown
  - Review authenticity analysis
  - Seller reputation tracking
  - Product verification tools

- **Product Details**
  - High-resolution image gallery
  - Detailed specifications
  - Trust sidebar with real-time updates
  - Voice assistant integration
  - Similar product recommendations

- **Shopping Cart**
  - Real-time updates
  - Trust score display for items
  - Quantity management
  - Price calculations

- **Checkout Process**
  - Secure payment integration
  - Address management
  - Order summary
  - Trust verification steps

## Tech Stack

- React with Vite
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication
- Headless UI for accessible components

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── store/         # Redux store and slices
├── services/      # API services
├── hooks/         # Custom hooks
└── assets/        # Static assets
```

## Environment Variables

1. Create a `.env` file in the frontend directory with the following variables:
```env
VITE_API_URL=http://localhost:3000/api
```

2. For production, create a `.env.production` file with your production API URL:
```env
VITE_API_URL=https://your-production-api.com/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
