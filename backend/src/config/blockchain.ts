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
  deployerPrivateKey: process.env.BLOCKCHAIN_DEPLOYER_KEY || process.env.PRIVATE_KEY || '',
  metadataBaseUrl: process.env.BLOCKCHAIN_METADATA_BASE_URL || 'https://metadata.agrichain.local',
  contractVersion: process.env.BLOCKCHAIN_CONTRACT_VERSION || '1.0.0',
  artifactsPath: resolveArtifactsPath(),
};
