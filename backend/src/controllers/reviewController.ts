import { Request, Response } from 'express';
import { ReviewStatus } from '@prisma/client';
import {
  createReview,
  getReviewsByProduct,
  getReviewsBySupplier,
  moderateReview,
} from '../services/reviewService';

const parseStatus = (value: unknown): ReviewStatus => {
  if (!value) return ReviewStatus.PENDING;
  const candidate = String(value).toUpperCase();
  return (candidate in ReviewStatus ? ReviewStatus[candidate as keyof typeof ReviewStatus] : ReviewStatus.PENDING);
};

export const createReviewHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, rating, comment, productId, supplierId, orderId, images } = req.body;
    if (!userId || rating === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const review = await createReview({
      userId: String(userId),
      rating: Number(rating),
      comment: comment ? String(comment) : undefined,
      productId: productId ? String(productId) : undefined,
      supplierId: supplierId ? String(supplierId) : undefined,
      orderId: orderId ? String(orderId) : undefined,
      images: Array.isArray(images) ? images.map((img) => String(img)) : undefined,
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review', details: err instanceof Error ? err.message : err });
  }
};

export const getReviewsByProductHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    if (!productId) {
      res.status(400).json({ error: 'productId is required' });
      return;
    }
    const reviews = await getReviewsByProduct(productId);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get product reviews', details: err instanceof Error ? err.message : err });
  }
};

export const getReviewsBySupplierHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) {
      res.status(400).json({ error: 'supplierId is required' });
      return;
    }
    const reviews = await getReviewsBySupplier(supplierId);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get supplier reviews', details: err instanceof Error ? err.message : err });
  }
};

export const moderateReviewHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { status, moderatorId } = req.body;
    if (!reviewId || !status || !moderatorId) {
      res.status(400).json({ error: 'reviewId, status, and moderatorId are required' });
      return;
    }
    const updated = await moderateReview(String(reviewId), parseStatus(status), String(moderatorId));
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to moderate review', details: err instanceof Error ? err.message : err });
  }
};
