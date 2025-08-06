import { Request, Response } from 'express';
import { createOrder } from '../services/orderService';

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { buyerId, productId, quantity, deliveryAddress } = req.body;
    if (!buyerId || !productId || !quantity || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const order = await createOrder({
      buyerId: Number(buyerId),
      productId: Number(productId),
      quantity: Number(quantity),
      deliveryAddress,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err instanceof Error ? err.message : err });
  }
};