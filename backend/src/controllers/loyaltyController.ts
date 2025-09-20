import { Request, Response } from 'express';
import {
  getBuyerLoyaltyPoints,
  getSupplierLoyaltyProgram,
  setSupplierLoyaltyProgram,
  redeemBuyerPoints,
} from '../services/loyaltyService';

export const getBuyerLoyaltyPointsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buyerId } = req.params;
    if (!buyerId) {
      res.status(400).json({ error: 'buyerId is required' });
      return;
    }
    const points = await getBuyerLoyaltyPoints(buyerId);
    res.status(200).json(points);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get buyer loyalty points', details: err instanceof Error ? err.message : err });
  }
};

export const getSupplierLoyaltyProgramHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) {
      res.status(400).json({ error: 'supplierId is required' });
      return;
    }
    const program = await getSupplierLoyaltyProgram(supplierId);
    res.status(200).json(program);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get supplier loyalty program', details: err instanceof Error ? err.message : err });
  }
};

export const setSupplierLoyaltyProgramHandler = async (req: Request, res: Response): Promise<void> => {
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

    const program = await setSupplierLoyaltyProgram(
      supplierId,
      Number(earnRatePerToken),
      Number(redeemValuePerPoint),
      description ? String(description) : undefined,
    );
    res.status(200).json(program);
  } catch (err) {
    res.status(500).json({ error: 'Failed to set supplier loyalty program', details: err instanceof Error ? err.message : err });
  }
};

export const redeemBuyerPointsHandler = async (req: Request, res: Response): Promise<void> => {
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

    const result = await redeemBuyerPoints(String(buyerId), String(supplierId), Number(points), referenceId ? String(referenceId) : undefined);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to redeem points', details: err instanceof Error ? err.message : err });
  }
};
