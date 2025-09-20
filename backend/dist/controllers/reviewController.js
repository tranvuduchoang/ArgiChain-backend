"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateReviewHandler = exports.getReviewsBySupplierHandler = exports.getReviewsByProductHandler = exports.createReviewHandler = void 0;
const client_1 = require("@prisma/client");
const reviewService_1 = require("../services/reviewService");
const parseStatus = (value) => {
    if (!value)
        return client_1.ReviewStatus.PENDING;
    const candidate = String(value).toUpperCase();
    return (candidate in client_1.ReviewStatus ? client_1.ReviewStatus[candidate] : client_1.ReviewStatus.PENDING);
};
const createReviewHandler = async (req, res) => {
    try {
        const { userId, rating, comment, productId, supplierId, orderId, images } = req.body;
        if (!userId || rating === undefined) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const review = await (0, reviewService_1.createReview)({
            userId: String(userId),
            rating: Number(rating),
            comment: comment ? String(comment) : undefined,
            productId: productId ? String(productId) : undefined,
            supplierId: supplierId ? String(supplierId) : undefined,
            orderId: orderId ? String(orderId) : undefined,
            images: Array.isArray(images) ? images.map((img) => String(img)) : undefined,
        });
        res.status(201).json(review);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create review', details: err instanceof Error ? err.message : err });
    }
};
exports.createReviewHandler = createReviewHandler;
const getReviewsByProductHandler = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            res.status(400).json({ error: 'productId is required' });
            return;
        }
        const reviews = await (0, reviewService_1.getReviewsByProduct)(productId);
        res.status(200).json(reviews);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get product reviews', details: err instanceof Error ? err.message : err });
    }
};
exports.getReviewsByProductHandler = getReviewsByProductHandler;
const getReviewsBySupplierHandler = async (req, res) => {
    try {
        const { supplierId } = req.params;
        if (!supplierId) {
            res.status(400).json({ error: 'supplierId is required' });
            return;
        }
        const reviews = await (0, reviewService_1.getReviewsBySupplier)(supplierId);
        res.status(200).json(reviews);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get supplier reviews', details: err instanceof Error ? err.message : err });
    }
};
exports.getReviewsBySupplierHandler = getReviewsBySupplierHandler;
const moderateReviewHandler = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { status, moderatorId } = req.body;
        if (!reviewId || !status || !moderatorId) {
            res.status(400).json({ error: 'reviewId, status, and moderatorId are required' });
            return;
        }
        const updated = await (0, reviewService_1.moderateReview)(String(reviewId), parseStatus(status), String(moderatorId));
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to moderate review', details: err instanceof Error ? err.message : err });
    }
};
exports.moderateReviewHandler = moderateReviewHandler;
//# sourceMappingURL=reviewController.js.map