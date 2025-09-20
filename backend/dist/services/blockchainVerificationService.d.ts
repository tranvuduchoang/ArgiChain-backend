import { ethers } from 'ethers';
export interface VerifiedTransfer {
    operator: string;
    from: string;
    to: string;
    id: string;
    value: string;
}
export interface TransferFetchParams {
    txHash: string;
    contractAddress: string;
}
export interface VerifyTransferParams extends TransferFetchParams {
    tokenId: string | number;
    quantity: string | number;
    expectedFrom?: string;
    expectedTo?: string;
}
export interface VerifyTransferResult {
    receipt: ethers.TransactionReceipt;
    transfer: VerifiedTransfer;
}
export interface TransfersInspectionResult {
    receipt: ethers.TransactionReceipt;
    transfers: VerifiedTransfer[];
}
export declare const fetchErc1155Transfers: (params: TransferFetchParams) => Promise<TransfersInspectionResult>;
export declare const verifyErc1155Transfer: (params: VerifyTransferParams) => Promise<VerifyTransferResult>;
//# sourceMappingURL=blockchainVerificationService.d.ts.map