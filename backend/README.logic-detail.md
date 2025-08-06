# Giải thích chi tiết logic backend AgriChain

File này giúp bạn hiểu rõ từng dòng code, từng file chính trong backend AgriChain (Node.js + TypeScript + Express + Prisma).

---

## 1. File: `src/index.ts` (Server chính)

Đây là entry point của backend, nơi khởi tạo server Express, middleware, routes, error handling, và kết nối database.

### 1.1. Import các thư viện cần thiết
```ts
import express from 'express'; // Framework web API
import cors from 'cors'; // Cho phép frontend truy cập API
import dotenv from 'dotenv'; // Đọc biến môi trường từ file .env
import { SERVER_CONFIG } from './config/server'; // Cấu hình server (port, CORS, ...)
import { prisma } from './config/database'; // Prisma client để truy vấn database
```

### 1.2. Khởi tạo Express app
```ts
const app = express();
```

### 1.3. Middleware cấu hình
```ts
app.use(cors({
  origin: SERVER_CONFIG.corsOrigin, // Chỉ cho phép frontend truy cập
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Parse JSON body, giới hạn 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse form data
```

### 1.4. Health check endpoint
```ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AgriChain Backend is running',
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.nodeEnv,
  });
});
```
- Để kiểm tra server có chạy không, dùng GET /health

### 1.5. API info endpoint
```ts
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
```
- Trả về thông tin API và các endpoint chính

### 1.6. (Sẽ thêm sau) Route handlers cho từng module
```ts
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// ...
```

### 1.7. Middleware xử lý lỗi
```ts
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
```
- Bắt mọi lỗi, trả về thông báo rõ ràng cho client

### 1.8. Middleware 404
```ts
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});
```
- Nếu không khớp route nào, trả về 404

### 1.9. Khởi động server và kết nối database
```ts
const startServer = async () => {
  try {
    await prisma.$connect(); // Kết nối database
    console.log('✅ Database connected successfully');
    app.listen(SERVER_CONFIG.port, () => {
      console.log(`🚀 AgriChain Backend server running on port ${SERVER_CONFIG.port}`);
      // ...
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};
startServer();
```
- Đảm bảo database kết nối thành công trước khi chạy server

### 1.10. Graceful shutdown
```ts
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```
- Đảm bảo đóng kết nối database khi dừng server

---

## 2. File: `src/config/server.ts` (Cấu hình server)

- Đọc biến môi trường từ .env
- Cấu hình các thông số: port, CORS, JWT, blockchain, upload, rate limit
- Tách riêng để dễ quản lý, dễ mở rộng

---

## 3. File: `src/config/database.ts` (Cấu hình database)

- Đọc DATABASE_URL từ .env
- Khởi tạo PrismaClient để truy vấn database
- Đảm bảo chỉ có 1 instance PrismaClient trong toàn app
- Đóng kết nối khi server dừng

---

## 4. File: `prisma/schema.prisma` (Database schema)

- Định nghĩa các model (bảng) cho hệ thống:
  - **User**: Người dùng (buyer/supplier)
  - **Supplier**: Thông tin nhà cung cấp
  - **Product**: Sản phẩm nông sản
  - **Order**: Đơn hàng
  - **OrderItem**: Sản phẩm trong đơn hàng
  - **Review**: Đánh giá
  - **NFT**: Quản lý token ERC-1155
  - **LoyaltyProgram**: Chương trình điểm thưởng
  - **LoyaltyPoint**: Điểm thưởng của user
  - **Auction**: Đấu giá
  - **Bid**: Đặt giá
- Định nghĩa quan hệ giữa các bảng (1-n, n-n)
- Sử dụng các trường như `@relation`, `@unique`, `@default`, `@map` để tối ưu hóa schema

---

## 5. Lý do thiết kế
- **Tách biệt config**: Dễ bảo trì, dễ mở rộng, bảo mật tốt hơn
- **Prisma ORM**: Truy vấn database an toàn, dễ migrate, dễ mở rộng
- **Express**: Đơn giản, phổ biến, dễ tích hợp middleware
- **TypeScript**: Giúp code an toàn, dễ refactor, dễ phát triển lâu dài
- **RESTful API**: Chuẩn hóa giao tiếp giữa frontend và backend
- **Graceful shutdown**: Đảm bảo không bị mất dữ liệu khi dừng server

