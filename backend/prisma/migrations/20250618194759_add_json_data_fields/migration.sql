/*
  Warnings:

  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_productAnalysisId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_productId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "avg_review_rating" DOUBLE PRECISION,
ADD COLUMN     "fake_score" DOUBLE PRECISION,
ADD COLUMN     "n_of_reviews" INTEGER,
ADD COLUMN     "product_ID" INTEGER,
ADD COLUMN     "trust_score" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "review_info" ADD COLUMN     "ai_generated" BOOLEAN,
ADD COLUMN     "generated_score" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Review";
