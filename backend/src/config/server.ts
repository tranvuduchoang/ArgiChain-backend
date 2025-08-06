import dotenv from 'dotenv';

dotenv.config();

// Server configuration
export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// JWT configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  polygonRpcUrl: process.env.POLYGON_RPC_URL || 'https://rpc.cardona.zkevm-rpc.com',
  polygonChainId: parseInt(process.env.POLYGON_CHAIN_ID || '2442', 10),
};

// File upload configuration
export const UPLOAD_CONFIG = {
  path: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
}; 