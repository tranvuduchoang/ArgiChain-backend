"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuyerLoyaltyPoints = getBuyerLoyaltyPoints;
exports.getSupplierLoyaltyProgram = getSupplierLoyaltyProgram;
exports.setSupplierLoyaltyProgram = setSupplierLoyaltyProgram;
exports.addLoyaltyPoints = addLoyaltyPoints;
exports.redeemBuyerPoints = redeemBuyerPoints;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
async function getBuyerLoyaltyPoints(userId) {
    const entries = await database_1.prisma.loyaltyLedger.findMany({
        where: { userId },
        orderBy: { occurredAt: 'desc' },
        include: {
            supplier: true,
            program: true,
        },
    });
    const balances = entries.reduce((acc, entry) => {
        const current = acc[entry.supplierId] ?? 0;
        acc[entry.supplierId] = current + entry.points;
        return acc;
    }, {});
    return {
        balances,
        entries,
    };
}
async function getSupplierLoyaltyProgram(supplierId) {
    return database_1.prisma.loyaltyProgram.findUnique({
        where: { supplierId },
    });
}
async function setSupplierLoyaltyProgram(supplierId, earnRatePerToken, redeemValuePerPoint, description) {
    if (earnRatePerToken <= 0 || redeemValuePerPoint <= 0) {
        throw new Error('Earn and redeem rates must be positive');
    }
    const existing = await database_1.prisma.loyaltyProgram.findUnique({ where: { supplierId } });
    if (existing) {
        return database_1.prisma.loyaltyProgram.update({
            where: { id: existing.id },
            data: {
                earnRatePerToken,
                redeemValuePerPoint,
                description,
                isActive: true,
            },
        });
    }
    return database_1.prisma.loyaltyProgram.create({
        data: {
            supplierId,
            name: 'Default Loyalty Program',
            earnRatePerToken,
            redeemValuePerPoint,
            description,
        },
    });
}
const getCurrentBalance = async (userId, supplierId) => {
    const latest = await database_1.prisma.loyaltyLedger.findFirst({
        where: { userId, supplierId },
        orderBy: { occurredAt: 'desc' },
    });
    return latest?.balanceAfter ?? 0;
};
async function addLoyaltyPoints(userId, supplierId, loyaltyProgramId, amountSpent, paymentMethod = client_1.PaymentMethod.CRYPTO) {
    const program = await database_1.prisma.loyaltyProgram.findUnique({ where: { id: loyaltyProgramId } });
    if (!program || !program.isActive)
        return null;
    if (amountSpent <= 0)
        return null;
    const earnRate = Number(program.earnRatePerToken);
    if (earnRate <= 0)
        return null;
    const pointsEarned = Math.floor(amountSpent / earnRate);
    if (pointsEarned <= 0)
        return null;
    const previousBalance = await getCurrentBalance(userId, supplierId);
    const newBalance = previousBalance + pointsEarned;
    return database_1.prisma.loyaltyLedger.create({
        data: {
            userId,
            supplierId,
            loyaltyProgramId,
            type: client_1.LoyaltyTransactionType.EARN,
            source: client_1.LoyaltyTransactionSource.ORDER,
            points: pointsEarned,
            balanceAfter: newBalance,
            notes: `Earned from purchase using ${paymentMethod}`,
        },
    });
}
async function redeemBuyerPoints(userId, supplierId, pointsToRedeem, referenceId) {
    if (pointsToRedeem <= 0)
        throw new Error('Points to redeem must be positive');
    const program = await database_1.prisma.loyaltyProgram.findUnique({
        where: { supplierId },
    });
    if (!program || !program.isActive)
        throw new Error('Supplier loyalty program not found');
    const previousBalance = await getCurrentBalance(userId, supplierId);
    if (previousBalance < pointsToRedeem) {
        throw new Error('Not enough points');
    }
    const newBalance = previousBalance - pointsToRedeem;
    const redeemValue = Number(program.redeemValuePerPoint);
    const tokensRedeemed = Math.floor(pointsToRedeem * redeemValue);
    const ledgerEntry = await database_1.prisma.loyaltyLedger.create({
        data: {
            userId,
            supplierId,
            loyaltyProgramId: program.id,
            type: client_1.LoyaltyTransactionType.REDEEM,
            source: client_1.LoyaltyTransactionSource.ORDER,
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
//# sourceMappingURL=loyaltyService.js.map