"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.updateProductAvailability = updateProductAvailability;
exports.listActiveMarketplaceProducts = listActiveMarketplaceProducts;
exports.prepareProductMint = prepareProductMint;
exports.confirmProductMint = confirmProductMint;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const ethers_1 = require("ethers");
const toDate = (value) => {
    if (!value)
        return undefined;
    if (value instanceof Date)
        return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
const toDecimal = (value) => new client_1.Prisma.Decimal(value);
const toDecimalString = (value) => {
    if (value instanceof client_1.Prisma.Decimal)
        return value.toString();
    return value.toString();
};
async function createProduct(input) {
    const pricingModel = input.pricingModel ?? client_1.PricingModel.FIXED;
    const currency = input.currency ?? 'MATIC';
    const totalSupply = Math.max(0, Math.floor(input.totalSupply));
    const availableSupply = totalSupply;
    const pricePerUnit = toDecimal(input.pricePerUnit);
    const harvestDate = toDate(input.harvestDate ?? undefined);
    const expiryDate = toDate(input.expiryDate ?? undefined);
    const product = await database_1.prisma.product.create({
        data: {
            supplierId: input.supplierId,
            name: input.name,
            description: input.description,
            category: input.category,
            unit: input.unit,
            pricingModel,
            currency,
            totalSupply,
            availableSupply,
            pricePerUnit,
            tags: input.tags ?? [],
            images: input.images ?? [],
            metadataCid: input.metadataCid,
            metadataUrl: input.metadataUrl,
            contractAddress: input.contractAddress,
            nftTokenId: input.nftTokenId,
            mintTxHash: input.mintTxHash,
            harvestDate,
            expiryDate,
            qualityCertifications: input.qualityCertifications ?? [],
            storageConditions: input.storageConditions,
            listings: input.listing
                ? {
                    create: {
                        title: input.listing.title,
                        slug: input.listing.slug,
                        shortDescription: input.listing.shortDescription,
                        status: input.listing.status ?? client_1.ListingStatus.DRAFT,
                        isFeatured: input.listing.isFeatured ?? false,
                        searchTags: input.listing.searchTags ?? [],
                        minOrderQuantity: input.listing.minOrderQuantity ?? 1,
                        maxOrderQuantity: input.listing.maxOrderQuantity,
                        leadTimeDays: input.listing.leadTimeDays ?? 2,
                        publishedAt: toDate(input.listing.publishedAt ?? undefined),
                    },
                }
                : undefined,
        },
        include: {
            supplier: true,
            listings: true,
            inventoryLots: true,
            productTokens: true,
        },
    });
    return product;
}
async function getAllProducts(params) {
    const onlyActive = params?.onlyActive ?? false;
    const where = onlyActive
        ? {
            isActive: true,
            listings: {
                some: {
                    status: client_1.ListingStatus.ACTIVE,
                },
            },
        }
        : {};
    return database_1.prisma.product.findMany({
        where,
        include: {
            supplier: true,
            listings: true,
            inventoryLots: true,
            productTokens: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}
async function getProductById(id) {
    return database_1.prisma.product.findUnique({
        where: { id },
        include: {
            supplier: true,
            listings: true,
            inventoryLots: true,
            productTokens: {
                include: {
                    tokenTransfers: true,
                    nftHoldings: true,
                },
            },
        },
    });
}
async function updateProductAvailability(productId, quantityDelta) {
    return database_1.prisma.product.update({
        where: { id: productId },
        data: {
            availableSupply: {
                decrement: quantityDelta,
            },
        },
    });
}
async function listActiveMarketplaceProducts() {
    return database_1.prisma.marketplaceListing.findMany({
        where: {
            status: client_1.ListingStatus.ACTIVE,
            product: {
                isActive: true,
            },
        },
        include: {
            product: {
                include: {
                    supplier: true,
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
}
async function prepareProductMint(productId) {
    const product = await database_1.prisma.product.findUnique({
        where: { id: productId },
        include: {
            supplier: {
                include: {
                    user: true,
                },
            },
            listings: true,
        },
    });
    if (!product) {
        throw new Error('Product not found');
    }
    const supplierWallet = product.supplier?.user?.walletAddress;
    if (!supplierWallet) {
        throw new Error('Supplier wallet address is not configured');
    }
    let template = await database_1.prisma.smartContractTemplate.findFirst({
        where: {
            supplierId: product.supplierId,
            isActive: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    if (!template) {
        const mainContractAddress = process.env.AGRICHAIN_NFT_CONTRACT_ADDRESS || '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1';
        template = await database_1.prisma.smartContractTemplate.create({
            data: {
                supplierId: product.supplierId,
                contractAddress: mainContractAddress,
                contractType: 'ERC1155',
                name: 'AgriChain NFT Collection',
                description: 'Main AgriChain NFT collection for agricultural products',
                networkChainId: 2442,
                abi: {},
                version: '1.0.0',
            },
        });
    }
    const metadataAttributes = [
        { trait_type: 'Category', value: product.category },
        { trait_type: 'Unit', value: product.unit },
        { trait_type: 'Organic', value: product.isOrganic ? 'Yes' : 'No' },
        {
            trait_type: 'Harvest Date',
            value: product.harvestDate ? product.harvestDate.toISOString() : undefined,
        },
        {
            trait_type: 'Expiry Date',
            value: product.expiryDate ? product.expiryDate.toISOString() : undefined,
        },
    ].filter((attribute) => attribute.value !== undefined && attribute.value !== null);
    return {
        tokenId: 1,
        contractAddress: template.contractAddress,
        chainId: template.networkChainId,
        product: {
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            unit: product.unit,
            totalSupply: product.totalSupply,
            pricePerUnit: toDecimalString(product.pricePerUnit),
            currency: product.currency,
            images: product.images,
            metadataCid: product.metadataCid,
            metadataUrl: product.metadataUrl,
        },
        supplier: {
            id: product.supplierId,
            walletAddress: supplierWallet,
        },
        contract: {
            templateId: template.id,
            address: template.contractAddress,
            chainId: template.networkChainId,
            contractType: template.contractType,
        },
        mintPayload: {
            to: supplierWallet,
            quantity: product.totalSupply,
            pricePerUnit: toDecimalString(product.pricePerUnit),
            currency: product.currency,
            metadata: {
                name: product.name,
                description: product.description,
                image: product.images?.[0] ?? null,
                external_url: product.metadataUrl ?? null,
                attributes: metadataAttributes,
            },
        },
    };
}
async function confirmProductMint(input) {
    const quantity = Math.max(0, Math.floor(input.mintedQuantity));
    if (quantity <= 0) {
        throw new Error('mintedQuantity must be greater than zero');
    }
    const chainId = Number(input.chainId);
    if (Number.isNaN(chainId)) {
        throw new Error('Invalid chainId');
    }
    const mintedAt = toDate(input.mintedAt) ?? new Date();
    const normalizedContractAddress = input.contractAddress.toLowerCase();
    return database_1.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: { id: input.productId },
            include: {
                supplier: {
                    include: { user: true },
                },
                listings: true,
            },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        const supplierWallet = product.supplier?.user?.walletAddress;
        const supplierUserId = product.supplier?.user?.id;
        if (!supplierWallet || !supplierUserId) {
            throw new Error('Supplier wallet or user record is not configured');
        }
        const template = await tx.smartContractTemplate.findFirst({
            where: {
                supplierId: product.supplierId,
                contractAddress: normalizedContractAddress,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const productToken = await tx.productToken.upsert({
            where: {
                contractAddress_tokenId: {
                    contractAddress: normalizedContractAddress,
                    tokenId: input.tokenId,
                },
            },
            update: {
                productId: product.id,
                templateId: template?.id,
                totalMinted: quantity,
                metadataCid: input.metadataCid ?? undefined,
                mintTxHash: input.transactionHash,
                mintedAt,
            },
            create: {
                productId: product.id,
                templateId: template?.id,
                tokenId: input.tokenId,
                contractAddress: normalizedContractAddress,
                totalMinted: quantity,
                metadataCid: input.metadataCid,
                mintTxHash: input.transactionHash,
                mintedAt,
            },
        });
        const updateData = {
            contractAddress: normalizedContractAddress,
            nftTokenId: input.tokenId,
            mintTxHash: input.transactionHash,
            mintedAt,
            availableSupply: quantity,
            totalSupply: quantity,
            isActive: true,
        };
        if (input.metadataCid !== undefined) {
            updateData.metadataCid = input.metadataCid;
        }
        if (input.metadataUrl !== undefined) {
            updateData.metadataUrl = input.metadataUrl;
        }
        if (product.listings.length > 0) {
            updateData.listings = {
                updateMany: {
                    where: { productId: product.id },
                    data: {
                        status: client_1.ListingStatus.ACTIVE,
                        publishedAt: new Date(),
                    },
                },
            };
        }
        else {
            updateData.listings = {
                create: {
                    title: product.name,
                    slug: product.name.toLowerCase().replace(/\s+/g, '-'),
                    shortDescription: product.description.substring(0, 100),
                    status: client_1.ListingStatus.ACTIVE,
                    isFeatured: false,
                    searchTags: product.tags || [],
                    publishedAt: new Date(),
                },
            };
        }
        const updatedProduct = await tx.product.update({
            where: { id: product.id },
            data: updateData,
            include: {
                supplier: {
                    include: { user: true },
                },
                listings: true,
            },
        });
        const existingTransfer = await tx.tokenTransfer.findFirst({
            where: { txHash: input.transactionHash },
        });
        if (!existingTransfer) {
            await tx.tokenTransfer.create({
                data: {
                    productTokenId: productToken.id,
                    fromAddress: ethers_1.ZeroAddress,
                    toAddress: input.toAddress ?? supplierWallet,
                    quantity,
                    txHash: input.transactionHash,
                    chainId,
                    type: client_1.TokenTransferType.MINT,
                },
            });
        }
        const metadataPayload = {
            productId: product.id,
            tokenId: input.tokenId,
            name: product.name,
            category: product.category,
        };
        await tx.nFT.upsert({
            where: {
                userId_productTokenId: {
                    userId: supplierUserId,
                    productTokenId: productToken.id,
                },
            },
            update: {
                quantity: { increment: quantity },
            },
            create: {
                userId: supplierUserId,
                productTokenId: productToken.id,
                quantity,
                metadata: metadataPayload,
            },
        });
        return {
            product: updatedProduct,
            productToken,
        };
    });
}
//# sourceMappingURL=productService.js.map