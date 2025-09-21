"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyErc1155Transfer = exports.fetchErc1155Transfers = void 0;
const ethers_1 = require("ethers");
const blockchain_1 = require("../config/blockchain");
const blockchainArtifacts_1 = require("../utils/blockchainArtifacts");
let provider = null;
const getProvider = () => {
    if (!provider) {
        provider = new ethers_1.ethers.JsonRpcProvider(blockchain_1.BLOCKCHAIN_CONFIG.rpcUrl, blockchain_1.BLOCKCHAIN_CONFIG.chainId);
    }
    return provider;
};
const NFT_ARTIFACT = (0, blockchainArtifacts_1.loadContractArtifact)('AgriChainNFT');
const NFT_INTERFACE = new ethers_1.ethers.Interface(NFT_ARTIFACT.abi);
const normalizeAddress = (value) => value ? value.toLowerCase() : undefined;
const matchesAddress = (actual, expected) => {
    if (!expected)
        return true;
    return normalizeAddress(actual) === normalizeAddress(expected);
};
const bigIntEquals = (a, b) => BigInt(a) === BigInt(b);
const fetchErc1155Transfers = async (params) => {
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
    const transfers = [];
    for (const log of logs) {
        const parsedLog = (() => {
            try {
                return NFT_INTERFACE.parseLog(log);
            }
            catch (error) {
                return null;
            }
        })();
        if (!parsedLog) {
            continue;
        }
        if (parsedLog.name === 'TransferSingle') {
            const { from, to, id, value, operator } = parsedLog.args;
            transfers.push({
                operator,
                from,
                to,
                id: id.toString(),
                value: value.toString(),
            });
        }
        if (parsedLog.name === 'TransferBatch') {
            const { from, to, ids, values, operator, } = parsedLog.args;
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
exports.fetchErc1155Transfers = fetchErc1155Transfers;
const verifyErc1155Transfer = async (params) => {
    const { receipt, transfers } = await (0, exports.fetchErc1155Transfers)(params);
    const expectedTokenId = BigInt(params.tokenId);
    const expectedQuantity = BigInt(params.quantity);
    const match = transfers.find((transfer) => bigIntEquals(transfer.id, expectedTokenId) &&
        bigIntEquals(transfer.value, expectedQuantity) &&
        matchesAddress(transfer.from, params.expectedFrom) &&
        matchesAddress(transfer.to, params.expectedTo));
    if (!match) {
        throw new Error('Matching ERC-1155 transfer not found in transaction logs');
    }
    return { receipt, transfer: match };
};
exports.verifyErc1155Transfer = verifyErc1155Transfer;
//# sourceMappingURL=blockchainVerificationService.js.map