"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const router = express_1.default.Router();
router.post('/', reviewController_1.createReviewHandler);
router.get('/product/:productId', reviewController_1.getReviewsByProductHandler);
router.get('/supplier/:supplierId', reviewController_1.getReviewsBySupplierHandler);
exports.default = router;
//# sourceMappingURL=review.js.map