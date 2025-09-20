import { Request, Response } from 'express';
import { PaymentMethod } from '@prisma/client';
import { createOrder, getUserOrders } from '../services/orderService';

const parsePaymentMethod = (value: unknown): PaymentMethod => {
  if (!value) return PaymentMethod.CRYPTO;
  const candidate = String(value).toUpperCase();
  return (candidate in PaymentMethod ? PaymentMethod[candidate as keyof typeof PaymentMethod] : PaymentMethod.CRYPTO);
};

export const createOrderHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      supplierId,
      items,
      deliveryAddress,
      deliveryMethod,
      paymentMethod,
      transactionHash,
      chainId,
      buyerWalletAddress,
      paymentAmount,
      notes,
      currency,
      feeAmount,
    } = req.body;

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

    const parsedItems = items.map((item: any) => ({
      productId: String(item.productId),
      quantity: Number(item.quantity),
      unitPrice: item.unitPrice !== undefined ? Number(item.unitPrice) : undefined,
      productTokenId: item.productTokenId ? String(item.productTokenId) : undefined,
      metadata: item.metadata,
    }));

    const order = await createOrder({
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err instanceof Error ? err.message : err });
  }
};

export const getUserOrdersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const orders = await getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders', details: err instanceof Error ? err.message : err });
  }
};
