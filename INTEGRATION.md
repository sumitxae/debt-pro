# Backend-Frontend Integration Guide

This guide explains how to integrate the DebtFree Pro backend API with the React Native frontend application.

## 🏗️ Architecture Overview

The application follows a modern client-server architecture:

- **Backend**: NestJS API with PostgreSQL database
- **Frontend**: React Native with Expo and Redux Toolkit
- **Communication**: RESTful API with JWT authentication
- **State Management**: Redux Toolkit with RTK Query

## 📁 Project Structure

```
loan tracker/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── debts/          # Debt tracking
│   │   ├── payments/       # Payment processing
│   │   ├── budget/         # Budget management
│   │   ├── analytics/      # Financial analytics
│   │   ├── gamification/   # Points and badges
│   │   └── reports/        # Financial reports
│   └── package.json
├── frontend/               # React Native app
│   ├── src/
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   ├── store/              # Redux store
│   │   ├── api/           # RTK Query APIs
│   │   └── slices/        # Redux slices
│   └── package.json
└── setup-integration.sh    # Setup script
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Redis 6+ (optional, for caching)
- Expo CLI (for frontend development)

### 2. Automated Setup

Run the setup script to automatically configure both backend and frontend:

```bash
./setup-integration.sh
```

### 3. Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Build the application
npm run build

# Start development server
npm run start:dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env
# Edit .env with your API configuration

# Start development server
npm start
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=debtfree_pro

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-for-security
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Settings
APP_NAME=DebtFree Pro
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8081
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
API_BASE_URL=http://localhost:3000/api/v1
API_TIMEOUT=10000

# Development Settings
DEBUG=true
LOG_LEVEL=info

# App Configuration
APP_NAME=DebtFree Pro
APP_VERSION=1.0.0

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_GAMIFICATION=true
ENABLE_NOTIFICATIONS=true
```

## 🔌 API Integration

### Authentication Flow

1. **Login**: User provides email/password
2. **Token Generation**: Backend returns JWT access and refresh tokens
3. **Token Storage**: Frontend stores tokens securely using AsyncStorage
4. **API Requests**: Frontend includes JWT token in Authorization header
5. **Token Refresh**: Automatic token refresh when access token expires

### API Client

The frontend uses a custom API client (`src/utils/apiClient.ts`) that handles:

- Automatic token management
- Request/response interceptors
- Error handling
- Token refresh logic
- Request timeouts

### Redux Integration

The application uses Redux Toolkit with RTK Query for:

- **State Management**: Centralized state for auth, debts, budget, etc.
- **API Caching**: Automatic caching and invalidation
- **Optimistic Updates**: Immediate UI updates with background sync
- **Error Handling**: Centralized error management

## 📱 Frontend Components

### Authentication

- **Login Screen**: Email/password authentication
- **Register Screen**: User registration with profile setup
- **Auth Guard**: Route protection for authenticated users

### Debt Management

- **Debt List**: Display all user debts
- **Debt Form**: Add/edit debt information
- **Payment Tracking**: Record and track payments
- **Debt Summary**: Overview of debt status

### Budget Management

- **Budget Setup**: Monthly income and expense categories
- **Transaction Tracking**: Record daily expenses
- **Budget Analysis**: Spending insights and recommendations

### Analytics

- **Dashboard**: Financial overview and progress
- **Projections**: Debt payoff strategies and timelines
- **Reports**: Detailed financial reports

### Gamification

- **Profile**: User level and points
- **Badges**: Achievement system
- **Progress**: Visual progress indicators

## 🔒 Security Features

### Backend Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with cost factor 12
- **Input Validation**: Class-validator for all inputs
- **CORS Configuration**: Proper cross-origin settings
- **Rate Limiting**: API rate limiting for abuse prevention
- **SQL Injection Prevention**: TypeORM with parameterized queries

### Frontend Security

- **Secure Storage**: AsyncStorage for token management
- **Token Refresh**: Automatic token refresh mechanism
- **Input Sanitization**: Form validation and sanitization
- **Error Handling**: Secure error messages without data leakage

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Backend Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Deploy to your preferred platform** (Heroku, AWS, etc.)

### Frontend Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Update API_BASE_URL** to production endpoint

3. **Deploy to app stores** (iOS App Store, Google Play Store)

## 🔍 API Documentation

Once the backend is running, access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

This provides:
- Complete API endpoint documentation
- Request/response examples
- Interactive testing interface
- Authentication setup

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure FRONTEND_URL is set correctly in backend .env
2. **Database Connection**: Verify PostgreSQL is running and credentials are correct
3. **Token Issues**: Check JWT_SECRET is set and tokens are being stored properly
4. **API Timeouts**: Increase API_TIMEOUT in frontend .env if needed

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
DEBUG=true
```

### Network Issues

For development on physical devices:
1. Use your computer's IP address instead of localhost
2. Ensure both devices are on the same network
3. Check firewall settings

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Expo Documentation](https://docs.expo.dev/)

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure API compatibility

## 📄 License

This project is licensed under the MIT License. 