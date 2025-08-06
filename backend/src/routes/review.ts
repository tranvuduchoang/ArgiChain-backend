import express from 'express';
import {
  createReviewHandler,
  getReviewsByProductHandler,
  getReviewsBySupplierHandler,
} from '../controllers/reviewController';

const router = express.Router();

// Tạo review
router.post('/', createReviewHandler);
// Lấy review theo sản phẩm
router.get('/product/:productId', getReviewsByProductHandler);
// Lấy review theo supplier
router.get('/supplier/:supplierId', getReviewsBySupplierHandler);

export default router;