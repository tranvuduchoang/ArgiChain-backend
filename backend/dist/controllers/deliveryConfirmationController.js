"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmDeliveryHandler = confirmDeliveryHandler;
exports.burnNFTHandler = burnNFTHandler;
exports.completeDeliveryConfirmationHandler = completeDeliveryConfirmationHandler;
exports.getDeliveryConfirmationHandler = getDeliveryConfirmationHandler;
exports.getUserDeliveryConfirmationsHandler = getUserDeliveryConfirmationsHandler;
const deliveryConfirmationService_1 = require("../services/deliveryConfirmationService");
async function confirmDeliveryHandler(req, res) {
    try {
        const { orderId, userId, rating, comment, images, hasComplaint, qualityRating } = req.body;
        console.log('Delivery confirmation request:', {
            orderId,
            userId,
            rating,
            comment,
            hasComplaint,
            qualityRating
        });
        if (!orderId || !userId) {
            res.status(400).json({
                error: 'Missing required fields',
                details: 'orderId and userId are required'
            });
            return;
        }
        if (rating && (rating < 1 || rating > 5)) {
            res.status(400).json({
                error: 'Invalid rating',
                details: 'Rating must be between 1 and 5'
            });
            return;
        }
        if (qualityRating && !['Good', 'Bad'].includes(qualityRating)) {
            res.status(400).json({
                error: 'Invalid quality rating',
                details: 'Quality rating must be "Good" or "Bad"'
            });
            return;
        }
        const input = {
            orderId,
            userId,
            rating,
            comment,
            images: images || [],
            hasComplaint: hasComplaint || false,
            qualityRating
        };
        const result = await (0, deliveryConfirmationService_1.confirmDelivery)(input);
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({
            error: 'Failed to confirm delivery',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function burnNFTHandler(req, res) {
    try {
        const { orderId, userId } = req.body;
        if (!orderId || !userId) {
            res.status(400).json({
                error: 'Missing required fields',
                details: 'orderId and userId are required'
            });
            return;
        }
        const result = await (0, deliveryConfirmationService_1.burnNFT)(orderId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error burning NFT:', error);
        res.status(500).json({
            error: 'Failed to burn NFT',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function completeDeliveryConfirmationHandler(req, res) {
    try {
        const { orderId, userId } = req.body;
        if (!orderId || !userId) {
            res.status(400).json({
                error: 'Missing required fields',
                details: 'orderId and userId are required'
            });
            return;
        }
        const result = await (0, deliveryConfirmationService_1.completeDeliveryConfirmation)(orderId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error completing delivery confirmation:', error);
        res.status(500).json({
            error: 'Failed to complete delivery confirmation',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function getDeliveryConfirmationHandler(req, res) {
    try {
        const { orderId, userId } = req.params;
        if (!orderId || !userId) {
            res.status(400).json({
                error: 'Missing required parameters',
                details: 'orderId and userId are required'
            });
            return;
        }
        const result = await (0, deliveryConfirmationService_1.getDeliveryConfirmation)(orderId, userId);
        if (!result) {
            res.status(404).json({
                error: 'Delivery confirmation not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error getting delivery confirmation:', error);
        res.status(500).json({
            error: 'Failed to get delivery confirmation',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function getUserDeliveryConfirmationsHandler(req, res) {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({
                error: 'Missing required parameter',
                details: 'userId is required'
            });
            return;
        }
        const result = await (0, deliveryConfirmationService_1.getUserDeliveryConfirmations)(userId);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error getting user delivery confirmations:', error);
        res.status(500).json({
            error: 'Failed to get user delivery confirmations',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=deliveryConfirmationController.js.map