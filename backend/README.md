# AgriChain Backend

Backend API server for AgriChain - Blockchain-based Agricultural Marketplace built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Features

- **RESTful API** with Express.js and TypeScript
- **Database ORM** with Prisma and PostgreSQL
- **User Management** with authentication and authorization
- **Product Management** with NFT integration
- **Order Management** with blockchain transactions
- **Review System** for products and suppliers
- **Loyalty Points** system
- **Auction/Bidding** functionality
- **File Upload** support
- **Rate Limiting** and security features

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Joi/Zod
- **Testing**: Jest

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BackEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Install PostgreSQL (if not already installed)
   # Create database
   createdb agrichain
   
   # Run Prisma migrations
   npm run prisma:migrate
   
   # Generate Prisma client
   npm run prisma:generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/agrichain"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Blockchain Configuration
POLYGON_RPC_URL=https://rpc.cardona.zkevm-rpc.com
POLYGON_CHAIN_ID=2442

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup

#### Option 1: Local PostgreSQL
1. Install PostgreSQL
2. Create database: `createdb agrichain`
3. Update DATABASE_URL in .env

#### Option 2: Docker PostgreSQL
```bash
docker run --name agrichain-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=agrichain \
  -p 5432:5432 \
  -d postgres:15
```

#### Option 3: Cloud Database (Supabase, Railway, etc.)
1. Create PostgreSQL database on cloud platform
2. Copy connection string to DATABASE_URL

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database configuration
│   └── server.ts     # Server configuration
├── controllers/      # Route controllers
├── routes/          # API routes
├── services/        # Business logic
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── index.ts         # Server entry point

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## 🗄️ Database Schema

### Core Models

- **User**: Users (buyers and suppliers)
- **Supplier**: Extended supplier profiles
- **Product**: Agricultural products with NFT integration
- **Order**: Purchase orders with blockchain transactions
- **Review**: Product and supplier reviews
- **NFT**: ERC-1155 token management
- **LoyaltyProgram**: Supplier loyalty programs
- **Auction**: Product auctions and bidding

### Key Features

- **Wallet Integration**: Users linked to blockchain wallets
- **NFT Management**: ERC-1155 tokens for products
- **Loyalty System**: Points-based rewards
- **Auction System**: Bidding functionality
- **Review System**: Rating and feedback
- **KYC Support**: User verification system

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
   npx prisma migrate dev
   
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database with sample data

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## 📚 API Endpoints

### Health Check
- `GET /health` - Server health status

### API Documentation
- `GET /api` - API overview and available endpoints

### Planned Endpoints
- `GET /api/users` - User management
- `GET /api/products` - Product management
- `GET /api/suppliers` - Supplier management
- `GET /api/orders` - Order management
- `GET /api/reviews` - Review system
- `GET /api/nfts` - NFT management
- `GET /api/auctions` - Auction system

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to get access token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Protected routes** require valid token

## 📤 File Upload

File uploads are supported for:
- User avatars
- Product images
- Review images
- KYC documents

Files are stored locally in the `uploads/` directory.

## 🔒 Security Features

- **CORS** protection
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **JWT authentication**
- **Environment variable** protection
- **SQL injection** protection via Prisma

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Make sure to set all required environment variables in production:
- `NODE_ENV=production`
- `DATABASE_URL` (production database)
- `JWT_SECRET` (strong secret key)
- `CORS_ORIGIN` (frontend domain)

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔮 Future Features

- [ ] Real-time notifications with WebSocket
- [ ] Advanced search and filtering
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Mobile API optimization
- [ ] GraphQL support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**AgriChain Backend** - Powering the future of agricultural commerce 🌱 