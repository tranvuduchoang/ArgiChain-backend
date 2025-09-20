"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContractArtifact = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const blockchain_1 = require("../config/blockchain");
const loadContractArtifact = (contractName) => {
    const artifactPath = path_1.default.join(blockchain_1.BLOCKCHAIN_CONFIG.artifactsPath, 'contracts', `${contractName}.sol`, `${contractName}.json`);
    if (!fs_1.default.existsSync(artifactPath)) {
        throw new Error(`Contract artifact not found at ${artifactPath}. Run hardhat compile first.`);
    }
    const raw = fs_1.default.readFileSync(artifactPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.abi) {
        throw new Error(`Invalid artifact for ${contractName}`);
    }
    return {
        abi: parsed.abi,
        bytecode: parsed.bytecode,
    };
};
exports.loadContractArtifact = loadContractArtifact;
//# sourceMappingURL=blockchainArtifacts.js.map