-- CreateEnum
CREATE TYPE "EditType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE');

-- CreateTable
CREATE TABLE "ProductEditHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "editedBy" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "editReason" TEXT,
    "editType" "EditType" NOT NULL DEFAULT 'UPDATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductEditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductEditHistory_productId_idx" ON "ProductEditHistory"("productId");

-- CreateIndex
CREATE INDEX "ProductEditHistory_editedBy_idx" ON "ProductEditHistory"("editedBy");

-- CreateIndex
CREATE INDEX "ProductEditHistory_createdAt_idx" ON "ProductEditHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "ProductEditHistory" ADD CONSTRAINT "ProductEditHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEditHistory" ADD CONSTRAINT "ProductEditHistory_editedBy_fkey" FOREIGN KEY ("editedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
