-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

-- Adding enum values one by one to handle PostgreSQL enum constraints

BEGIN;
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CUSTOMER';
COMMIT;

BEGIN;
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SELLER';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
