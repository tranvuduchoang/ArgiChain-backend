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
  rpcUrl: process.env.BNBTESTNET_URL || process.env.BLOCKCHAIN_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
  chainId: parseInt(process.env.BSC_CHAIN_ID || process.env.BLOCKCHAIN_CHAIN_ID || '97', 10),
  network: process.env.BLOCKCHAIN_NETWORK || 'bsctestnet',
  deployerPrivateKey: process.env.BLOCKCHAIN_DEPLOYER_KEY || process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  metadataBaseUrl: process.env.NFT_BASE_URI || process.env.BLOCKCHAIN_METADATA_BASE_URL || 'https://metadata.agrichain.local',
  contractVersion: process.env.BLOCKCHAIN_CONTRACT_VERSION || '1.0.0',
  artifactsPath: resolveArtifactsPath(),
};

// ABI for AgriChainNFT contract
export const AGRICHAIN_NFT_ABI = [
  "function mintProductNFT(uint256 amount, string memory name, string memory description, string memory category, uint256 price, uint256 quantity, string memory unit, bool isOrganic, uint256 harvestDate, string memory location, string memory metadata) external",
  "function burnProductNFT(uint256 tokenId, uint256 amount, string memory reason) external",
  "function burnNFT(uint256 tokenId, uint256 amount, bytes32 signature, address user) external",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function isAuthorizedSupplier(address supplier) external view returns (bool)",
  "function getProductInfo(uint256 tokenId) external view returns (tuple(string name, string description, string category, address supplier, uint256 price, uint256 quantity, string unit, bool isOrganic, uint256 harvestDate, string location, string metadata, bool isActive))",
  "event ProductNFTMinted(uint256 indexed tokenId, address indexed supplier, uint256 amount, string productName, string metadata)",
  "event ProductNFTBurned(uint256 indexed tokenId, address indexed owner, uint256 amount, string reason)",
  "event NFTBurned(uint256 indexed tokenId, uint256 amount, address indexed user, address indexed supplier)"
];

// Contract address (will be updated after deployment)
export const AGRICHAIN_NFT_CONTRACT_ADDRESS = process.env.AGRICHAIN_NFT_ADDRESS || '0x0124b7D07Ebd0E9EDaACCdD126375671c3506f70';

export const blockchainConfig = {
  rpcUrl: BLOCKCHAIN_CONFIG.rpcUrl,
  chainId: BLOCKCHAIN_CONFIG.chainId,
  network: BLOCKCHAIN_CONFIG.network,
  privateKey: BLOCKCHAIN_CONFIG.deployerPrivateKey,
  contractAddress: AGRICHAIN_NFT_CONTRACT_ADDRESS,
  abi: AGRICHAIN_NFT_ABI
};
