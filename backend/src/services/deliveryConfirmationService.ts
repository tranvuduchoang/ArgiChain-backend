import { PrismaClient, DeliveryStatus, OrderStatus } from '@prisma/client';
import { ethers } from 'ethers';
import { blockchainConfig } from '../config/blockchain';

const prisma = new PrismaClient();

export interface DeliveryConfirmationInput {
  orderId: string;
  userId: string;
  rating?: number;
  comment?: string;
  images?: string[];
  hasComplaint?: boolean;
  qualityRating?: 'Good' | 'Bad';
}

export interface DeliveryConfirmationResult {
  id: string;
  orderId: string;
  userId: string;
  status: DeliveryStatus;
  rating?: number;
  comment?: string;
  images: string[];
  hasComplaint: boolean;
  qualityRating?: string;
  nftBurnTxHash?: string;
  nftBurnStatus?: string;
  confirmedAt: Date;
}

/**
 * Confirm delivery and create delivery confirmation record
 */
export async function confirmDelivery(input: DeliveryConfirmationInput): Promise<DeliveryConfirmationResult> {
  const { orderId, userId, rating, comment, images = [], hasComplaint = false, qualityRating } = input;

  // Validate order exists and belongs to user
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: userId,
      status: OrderStatus.PAID  // Orders are PAID when user wants to confirm delivery
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

  // Check if delivery confirmation already exists
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

  // Create delivery confirmation
  const deliveryConfirmation = await prisma.deliveryConfirmation.create({
    data: {
      orderId,
      userId,
      status: DeliveryStatus.CONFIRMED,
      rating,
      comment,
      images,
      hasComplaint,
      qualityRating,
      nftBurnStatus: 'PENDING'
    }
  });

  // Update order delivery status
  await prisma.order.update({
    where: { id: orderId },
    data: { deliveryStatus: DeliveryStatus.CONFIRMED }
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

/**
 * Burn NFT after delivery confirmation
 */
export async function burnNFT(orderId: string, userId: string): Promise<{ txHash: string; status: string }> {
  // Get delivery confirmation
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
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
    const wallet = new ethers.Wallet(blockchainConfig.privateKey, provider);
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.abi,
      wallet
    );

    // Get NFT details from order items
    const orderItems = deliveryConfirmation.order.items;
    if (orderItems.length === 0) {
      throw new Error('No items found in order');
    }

    // For simplicity, we'll burn the first item's NFT
    const firstItem = orderItems[0];
    const product = firstItem.product;
    
    if (!product.contractAddress || !product.nftTokenId) {
      throw new Error('Product not minted as NFT');
    }

    const tokenId = parseInt(product.nftTokenId);
    const amount = firstItem.quantity;

    // Create signature for burn verification
    const messageHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256', 'uint256', 'address', 'uint256'],
        [tokenId, amount, userId, Math.floor(Date.now() / 1000)]
      )
    );

    // Call burnNFT function
    const tx = await contract.burnNFT(
      tokenId,
      amount,
      messageHash,
      userId
    );

    const receipt = await tx.wait();

    // Update delivery confirmation with burn transaction details
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

  } catch (error) {
    // Update delivery confirmation with error status
    await prisma.deliveryConfirmation.update({
      where: { id: deliveryConfirmation.id },
      data: {
        nftBurnStatus: 'FAILED'
      }
    });

    throw new Error(`Failed to burn NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Complete delivery confirmation process
 */
export async function completeDeliveryConfirmation(orderId: string, userId: string): Promise<DeliveryConfirmationResult> {
  // Get delivery confirmation
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

  if (deliveryConfirmation.status === DeliveryStatus.COMPLETED) {
    throw new Error('Delivery confirmation already completed');
  }

  // Update status to completed
  const updatedConfirmation = await prisma.deliveryConfirmation.update({
    where: { id: deliveryConfirmation.id },
    data: { status: DeliveryStatus.COMPLETED }
  });

  // Update order delivery status
  await prisma.order.update({
    where: { id: orderId },
    data: { deliveryStatus: DeliveryStatus.COMPLETED }
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

/**
 * Get delivery confirmation by order ID and user ID
 */
export async function getDeliveryConfirmation(orderId: string, userId: string): Promise<DeliveryConfirmationResult | null> {
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

/**
 * Get all delivery confirmations for a user
 */
export async function getUserDeliveryConfirmations(userId: string): Promise<DeliveryConfirmationResult[]> {
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
