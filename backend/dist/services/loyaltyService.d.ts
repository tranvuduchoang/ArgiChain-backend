import { PaymentMethod } from '@prisma/client';
export declare function getBuyerLoyaltyPoints(userId: string): Promise<{
    balances: Record<string, number>;
    entries: ({
        supplier: {
            id: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            userId: string;
            businessName: string;
            logo: string | null;
            coverImage: string | null;
            website: string | null;
            location: string | null;
            contactEmail: string | null;
            contactPhone: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            rating: number;
            totalSales: number;
        };
        program: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            supplierId: string;
            earnRatePerToken: import("@prisma/client/runtime/library").Decimal;
            redeemValuePerPoint: import("@prisma/client/runtime/library").Decimal;
            tierConfiguration: import("@prisma/client/runtime/library").JsonValue | null;
            expirationDays: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        supplierId: string;
        userId: string;
        type: import(".prisma/client").$Enums.LoyaltyTransactionType;
        occurredAt: Date;
        notes: string | null;
        loyaltyProgramId: string;
        source: import(".prisma/client").$Enums.LoyaltyTransactionSource;
        points: number;
        balanceAfter: number;
        referenceId: string | null;
        expiresAt: Date | null;
    })[];
}>;
export declare function getSupplierLoyaltyProgram(supplierId: string): Promise<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    supplierId: string;
    earnRatePerToken: import("@prisma/client/runtime/library").Decimal;
    redeemValuePerPoint: import("@prisma/client/runtime/library").Decimal;
    tierConfiguration: import("@prisma/client/runtime/library").JsonValue | null;
    expirationDays: number | null;
} | null>;
export declare function setSupplierLoyaltyProgram(supplierId: string, earnRatePerToken: number, redeemValuePerPoint: number, description?: string): Promise<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    supplierId: string;
    earnRatePerToken: import("@prisma/client/runtime/library").Decimal;
    redeemValuePerPoint: import("@prisma/client/runtime/library").Decimal;
    tierConfiguration: import("@prisma/client/runtime/library").JsonValue | null;
    expirationDays: number | null;
}>;
export declare function addLoyaltyPoints(userId: string, supplierId: string, loyaltyProgramId: string, amountSpent: number, paymentMethod?: PaymentMethod): Promise<{
    id: string;
    createdAt: Date;
    supplierId: string;
    userId: string;
    type: import(".prisma/client").$Enums.LoyaltyTransactionType;
    occurredAt: Date;
    notes: string | null;
    loyaltyProgramId: string;
    source: import(".prisma/client").$Enums.LoyaltyTransactionSource;
    points: number;
    balanceAfter: number;
    referenceId: string | null;
    expiresAt: Date | null;
} | null>;
export declare function redeemBuyerPoints(userId: string, supplierId: string, pointsToRedeem: number, referenceId?: string): Promise<{
    tokensRedeemed: number;
    ledgerEntry: {
        id: string;
        createdAt: Date;
        supplierId: string;
        userId: string;
        type: import(".prisma/client").$Enums.LoyaltyTransactionType;
        occurredAt: Date;
        notes: string | null;
        loyaltyProgramId: string;
        source: import(".prisma/client").$Enums.LoyaltyTransactionSource;
        points: number;
        balanceAfter: number;
        referenceId: string | null;
        expiresAt: Date | null;
    };
}>;
//# sourceMappingURL=loyaltyService.d.ts.map