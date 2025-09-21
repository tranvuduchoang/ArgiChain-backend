import { Prisma, PaymentMethod } from '@prisma/client';
export interface CreateOrderItemInput {
    productId: string;
    quantity: number;
    unitPrice?: number;
    productTokenId?: string;
    metadata?: Record<string, unknown>;
}
export interface CreateOrderInput {
    userId: string;
    supplierId: string;
    transactionHash: string;
    chainId: number;
    buyerWalletAddress: string;
    items: CreateOrderItemInput[];
    deliveryAddress: string;
    deliveryMethod: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    currency?: string;
    feeAmount?: number;
    paymentAmount?: number;
}
export declare function createOrder(input: CreateOrderInput): Promise<{
    items: {
        id: string;
        createdAt: Date;
        productId: string;
        productTokenId: string | null;
        quantity: number;
        metadata: Prisma.JsonValue | null;
        unitPrice: Prisma.Decimal;
        totalPrice: Prisma.Decimal;
        orderId: string;
    }[];
} & {
    id: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    supplierId: string;
    status: import(".prisma/client").$Enums.OrderStatus;
    userId: string;
    transactionHash: string | null;
    orderNumber: string;
    deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    subtotalAmount: Prisma.Decimal;
    feeAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    deliveryAddress: string;
    deliveryMethod: string;
    expectedFulfillment: Date | null;
    fulfilledAt: Date | null;
    cancelledAt: Date | null;
    cancelReason: string | null;
    notes: string | null;
}>;
export declare function getUserOrders(userId: string): Promise<({
    supplier: {
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            username: string;
            walletAddress: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatar: string | null;
            phone: string | null;
            address: string | null;
            isSupplier: boolean;
            isVerified: boolean;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
        };
    } & {
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
        socialLinks: Prisma.JsonValue | null;
        rating: number;
        totalSales: number;
    };
    items: ({
        product: {
            supplier: {
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    username: string;
                    walletAddress: string;
                    role: import(".prisma/client").$Enums.UserRole;
                    avatar: string | null;
                    phone: string | null;
                    address: string | null;
                    isSupplier: boolean;
                    isVerified: boolean;
                    kycStatus: import(".prisma/client").$Enums.KycStatus;
                };
            } & {
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
                socialLinks: Prisma.JsonValue | null;
                rating: number;
                totalSales: number;
            };
        } & {
            id: string;
            name: string;
            description: string;
            category: string;
            tags: string[];
            pricingModel: import(".prisma/client").$Enums.PricingModel;
            pricePerUnit: Prisma.Decimal;
            currency: string;
            totalSupply: number;
            availableSupply: number;
            unit: string;
            metadataCid: string | null;
            metadataUrl: string | null;
            contractAddress: string | null;
            nftTokenId: string | null;
            mintTxHash: string | null;
            mintedAt: Date | null;
            harvestDate: Date | null;
            expiryDate: Date | null;
            qualityCertifications: string[];
            storageConditions: string | null;
            images: string[];
            isOrganic: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            supplierId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        productTokenId: string | null;
        quantity: number;
        metadata: Prisma.JsonValue | null;
        unitPrice: Prisma.Decimal;
        totalPrice: Prisma.Decimal;
        orderId: string;
    })[];
} & {
    id: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    supplierId: string;
    status: import(".prisma/client").$Enums.OrderStatus;
    userId: string;
    transactionHash: string | null;
    orderNumber: string;
    deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    subtotalAmount: Prisma.Decimal;
    feeAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    deliveryAddress: string;
    deliveryMethod: string;
    expectedFulfillment: Date | null;
    fulfilledAt: Date | null;
    cancelledAt: Date | null;
    cancelReason: string | null;
    notes: string | null;
})[]>;
//# sourceMappingURL=orderService.d.ts.map