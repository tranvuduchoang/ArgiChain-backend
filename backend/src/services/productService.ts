import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  supplierId: number;
}

export async function createProduct(input: CreateProductInput) {
  // TODO: Gọi smart contract mint NFT ở đây (mock)
  // const nftTxHash = await mintProductNFT(...)
  const nftTxHash = 'mocked_tx_hash';

  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      quantity: input.quantity,
      imageUrl: input.imageUrl,
      supplierId: input.supplierId,
      nftTxHash,
    },
  });
  return product;
}

export async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: { id: 'desc' },
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
  });
}