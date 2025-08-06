import express from 'express';
import {
  getBuyerLoyaltyPointsHandler,
  getSupplierLoyaltyProgramHandler,
  setSupplierLoyaltyProgramHandler,
  redeemBuyerPointsHandler,
} from '../controllers/loyaltyController';

const router = express.Router();

// Buyer xem điểm
router.get('/buyer/:buyerId', getBuyerLoyaltyPointsHandler);
// Supplier xem chương trình
router.get('/supplier/:supplierId', getSupplierLoyaltyProgramHandler);
// Supplier cấu hình chương trình
router.post('/supplier/:supplierId/config', setSupplierLoyaltyProgramHandler);
// Buyer đổi điểm
router.post('/buyer/:buyerId/redeem', redeemBuyerPointsHandler);

export default router;