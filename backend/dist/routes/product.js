"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const router = express_1.default.Router();
router.post('/', productController_1.createProductHandler);
router.get('/', productController_1.getAllProductsHandler);
router.get('/marketplace/listings', productController_1.listMarketplaceProductsHandler);
router.post('/:productId/mint/prepare', productController_1.prepareProductMintHandler);
router.post('/:productId/mint/confirm', productController_1.confirmProductMintHandler);
router.get('/:id', productController_1.getProductByIdHandler);
exports.default = router;
//# sourceMappingURL=product.js.map