import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOrderInput {
  buyerId: number;
  productId: number;
  quantity: number;
  deliveryAddress: string;
}

export async function createOrder(input: CreateOrderInput) {
  // TODO: Gọi smart contract chuyển token, escrow, v.v. (mock)
  const txHash = 'mocked_order_tx_hash';

  // Lấy thông tin sản phẩm
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new Error('Product not found');
  if (input.quantity > product.quantity) throw new Error('Not enough product quantity');

  // Tạo đơn hàng
  const order = await prisma.order.create({
    data: {
      buyerId: input.buyerId,
      productId: input.productId,
      quantity: input.quantity,
      deliveryAddress: input.deliveryAddress,
      txHash,
      status: 'PENDING',
      totalPrice: product.price * input.quantity,
    },
  });

  // Trừ số lượng sản phẩm còn lại
  await prisma.product.update({
    where: { id: input.productId },
    data: { quantity: { decrement: input.quantity } },
  });

  return order;
}