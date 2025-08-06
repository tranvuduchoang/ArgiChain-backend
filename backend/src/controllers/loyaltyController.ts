import { Request, Response } from 'express';
import { getBuyerLoyaltyPoints, getSupplierLoyaltyProgram, setSupplierLoyaltyProgram, redeemBuyerPoints } from '../services/loyaltyService';

export const getBuyerLoyaltyPointsHandler = async (req: Request, res: Response) => {
  try {
    const buyerId = Number(req.params.buyerId);
    const points = await getBuyerLoyaltyPoints(buyerId);
    res.status(200).json(points);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get buyer loyalty points', details: err instanceof Error ? err.message : err });
  }
};

export const getSupplierLoyaltyProgramHandler = async (req: Request, res: Response) => {
  try {
    const supplierId = Number(req.params.supplierId);
    const program = await getSupplierLoyaltyProgram(supplierId);
    res.status(200).json(program);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get supplier loyalty program', details: err instanceof Error ? err.message : err });
  }
};

export const setSupplierLoyaltyProgramHandler = async (req: Request, res: Response) => {
  try {
    const supplierId = Number(req.params.supplierId);
    const { earnRate, redeemRate } = req.body;
    if (!earnRate || !redeemRate) return res.status(400).json({ error: 'Missing earnRate or redeemRate' });
    const program = await setSupplierLoyaltyProgram(supplierId, Number(earnRate), Number(redeemRate));
    res.status(200).json(program);
  } catch (err) {
    res.status(500).json({ error: 'Failed to set supplier loyalty program', details: err instanceof Error ? err.message : err });
  }
};

export const redeemBuyerPointsHandler = async (req: Request, res: Response) => {
  try {
    const buyerId = Number(req.params.buyerId);
    const { supplierId, points } = req.body;
    if (!supplierId || !points) return res.status(400).json({ error: 'Missing supplierId or points' });
    const result = await redeemBuyerPoints(buyerId, Number(supplierId), Number(points));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to redeem points', details: err instanceof Error ? err.message : err });
  }
};