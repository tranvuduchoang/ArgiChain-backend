const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function mintNFTForProduct(productId) {
  console.log(`🔄 Minting NFT for product: ${productId}`);
  
  try {
    // 1. Tìm sản phẩm
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        supplier: {
          include: { user: true }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    console.log('📦 Product found:', product.name);
    console.log('👤 Supplier:', product.supplier?.user?.walletAddress);

    // 2. Tìm hoặc tạo smart contract template
    let template = await prisma.smartContractTemplate.findFirst({
      where: {
        supplierId: product.supplierId,
        isActive: true,
      },
    });

    if (!template) {
      console.log('📝 Creating smart contract template...');
      template = await prisma.smartContractTemplate.create({
        data: {
          supplierId: product.supplierId,
          contractAddress: process.env.AGRICHAIN_NFT_CONTRACT_ADDRESS || '0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4',
          contractType: 'ERC1155',
          name: 'AgriChain NFT Collection',
          description: 'Main AgriChain NFT collection for agricultural products',
          networkChainId: 97, // BSC Testnet
          abi: {},
          version: '1.0.0',
        },
      });
    }

    // 3. Tạo product token record
    const tokenId = Math.floor(Math.random() * 1000000).toString();
    const contractAddress = template.contractAddress.toLowerCase();
    
    console.log('🎫 Creating product token...');
    const productToken = await prisma.productToken.upsert({
      where: {
        contractAddress_tokenId: {
          contractAddress: contractAddress,
          tokenId: tokenId,
        },
      },
      update: {
        productId: product.id,
        templateId: template.id,
        totalMinted: product.totalSupply,
        mintTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        mintedAt: new Date(),
      },
      create: {
        productId: product.id,
        templateId: template.id,
        tokenId: tokenId,
        contractAddress: contractAddress,
        totalMinted: product.totalSupply,
        mintTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        mintedAt: new Date(),
      },
    });

    console.log('✅ Product token created:', productToken.id);

    // 4. Cập nhật sản phẩm
    await prisma.product.update({
      where: { id: product.id },
      data: {
        contractAddress: contractAddress,
        nftTokenId: tokenId,
        mintTxHash: productToken.mintTxHash,
        mintedAt: productToken.mintedAt,
        availableSupply: product.totalSupply,
        isActive: true,
      },
    });

    console.log('🎉 NFT minted successfully for product:', product.name);
    console.log('📊 Token ID:', tokenId);
    console.log('📋 Contract Address:', contractAddress);
    
  } catch (error) {
    console.error('❌ Error minting NFT:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Lấy productId từ command line arguments
const productId = process.argv[2];
if (!productId) {
  console.error('❌ Please provide product ID');
  console.log('Usage: node mint-nft-for-product.js <productId>');
  process.exit(1);
}

mintNFTForProduct(productId);
