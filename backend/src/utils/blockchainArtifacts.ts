import fs from 'fs';
import path from 'path';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';

export interface ContractArtifact {
  abi: unknown;
  bytecode?: string;
}

export const loadContractArtifact = (contractName: string): ContractArtifact => {
  const artifactPath = path.join(
    BLOCKCHAIN_CONFIG.artifactsPath,
    'contracts',
    `${contractName}.sol`,
    `${contractName}.json`,
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Contract artifact not found at ${artifactPath}. Run hardhat compile first.`);
  }

  const raw = fs.readFileSync(artifactPath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed.abi) {
    throw new Error(`Invalid artifact for ${contractName}`);
  }

  return {
    abi: parsed.abi,
    bytecode: parsed.bytecode,
  };
};
