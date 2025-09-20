import { ReviewStatus } from '@prisma/client';
export interface CreateReviewInput {
    userId: string;
    productId?: string;
    supplierId?: string;
    orderId?: string;
    rating: number;
    comment?: string;
    images?: string[];
}
export declare function createReview(input: CreateReviewInput): Promise<{
    id: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    supplierId: string;
    status: import(".prisma/client").$Enums.ReviewStatus;
    productId: string | null;
    userId: string;
    rating: number;
    orderId: string | null;
    comment: string | null;
    moderatedBy: string | null;
    moderatedAt: Date | null;
}>;
export declare function getReviewsByProduct(productId: string): Promise<({
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
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    supplierId: string;
    status: import(".prisma/client").$Enums.ReviewStatus;
    productId: string | null;
    userId: string;
    rating: number;
    orderId: string | null;
    comment: string | null;
    moderatedBy: string | null;
    moderatedAt: Date | null;
})[]>;
export declare function getReviewsBySupplier(supplierId: string): Promise<({
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
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    supplierId: string;
    status: import(".prisma/client").$Enums.ReviewStatus;
    productId: string | null;
    userId: string;
    rating: number;
    orderId: string | null;
    comment: string | null;
    moderatedBy: string | null;
    moderatedAt: Date | null;
})[]>;
export declare function moderateReview(reviewId: string, status: ReviewStatus, moderatorId: string): Promise<{
    id: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    supplierId: string;
    status: import(".prisma/client").$Enums.ReviewStatus;
    productId: string | null;
    userId: string;
    rating: number;
    orderId: string | null;
    comment: string | null;
    moderatedBy: string | null;
    moderatedAt: Date | null;
}>;
//# sourceMappingURL=reviewService.d.ts.map