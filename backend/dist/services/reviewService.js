"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.getReviewsByProduct = getReviewsByProduct;
exports.getReviewsBySupplier = getReviewsBySupplier;
exports.moderateReview = moderateReview;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
async function createReview(input) {
    if (!input.productId && !input.supplierId) {
        throw new Error('Must provide productId or supplierId');
    }
    if (input.rating < 1 || input.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    let supplierId = input.supplierId ?? null;
    if (!supplierId && input.productId) {
        const product = await database_1.prisma.product.findUnique({ where: { id: input.productId } });
        supplierId = product?.supplierId ?? null;
    }
    if (!supplierId) {
        throw new Error('Supplier not found for review');
    }
    return database_1.prisma.review.create({
        data: {
            userId: input.userId,
            productId: input.productId,
            supplierId,
            orderId: input.orderId,
            rating: input.rating,
            comment: input.comment,
            images: input.images ?? [],
            status: client_1.ReviewStatus.PENDING,
        },
    });
}
async function getReviewsByProduct(productId) {
    return database_1.prisma.review.findMany({
        where: { productId, status: client_1.ReviewStatus.APPROVED },
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
        },
    });
}
async function getReviewsBySupplier(supplierId) {
    return database_1.prisma.review.findMany({
        where: { supplierId, status: client_1.ReviewStatus.APPROVED },
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
        },
    });
}
async function moderateReview(reviewId, status, moderatorId) {
    if (status === client_1.ReviewStatus.PENDING) {
        throw new Error('Cannot set review status back to pending');
    }
    return database_1.prisma.review.update({
        where: { id: reviewId },
        data: {
            status,
            moderatedBy: moderatorId,
            moderatedAt: new Date(),
        },
    });
}
//# sourceMappingURL=reviewService.js.map