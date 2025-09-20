"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.DATABASE_CONFIG = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.DATABASE_CONFIG = {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/agrichain',
    pool: {
        min: 2,
        max: 10,
    },
};
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: exports.DATABASE_CONFIG.url,
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
exports.default = exports.prisma;
//# sourceMappingURL=database.js.map