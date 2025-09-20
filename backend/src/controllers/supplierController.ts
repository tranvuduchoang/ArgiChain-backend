import { Request, Response } from 'express';
import { BrandMemberRole, BrandMemberStatus } from '@prisma/client';
import {
  addBrandMember,
  createSupplier,
  getActiveSupplierContract,
  getSupplierById,
  getSupplierBySlug,
  listBrandMembers,
  listSuppliers,
  updateBrandMember,
  updateSupplier,
} from '../services/supplierService';
import { deploySupplierContract } from '../services/blockchainService';

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  const lowered = String(value).toLowerCase();
  if (lowered === 'true') return true;
  if (lowered === 'false') return false;
  return undefined;
};

export const createSupplierHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      businessName,
      slug,
      description,
      logo,
      coverImage,
      website,
      location,
      contactEmail,
      contactPhone,
      socialLinks,
    } = req.body;

    if (!userId || !businessName || !slug) {
      res.status(400).json({ error: 'userId, businessName, and slug are required' });
      return;
    }

    const supplier = await createSupplier({
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to create supplier', details: err instanceof Error ? err.message : err });
  }
};

export const listSuppliersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, isActive, walletAddress } = req.query;
    
    // If walletAddress is provided, find supplier by wallet address
    if (walletAddress) {
      const suppliers = await listSuppliers({
        walletAddress: String(walletAddress),
        isActive: parseBoolean(isActive),
      });
      res.status(200).json(suppliers);
      return;
    }
    
    const suppliers = await listSuppliers({
      search: search ? String(search) : undefined,
      isActive: parseBoolean(isActive),
    });
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list suppliers', details: err instanceof Error ? err.message : err });
  }
};

export const getSupplierByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) {
      res.status(400).json({ error: 'supplierId is required' });
      return;
    }
    const supplier = await getSupplierById(supplierId);
    if (!supplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }
    res.status(200).json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch supplier', details: err instanceof Error ? err.message : err });
  }
};

export const getSupplierBySlugHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    if (!slug) {
      res.status(400).json({ error: 'slug is required' });
      return;
    }
    const supplier = await getSupplierBySlug(slug.toLowerCase());
    if (!supplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }
    res.status(200).json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch supplier by slug', details: err instanceof Error ? err.message : err });
  }
};

export const updateSupplierHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) {
      res.status(400).json({ error: 'supplierId is required' });
      return;
    }

    const supplier = await updateSupplier({
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to update supplier', details: err instanceof Error ? err.message : err });
  }
};

export const listBrandMembersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) {
      res.status(400).json({ error: 'supplierId is required' });
      return;
    }
    const members = await listBrandMembers(supplierId);
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list brand members', details: err instanceof Error ? err.message : err });
  }
};

export const addBrandMemberHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const { userId, role } = req.body;

    if (!supplierId || !userId) {
      res.status(400).json({ error: 'supplierId and userId are required' });
      return;
    }

    const member = await addBrandMember({
      supplierId,
      userId: String(userId),
      role: role ? (BrandMemberRole[role as keyof typeof BrandMemberRole] ?? BrandMemberRole.STAFF) : BrandMemberRole.STAFF,
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add brand member', details: err instanceof Error ? err.message : err });
  }
};

export const updateBrandMemberHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId, memberId } = req.params;
    const { role, status } = req.body;

    if (!supplierId || !memberId) {
      res.status(400).json({ error: 'supplierId and memberId are required' });
      return;
    }

    const updated = await updateBrandMember({
      supplierId,
      memberId,
      role: role ? (BrandMemberRole[role as keyof typeof BrandMemberRole] ?? undefined) : undefined,
      status: status ? (BrandMemberStatus[status as keyof typeof BrandMemberStatus] ?? undefined) : undefined,
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update brand member', details: err instanceof Error ? err.message : err });
  }
};

export const deploySupplierContractHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) {
      res.status(400).json({ error: 'supplierId is required' });
      return;
    }

    const supplier = await getSupplierById(supplierId);
    if (!supplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    if (!supplier.user?.walletAddress) {
      res.status(400).json({ error: 'Supplier user walletAddress is missing' });
      return;
    }

    const existing = await getActiveSupplierContract(supplierId);
    const force = req.body.force === true || req.query.force === 'true';
    if (existing && !force) {
      res.status(409).json({
        error: 'Supplier already has an active contract template',
        template: existing,
      });
      return;
    }

    const result = await deploySupplierContract({
      supplierId,
      supplierAddress: supplier.user.walletAddress,
      baseUri: req.body.baseUri ? String(req.body.baseUri) : undefined,
      contractUri: req.body.contractUri ? String(req.body.contractUri) : undefined,
      name: req.body.name ? String(req.body.name) : undefined,
      description: req.body.description ? String(req.body.description) : undefined,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to deploy supplier contract', details: err instanceof Error ? err.message : err });
  }
};
