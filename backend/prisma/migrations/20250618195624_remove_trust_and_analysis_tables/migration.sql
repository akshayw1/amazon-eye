/*
  Warnings:

  - You are about to drop the `product_analysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_trust` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_analysis" DROP CONSTRAINT "product_analysis_to_product";

-- DropForeignKey
ALTER TABLE "product_analysis" DROP CONSTRAINT "product_analysis_to_trust";

-- DropForeignKey
ALTER TABLE "product_trust" DROP CONSTRAINT "product_trust_productId_fkey";

-- DropTable
DROP TABLE "product_analysis";

-- DropTable
DROP TABLE "product_trust";

-- DropEnum
DROP TYPE "TrustBadge";
