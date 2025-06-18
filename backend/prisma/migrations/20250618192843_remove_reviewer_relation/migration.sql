-- DropForeignKey
ALTER TABLE "review_info" DROP CONSTRAINT "review_info_reviewerId_fkey";

-- DropIndex
DROP INDEX "review_info_reviewerId_idx";
