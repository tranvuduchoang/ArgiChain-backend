import { prisma } from '../config/database';
import { ReviewStatus } from '@prisma/client';

export interface CreateReviewInput {
  userId: string;
  productId?: string;
  supplierId?: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export async function createReview(input: CreateReviewInput) {
  if (!input.productId && !input.supplierId) {
    throw new Error('Must provide productId or supplierId');
  }
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  let supplierId = input.supplierId ?? null;
  if (!supplierId && input.productId) {
    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    supplierId = product?.supplierId ?? null;
  }

  if (!supplierId) {
    throw new Error('Supplier not found for review');
  }

  return prisma.review.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      supplierId,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment,
      images: input.images ?? [],
      status: ReviewStatus.PENDING,
    },
  });
}

export async function getReviewsByProduct(productId: string) {
  return prisma.review.findMany({
    where: { productId, status: ReviewStatus.APPROVED },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  });
}

export async function getReviewsBySupplier(supplierId: string) {
  return prisma.review.findMany({
    where: { supplierId, status: ReviewStatus.APPROVED },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  });
}

export async function moderateReview(reviewId: string, status: ReviewStatus, moderatorId: string) {
  if (status === ReviewStatus.PENDING) {
    throw new Error('Cannot set review status back to pending');
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      status,
      moderatedBy: moderatorId,
      moderatedAt: new Date(),
    },
  });
}
