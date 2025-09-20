import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { SERVER_CONFIG } from "./config/server";
import { prisma } from "./config/database";
import uploadRoute from "./routes/upload";
import productRoute from "./routes/product";
import orderRoute from "./routes/order";
import loyaltyRoute from "./routes/loyalty";
import reviewRoute from "./routes/review";
import supplierRoute from "./routes/supplier";
import deliveryConfirmationRoute from "./routes/deliveryConfirmation";

dotenv.config();

const app = express();

app.use(cors({
  origin: SERVER_CONFIG.corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AgriChain Backend is running",
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.nodeEnv,
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

app.use("/uploads", express.static("uploads"));

app.use("/api/upload", uploadRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/loyalty", loyaltyRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/suppliers", supplierRoute);
app.use("/api/delivery-confirmation", deliveryConfirmationRoute);

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
    message: SERVER_CONFIG.nodeEnv === "development" ? err.message : "Something went wrong",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(SERVER_CONFIG.port, () => {
      console.log(`AgriChain Backend server running on port ${SERVER_CONFIG.port}`);
      console.log(`Environment: ${SERVER_CONFIG.nodeEnv}`);
      console.log(`CORS Origin: ${SERVER_CONFIG.corsOrigin}`);
      console.log(`Health check: http://localhost:${SERVER_CONFIG.port}/health`);
      console.log(`API index: http://localhost:${SERVER_CONFIG.port}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

