"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrdersHandler = exports.createOrderHandler = void 0;
const client_1 = require("@prisma/client");
const orderService_1 = require("../services/orderService");
const parsePaymentMethod = (value) => {
    if (!value)
        return client_1.PaymentMethod.CRYPTO;
    const candidate = String(value).toUpperCase();
    return (candidate in client_1.PaymentMethod ? client_1.PaymentMethod[candidate] : client_1.PaymentMethod.CRYPTO);
};
const createOrderHandler = async (req, res) => {
    try {
        const { userId, supplierId, items, deliveryAddress, deliveryMethod, paymentMethod, transactionHash, chainId, buyerWalletAddress, paymentAmount, notes, currency, feeAmount, } = req.body;
        if (!userId || !supplierId || !deliveryAddress || !deliveryMethod || !transactionHash || chainId === undefined || !buyerWalletAddress) {
            res.status(400).json({ error: 'Missing required fields (userId, supplierId, delivery info, transactionHash, chainId, buyerWalletAddress)' });
            return;
        }
        const parsedChainId = Number(chainId);
        if (Number.isNaN(parsedChainId)) {
            res.status(400).json({ error: 'Invalid chainId' });
            return;
        }
        if (!Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'Order must include at least one item' });
            return;
        }
        const parsedItems = items.map((item) => ({
            productId: String(item.productId),
            quantity: Number(item.quantity),
            unitPrice: item.unitPrice !== undefined ? Number(item.unitPrice) : undefined,
            productTokenId: item.productTokenId ? String(item.productTokenId) : undefined,
            metadata: item.metadata,
        }));
        const order = await (0, orderService_1.createOrder)({
            userId: String(userId),
            supplierId: String(supplierId),
            items: parsedItems,
            deliveryAddress: String(deliveryAddress),
            deliveryMethod: String(deliveryMethod),
            paymentMethod: parsePaymentMethod(paymentMethod),
            transactionHash: String(transactionHash),
            chainId: parsedChainId,
            buyerWalletAddress: String(buyerWalletAddress),
            paymentAmount: paymentAmount !== undefined ? Number(paymentAmount) : undefined,
            notes: notes ? String(notes) : undefined,
            currency: currency ? String(currency) : undefined,
            feeAmount: feeAmount !== undefined ? Number(feeAmount) : undefined,
        });
        res.status(201).json(order);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create order', details: err instanceof Error ? err.message : err });
    }
};
exports.createOrderHandler = createOrderHandler;
const getUserOrdersHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const orders = await (0, orderService_1.getUserOrders)(userId);
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch user orders', details: err instanceof Error ? err.message : err });
    }
};
exports.getUserOrdersHandler = getUserOrdersHandler;
//# sourceMappingURL=orderController.js.map