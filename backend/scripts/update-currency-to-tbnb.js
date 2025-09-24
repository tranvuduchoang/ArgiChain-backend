const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating currency from MATIC to tBNB...');
  
  try {
    // Update products
    const productUpdate = await prisma.product.updateMany({
      where: {
        currency: 'MATIC'
      },
      data: {
        currency: 'tBNB'
      }
    });
    console.log(`✅ Updated ${productUpdate.count} products`);
    
    // Update orders
    const orderUpdate = await prisma.order.updateMany({
      where: {
        currency: 'MATIC'
      },
      data: {
        currency: 'tBNB'
      }
    });
    console.log(`✅ Updated ${orderUpdate.count} orders`);
    
    // Update payment receipts
    const paymentUpdate = await prisma.paymentReceipt.updateMany({
      where: {
        currency: 'MATIC'
      },
      data: {
        currency: 'tBNB'
      }
    });
    console.log(`✅ Updated ${paymentUpdate.count} payment receipts`);
    
    console.log('🎉 Currency update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating currency:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
