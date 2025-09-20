import express from 'express';
import {
  addBrandMemberHandler,
  createSupplierHandler,
  deploySupplierContractHandler,
  getSupplierByIdHandler,
  getSupplierBySlugHandler,
  listBrandMembersHandler,
  listSuppliersHandler,
  updateBrandMemberHandler,
  updateSupplierHandler,
} from '../controllers/supplierController';

const router = express.Router();

router.post('/', createSupplierHandler);
router.get('/', listSuppliersHandler);
router.get('/slug/:slug', getSupplierBySlugHandler);
router.get('/:supplierId', getSupplierByIdHandler);
router.patch('/:supplierId', updateSupplierHandler);
router.post('/:supplierId/contracts/deploy', deploySupplierContractHandler);
router.get('/:supplierId/members', listBrandMembersHandler);
router.post('/:supplierId/members', addBrandMemberHandler);
router.patch('/:supplierId/members/:memberId', updateBrandMemberHandler);

export default router;
