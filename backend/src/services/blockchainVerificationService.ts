import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';
import { loadContractArtifact } from '../utils/blockchainArtifacts';

let provider: ethers.JsonRpcProvider | null = null;
const getProvider = () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(
      BLOCKCHAIN_CONFIG.rpcUrl,
      BLOCKCHAIN_CONFIG.chainId,
    );
  }
  return provider;
};

const NFT_ARTIFACT = loadContractArtifact('AgriChainNFT');
const NFT_INTERFACE = new ethers.Interface(NFT_ARTIFACT.abi as ethers.InterfaceAbi);

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

const normalizeAddress = (value?: string | null) =>
  value ? value.toLowerCase() : undefined;

const matchesAddress = (actual: string, expected?: string) => {
  if (!expected) return true;
  return normalizeAddress(actual) === normalizeAddress(expected);
};

const bigIntEquals = (a: string | number | bigint, b: string | number | bigint) =>
  BigInt(a) === BigInt(b);

export const fetchErc1155Transfers = async (
  params: TransferFetchParams,
): Promise<TransfersInspectionResult> => {
  const providerInstance = getProvider();
  const receipt = await providerInstance.getTransactionReceipt(params.txHash);

  if (!receipt) {
    throw new Error('Transaction receipt not found');
  }
  if (receipt.status !== 1) {
    throw new Error('Transaction failed on-chain');
  }

  const targetAddress = normalizeAddress(params.contractAddress);
  const logs = receipt.logs.filter((log) => normalizeAddress(log.address) === targetAddress);
  if (logs.length === 0) {
    throw new Error('No logs found for expected contract address');
  }

  const transfers: VerifiedTransfer[] = [];

  for (const log of logs) {
        const parsedLog = (() => {
      try {
        return NFT_INTERFACE.parseLog(log);
      } catch (error) {
        return null;
      }
    })();

    if (!parsedLog) {
      continue;
    }

    if (parsedLog.name === 'TransferSingle') {
      const { from, to, id, value, operator } = parsedLog.args as unknown as {
        operator: string;
        from: string;
        to: string;
        id: bigint;
        value: bigint;
      };

      transfers.push({
        operator,
        from,
        to,
        id: id.toString(),
        value: value.toString(),
      });
    }

    if (parsedLog.name === 'TransferBatch') {
      const {
        from,
        to,
        ids,
        values,
        operator,
      } = parsedLog.args as unknown as {
        operator: string;
        from: string;
        to: string;
        ids: bigint[];
        values: bigint[];
      };

      for (let index = 0; index < ids.length; index += 1) {
        transfers.push({
          operator,
          from,
          to,
          id: ids[index].toString(),
          value: values[index].toString(),
        });
      }
    }
  }

  return { receipt, transfers };
};

export const verifyErc1155Transfer = async (
  params: VerifyTransferParams,
): Promise<VerifyTransferResult> => {
  const { receipt, transfers } = await fetchErc1155Transfers(params);

  const expectedTokenId = BigInt(params.tokenId);
  const expectedQuantity = BigInt(params.quantity);

  const match = transfers.find((transfer) =>
    bigIntEquals(transfer.id, expectedTokenId) &&
    bigIntEquals(transfer.value, expectedQuantity) &&
    matchesAddress(transfer.from, params.expectedFrom) &&
    matchesAddress(transfer.to, params.expectedTo)
  );

  if (!match) {
    throw new Error('Matching ERC-1155 transfer not found in transaction logs');
  }

  return { receipt, transfer: match };
};





