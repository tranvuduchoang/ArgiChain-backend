import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateReviewInput {
  buyerId: number;
  rating: number;
  comment: string;
  productId?: number;
  supplierId?: number;
}

export async function createReview(input: CreateReviewInput) {
  if (!input.productId && !input.supplierId) throw new Error('Must provide productId or supplierId');
  if (input.productId && input.supplierId) throw new Error('Only one of productId or supplierId allowed');
  return prisma.review.create({ data: input });
}

export async function getReviewsByProduct(productId: number) {
  return prisma.review.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
}

export async function getReviewsBySupplier(supplierId: number) {
  return prisma.review.findMany({ where: { supplierId }, orderBy: { createdAt: 'desc' } });
}