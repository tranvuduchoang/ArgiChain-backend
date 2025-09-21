"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryConfirmationController_1 = require("../controllers/deliveryConfirmationController");
const router = (0, express_1.Router)();
router.post('/confirm', deliveryConfirmationController_1.confirmDeliveryHandler);
router.post('/burn-nft', deliveryConfirmationController_1.burnNFTHandler);
router.post('/complete', deliveryConfirmationController_1.completeDeliveryConfirmationHandler);
router.get('/:orderId/:userId', deliveryConfirmationController_1.getDeliveryConfirmationHandler);
router.get('/user/:userId', deliveryConfirmationController_1.getUserDeliveryConfirmationsHandler);
exports.default = router;
//# sourceMappingURL=deliveryConfirmation.js.map