import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@agrichain.com' },
    update: {},
    create: {
      email: 'user1@agrichain.com',
      username: 'user1',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      role: 'BUYER',
      isVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'supplier1@agrichain.com' },
    update: {},
    create: {
      email: 'supplier1@agrichain.com',
      username: 'supplier1',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      role: 'SUPPLIER',
      isSupplier: true,
      isVerified: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'supplier2@agrichain.com' },
    update: {},
    create: {
      email: 'supplier2@agrichain.com',
      username: 'supplier2',
      walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
      role: 'SUPPLIER',
      isSupplier: true,
      isVerified: true,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'supplier3@agrichain.com' },
    update: {},
    create: {
      email: 'supplier3@agrichain.com',
      username: 'supplier3',
      walletAddress: '0x5555555555555555555555555555555555555555',
      role: 'SUPPLIER',
      isSupplier: true,
      isVerified: true,
    },
  });

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      userId: user2.id,
      businessName: 'Nông trại Xanh Tươi',
      slug: 'nong-trai-xanh-tuoi',
      description: 'Chuyên cung cấp rau củ quả hữu cơ chất lượng cao, được chứng nhận VietGAP',
      location: 'Đà Lạt, Lâm Đồng',
      contactEmail: 'contact@xanhtuoi.com',
      contactPhone: '0123-456-789',
      rating: 4.8,
      totalSales: 150,
      isActive: true,
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      userId: user3.id,
      businessName: 'Hợp tác xã Nông sản Sạch',
      slug: 'hop-tac-xa-nong-san-sach',
      description: 'Liên kết với 50+ hộ nông dân, cung cấp gạo, lúa mì và các loại ngũ cốc',
      location: 'An Giang',
      contactEmail: 'info@nongsansach.vn',
      contactPhone: '0987-654-321',
      rating: 4.6,
      totalSales: 89,
      isActive: true,
    },
  });

  const supplier3 = await prisma.supplier.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      userId: user4.id,
      businessName: 'Trang trại Cà phê Cao Nguyên',
      slug: 'trang-trai-ca-phe-cao-nguyen',
      description: 'Sản xuất cà phê Arabica và Robusta chất lượng cao từ vùng Tây Nguyên',
      location: 'Buôn Ma Thuột, Đắk Lắk',
      contactEmail: 'cao@caonguyen.com',
      contactPhone: '0901-234-567',
      rating: 4.9,
      totalSales: 203,
      isActive: true,
    },
  });

  // Create products
  const product1 = await prisma.product.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      supplierId: supplier1.id,
      name: 'Cà chua hữu cơ',
      description: 'Cà chua hữu cơ tươi ngon, được trồng theo phương pháp tự nhiên',
      category: 'Rau củ',
      tags: ['hữu cơ', 'tươi', 'sạch'],
      pricingModel: 'FIXED',
      pricePerUnit: 25000,
      currency: 'MATIC',
      totalSupply: 100,
      availableSupply: 100,
      unit: 'kg',
      images: ['https://via.placeholder.com/400x300?text=Ca+Chua'],
      isOrganic: true,
      isActive: true,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      supplierId: supplier2.id,
      name: 'Gạo ST25',
      description: 'Gạo ST25 thơm ngon, hạt dài, cơm dẻo',
      category: 'Ngũ cốc',
      tags: ['gạo', 'ST25', 'thơm'],
      pricingModel: 'FIXED',
      pricePerUnit: 35000,
      currency: 'MATIC',
      totalSupply: 50,
      availableSupply: 50,
      unit: 'kg',
      images: ['https://via.placeholder.com/400x300?text=Gao+ST25'],
      isOrganic: false,
      isActive: true,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      supplierId: supplier3.id,
      name: 'Cà phê Arabica',
      description: 'Cà phê Arabica nguyên chất, rang mộc',
      category: 'Đồ uống',
      tags: ['cà phê', 'arabica', 'rang mộc'],
      pricingModel: 'FIXED',
      pricePerUnit: 150000,
      currency: 'MATIC',
      totalSupply: 30,
      availableSupply: 30,
      unit: 'kg',
      images: ['https://via.placeholder.com/400x300?text=Ca+Phe+Arabica'],
      isOrganic: true,
      isActive: true,
    },
  });

  // Create marketplace listings
  await prisma.marketplaceListing.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      productId: product1.id,
      title: 'Cà chua hữu cơ tươi ngon',
      slug: 'ca-chua-huu-co-tuoi-ngon',
      shortDescription: 'Cà chua hữu cơ được trồng theo phương pháp tự nhiên',
      status: 'ACTIVE',
      isFeatured: true,
      searchTags: ['cà chua', 'hữu cơ', 'tươi'],
      minOrderQuantity: 1,
      maxOrderQuantity: 10,
      leadTimeDays: 2,
      publishedAt: new Date(),
    },
  });

  await prisma.marketplaceListing.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      productId: product2.id,
      title: 'Gạo ST25 thơm ngon',
      slug: 'gao-st25-thom-ngon',
      shortDescription: 'Gạo ST25 hạt dài, cơm dẻo thơm',
      status: 'ACTIVE',
      isFeatured: false,
      searchTags: ['gạo', 'ST25', 'thơm'],
      minOrderQuantity: 5,
      maxOrderQuantity: 20,
      leadTimeDays: 3,
      publishedAt: new Date(),
    },
  });

  await prisma.marketplaceListing.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      productId: product3.id,
      title: 'Cà phê Arabica rang mộc',
      slug: 'ca-phe-arabica-rang-moc',
      shortDescription: 'Cà phê Arabica nguyên chất, rang mộc',
      status: 'ACTIVE',
      isFeatured: true,
      searchTags: ['cà phê', 'arabica', 'rang mộc'],
      minOrderQuantity: 1,
      maxOrderQuantity: 5,
      leadTimeDays: 1,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Created ${4} users, ${3} suppliers, ${3} products, ${3} listings`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
