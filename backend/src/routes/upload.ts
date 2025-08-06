import express from 'express';
import upload from '../middleware/upload';
import { uploadImage } from '../controllers/uploadController';

const router = express.Router();

// Route upload ảnh sản phẩm hoặc KYC
router.post('/', upload.single('image'), uploadImage);

export default router;