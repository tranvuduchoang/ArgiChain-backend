# Product NFT Lifecycle

The goal is to let a supplier mint ERC-1155 tokens representing agricultural batches, list them for sale, and transfer ownership when buyers purchase. This document outlines the end-to-end flow and components you must implement.

## 1. Participants

- **Supplier (User A)**: creates product batches, mints NFTs, receives crypto payments.
- **Buyer (User B)**: purchases NFTs, gains entitlement to agricultural goods.
- **Backend API**: orchestrates database records, triggers blockchain transactions, reconciles results.
- **Smart Contracts**: ERC-1155 token contract (per supplier template) deployed via Hardhat scripts.
- **Frontend dApp**: guides wallet interactions (MetaMask) and displays status to users.

## 2. High-Level Flow

1. **Wallet Connection**: User authenticates via MetaMask; frontend captures wallet address and session token (future auth work).
2. **Supplier Registration**: User promotes to supplier using POST /api/suppliers. Backend stores profile + associates wallet.
3. **Product Draft**:
   - Supplier submits product metadata to POST /api/products with total supply, unit price, inventory notes, and listing details.
   - Backend stores product with vailableSupply = totalSupply and marks listing as DRAFT until mint succeeds.
4. **NFT Mint Transaction**:
   - Frontend calls blockchain service to deploy or reuse supplier ERC-1155 contract (SmartContractTemplate).
   - Supplier signs mint transaction for 	okenId representing the batch (	otalSupply quantity, price per unit stored off-chain).
   - On-chain event TransferSingle emits; backend listens (or is notified via callback) and records ProductToken + TokenTransfer with mintTxHash.
   - Backend updates product with contractAddress, 
ftTokenId, mintedAt, and activates marketplace listing.
5. **Marketplace Listing**:
   - Buyers see listing via GET /api/products/marketplace/listings with available supply and price.
6. **Purchase Flow** (User B buys 3 NFTs):
   - Frontend prepares order summary and prompts buyer to sign transaction transferring 0.003 ETH to supplier contract / wallet and calling safeTransferFrom for 3 tokens.
   - Transaction receipt is sent to backend through POST /api/orders with metadata including productTokenId, quantity, paymentMethod=CRYPTO, 	ransactionHash.
   - Backend verifies vailableSupply >= 3, decrements supply, stores order + order items, and logs TokenTransfer (from Supplier wallet to Buyer wallet) tied to blockchain tx hash.
   - Optional: backend subscribes to event indexer to confirm on-chain transfer before finalizing order status.
7. **Post-Trade Updates**:
   - Buyer holds 3 NFTs in wallet; backend NFT table tracks holdings for analytics and loyalty.
   - Supplier balance increases by 0.003 ETH on-chain; backend persists payment receipt for reconciliation.
   - Loyalty/Rewards logic accrues points when applicable.
8. **Settlement / Redemption**:
   - When physical goods are delivered, backend may mark order as DELIVERED and optionally burn NFTs or flag as redeemed (future design).

## 3. Required Components

- **Blockchain service module** (backend) encapsulating RPC calls (ethers.js) for mint and transfer verification.
- **Webhook / listener** to capture events from Hardhat node or live network and update ProductToken, TokenTransfer, NFT tables.
- **Order service updates** to validate payment and ensure atomic decrement of supply when blockchain transfer succeeds.
- **Frontend UX** aligning with wallet prompts, transaction progress, and failure handling.

## 4. Data Contracts

- ProductToken: id, productId, contractAddress, 	okenId, 	otalMinted, mintTxHash, 	emplateId
- TokenTransfer: productTokenId, romAddress, 	oAddress, quantity, 	xHash, chainId, 	ype
- NFT: userId, productTokenId, quantity, metadata
- OrderItem: stores productTokenId, quantity, 	otalPrice, metadata
- PaymentReceipt: 	ransactionHash, mount, status

Ensure all blockchain hashes and addresses are checksummed and stored as lowercase for indexing.

## 5. Implementation Roadmap

### Phase 1 – Contract Deployment & Mint
- Implement backend module to call Hardhat scripts (via child process) or direct ethers provider for contract deployment per supplier.
- Expose API for supplier to request mint parameters (price, supply, metadata URI) and confirm after signing transaction.
- Update services to set listing status to ACTIVE only when mint transaction is confirmed.

### Phase 2 – Purchase & Transfer
- Extend order controller to require 	ransactionHash for crypto payments.
- Introduce verification job that fetches tx receipt, confirms token quantity transferred, and moves order to PAID status.
- Update inventory counters only after verification to prevent double-selling.

### Phase 3 – Event Indexing & Wallet State
- Build listener (cron or websocket) that scans blockchain events and populates TokenTransfer + NFT holdings.
- Handle rollback if transaction fails or is reverted.

### Phase 4 – Redemption & Settlement
- Define process for marking NFTs as redeemed when goods are delivered (optional burn or metadata update).
- Align loyalty and review eligibility with order status.

## 6. Security & Compliance Checklist

- Validate supplier ownership before allowing mint operations.
- Enforce price and quantity bounds to prevent overflow or malicious behavior.
- Store blockchain RPC credentials securely; never expose private keys server-side (transactions are signed client-side).
- Provide clear error handling for transaction failures, replays, and pending states.

## 7. Testing Strategy

- Use Hardhat local node with funded test accounts to simulate mint + purchase.
- Write integration tests that:
  1. Create supplier & product
  2. Mint tokens via mocked transaction response
  3. Submit order with tx hash
  4. Verify database reflects new ownership and decreased supply
- For manual QA, document wallet addresses, transaction hashes, and expected inventory state after each scenario.

## 8. Open Questions

- Should the backend initiate escrow smart contracts for partial fills, or rely on direct marketplace transfers?
- How will we handle fiat fallback payments (e.g., off-chain settlement)?
- What is the redemption UX for the buyer (burn token vs mark as used)?

Update this document as the implementation evolves. Treat it as the canonical reference for blockchain-related features.

