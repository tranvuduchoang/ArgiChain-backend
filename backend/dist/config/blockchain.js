"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOCKCHAIN_CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const resolveArtifactsPath = () => {
    if (process.env.BLOCKCHAIN_ARTIFACTS_PATH) {
        return process.env.BLOCKCHAIN_ARTIFACTS_PATH;
    }
    const projectRoot = path_1.default.resolve(__dirname, '..', '..');
    return path_1.default.resolve(projectRoot, '..', 'blockchain', 'artifacts');
};
exports.BLOCKCHAIN_CONFIG = {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || process.env.POLYGON_RPC_URL || 'http://127.0.0.1:8545',
    chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || process.env.POLYGON_CHAIN_ID || '1337', 10),
    network: process.env.BLOCKCHAIN_NETWORK || 'hardhat',
    deployerPrivateKey: process.env.BLOCKCHAIN_DEPLOYER_KEY || process.env.PRIVATE_KEY || '',
    metadataBaseUrl: process.env.BLOCKCHAIN_METADATA_BASE_URL || 'https://metadata.agrichain.local',
    contractVersion: process.env.BLOCKCHAIN_CONTRACT_VERSION || '1.0.0',
    artifactsPath: resolveArtifactsPath(),
};
//# sourceMappingURL=blockchain.js.map