---

## 6. Luồng hoạt động tổng quát
1. Khi chạy `npm run dev`, server Express khởi tạo, đọc config, kết nối database
2. Frontend gửi request (ví dụ: GET /api/products)
3. Backend nhận request, kiểm tra middleware, gọi controller, truy vấn database qua Prisma
4. Trả về kết quả JSON cho frontend
5. Nếu có lỗi, trả về thông báo lỗi rõ ràng

---

**Hy vọng file này giúp bạn hiểu sâu về logic backend AgriChain! Nếu muốn giải thích chi tiết file nào, module nào, hãy hỏi tiếp nhé!**

---

## Upload ảnh sản phẩm & KYC (middleware/upload.ts, controllers/uploadController.ts, routes/upload.ts)

### 1. Middleware Multer (`middleware/upload.ts`)
- Sử dụng `multer.diskStorage` để lưu file vào thư mục `/uploads`.
- Tạo tên file duy nhất bằng timestamp và random number, loại bỏ khoảng trắng.
- Chỉ cho phép file `.jpg`, `.jpeg`, `.png` (kiểm tra bằng regex extname).
- Giới hạn dung lượng file tối đa 5MB (`limits: { fileSize: 5 * 1024 * 1024 }`).
- Nếu file không hợp lệ, trả về lỗi.

### 2. Controller upload (`controllers/uploadController.ts`)
- Hàm `uploadImage` nhận file từ request (`req.file`).
- Nếu không có file, trả về lỗi 400.
- Nếu thành công, trả về đường dẫn file vừa upload (`/uploads/filename`).
- Đường dẫn này frontend sẽ dùng để hiển thị ảnh sản phẩm/KYC.

### 3. Route upload (`routes/upload.ts`)
- Định nghĩa route POST `/api/upload`.
- Sử dụng middleware `upload.single('image')` để nhận 1 file với key là `image`.
- Gọi controller `uploadImage` để xử lý và trả về kết quả.

### 4. Tích hợp vào app chính
- Import và sử dụng route này trong `src/index.ts`:
  ```ts
  import uploadRoute from './routes/upload';
  app.use('/api/upload', uploadRoute);
  ```
- Đảm bảo tạo thư mục `/uploads` trong backend để lưu file.

---

## API tạo sản phẩm (mint NFT) – productService.ts, productController.ts, routes/product.ts

### 1. Service tạo sản phẩm (`services/productService.ts`)
- Hàm `createProduct(input)` nhận thông tin sản phẩm (name, description, price, quantity, imageUrl, supplierId).
- (Tạm thời) Mock phần gọi smart contract mint NFT, trả về `nftTxHash = 'mocked_tx_hash'`.
- Lưu sản phẩm vào database qua Prisma (`prisma.product.create`).
- Trả về object sản phẩm đã lưu.

### 2. Controller tạo sản phẩm (`controllers/productController.ts`)
- Hàm `createProductHandler` nhận request từ client (body gồm name, price, quantity, imageUrl, supplierId).
- Kiểm tra trường bắt buộc, nếu thiếu trả về lỗi 400.
- Gọi service `createProduct`, trả về kết quả 201 nếu thành công, 500 nếu lỗi.

### 3. Route sản phẩm (`routes/product.ts`)
- Định nghĩa route POST `/api/products`.
- Gọi controller `createProductHandler` để xử lý tạo sản phẩm.

### 4. Tích hợp vào app chính
- Import và sử dụng route này trong `src/index.ts`:
  ```ts
  import productRoute from './routes/product';
  app.use('/api/products', productRoute);
  ```

---

## API lấy danh sách & chi tiết sản phẩm (GET /api/products, GET /api/products/:id)

### 1. Service (`services/productService.ts`)
- `getAllProducts`: Lấy toàn bộ sản phẩm từ database, sắp xếp mới nhất trước.
- `getProductById(id)`: Lấy chi tiết 1 sản phẩm theo id.

### 2. Controller (`controllers/productController.ts`)
- `getAllProductsHandler`: Gọi service, trả về danh sách sản phẩm.
- `getProductByIdHandler`: Kiểm tra id, gọi service, trả về chi tiết sản phẩm hoặc lỗi nếu không tìm thấy.

