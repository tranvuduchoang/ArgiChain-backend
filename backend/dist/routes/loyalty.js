"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loyaltyController_1 = require("../controllers/loyaltyController");
const router = express_1.default.Router();
router.get('/buyer/:buyerId', loyaltyController_1.getBuyerLoyaltyPointsHandler);
router.get('/supplier/:supplierId', loyaltyController_1.getSupplierLoyaltyProgramHandler);
router.post('/supplier/:supplierId/config', loyaltyController_1.setSupplierLoyaltyProgramHandler);
router.post('/buyer/:buyerId/redeem', loyaltyController_1.redeemBuyerPointsHandler);
exports.default = router;
//# sourceMappingURL=loyalty.js.map