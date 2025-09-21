"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getUserOrders = getUserOrders;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const toDecimal = (value) => new client_1.Prisma.Decimal(value);
const normalizeAddress = (value) => value.toLowerCase();
const addressesMatch = (actual, expected) => normalizeAddress(actual) === normalizeAddress(expected);
const bigIntEquals = (a, b) => BigInt(a) === BigInt(b);
const buildOrderNumber = () => {
    const now = new Date();
    return `AGR-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now
        .getDate()
        .toString()
        .padStart(2, '0')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};
async function createOrder(input) {
    if (!input.items || input.items.length === 0) {
        throw new Error('Order requires at least one item');
    }
    const chainId = Number(input.chainId);
    if (Number.isNaN(chainId)) {
        throw new Error('Invalid chainId');
    }
    const productIds = input.items.map((item) => item.productId);
    const normalizedBuyerAddress = normalizeAddress(input.buyerWalletAddress);
    const normalizedTxHash = input.transactionHash.toLowerCase();
    return database_1.prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
            where: { id: input.userId }
        });
        if (!user) {
            user = await tx.user.create({
                data: {
                    id: input.userId,
                    email: `${input.userId}@wallet.local`,
                    username: `user_${input.userId.slice(0, 8)}`,
                    walletAddress: input.userId,
                    role: client_1.UserRole.BUYER,
                    isSupplier: false,
                    isVerified: true,
                }
            });
        }
        const products = await tx.product.findMany({
            where: { id: { in: productIds } },
            include: {
                supplier: {
                    include: { user: true },
                },
                productTokens: true,
            },
        });
        if (products.length !== productIds.length) {
            throw new Error('One or more products not found');
        }
        products.forEach((product) => {
            if (product.supplierId !== input.supplierId) {
                throw new Error('All items must belong to the same supplier');
            }
        });
        let subtotal = new client_1.Prisma.Decimal(0);
        const currency = input.currency ?? products[0]?.currency ?? 'MATIC';
        const orderItemsData = [];
        const itemContexts = [];
        for (const item of input.items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product)
                throw new Error('Product not found');
            if (item.quantity <= 0)
                throw new Error('Quantity must be positive');
            if (item.quantity > product.availableSupply) {
                throw new Error(`Insufficient supply for product ${product.name}`);
            }
            if (!product.contractAddress || !product.nftTokenId) {
                throw new Error(`Product ${product.name} is not tokenized yet`);
            }
            const supplierWallet = product.supplier?.user?.walletAddress;
            const supplierUserId = product.supplier?.user?.id;
            if (!supplierWallet || !supplierUserId) {
                throw new Error('Supplier wallet or user record is not configured');
            }
            const normalizedContractAddress = product.contractAddress.toLowerCase();
            const productTokenRecord = product.productTokens.find((token) => token.contractAddress.toLowerCase() === normalizedContractAddress &&
                token.tokenId === product.nftTokenId);
            if (!productTokenRecord) {
                throw new Error(`Product token not registered for ${product.name}`);
            }
            const unitPrice = item.unitPrice ?? Number(product.pricePerUnit);
            const unitPriceDecimal = toDecimal(unitPrice);
            const lineTotal = unitPriceDecimal.mul(item.quantity);
            subtotal = subtotal.add(lineTotal);
            const metadata = item.metadata;
            const orderItem = {
                productId: item.productId,
                productTokenId: productTokenRecord.id,
                quantity: item.quantity,
                unitPrice: unitPriceDecimal,
                totalPrice: lineTotal,
            };
            if (metadata !== undefined) {
                orderItem.metadata = metadata;
            }
            orderItemsData.push(orderItem);
            itemContexts.push({
                productId: item.productId,
                productToken: {
                    id: productTokenRecord.id,
                    tokenId: productTokenRecord.tokenId,
                    contractAddress: productTokenRecord.contractAddress,
                },
                supplierWallet,
                supplierUserId,
                quantity: item.quantity,
            });
        }
        const feeAmount = toDecimal(input.feeAmount ?? 0);
        const totalAmount = subtotal.add(feeAmount);
        const order = await tx.order.create({
            data: {
                orderNumber: buildOrderNumber(),
                userId: input.userId,
                supplierId: input.supplierId,
                status: client_1.OrderStatus.PAID,
                paymentMethod: input.paymentMethod,
                paymentStatus: client_1.PaymentStatus.CONFIRMED,
                subtotalAmount: subtotal,
                feeAmount,
                totalAmount,
                currency,
                transactionHash: normalizedTxHash,
                deliveryAddress: input.deliveryAddress,
                deliveryMethod: input.deliveryMethod,
                notes: input.notes,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: true,
            },
        });
        for (const item of input.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    availableSupply: {
                        decrement: item.quantity,
                    },
                },
            });
        }
        const supplierWallet = itemContexts[0]?.supplierWallet;
        await tx.paymentReceipt.upsert({
            where: { orderId: order.id },
            update: {
                chainId,
                paymentMethod: input.paymentMethod,
                status: client_1.PaymentStatus.CONFIRMED,
                transactionHash: normalizedTxHash,
                payerAddress: normalizedBuyerAddress,
                receiverAddress: supplierWallet,
                amount: totalAmount,
                currency,
            },
            create: {
                orderId: order.id,
                chainId,
                paymentMethod: input.paymentMethod,
                status: client_1.PaymentStatus.CONFIRMED,
                transactionHash: normalizedTxHash,
                payerAddress: normalizedBuyerAddress,
                receiverAddress: supplierWallet,
                amount: totalAmount,
                currency,
            },
        });
        for (const context of itemContexts) {
            const supplierNft = await tx.nFT.findUnique({
                where: {
                    userId_productTokenId: {
                        userId: context.supplierUserId,
                        productTokenId: context.productToken.id,
                    },
                },
            });
            if (!supplierNft || supplierNft.quantity < context.quantity) {
                throw new Error('Supplier NFT balance is insufficient for transfer');
            }
            await tx.nFT.update({
                where: {
                    userId_productTokenId: {
                        userId: context.supplierUserId,
                        productTokenId: context.productToken.id,
                    },
                },
                data: {
                    quantity: { decrement: context.quantity },
                },
            });
            const buyerMetadata = {
                productId: context.productId,
                tokenId: context.productToken.tokenId,
            };
            await tx.nFT.upsert({
                where: {
                    userId_productTokenId: {
                        userId: input.userId,
                        productTokenId: context.productToken.id,
                    },
                },
                update: {
                    quantity: { increment: context.quantity },
                },
                create: {
                    userId: input.userId,
                    productTokenId: context.productToken.id,
                    quantity: context.quantity,
                    metadata: buyerMetadata,
                },
            });
            const existingTransfer = await tx.tokenTransfer.findFirst({
                where: {
                    productTokenId: context.productToken.id,
                    txHash: normalizedTxHash,
                    type: client_1.TokenTransferType.TRANSFER,
                },
            });
            if (!existingTransfer) {
                await tx.tokenTransfer.create({
                    data: {
                        productTokenId: context.productToken.id,
                        fromAddress: context.supplierWallet,
                        toAddress: normalizedBuyerAddress,
                        quantity: context.quantity,
                        txHash: normalizedTxHash,
                        chainId,
                        type: client_1.TokenTransferType.TRANSFER,
                    },
                });
            }
        }
        return order;
    });
}
async function getUserOrders(userId) {
    const orders = await database_1.prisma.order.findMany({
        where: {
            userId: userId,
        },
        include: {
            supplier: {
                include: {
                    user: true,
                },
            },
            items: {
                include: {
                    product: {
                        include: {
                            supplier: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return orders;
}
//# sourceMappingURL=orderService.js.map