### 3. Route (`routes/product.ts`)
- `GET /api/products`: Lấy danh sách sản phẩm.
- `GET /api/products/:id`: Lấy chi tiết sản phẩm theo id.

---

## API đặt hàng/mua sản phẩm (POST /api/orders)

### 1. Service (`services/orderService.ts`)
- Hàm `createOrder(input)` nhận buyerId, productId, quantity, deliveryAddress.
- (Tạm thời) Mock phần gọi smart contract chuyển token, trả về `txHash = 'mocked_order_tx_hash'`.
- Kiểm tra sản phẩm tồn tại và đủ số lượng.
- Tạo đơn hàng mới trong database, trạng thái `PENDING`, tính tổng tiền.
- Trừ số lượng sản phẩm còn lại.
- Trả về object đơn hàng đã lưu.

### 2. Controller (`controllers/orderController.ts`)
- Hàm `createOrderHandler` nhận request từ client (body gồm buyerId, productId, quantity, deliveryAddress).
- Kiểm tra trường bắt buộc, nếu thiếu trả về lỗi 400.
- Gọi service `createOrder`, trả về kết quả 201 nếu thành công, 500 nếu lỗi.

### 3. Route (`routes/order.ts`)
- Định nghĩa route POST `/api/orders`.
- Gọi controller `createOrderHandler` để xử lý tạo đơn hàng.

### 4. Tích hợp vào app chính
- Import và sử dụng route này trong `src/index.ts`:
  ```ts
  import orderRoute from './routes/order';
  app.use('/api/orders', orderRoute);
  ```

---

## API loyalty points (buyer & supplier)

### 1. Service (`services/loyaltyService.ts`)
- `getBuyerLoyaltyPoints(buyerId)`: Buyer xem điểm tích lũy với từng supplier.
- `getSupplierLoyaltyProgram(supplierId)`: Supplier xem chương trình điểm thưởng của mình.
- `setSupplierLoyaltyProgram(supplierId, earnRate, redeemRate)`: Supplier cấu hình tỉ lệ tích/đổi điểm.
- `redeemBuyerPoints(buyerId, supplierId, points)`: Buyer đổi điểm lấy token thưởng (mock logic).
- `addLoyaltyPoints(buyerId, supplierId, amount)`: Hàm cộng điểm cho buyer khi mua hàng (gọi từ orderService).

### 2. Controller (`controllers/loyaltyController.ts`)
- Xử lý request, gọi service, trả về kết quả hoặc lỗi.

### 3. Route (`routes/loyalty.ts`)
- `GET /api/loyalty/buyer/:buyerId`: Buyer xem điểm.
- `GET /api/loyalty/supplier/:supplierId`: Supplier xem chương trình.
- `POST /api/loyalty/supplier/:supplierId/config`: Supplier cấu hình chương trình.
- `POST /api/loyalty/buyer/:buyerId/redeem`: Buyer đổi điểm.

### 4. Tích hợp vào app chính
- Import và sử dụng route này trong `src/index.ts`:
  ```ts
  import loyaltyRoute from './routes/loyalty';
  app.use('/api/loyalty', loyaltyRoute);
  ```

---

## API đánh giá sản phẩm/supplier (review)

### 1. Service (`services/reviewService.ts`)
- `createReview(input)`: Buyer tạo review cho sản phẩm hoặc supplier (chỉ 1 trong 2).
- `getReviewsByProduct(productId)`: Lấy danh sách review theo sản phẩm.
- `getReviewsBySupplier(supplierId)`: Lấy danh sách review theo supplier.

### 2. Controller (`controllers/reviewController.ts`)
- Xử lý request, gọi service, trả về kết quả hoặc lỗi.

### 3. Route (`routes/review.ts`)
- `POST /api/reviews`: Tạo review mới.
- `GET /api/reviews/product/:productId`: Lấy review theo sản phẩm.
- `GET /api/reviews/supplier/:supplierId`: Lấy review theo supplier.

### 4. Tích hợp vào app chính
- Import và sử dụng route này trong `src/index.ts`:
  ```ts
  import reviewRoute from './routes/review';
  app.use('/api/reviews', reviewRoute);
  ```

---