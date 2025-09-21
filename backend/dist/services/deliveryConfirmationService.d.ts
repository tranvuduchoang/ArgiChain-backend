import { DeliveryStatus } from '@prisma/client';
export interface DeliveryConfirmationInput {
    orderId: string;
    userId: string;
    rating?: number;
    comment?: string;
    images?: string[];
    hasComplaint?: boolean;
    qualityRating?: 'Good' | 'Bad';
}
export interface DeliveryConfirmationResult {
    id: string;
    orderId: string;
    userId: string;
    status: DeliveryStatus;
    rating?: number;
    comment?: string;
    images: string[];
    hasComplaint: boolean;
    qualityRating?: string;
    nftBurnTxHash?: string;
    nftBurnStatus?: string;
    confirmedAt: Date;
}
export declare function confirmDelivery(input: DeliveryConfirmationInput): Promise<DeliveryConfirmationResult>;
export declare function burnNFT(orderId: string, userId: string): Promise<{
    txHash: string;
    status: string;
}>;
export declare function completeDeliveryConfirmation(orderId: string, userId: string): Promise<DeliveryConfirmationResult>;
export declare function getDeliveryConfirmation(orderId: string, userId: string): Promise<DeliveryConfirmationResult | null>;
export declare function getUserDeliveryConfirmations(userId: string): Promise<DeliveryConfirmationResult[]>;
//# sourceMappingURL=deliveryConfirmationService.d.ts.map