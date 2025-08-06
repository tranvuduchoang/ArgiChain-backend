import express from 'express';
import { createProductHandler, getAllProductsHandler, getProductByIdHandler } from '../controllers/productController';

const router = express.Router();

// Tạo sản phẩm mới (mint NFT)
router.post('/', createProductHandler);
router.get('/', getAllProductsHandler);
router.get('/:id', getProductByIdHandler);

export default router;