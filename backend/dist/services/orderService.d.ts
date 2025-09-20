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
//# sourceMappingURL=orderService.d.ts.map