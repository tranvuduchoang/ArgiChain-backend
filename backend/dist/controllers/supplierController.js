"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploySupplierContractHandler = exports.updateBrandMemberHandler = exports.addBrandMemberHandler = exports.listBrandMembersHandler = exports.updateSupplierHandler = exports.getSupplierBySlugHandler = exports.getSupplierByIdHandler = exports.listSuppliersHandler = exports.createSupplierHandler = void 0;
const client_1 = require("@prisma/client");
const supplierService_1 = require("../services/supplierService");
const blockchainService_1 = require("../services/blockchainService");
const parseBoolean = (value) => {
    if (value === undefined)
        return undefined;
    if (typeof value === 'boolean')
        return value;
    const lowered = String(value).toLowerCase();
    if (lowered === 'true')
        return true;
    if (lowered === 'false')
        return false;
    return undefined;
};
const createSupplierHandler = async (req, res) => {
    try {
        const { userId, businessName, slug, description, logo, coverImage, website, location, contactEmail, contactPhone, socialLinks, } = req.body;
        if (!userId || !businessName || !slug) {
            res.status(400).json({ error: 'userId, businessName, and slug are required' });
            return;
        }
        const supplier = await (0, supplierService_1.createSupplier)({
            userId: String(userId),
            businessName: String(businessName),
            slug: String(slug).toLowerCase(),
            description: description ? String(description) : undefined,
            logo: logo ? String(logo) : undefined,
            coverImage: coverImage ? String(coverImage) : undefined,
            website: website ? String(website) : undefined,
            location: location ? String(location) : undefined,
            contactEmail: contactEmail ? String(contactEmail) : undefined,
            contactPhone: contactPhone ? String(contactPhone) : undefined,
            socialLinks: socialLinks ?? undefined,
        });
        res.status(201).json(supplier);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create supplier', details: err instanceof Error ? err.message : err });
    }
};
exports.createSupplierHandler = createSupplierHandler;
const listSuppliersHandler = async (req, res) => {
    try {
        const { search, isActive, walletAddress } = req.query;
        if (walletAddress) {
            const suppliers = await (0, supplierService_1.listSuppliers)({
                walletAddress: String(walletAddress),
                isActive: parseBoolean(isActive),
            });
            res.status(200).json(suppliers);
            return;
        }
        const suppliers = await (0, supplierService_1.listSuppliers)({
            search: search ? String(search) : undefined,
            isActive: parseBoolean(isActive),
        });
        res.status(200).json(suppliers);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to list suppliers', details: err instanceof Error ? err.message : err });
    }
};
exports.listSuppliersHandler = listSuppliersHandler;
const getSupplierByIdHandler = async (req, res) => {
    try {
        const { supplierId } = req.params;
        if (!supplierId) {
            res.status(400).json({ error: 'supplierId is required' });
            return;
        }
        const supplier = await (0, supplierService_1.getSupplierById)(supplierId);
        if (!supplier) {
            res.status(404).json({ error: 'Supplier not found' });
            return;
        }
        res.status(200).json(supplier);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch supplier', details: err instanceof Error ? err.message : err });
    }
};
exports.getSupplierByIdHandler = getSupplierByIdHandler;
const getSupplierBySlugHandler = async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            res.status(400).json({ error: 'slug is required' });
            return;
        }
        const supplier = await (0, supplierService_1.getSupplierBySlug)(slug.toLowerCase());
        if (!supplier) {
            res.status(404).json({ error: 'Supplier not found' });
            return;
        }
        res.status(200).json(supplier);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch supplier by slug', details: err instanceof Error ? err.message : err });
    }
};
exports.getSupplierBySlugHandler = getSupplierBySlugHandler;
const updateSupplierHandler = async (req, res) => {
    try {
        const { supplierId } = req.params;
        if (!supplierId) {
            res.status(400).json({ error: 'supplierId is required' });
            return;
        }
        const supplier = await (0, supplierService_1.updateSupplier)({
            supplierId,
            businessName: req.body.businessName,
            description: req.body.description,
            logo: req.body.logo,
            coverImage: req.body.coverImage,
            website: req.body.website,
            location: req.body.location,
            contactEmail: req.body.contactEmail,
            contactPhone: req.body.contactPhone,
            socialLinks: req.body.socialLinks,
            isActive: parseBoolean(req.body.isActive),
        });
        res.status(200).json(supplier);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update supplier', details: err instanceof Error ? err.message : err });
    }
};
exports.updateSupplierHandler = updateSupplierHandler;
const listBrandMembersHandler = async (req, res) => {
    try {
        const { supplierId } = req.params;
        if (!supplierId) {
            res.status(400).json({ error: 'supplierId is required' });
            return;
        }
        const members = await (0, supplierService_1.listBrandMembers)(supplierId);
        res.status(200).json(members);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to list brand members', details: err instanceof Error ? err.message : err });
    }
};
exports.listBrandMembersHandler = listBrandMembersHandler;
const addBrandMemberHandler = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { userId, role } = req.body;
        if (!supplierId || !userId) {
            res.status(400).json({ error: 'supplierId and userId are required' });
            return;
        }
        const member = await (0, supplierService_1.addBrandMember)({
            supplierId,
            userId: String(userId),
            role: role ? (client_1.BrandMemberRole[role] ?? client_1.BrandMemberRole.STAFF) : client_1.BrandMemberRole.STAFF,
        });
        res.status(201).json(member);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add brand member', details: err instanceof Error ? err.message : err });
    }
};
exports.addBrandMemberHandler = addBrandMemberHandler;
const updateBrandMemberHandler = async (req, res) => {
    try {
        const { supplierId, memberId } = req.params;
        const { role, status } = req.body;
        if (!supplierId || !memberId) {
            res.status(400).json({ error: 'supplierId and memberId are required' });
            return;
        }
        const updated = await (0, supplierService_1.updateBrandMember)({
            supplierId,
            memberId,
            role: role ? (client_1.BrandMemberRole[role] ?? undefined) : undefined,
            status: status ? (client_1.BrandMemberStatus[status] ?? undefined) : undefined,
        });
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update brand member', details: err instanceof Error ? err.message : err });
    }
};
exports.updateBrandMemberHandler = updateBrandMemberHandler;
const deploySupplierContractHandler = async (req, res) => {
    try {
        const { supplierId } = req.params;
        if (!supplierId) {
            res.status(400).json({ error: 'supplierId is required' });
            return;
        }
        const supplier = await (0, supplierService_1.getSupplierById)(supplierId);
        if (!supplier) {
            res.status(404).json({ error: 'Supplier not found' });
            return;
        }
        if (!supplier.user?.walletAddress) {
            res.status(400).json({ error: 'Supplier user walletAddress is missing' });
            return;
        }
        const existing = await (0, supplierService_1.getActiveSupplierContract)(supplierId);
        const force = req.body.force === true || req.query.force === 'true';
        if (existing && !force) {
            res.status(409).json({
                error: 'Supplier already has an active contract template',
                template: existing,
            });
            return;
        }
        const result = await (0, blockchainService_1.deploySupplierContract)({
            supplierId,
            supplierAddress: supplier.user.walletAddress,
            baseUri: req.body.baseUri ? String(req.body.baseUri) : undefined,
            contractUri: req.body.contractUri ? String(req.body.contractUri) : undefined,
            name: req.body.name ? String(req.body.name) : undefined,
            description: req.body.description ? String(req.body.description) : undefined,
        });
        res.status(201).json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to deploy supplier contract', details: err instanceof Error ? err.message : err });
    }
};
exports.deploySupplierContractHandler = deploySupplierContractHandler;
//# sourceMappingURL=supplierController.js.map