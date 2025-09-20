# Backend API Updates

## Supplier Brand Management
- POST /api/suppliers - create a supplier storefront for a user, link the owner as a brand member, and set the user role to SUPPLIER.
- GET /api/suppliers - list suppliers with optional search keyword and isActive=true|false filters; response bundles supplier info, recent products, members, and loyalty programs.
- GET /api/suppliers/slug/:slug - fetch a supplier by public slug for marketplace navigation.
- GET /api/suppliers/:supplierId - fetch a supplier by internal ID including members and product portfolio.
- PATCH /api/suppliers/:supplierId - update profile fields (branding assets, contact, location, active flag).
- GET /api/suppliers/:supplierId/members - list brand team members with linked user info.
- POST /api/suppliers/:supplierId/members - invite or add a member (defaults to STAFF role when not provided).
- POST /api/suppliers/:supplierId/contracts/deploy - deploy an ERC-1155 contract template for the supplier (set force=true to replace existing).
- PATCH /api/suppliers/:supplierId/members/:memberId - change member role or status (for example accept invite, deactivate user).

### Data Flow
1. Onboarding: user creates supplier -> backend creates supplier row, marks user as SUPPLIER, seeds owner brand member entry.
2. Brand teaming: owners invite teammates; status tracks lifecycle (INVITED, ACTIVE, INACTIVE).
3. Profile management: suppliers can toggle isActive and refresh branding/contact links without touching historical products.

## Marketplace Listings
- GET /api/products/marketplace/listings - returns active MarketplaceListing records joined with product and supplier metadata for the frontend grid.
- Product creation accepts an optional listing payload (title, slug, tags, min/max order quantities, lead time) so mint + listing happens in one call.

## Product Minting
- POST /api/products/:productId/mint/prepare - fetch mint-ready payload (contract address, chain id, metadata preview).
- POST /api/products/:productId/mint/confirm - persist blockchain mint tx, create product token, and activate marketplace listing.

### Marketplace Flow
1. Supplier mints a product batch (optionally with listing info).
2. Backend stores product, listing, and inventory; availability counters update immediately.
3. Marketplace endpoint surfaces listings marked ACTIVE whose products remain active.

## Implementation Notes
- All identifiers returned by the API are strings (cuid); update frontend DTOs accordingly.
- Slugs are forced to lowercase server-side to guarantee consistent URLs.
- Social links and similar structured fields accept JSON objects, not pre-stringified payloads.
- Brand member role/status values must match Prisma enums (OWNER, MANAGER, STAFF, INVITED, ACTIVE, INACTIVE).
- Marketplace responses include supplier and product references so the UI can link to store profiles without extra round-trips.







