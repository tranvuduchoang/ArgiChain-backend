"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supplierController_1 = require("../controllers/supplierController");
const router = express_1.default.Router();
router.post('/', supplierController_1.createSupplierHandler);
router.get('/', supplierController_1.listSuppliersHandler);
router.get('/slug/:slug', supplierController_1.getSupplierBySlugHandler);
router.get('/:supplierId', supplierController_1.getSupplierByIdHandler);
router.patch('/:supplierId', supplierController_1.updateSupplierHandler);
router.post('/:supplierId/contracts/deploy', supplierController_1.deploySupplierContractHandler);
router.get('/:supplierId/members', supplierController_1.listBrandMembersHandler);
router.post('/:supplierId/members', supplierController_1.addBrandMemberHandler);
router.patch('/:supplierId/members/:memberId', supplierController_1.updateBrandMemberHandler);
exports.default = router;
//# sourceMappingURL=supplier.js.map