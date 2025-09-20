import express from 'express';
import { createOrderHandler, getUserOrdersHandler } from '../controllers/orderController';

const router = express.Router();

// Tạo đơn hàng mới
router.post('/', createOrderHandler);

// Lấy danh sách đơn hàng của user
router.get('/user/:userId', getUserOrdersHandler);

export default router;