# AgriChain Backend

Purpose-built Node.js + TypeScript service powering the AgriChain marketplace. This document introduces the architecture, local development workflow, and operational runbooks so a new engineer can deploy and extend the platform confidently.

---

## 1. System Overview

AgriChain connects farmers (suppliers) and buyers through an NFT-enabled marketplace. The backend exposes REST APIs for:

- Supplier brand onboarding and team management
- Product batch creation with optional marketplace listings
- NFT token metadata tracking (off-chain) and inventory management
- Order lifecycle (pricing, fulfillment, payment reconciliation)
- Loyalty programs, reviews, and auctions (under active development)

The service integrates with a Polygon-compatible blockchain (Hardhat stack lives in ../blockchain) to mint and transfer ERC-1155 tokens representing agricultural lots.

![Backend Architecture](docs/diagrams/backend-architecture.png)

> If the diagram file is missing locally, re-export from the shared design source. Use it as a reference for request routing, service layers, and data stores.

---

## 2. Tech Stack

| Layer              | Tooling / Version                                          |
|--------------------|------------------------------------------------------------|
| Runtime            | Node.js 18+, npm                                           |
| Framework          | Express 4 + TypeScript 5                                   |
| ORM / Database     | Prisma 6 / PostgreSQL (local: postgres://postgres@localhost:5432/agrichain) |
| Authn / Security   | JWT (planned), CORS w/ origin allowlist                    |
| File storage       | Local uploads/ (replaceable with S3-compatible storage)  |
| Blockchain bridge  | Hardhat, Ethers v6, Polygon zkEVM Cardona / Mumbai targets |
| Tooling            | ts-node-dev (dev), ESLint, npm scripts                     |

---

## 3. Repository Structure

`
backend/
+-- docs/                  # living documentation (API, runbooks, playbooks)
+-- prisma/                # schema + migrations
+-- src/
¦   +-- config/            # environment + server configuration
¦   +-- controllers/       # HTTP handlers (input validation, response mapping)
¦   +-- middleware/        # shared Express middleware (upload, auth placeholder)
¦   +-- routes/            # route definitions grouped by domain
¦   +-- services/          # business logic; single place Prisma is imported
¦   +-- index.ts           # app bootstrap
+-- package.json           # scripts and dependencies
+-- tsconfig.json          # TypeScript compiler config
`

Cross-cutting docs that complement this README live in docs/:

- docs/api-overview.md — endpoint catalog and data flows (updated regularly)
- docs/setup-local.md — environment provisioning & troubleshooting (create next)
- docs/product-nft-flow.md — canonical NFT mint & trade lifecycle (create next)

---

## 4. Getting Started

1. **Install dependencies**
   `ash
   cd backend
   npm install
   `

2. **Environment variables**
   Copy .env.example (if present) to .env and set:
   - DATABASE_URL — PostgreSQL connection string
   - Future additions: JWT secrets, CORS origins, blockchain RPC URLs

3. **Database migration**
   `ash
   npx prisma migrate dev --name init
   `
   This applies the Prisma schema (prisma/schema.prisma) to your local database and generates typed clients.

4. **Run in development**
   `ash
   npm run dev
   `
   Starts Express with 	s-node-dev, auto-reloading on file changes.

5. **Type check / build**
   `ash
   npm run build   # tsc compile to ./dist
   `

6. **Access API**
   - Health: GET http://localhost:5000/health
   - API index: GET http://localhost:5000/api

---

## 5. Operational Concepts

### 5.1 Supplier Brands
- Users can promote themselves from buyers to suppliers via POST /api/suppliers.
- Each supplier has a unique slug, profile metadata, and brand members with roles.
- Services enforce ownership and allow deactivation without deleting historical records.

### 5.2 Products & Marketplace Listings
- Products represent token-enabled agricultural batches (total supply, units, pricing).
- Optional marketplace listing metadata dictates search tags, featured flags, and order limits.
- Stock is tracked via vailableSupply and InventoryLot records.

### 5.3 Orders & Payments
- Orders currently track fiat/crypto totals and reserved quantities.
- Payment receipts are modeled for blockchain transaction hashes; integration with smart contracts is on the roadmap for the next sprint.

### 5.4 Loyalty & Reviews
- Loyalty ledger captures earn/redeem transactions per supplier program.
- Reviews require associated orders/products and pass through moderation states.

---

## 6. Data Model (Prisma)

![](docs/diagrams/prisma-model.png)

Key tables:
- Supplier, BrandMember — storefront metadata & team roles
- Product, MarketplaceListing, InventoryLot — saleable goods & availability
- ProductToken, TokenTransfer, NFT — blockchain asset mirror
- Order, OrderItem, PaymentReceipt — commerce transactions
- LoyaltyProgram, LoyaltyLedger — customer rewards
- Review, Auction, Bid — reputation and advanced sale mechanics

Regenerate the Prisma client after schema changes:
`ash
npx prisma generate
`

---

## 7. Testing & Verification

- **Unit / integration tests**: currently minimal. Add Jest suites under src/__tests__/ alongside service modules.
- **Manual testing**: use REST clients (Insomnia/Postman) against local instance.
- **Type safety**: rely on 
pm run build in CI to block invalid DTO changes.

---

## 8. Deployment Checklist

1. Environment variables configured (DB, CORS, blockchain RPC, JWT secrets)
2. Run 
pm run build
3. Apply migrations: 
px prisma migrate deploy
4. Start service via process manager (PM2, systemd, Docker) with 
ode dist/index.js
5. Hook up reverse proxy / TLS as required

---

## 9. Next Actions

- Finalize blockchain integration plan (see docs/product-nft-flow.md once created)
- Implement authentication/authorization guardrails
- Build automated tests for supplier/product flows
- Connect with frontend to validate end-to-end NFT mint/trade experience

Maintain this README as the source-of-truth onboarding guide. Update diagrams and linked docs whenever domain logic evolves.

