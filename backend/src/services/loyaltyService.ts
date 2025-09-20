import { prisma } from '../config/database';
import {
  LoyaltyTransactionType,
  LoyaltyTransactionSource,
  PaymentMethod,
} from '@prisma/client';

export async function getBuyerLoyaltyPoints(userId: string) {
  const entries = await prisma.loyaltyLedger.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
    include: {
      supplier: true,
      program: true,
    },
  });

  const balances = entries.reduce<Record<string, number>>((acc, entry) => {
    const current = acc[entry.supplierId] ?? 0;
    acc[entry.supplierId] = current + entry.points;
    return acc;
  }, {});

  return {
    balances,
    entries,
  };
}

export async function getSupplierLoyaltyProgram(supplierId: string) {
  return prisma.loyaltyProgram.findUnique({
    where: { supplierId },
  });
}

export async function setSupplierLoyaltyProgram(
  supplierId: string,
  earnRatePerToken: number,
  redeemValuePerPoint: number,
  description?: string,
) {
  if (earnRatePerToken <= 0 || redeemValuePerPoint <= 0) {
    throw new Error('Earn and redeem rates must be positive');
  }

  const existing = await prisma.loyaltyProgram.findUnique({ where: { supplierId } });

  if (existing) {
    return prisma.loyaltyProgram.update({
      where: { id: existing.id },
      data: {
        earnRatePerToken,
        redeemValuePerPoint,
        description,
        isActive: true,
      },
    });
  }

  return prisma.loyaltyProgram.create({
    data: {
      supplierId,
      name: 'Default Loyalty Program',
      earnRatePerToken,
      redeemValuePerPoint,
      description,
    },
  });
}

const getCurrentBalance = async (userId: string, supplierId: string) => {
  const latest = await prisma.loyaltyLedger.findFirst({
    where: { userId, supplierId },
    orderBy: { occurredAt: 'desc' },
  });
  return latest?.balanceAfter ?? 0;
};

export async function addLoyaltyPoints(
  userId: string,
  supplierId: string,
  loyaltyProgramId: string,
  amountSpent: number,
  paymentMethod: PaymentMethod = PaymentMethod.CRYPTO,
) {
  const program = await prisma.loyaltyProgram.findUnique({ where: { id: loyaltyProgramId } });
  if (!program || !program.isActive) return null;
  if (amountSpent <= 0) return null;

  const earnRate = Number(program.earnRatePerToken);
  if (earnRate <= 0) return null;

  const pointsEarned = Math.floor(amountSpent / earnRate);
  if (pointsEarned <= 0) return null;

  const previousBalance = await getCurrentBalance(userId, supplierId);
  const newBalance = previousBalance + pointsEarned;

  return prisma.loyaltyLedger.create({
    data: {
      userId,
      supplierId,
      loyaltyProgramId,
      type: LoyaltyTransactionType.EARN,
      source: LoyaltyTransactionSource.ORDER,
      points: pointsEarned,
      balanceAfter: newBalance,
      notes: `Earned from purchase using ${paymentMethod}`,
    },
  });
}

export async function redeemBuyerPoints(
  userId: string,
  supplierId: string,
  pointsToRedeem: number,
  referenceId?: string,
) {
  if (pointsToRedeem <= 0) throw new Error('Points to redeem must be positive');

  const program = await prisma.loyaltyProgram.findUnique({
    where: { supplierId },
  });
  if (!program || !program.isActive) throw new Error('Supplier loyalty program not found');

  const previousBalance = await getCurrentBalance(userId, supplierId);
  if (previousBalance < pointsToRedeem) {
    throw new Error('Not enough points');
  }

  const newBalance = previousBalance - pointsToRedeem;
  const redeemValue = Number(program.redeemValuePerPoint);
  const tokensRedeemed = Math.floor(pointsToRedeem * redeemValue);

  const ledgerEntry = await prisma.loyaltyLedger.create({
    data: {
      userId,
      supplierId,
      loyaltyProgramId: program.id,
      type: LoyaltyTransactionType.REDEEM,
      source: LoyaltyTransactionSource.ORDER,
      points: -pointsToRedeem,
      balanceAfter: newBalance,
      referenceId,
      notes: 'Redeemed for discounts or rewards',
    },
  });

  return {
    tokensRedeemed,
    ledgerEntry,
  };
}
