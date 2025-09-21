"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("./config/server");
const database_1 = require("./config/database");
const upload_1 = __importDefault(require("./routes/upload"));
const product_1 = __importDefault(require("./routes/product"));
const order_1 = __importDefault(require("./routes/order"));
const loyalty_1 = __importDefault(require("./routes/loyalty"));
const review_1 = __importDefault(require("./routes/review"));
const supplier_1 = __importDefault(require("./routes/supplier"));
const deliveryConfirmation_1 = __importDefault(require("./routes/deliveryConfirmation"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: server_1.SERVER_CONFIG.corsOrigin,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "AgriChain Backend is running",
        timestamp: new Date().toISOString(),
        environment: server_1.SERVER_CONFIG.nodeEnv,
    });
});
app.get("/api", (req, res) => {
    res.json({
        message: "Welcome to AgriChain API",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            users: "/api/users",
            products: "/api/products",
            suppliers: "/api/suppliers",
            orders: "/api/orders",
            reviews: "/api/reviews",
            nfts: "/api/nfts",
            auctions: "/api/auctions",
        },
    });
});
app.use("/uploads", express_1.default.static("uploads"));
app.use("/api/upload", upload_1.default);
app.use("/api/products", product_1.default);
app.use("/api/orders", order_1.default);
app.use("/api/loyalty", loyalty_1.default);
app.use("/api/reviews", review_1.default);
app.use("/api/suppliers", supplier_1.default);
app.use("/api/delivery-confirmation", deliveryConfirmation_1.default);
app.use((err, req, res, _next) => {
    console.error("Error:", err);
    if (err.type === "entity.parse.failed") {
        res.status(400).json({
            error: "Invalid JSON format",
            message: "The request body contains invalid JSON",
        });
        return;
    }
    res.status(err.status || 500).json({
        error: "Internal Server Error",
        message: server_1.SERVER_CONFIG.nodeEnv === "development" ? err.message : "Something went wrong",
    });
});
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.originalUrl} not found`,
    });
});
const startServer = async () => {
    try {
        await database_1.prisma.$connect();
        console.log("Database connected successfully");
        app.listen(server_1.SERVER_CONFIG.port, () => {
            console.log(`AgriChain Backend server running on port ${server_1.SERVER_CONFIG.port}`);
            console.log(`Environment: ${server_1.SERVER_CONFIG.nodeEnv}`);
            console.log(`CORS Origin: ${server_1.SERVER_CONFIG.corsOrigin}`);
            console.log(`Health check: http://localhost:${server_1.SERVER_CONFIG.port}/health`);
            console.log(`API index: http://localhost:${server_1.SERVER_CONFIG.port}/api`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await database_1.prisma.$disconnect();
    process.exit(0);
});
process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    await database_1.prisma.$disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map