import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const resolveArtifactsPath = () => {
  if (process.env.BLOCKCHAIN_ARTIFACTS_PATH) {
    return process.env.BLOCKCHAIN_ARTIFACTS_PATH;
  }
  const projectRoot = path.resolve(__dirname, '..', '..');
  return path.resolve(projectRoot, '..', 'blockchain', 'artifacts');
};

export const BLOCKCHAIN_CONFIG = {
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || process.env.POLYGON_RPC_URL || 'http://127.0.0.1:8545',
  chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || process.env.POLYGON_CHAIN_ID || '1337', 10),
  network: process.env.BLOCKCHAIN_NETWORK || 'hardhat',
  // rpcUrl: process.env.BLOCKCHAIN_RPC_URL || process.env.POLYGON_RPC_URL || 'https://rpc.cardona-testnet.polygon.technology',
  // chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || process.env.POLYGON_CHAIN_ID || '2442', 10),
  // network: process.env.BLOCKCHAIN_NETWORK || 'cardona',
  deployerPrivateKey: process.env.BLOCKCHAIN_DEPLOYER_KEY || process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  metadataBaseUrl: process.env.BLOCKCHAIN_METADATA_BASE_URL || 'https://metadata.agrichain.local',
  contractVersion: process.env.BLOCKCHAIN_CONTRACT_VERSION || '1.0.0',
  artifactsPath: resolveArtifactsPath(),
};

// ABI for AgriChainNFT contract
export const AGRICHAIN_NFT_ABI = [
  "function burnNFT(uint256 tokenId, uint256 amount, bytes32 signature, address user) external",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function isAuthorizedSupplier(address supplier) external view returns (bool)",
  "event NFTBurned(uint256 indexed tokenId, uint256 amount, address indexed user, address indexed supplier)"
];

// Contract address (will be updated after deployment)
export const AGRICHAIN_NFT_CONTRACT_ADDRESS = process.env.AGRICHAIN_NFT_CONTRACT_ADDRESS || '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1';

export const blockchainConfig = {
  rpcUrl: BLOCKCHAIN_CONFIG.rpcUrl,
  chainId: BLOCKCHAIN_CONFIG.chainId,
  network: BLOCKCHAIN_CONFIG.network,
  privateKey: BLOCKCHAIN_CONFIG.deployerPrivateKey,
  contractAddress: AGRICHAIN_NFT_CONTRACT_ADDRESS,
  abi: AGRICHAIN_NFT_ABI
};
