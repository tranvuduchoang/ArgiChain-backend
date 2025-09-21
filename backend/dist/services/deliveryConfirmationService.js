"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmDelivery = confirmDelivery;
exports.burnNFT = burnNFT;
exports.completeDeliveryConfirmation = completeDeliveryConfirmation;
exports.getDeliveryConfirmation = getDeliveryConfirmation;
exports.getUserDeliveryConfirmations = getUserDeliveryConfirmations;
const client_1 = require("@prisma/client");
const ethers_1 = require("ethers");
const blockchain_1 = require("../config/blockchain");
const prisma = new client_1.PrismaClient();
async function confirmDelivery(input) {
    const { orderId, userId, rating, comment, images = [], hasComplaint = false, qualityRating } = input;
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId: userId,
            status: client_1.OrderStatus.PAID
        },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });
    if (!order) {
        throw new Error('Order not found or not delivered');
    }
    const existingConfirmation = await prisma.deliveryConfirmation.findUnique({
        where: {
            orderId_userId: {
                orderId,
                userId
            }
        }
    });
    if (existingConfirmation) {
        throw new Error('Delivery already confirmed');
    }
    const deliveryConfirmation = await prisma.deliveryConfirmation.create({
        data: {
            orderId,
            userId,
            status: client_1.DeliveryStatus.CONFIRMED,
            rating,
            comment,
            images,
            hasComplaint,
            qualityRating,
            nftBurnStatus: 'PENDING'
        }
    });
    await prisma.order.update({
        where: { id: orderId },
        data: { deliveryStatus: client_1.DeliveryStatus.CONFIRMED }
    });
    return {
        id: deliveryConfirmation.id,
        orderId: deliveryConfirmation.orderId,
        userId: deliveryConfirmation.userId,
        status: deliveryConfirmation.status,
        rating: deliveryConfirmation.rating || undefined,
        comment: deliveryConfirmation.comment || undefined,
        images: deliveryConfirmation.images,
        hasComplaint: deliveryConfirmation.hasComplaint,
        qualityRating: deliveryConfirmation.qualityRating || undefined,
        nftBurnTxHash: deliveryConfirmation.nftBurnTxHash || undefined,
        nftBurnStatus: deliveryConfirmation.nftBurnStatus || undefined,
        confirmedAt: deliveryConfirmation.confirmedAt
    };
}
async function burnNFT(orderId, userId) {
    const deliveryConfirmation = await prisma.deliveryConfirmation.findUnique({
        where: {
            orderId_userId: {
                orderId,
                userId
            }
        },
        include: {
            order: {
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        }
    });
    if (!deliveryConfirmation) {
        throw new Error('Delivery confirmation not found');
    }
    if (deliveryConfirmation.nftBurnStatus === 'SUCCESS') {
        throw new Error('NFT already burned');
    }
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(blockchain_1.blockchainConfig.rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(blockchain_1.blockchainConfig.privateKey, provider);
        const contract = new ethers_1.ethers.Contract(blockchain_1.blockchainConfig.contractAddress, blockchain_1.blockchainConfig.abi, wallet);
        const orderItems = deliveryConfirmation.order.items;
        if (orderItems.length === 0) {
            throw new Error('No items found in order');
        }
        const firstItem = orderItems[0];
        const product = firstItem.product;
        if (!product.contractAddress || !product.nftTokenId) {
            throw new Error('Product not minted as NFT');
        }
        const tokenId = parseInt(product.nftTokenId);
        const amount = firstItem.quantity;
        const messageHash = ethers_1.ethers.keccak256(ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['uint256', 'uint256', 'address', 'uint256'], [tokenId, amount, userId, Math.floor(Date.now() / 1000)]));
        const tx = await contract.burnNFT(tokenId, amount, messageHash, userId);
        const receipt = await tx.wait();
        await prisma.deliveryConfirmation.update({
            where: { id: deliveryConfirmation.id },
            data: {
                nftBurnTxHash: receipt.hash,
                nftBurnStatus: 'SUCCESS'
            }
        });
        return {
            txHash: receipt.hash,
            status: 'SUCCESS'
        };
    }
    catch (error) {
        await prisma.deliveryConfirmation.update({
            where: { id: deliveryConfirmation.id },
            data: {
                nftBurnStatus: 'FAILED'
            }
        });
        throw new Error(`Failed to burn NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function completeDeliveryConfirmation(orderId, userId) {
    const deliveryConfirmation = await prisma.deliveryConfirmation.findUnique({
        where: {
            orderId_userId: {
                orderId,
                userId
            }
        }
    });
    if (!deliveryConfirmation) {
        throw new Error('Delivery confirmation not found');
    }
    if (deliveryConfirmation.status === client_1.DeliveryStatus.COMPLETED) {
        throw new Error('Delivery confirmation already completed');
    }
    const updatedConfirmation = await prisma.deliveryConfirmation.update({
        where: { id: deliveryConfirmation.id },
        data: { status: client_1.DeliveryStatus.COMPLETED }
    });
    await prisma.order.update({
        where: { id: orderId },
        data: { deliveryStatus: client_1.DeliveryStatus.COMPLETED }
    });
    return {
        id: updatedConfirmation.id,
        orderId: updatedConfirmation.orderId,
        userId: updatedConfirmation.userId,
        status: updatedConfirmation.status,
        rating: updatedConfirmation.rating || undefined,
        comment: updatedConfirmation.comment || undefined,
        images: updatedConfirmation.images,
        hasComplaint: updatedConfirmation.hasComplaint,
        qualityRating: updatedConfirmation.qualityRating || undefined,
        nftBurnTxHash: updatedConfirmation.nftBurnTxHash || undefined,
        nftBurnStatus: updatedConfirmation.nftBurnStatus || undefined,
        confirmedAt: updatedConfirmation.confirmedAt
    };
}
async function getDeliveryConfirmation(orderId, userId) {
    const deliveryConfirmation = await prisma.deliveryConfirmation.findUnique({
        where: {
            orderId_userId: {
                orderId,
                userId
            }
        }
    });
    if (!deliveryConfirmation) {
        return null;
    }
    return {
        id: deliveryConfirmation.id,
        orderId: deliveryConfirmation.orderId,
        userId: deliveryConfirmation.userId,
        status: deliveryConfirmation.status,
        rating: deliveryConfirmation.rating || undefined,
        comment: deliveryConfirmation.comment || undefined,
        images: deliveryConfirmation.images,
        hasComplaint: deliveryConfirmation.hasComplaint,
        qualityRating: deliveryConfirmation.qualityRating || undefined,
        nftBurnTxHash: deliveryConfirmation.nftBurnTxHash || undefined,
        nftBurnStatus: deliveryConfirmation.nftBurnStatus || undefined,
        confirmedAt: deliveryConfirmation.confirmedAt
    };
}
async function getUserDeliveryConfirmations(userId) {
    const deliveryConfirmations = await prisma.deliveryConfirmation.findMany({
        where: { userId },
        orderBy: { confirmedAt: 'desc' }
    });
    return deliveryConfirmations.map(dc => ({
        id: dc.id,
        orderId: dc.orderId,
        userId: dc.userId,
        status: dc.status,
        rating: dc.rating || undefined,
        comment: dc.comment || undefined,
        images: dc.images,
        hasComplaint: dc.hasComplaint,
        qualityRating: dc.qualityRating || undefined,
        nftBurnTxHash: dc.nftBurnTxHash || undefined,
        nftBurnStatus: dc.nftBurnStatus || undefined,
        confirmedAt: dc.confirmedAt
    }));
}
//# sourceMappingURL=deliveryConfirmationService.js.map