import express from 'express';
import {
  confirmProductMintHandler,
  createProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  listMarketplaceProductsHandler,
  prepareProductMintHandler,
} from '../controllers/productController';

const router = express.Router();

router.post('/', createProductHandler);
router.get('/', getAllProductsHandler);
router.get('/marketplace/listings', listMarketplaceProductsHandler);
router.post('/:productId/mint/prepare', prepareProductMintHandler);
router.post('/:productId/mint/confirm', confirmProductMintHandler);
router.get('/:id', getProductByIdHandler);

export default router;
