-- AlterTable
ALTER TABLE "ReturnRequest" ADD COLUMN     "isCalled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transcript" JSONB;
