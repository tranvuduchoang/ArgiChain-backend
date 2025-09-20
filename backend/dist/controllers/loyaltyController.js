"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemBuyerPointsHandler = exports.setSupplierLoyaltyProgramHandler = exports.getSupplierLoyaltyProgramHandler = exports.getBuyerLoyaltyPointsHandler = void 0;
const loyaltyService_1 = require("../services/loyaltyService");
const getBuyerLoyaltyPointsHandler = async (req, res) => {
    try {
        const { buyerId } = req.params;
        if (!buyerId) {
            res.status(400).json({ error: 'buyerId is required' });
            return;
        }
        const points = await (0, loyaltyService_1.getBuyerLoyaltyPoints)(buyerId);
        res.status(200).json(points);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get buyer loyalty points', details: err instanceof Error ? err.message : err });
    }
};
exports.getBuyerLoyaltyPointsHandler = getBuyerLoyaltyPointsHandler;
const getSupplierLoyaltyProgramHandler = async (req, res) => {
    try {
        const { supplierId } = req.params;
        if (!supplierId) {
            res.status(400).json({ error: 'supplierId is required' });
            return;
        }
        const program = await (0, loyaltyService_1.getSupplierLoyaltyProgram)(supplierId);
        res.status(200).json(program);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get supplier loyalty program', details: err instanceof Error ? err.message : err });
    }
};
exports.getSupplierLoyaltyProgramHandler = getSupplierLoyaltyProgramHandler;
const setSupplierLoyaltyProgramHandler = async (req, res) => {
    try {
        const { supplierId } = req.params;
        if (!supplierId) {
            res.status(400).json({ error: 'supplierId is required' });
            return;
        }
        const { earnRatePerToken, redeemValuePerPoint, description } = req.body;
        if (earnRatePerToken === undefined || redeemValuePerPoint === undefined) {
            res.status(400).json({ error: 'earnRatePerToken and redeemValuePerPoint are required' });
            return;
        }
        const program = await (0, loyaltyService_1.setSupplierLoyaltyProgram)(supplierId, Number(earnRatePerToken), Number(redeemValuePerPoint), description ? String(description) : undefined);
        res.status(200).json(program);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to set supplier loyalty program', details: err instanceof Error ? err.message : err });
    }
};
exports.setSupplierLoyaltyProgramHandler = setSupplierLoyaltyProgramHandler;
const redeemBuyerPointsHandler = async (req, res) => {
    try {
        const { buyerId } = req.params;
        if (!buyerId) {
            res.status(400).json({ error: 'buyerId is required' });
            return;
        }
        const { supplierId, points, referenceId } = req.body;
        if (!supplierId || points === undefined) {
            res.status(400).json({ error: 'supplierId and points are required' });
            return;
        }
        const result = await (0, loyaltyService_1.redeemBuyerPoints)(String(buyerId), String(supplierId), Number(points), referenceId ? String(referenceId) : undefined);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to redeem points', details: err instanceof Error ? err.message : err });
    }
};
exports.redeemBuyerPointsHandler = redeemBuyerPointsHandler;
//# sourceMappingURL=loyaltyController.js.map