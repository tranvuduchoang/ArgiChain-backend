-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'DISPUTED');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "deliveryStatus" "public"."DeliveryStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "public"."delivery_confirmations" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "rating" INTEGER,
    "comment" TEXT,
    "images" TEXT[],
    "hasComplaint" BOOLEAN NOT NULL DEFAULT false,
    "qualityRating" TEXT,
    "nftBurnTxHash" TEXT,
    "nftBurnStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_confirmations_orderId_userId_key" ON "public"."delivery_confirmations"("orderId", "userId");

-- AddForeignKey
ALTER TABLE "public"."delivery_confirmations" ADD CONSTRAINT "delivery_confirmations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."delivery_confirmations" ADD CONSTRAINT "delivery_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
