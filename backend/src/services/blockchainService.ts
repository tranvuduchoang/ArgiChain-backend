import { loadContractArtifact } from '../utils/blockchainArtifacts';
import { ethers } from 'ethers';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';

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

export const deploySupplierContract = async (
  input: DeploySupplierContractInput,
): Promise<DeploySupplierContractResult> => {
  if (!BLOCKCHAIN_CONFIG.deployerPrivateKey) {
    throw new Error('Blockchain deployer private key is not configured');
  }

  const provider = new ethers.JsonRpcProvider(
    BLOCKCHAIN_CONFIG.rpcUrl,
    BLOCKCHAIN_CONFIG.chainId,
  );
  const wallet = new ethers.Wallet(BLOCKCHAIN_CONFIG.deployerPrivateKey, provider);
  const network = await provider.getNetwork();

  const artifact = loadContractArtifact('AgriChainNFT');
  const bytecode = artifact.bytecode;
  if (!bytecode) {
    throw new Error('AgriChainNFT artifact missing bytecode. Run hardhat compile.');
  }

  const baseUri = input.baseUri ?? `${BLOCKCHAIN_CONFIG.metadataBaseUrl}/products/${input.supplierId}/`;
  const contractUri = input.contractUri ?? `${BLOCKCHAIN_CONFIG.metadataBaseUrl}/contracts/${input.supplierId}`;

  const factory = new ethers.ContractFactory(
    artifact.abi as ethers.InterfaceAbi,
    bytecode,
    wallet,
  );

  const contract = await factory.deploy(baseUri, contractUri);
  const deploymentTx = contract.deploymentTransaction();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  const contractInterface = new ethers.Interface(artifact.abi as ethers.InterfaceAbi);
  const supplierAddress = String(input.supplierAddress);
  const authorizeTx = await wallet.sendTransaction({
    to: contractAddress,
    data: contractInterface.encodeFunctionData('authorizeSupplier', [supplierAddress]),
  });
  await authorizeTx.wait();

  await prisma.$transaction(async (tx) => {
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
        abi: artifact.abi as Prisma.InputJsonValue,
        bytecode,
        version: BLOCKCHAIN_CONFIG.contractVersion,
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
