# DebtFree Pro - NestJS Backend API

A comprehensive debt management backend API built with NestJS, TypeScript, and PostgreSQL. This API powers the DebtFree Pro mobile application with advanced features including debt tracking, payment analytics, budgeting, gamification, and intelligent debt payoff strategies.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with refresh tokens
- **Debt Management**: Complete CRUD operations for debt tracking
- **Payment Processing**: Record and track debt payments with automatic calculations
- **Budget Management**: Monthly budgeting with expense tracking
- **Analytics Engine**: Advanced debt payoff projections and strategy comparisons
- **Gamification System**: Points, levels, and badges to motivate users
- **Smart Notifications**: Email alerts for payments and budget overruns
- **Comprehensive Reporting**: Financial health reports and payment history

### Advanced Features
- **Multiple Payoff Strategies**: Snowball, Avalanche, and Custom priority methods
- **Real-time Calculations**: Interest/principal splits and remaining balances
- **Budget Analysis**: Trend analysis and spending recommendations
- **Progress Tracking**: Visual progress indicators and milestone celebrations
- **Financial Health Score**: Comprehensive assessment of financial wellness

## 🏗️ Architecture

### Technology Stack
- **Framework**: NestJS v10 with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport strategies
- **Caching**: Redis for performance optimization
- **Email**: Nodemailer for notifications
- **Validation**: Class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI

### Project Structure
```
src/
├── auth/                 # Authentication module
├── users/               # User management
├── debts/               # Debt tracking
├── payments/            # Payment processing
├── budget/              # Budget management
├── analytics/           # Financial analytics
├── gamification/        # Points and badges
├── notifications/       # Email notifications
├── reports/             # Financial reports
└── common/              # Shared utilities
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- npm or yarn

### Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
Copy the `.env` file and update with your database and email credentials:
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=debtfree_pro

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

3. **Database Setup**
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE debtfree_pro;
```

4. **Start Redis**
```bash
# On macOS with Homebrew
brew services start redis

# On Ubuntu/Debian
sudo systemctl start redis

# Using Docker
docker run -d -p 6379:6379 redis:alpine
```

5. **Run the Application**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the application is running, access the interactive Swagger documentation at:
```
http://localhost:3000/api/docs
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

#### Debt Management
- `GET /api/v1/debts` - Get all user debts
- `POST /api/v1/debts` - Create new debt
- `PUT /api/v1/debts/:id` - Update debt
- `DELETE /api/v1/debts/:id` - Delete debt
- `GET /api/v1/debts/summary` - Get debt statistics

#### Payments
- `POST /api/v1/payments/:debtId` - Record payment
- `GET /api/v1/payments` - Get payment history
- `GET /api/v1/payments/stats` - Get payment statistics

#### Analytics
- `GET /api/v1/analytics/projection` - Get debt payoff projections
- `GET /api/v1/analytics/dashboard` - Get dashboard metrics
- `GET /api/v1/analytics/compare-strategies` - Compare payoff strategies

#### Budget Management
- `GET /api/v1/budget/current` - Get current month budget
- `PUT /api/v1/budget/current` - Update budget
- `POST /api/v1/budget/transactions` - Add expense transaction
- `GET /api/v1/budget/analysis` - Get budget insights

## 🎮 Gamification System

The API includes a comprehensive gamification system to motivate users:

### Points System
- **Payment Made**: 50 points per ₹1000 paid
- **Debt Paid Off**: 500 bonus points
- **Budget Goal Met**: 200 points
- **Badge Earned**: Badge-specific bonus points

### Levels
Users advance through levels based on total points earned:
- **Level 1**: 0-999 points
- **Level 2**: 1000-3999 points  
- **Level 3**: 4000-8999 points
- And so on...

### Badge Categories
- **Payment Badges**: First payment, consistent payer
- **Debt Payoff Badges**: First debt eliminated, debt-free achiever
- **Budget Badges**: Budget master, savings champion
- **Milestone Badges**: ₹10K paid, ₹1L paid, etc.

## 📊 Analytics Engine

### Debt Payoff Strategies

1. **Snowball Method**: Focus on smallest debt first
2. **Avalanche Method**: Focus on highest interest rate first  
3. **Custom Priority**: User-defined priority order

### Projection Calculations
- Monthly payment schedules with interest/principal breakdown
- Total interest calculations
- Debt-free date predictions
- Strategy comparison with savings analysis

### Financial Health Score
Comprehensive scoring based on:
- Debt-to-income ratio
- Payment consistency
- Budget discipline
- Overall progress

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt (cost factor 12)
- **Input Validation** with class-validator
- **SQL Injection Prevention** via TypeORM
- **Rate Limiting** on sensitive endpoints
- **CORS Configuration** for frontend integration

## 🚀 Deployment

### Docker Deployment
```dockerfile
# Build the application
docker build -t debtfree-api .

# Run with Docker Compose
docker-compose up -d
```

### Production Considerations
- Set `NODE_ENV=production`
- Use environment variables for all secrets
- Enable database SSL connections
- Configure proper logging
- Set up monitoring and health checks
- Use PM2 or similar for process management

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📈 Performance Optimization

- **Redis Caching**: Expensive calculations cached for 1 hour
- **Database Indexing**: Optimized queries on frequently accessed fields
- **Connection Pooling**: Efficient database connection management
- **Pagination**: Large datasets properly paginated
- **Lazy Loading**: Relations loaded only when needed

## 🔄 Background Jobs

Automated tasks for user engagement:
- **Daily Payment Reminders**: 9:00 AM notifications for due payments
- **Monthly Badge Checks**: Award consistency and budget badges
- **Weekly Analytics Refresh**: Update cached projection data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@debtfreepro.com
- Documentation: [API Docs](http://localhost:3000/api/docs)

## 🎯 Roadmap

- [ ] Mobile push notifications
- [ ] Advanced reporting with PDF exports  
- [ ] Integration with banking APIs
- [ ] Machine learning for spending predictions
- [ ] Multi-currency support
- [ ] Social features and debt challenges
- [ ] Investment tracking integration

---

Built with ❤️ using NestJS for the DebtFree Pro debt management platform.