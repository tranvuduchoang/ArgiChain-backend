import { Request, Response } from 'express';
import { createReview, getReviewsByProduct, getReviewsBySupplier } from '../services/reviewService';

export const createReviewHandler = async (req: Request, res: Response) => {
  try {
    const { buyerId, rating, comment, productId, supplierId } = req.body;
    if (!buyerId || !rating || !comment) return res.status(400).json({ error: 'Missing required fields' });
    const review = await createReview({
      buyerId: Number(buyerId),
      rating: Number(rating),
      comment,
      productId: productId ? Number(productId) : undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review', details: err instanceof Error ? err.message : err });
  }
};

export const getReviewsByProductHandler = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const reviews = await getReviewsByProduct(productId);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get product reviews', details: err instanceof Error ? err.message : err });
  }
};

export const getReviewsBySupplierHandler = async (req: Request, res: Response) => {
  try {
    const supplierId = Number(req.params.supplierId);
    const reviews = await getReviewsBySupplier(supplierId);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get supplier reviews', details: err instanceof Error ? err.message : err });
  }
};