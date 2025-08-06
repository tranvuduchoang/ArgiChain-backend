import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Buyer xem điểm
export async function getBuyerLoyaltyPoints(buyerId: number) {
  return prisma.loyaltyPoint.findMany({ where: { buyerId } });
}

// Supplier xem chương trình điểm thưởng
export async function getSupplierLoyaltyProgram(supplierId: number) {
  return prisma.loyaltyProgram.findUnique({ where: { supplierId } });
}

// Supplier cấu hình chương trình điểm thưởng
export async function setSupplierLoyaltyProgram(supplierId: number, earnRate: number, redeemRate: number) {
  return prisma.loyaltyProgram.upsert({
    where: { supplierId },
    update: { earnRate, redeemRate },
    create: { supplierId, earnRate, redeemRate },
  });
}

// Buyer đổi điểm lấy ưu đãi
export async function redeemBuyerPoints(buyerId: number, supplierId: number, points: number) {
  // Lấy chương trình điểm thưởng
  const program = await prisma.loyaltyProgram.findUnique({ where: { supplierId } });
  if (!program) throw new Error('Supplier loyalty program not found');
  // Lấy điểm hiện có
  const loyalty = await prisma.loyaltyPoint.findUnique({ where: { buyerId_supplierId: { buyerId, supplierId } } });
  if (!loyalty || loyalty.points < points) throw new Error('Not enough points');
  // Tính số token được đổi
  const tokens = Math.floor(points / program.redeemRate);
  // Trừ điểm
  await prisma.loyaltyPoint.update({
    where: { buyerId_supplierId: { buyerId, supplierId } },
    data: { points: { decrement: points } },
  });
  // TODO: Gọi smart contract chuyển token thưởng (mock)
  return { tokensRedeemed: tokens };
}

// Hàm cộng điểm cho buyer khi mua hàng (gọi từ orderService)
export async function addLoyaltyPoints(buyerId: number, supplierId: number, amount: number) {
  // Lấy chương trình điểm thưởng
  const program = await prisma.loyaltyProgram.findUnique({ where: { supplierId } });
  if (!program) return;
  const points = Math.floor(amount / program.earnRate);
  if (points <= 0) return;
  await prisma.loyaltyPoint.upsert({
    where: { buyerId_supplierId: { buyerId, supplierId } },
    update: { points: { increment: points } },
    create: { buyerId, supplierId, points },
  });
}