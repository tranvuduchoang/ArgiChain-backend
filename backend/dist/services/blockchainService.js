"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploySupplierContract = void 0;
const blockchainArtifacts_1 = require("../utils/blockchainArtifacts");
const ethers_1 = require("ethers");
const database_1 = require("../config/database");
const blockchain_1 = require("../config/blockchain");
const deploySupplierContract = async (input) => {
    if (!blockchain_1.BLOCKCHAIN_CONFIG.deployerPrivateKey) {
        throw new Error('Blockchain deployer private key is not configured');
    }
    const provider = new ethers_1.ethers.JsonRpcProvider(blockchain_1.BLOCKCHAIN_CONFIG.rpcUrl, blockchain_1.BLOCKCHAIN_CONFIG.chainId);
    const wallet = new ethers_1.ethers.Wallet(blockchain_1.BLOCKCHAIN_CONFIG.deployerPrivateKey, provider);
    const network = await provider.getNetwork();
    const artifact = (0, blockchainArtifacts_1.loadContractArtifact)('AgriChainNFT');
    const bytecode = artifact.bytecode;
    if (!bytecode) {
        throw new Error('AgriChainNFT artifact missing bytecode. Run hardhat compile.');
    }
    const baseUri = input.baseUri ?? `${blockchain_1.BLOCKCHAIN_CONFIG.metadataBaseUrl}/products/${input.supplierId}/`;
    const contractUri = input.contractUri ?? `${blockchain_1.BLOCKCHAIN_CONFIG.metadataBaseUrl}/contracts/${input.supplierId}`;
    const factory = new ethers_1.ethers.ContractFactory(artifact.abi, bytecode, wallet);
    const contract = await factory.deploy(baseUri, contractUri);
    const deploymentTx = contract.deploymentTransaction();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    const contractInterface = new ethers_1.ethers.Interface(artifact.abi);
    const supplierAddress = String(input.supplierAddress);
    const authorizeTx = await wallet.sendTransaction({
        to: contractAddress,
        data: contractInterface.encodeFunctionData('authorizeSupplier', [supplierAddress]),
    });
    await authorizeTx.wait();
    await database_1.prisma.$transaction(async (tx) => {
        await tx.smartContractTemplate.updateMany({
            where: {
                supplierId: input.supplierId,
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });
        await tx.smartContractTemplate.create({
            data: {
                supplierId: input.supplierId,
                name: input.name ?? 'AgriChain Product NFT',
                description: input.description,
                contractType: 'ERC1155',
                contractAddress,
                networkChainId: Number(network.chainId),
                abi: artifact.abi,
                bytecode,
                version: blockchain_1.BLOCKCHAIN_CONFIG.contractVersion,
                isActive: true,
            },
        });
    });
    return {
        contractAddress,
        transactionHash: deploymentTx?.hash ?? authorizeTx.hash,
        chainId: Number(network.chainId),
        networkName: network.name,
    };
};
exports.deploySupplierContract = deploySupplierContract;
//# sourceMappingURL=blockchainService.js.map