-- AlterTable
ALTER TABLE "ReturnRequest" ALTER COLUMN "isCalled" SET DEFAULT 'pending',
ALTER COLUMN "isCalled" SET DATA TYPE TEXT;
