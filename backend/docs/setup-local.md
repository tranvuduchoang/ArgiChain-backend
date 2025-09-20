# Local Environment Setup

This guide walks through provisioning a local AgriChain backend environment from scratch.

## 1. Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (local instance)
- Optional: Redis (future caching), Docker Desktop if you prefer containers

## 2. Clone Repository

`ash
mkdir -p ~/workspace
cd ~/workspace
git clone <your-fork-url> agrichain
cd agrichain/backend
`

> Keep rontend/ and lockchain/ siblings checked out so cross-project scripts run smoothly.

## 3. Configure Environment Variables

Copy .env.example (if provided) or create .env manually:

`
DATABASE_URL=postgres://postgres:password@localhost:5432/agrichain\nPORT=5000\nNODE_ENV=development\nCORS_ORIGIN=http://localhost:3000\nBLOCKCHAIN_RPC_URL=http://127.0.0.1:8545\nBLOCKCHAIN_CHAIN_ID=1337\nBLOCKCHAIN_DEPLOYER_KEY=0xYOUR_PRIVATE_KEY\nBLOCKCHAIN_NETWORK=hardhat\nBLOCKCHAIN_METADATA_BASE_URL=https://metadata.local/agrichain\nBLOCKCHAIN_ARTIFACTS_PATH=../blockchain/artifacts\nBLOCKCHAIN_CONTRACT_VERSION=1.0.0\nJWT_SECRET=replace-me
`

Adjust usernames/passwords to match your local Postgres credentials. Use .env.local if your shell auto-loads environment variables.

## 4. Database Provisioning

Create the database if it does not exist:

`ash
psql -U postgres -c 'CREATE DATABASE agrichain;'
`

Apply migrations & generate Prisma client:

`ash
npx prisma migrate dev --name bootstrap
npx prisma generate
`

## 5. Install Dependencies

`ash
npm install
`

## 6. Start the Backend

`ash
npm run dev
`

The API listens on http://localhost:5000. Verify with:

`ash
curl http://localhost:5000/health
`

You should see JSON containing status OK.

## 7. Useful Commands

| Command | Description |
|---------|-------------|
| 
pm run dev | Start dev server with hot reload |
| 
pm run build | Compile TypeScript to dist/ |
| 
pm run start | Run compiled server |
| 
px prisma studio | Launch Prisma data browser |
| 
px prisma format | Format Prisma schema |

## 8. Troubleshooting

- **Port conflicts**: Adjust PORT in .env or terminate the process using port 5000.
- **Database connection errors**: Confirm Postgres is running and DATABASE_URL is reachable.
- **Prisma client mismatch**: Run 
px prisma generate after schema edits.
- **ESM/CommonJS errors**: ensure "type": "commonjs" remains in package.json for backend.

## 9. Next Steps

- Start the Hardhat node within ../blockchain for smart-contract testing.
- Launch the Next.js frontend (../frontend) to exercise the marketplace UI.
- Follow docs/product-nft-flow.md to wire blockchain transactions before enabling production data.

