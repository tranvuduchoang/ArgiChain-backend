export interface DeploySupplierContractInput {
    supplierId: string;
    supplierAddress: string;
    baseUri?: string;
    contractUri?: string;
    name?: string;
    description?: string;
}
export interface DeploySupplierContractResult {
    contractAddress: string;
    transactionHash: string;
    chainId: number;
    networkName: string;
}
export declare const deploySupplierContract: (input: DeploySupplierContractInput) => Promise<DeploySupplierContractResult>;
//# sourceMappingURL=blockchainService.d.ts.map