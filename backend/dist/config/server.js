"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_CONFIG = exports.UPLOAD_CONFIG = exports.BLOCKCHAIN_CONFIG = exports.JWT_CONFIG = exports.SERVER_CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.SERVER_CONFIG = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
};
exports.JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
exports.BLOCKCHAIN_CONFIG = {
    polygonRpcUrl: process.env.POLYGON_RPC_URL || 'https://rpc.cardona.zkevm-rpc.com',
    polygonChainId: parseInt(process.env.POLYGON_CHAIN_ID || '2442', 10),
};
exports.UPLOAD_CONFIG = {
    path: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
};
exports.RATE_LIMIT_CONFIG = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};
//# sourceMappingURL=server.js.map