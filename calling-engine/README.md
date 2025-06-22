# Calling Engine

## Environment Setup

1. Create a `.env` file in the calling-engine directory with the following variables:
```env
API_BASE_URL=http://localhost:3000/api
```

2. For production, update the `.env` file with your production API URL:
```env
API_BASE_URL=https://your-production-api.com/api
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the calling engine:
```bash
node index.js
``` 