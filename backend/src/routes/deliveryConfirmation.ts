import { Router } from 'express';
import {
  confirmDeliveryHandler,
  burnNFTHandler,
  completeDeliveryConfirmationHandler,
  getDeliveryConfirmationHandler,
  getUserDeliveryConfirmationsHandler
} from '../controllers/deliveryConfirmationController';

const router = Router();

// POST /api/delivery-confirmation/confirm
// Confirm delivery and create delivery confirmation record
router.post('/confirm', confirmDeliveryHandler);

// POST /api/delivery-confirmation/burn-nft
// Burn NFT after delivery confirmation
router.post('/burn-nft', burnNFTHandler);

// POST /api/delivery-confirmation/complete
// Complete delivery confirmation process
router.post('/complete', completeDeliveryConfirmationHandler);

// GET /api/delivery-confirmation/:orderId/:userId
// Get delivery confirmation by order ID and user ID
router.get('/:orderId/:userId', getDeliveryConfirmationHandler);

// GET /api/delivery-confirmation/user/:userId
// Get all delivery confirmations for a user
router.get('/user/:userId', getUserDeliveryConfirmationsHandler);

export default router;
