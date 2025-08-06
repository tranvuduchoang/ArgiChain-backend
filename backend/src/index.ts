import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SERVER_CONFIG } from './config/server';
import { prisma } from './config/database';
import uploadRoute from './routes/upload';
import productRoute from './routes/product';
import orderRoute from './routes/order';
import loyaltyRoute from './routes/loyalty';
import reviewRoute from './routes/review';

// Import routes (will be created later)
// import userRoutes from './routes/userRoutes';
// import productRoutes from './routes/productRoutes';
// import supplierRoutes from './routes/supplierRoutes';
// import orderRoutes from './routes/orderRoutes';
// import reviewRoutes from './routes/reviewRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: SERVER_CONFIG.corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AgriChain Backend is running',
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.nodeEnv,
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to AgriChain API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      products: '/api/products',
      suppliers: '/api/suppliers',
      orders: '/api/orders',
      reviews: '/api/reviews',
      nfts: '/api/nfts',
      auctions: '/api/auctions',
    },
  });
});

// Phục vụ file tĩnh cho ảnh upload
app.use('/uploads', express.static('uploads'));

// Route handlers
app.use('/api/upload', uploadRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/loyalty', loyaltyRoute);
app.use('/api/reviews', reviewRoute);
// app.use('/api/suppliers', supplierRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON format',
      message: 'The request body contains invalid JSON',
    });
  }

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: SERVER_CONFIG.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(SERVER_CONFIG.port, () => {
      console.log(`🚀 AgriChain Backend server running on port ${SERVER_CONFIG.port}`);
      console.log(`📊 Environment: ${SERVER_CONFIG.nodeEnv}`);
      console.log(`🌐 CORS Origin: ${SERVER_CONFIG.corsOrigin}`);
      console.log(`🔗 Health check: http://localhost:${SERVER_CONFIG.port}/health`);
      console.log(`📚 API docs: http://localhost:${SERVER_CONFIG.port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer(); 