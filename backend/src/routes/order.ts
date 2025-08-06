import express from 'express';
import { createOrderHandler } from '../controllers/orderController';

const router = express.Router();

// Tạo đơn hàng mới
router.post('/', createOrderHandler);

export default router;