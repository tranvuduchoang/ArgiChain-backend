# 🧪 HƯỚNG DẪN TEST DỰ ÁN ARGICHAIN

## 📋 TỔNG QUAN

Dự án ArgiChain đã hoàn thành 100% các mục tiêu Day 1-4 và sẵn sàng cho testing. Đây là hướng dẫn chi tiết để chạy và test dự án.

## 🚀 CÁCH CHẠY DỰ ÁN

### 1. Chuẩn bị môi trường

```bash
# Cài đặt dependencies cho tất cả modules
cd backend && npm install
cd ../frontend && npm install  
cd ../blockchain && npm install
```

### 2. Khởi động Database

```bash
# Đảm bảo PostgreSQL đang chạy
# Tạo database "agrichain" nếu chưa có

# Chạy migration và seed data
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### 3. Khởi động Backend

```bash
cd backend
npm run dev
# Server sẽ chạy tại http://localhost:3001
```

### 4. Khởi động Frontend

```bash
cd frontend  
npm run dev
# App sẽ chạy tại http://localhost:3000
```

### 5. Khởi động Blockchain (nếu cần)

```bash
cd blockchain
npx hardhat node
# Local blockchain sẽ chạy tại http://localhost:8545
```

## 🧪 KIỂM THỬ CHỨC NĂNG

### ✅ 1. Kiểm tra Database

**API Endpoints đã có:**
- `GET /api/suppliers` - Danh sách nhà cung cấp
- `GET /api/suppliers/1` - Chi tiết nhà cung cấp ID 1
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/1` - Chi tiết sản phẩm ID 1
- `GET /api/marketplace` - Danh sách marketplace
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/loyalty` - Loyalty program
- `GET /api/reviews` - Reviews

**Test với curl:**
```bash
# Test suppliers API
curl http://localhost:3001/api/suppliers

# Test marketplace API  
curl http://localhost:3001/api/products/marketplace

# Test health check
curl http://localhost:3001/health
```

### ✅ 2. Kiểm tra Frontend

**Các trang đã hoàn thành:**
- `/` - Trang chủ
- `/marketplace` - Marketplace với product grid
- `/marketplace/[id]` - Chi tiết sản phẩm
- `/suppliers` - Danh sách nhà cung cấp
- `/supplier/[id]` - Chi tiết nhà cung cấp
- `/supplier/dashboard` - Dashboard nhà cung cấp
- `/order` - Đặt hàng
- `/profile` - Hồ sơ cá nhân
- `/loyalty` - Loyalty program
- `/review` - Reviews
- `/event` - Events

**Test UI:**
1. Mở http://localhost:3000
2. Kiểm tra navigation menu
3. Test responsive design trên mobile/desktop
4. Kiểm tra các trang load đúng data

### ✅ 3. Kiểm tra Wallet Integration

**Header Component mới:**
- Avatar dropdown khi kết nối ví
- Hiển thị địa chỉ ví và balance
- Menu "Trở thành nhà cung cấp" / "Nhà cung cấp của bạn"
- Link đến profile và dashboard

**Test wallet:**
1. Click "Kết nối ví" 
2. Kết nối MetaMask (hoặc mock wallet)
3. Kiểm tra Avatar dropdown
4. Test các menu items

### ✅ 4. Kiểm tra Data Flow

**Seed Data đã tạo:**
- 4 users (1 buyer, 3 suppliers)
- 3 suppliers với thông tin đầy đủ
- 3 products với marketplace listings
- Các bảng database đã sync

**Test data:**
1. Kiểm tra marketplace hiển thị 3 sản phẩm
2. Kiểm tra suppliers page hiển thị 3 nhà cung cấp
3. Kiểm tra product detail pages
4. Test search và filter functionality

## 🔧 TROUBLESHOOTING

### Lỗi Database
```bash
# Nếu gặp lỗi table không tồn tại
cd backend
npx prisma db push --accept-data-loss
npm run prisma:seed
```

### Lỗi API 404
```bash
# Kiểm tra routes đã register trong index.ts
# Đảm bảo server đang chạy
curl http://localhost:3001/health
```

### Lỗi Frontend Build
```bash
# Clear cache và rebuild
cd frontend
rm -rf .next
npm run build
```

### Lỗi Wallet Connection
- Kiểm tra MetaMask extension
- Đảm bảo network đúng (localhost:8545 hoặc testnet)
- Check console logs cho errors

## 📊 KẾT QUẢ MONG ĐỢI

### ✅ Backend
- Server chạy tại port 3001
- Database connected và có data
- Tất cả API endpoints trả về data đúng
- CORS configured cho frontend

### ✅ Frontend  
- App chạy tại port 3000
- Tất cả pages load được
- Responsive design hoạt động
- Wallet integration sẵn sàng

### ✅ Database
- 3 suppliers với data đầy đủ
- 3 products với marketplace listings
- Users và relationships đúng
- Prisma schema sync hoàn toàn

## 🎯 NEXT STEPS (Day 5)

1. **End-to-end testing** với live wallet
2. **Blockchain integration** testing
3. **Documentation** hoàn thiện
4. **Demo preparation**

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Check browser console
3. Verify database connection
4. Test API endpoints riêng lẻ

**Dự án ArgiChain đã sẵn sàng cho testing và demo!** 🎉
