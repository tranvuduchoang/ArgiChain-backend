import { Request, Response } from 'express';
import { ListingStatus, PricingModel } from '@prisma/client';
import {
  createProduct,
  getAllProducts,
  getProductById,
  listActiveMarketplaceProducts,
  prepareProductMint,
  confirmProductMint,
} from '../services/productService';

type EnumType = Record<string, string>;

type EnumReturn<T extends EnumType> = T[keyof T];

const parseStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }
  return [];
};

const parseEnum = <T extends EnumType>(enumObject: T, value: unknown, fallback: EnumReturn<T>): EnumReturn<T> => {
  if (!value) return fallback;
  const candidate = String(value).toUpperCase();
  return (candidate in enumObject ? enumObject[candidate] : fallback) as EnumReturn<T>;
};

const toLowerAddress = (value: unknown): string => String(value).toLowerCase();

export const createProductHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      supplierId,
      name,
      description,
      category,
      unit,
      totalSupply,
      pricePerUnit,
      currency,
      tags,
      images,
      pricingModel,
      metadataCid,
      metadataUrl,
      harvestDate,
      expiryDate,
      qualityCertifications,
      storageConditions,
      listing,
    } = req.body;

    if (!supplierId || !name || !description || !category || !unit || totalSupply === undefined || pricePerUnit === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const parsedListing = listing
      ? {
          title: listing.title,
          slug: listing.slug,
          shortDescription: listing.shortDescription,
          status: parseEnum(ListingStatus, listing.status, ListingStatus.DRAFT) as ListingStatus,
          isFeatured: Boolean(listing.isFeatured),
          searchTags: parseStringArray(listing.searchTags),
          minOrderQuantity: listing.minOrderQuantity ? Number(listing.minOrderQuantity) : undefined,
          maxOrderQuantity: listing.maxOrderQuantity ? Number(listing.maxOrderQuantity) : undefined,
          leadTimeDays: listing.leadTimeDays ? Number(listing.leadTimeDays) : undefined,
          publishedAt: listing.publishedAt,
        }
      : undefined;

    if (parsedListing && !parsedListing.title) {
      res.status(400).json({ error: 'Listing title is required when listing data is provided' });
      return;
    }
    if (parsedListing && !parsedListing.slug) {
      res.status(400).json({ error: 'Listing slug is required when listing data is provided' });
      return;
    }

    const product = await createProduct({
      supplierId: String(supplierId),
      name: String(name),
      description: String(description),
      category: String(category),
      unit: String(unit),
      totalSupply: Number(totalSupply),
      pricePerUnit: Number(pricePerUnit),
      currency: currency ? String(currency) : undefined,
      tags: parseStringArray(tags),
      images: parseStringArray(images),
      pricingModel: parseEnum(PricingModel, pricingModel, PricingModel.FIXED) as PricingModel,
      metadataCid: metadataCid ? String(metadataCid) : undefined,
      metadataUrl: metadataUrl ? String(metadataUrl) : undefined,
      harvestDate,
      expiryDate,
      qualityCertifications: parseStringArray(qualityCertifications),
      storageConditions: storageConditions ? String(storageConditions) : undefined,
      listing: parsedListing,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err instanceof Error ? err.message : err });
  }
};

export const getAllProductsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const onlyActive = req.query.active === 'true';
    const products = await getAllProducts({ onlyActive });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err instanceof Error ? err.message : err });
  }
};

export const getProductByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Product id is required' });
      return;
    }
    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product', details: err instanceof Error ? err.message : err });
  }
};

export const listMarketplaceProductsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const listings = await listActiveMarketplaceProducts();
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch marketplace listings', details: err instanceof Error ? err.message : err });
  }
};

export const prepareProductMintHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    if (!productId) {
      res.status(400).json({ error: 'productId is required' });
      return;
    }
    const payload = await prepareProductMint(productId);
    res.status(200).json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to prepare mint payload';
    const status = message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ error: 'Failed to prepare mint payload', details: message });
  }
};

export const confirmProductMintHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    if (!productId) {
      res.status(400).json({ error: 'productId is required' });
      return;
    }

    const {
      tokenId,
      contractAddress,
      transactionHash,
      mintedQuantity,
      chainId,
      metadataCid,
      metadataUrl,
      mintedAt,
      toAddress,
    } = req.body;

    console.log('Confirm mint request:', {
      productId,
      tokenId,
      contractAddress,
      transactionHash,
      mintedQuantity,
      chainId,
      toAddress,
    });

    if (!tokenId || !contractAddress || !transactionHash || mintedQuantity === undefined || chainId === undefined) {
      res.status(400).json({ error: 'tokenId, contractAddress, transactionHash, mintedQuantity, and chainId are required' });
      return;
    }

    const result = await confirmProductMint({
      productId,
      tokenId: String(tokenId),
      contractAddress: toLowerAddress(contractAddress),
      transactionHash: String(transactionHash),
      mintedQuantity: Number(mintedQuantity),
      chainId: Number(chainId),
      metadataCid: metadataCid ? String(metadataCid) : undefined,
      metadataUrl: metadataUrl ? String(metadataUrl) : undefined,
      mintedAt,
      toAddress: toAddress ? String(toAddress) : undefined,
    });

    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to confirm mint';
    const status = message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ error: 'Failed to confirm mint', details: message });
  }
};
