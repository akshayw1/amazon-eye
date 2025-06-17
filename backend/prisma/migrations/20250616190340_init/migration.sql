-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TrustBadge" AS ENUM ('TRUSTED', 'CAUTION', 'RISK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "images" TEXT[],
    "category" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_trust" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "overallTrustScore" INTEGER NOT NULL,
    "reviewTrustScore" INTEGER NOT NULL,
    "sellerTrustScore" INTEGER NOT NULL,
    "productTrustScore" INTEGER NOT NULL,
    "trustBadge" "TrustBadge" NOT NULL,
    "trustBadgeColor" TEXT NOT NULL,
    "badgeDisplayText" TEXT NOT NULL,
    "badgeReason" TEXT,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "totalReviews" INTEGER NOT NULL,
    "authenticReviews" INTEGER NOT NULL,
    "suspiciousReviews" INTEGER NOT NULL,
    "reviewQualityScore" DOUBLE PRECISION NOT NULL,
    "aiGeneratedProbability" DOUBLE PRECISION,
    "counterfeiteRisk" DOUBLE PRECISION,
    "imageAnalysisScore" DOUBLE PRECISION,
    "logoTamperingDetected" BOOLEAN NOT NULL DEFAULT false,
    "sellerReliabilityScore" DOUBLE PRECISION,
    "sellerFraudReports" INTEGER NOT NULL DEFAULT 0,
    "sellerVerified" BOOLEAN NOT NULL DEFAULT false,
    "activeFraudFlags" JSONB,
    "fraudFlagCount" INTEGER NOT NULL DEFAULT 0,
    "moderatorFlagged" BOOLEAN NOT NULL DEFAULT false,
    "moderatorNotes" TEXT,
    "watchlistCount" INTEGER NOT NULL DEFAULT 0,
    "alertsGenerated" INTEGER NOT NULL DEFAULT 0,
    "lastAlertSent" TIMESTAMP(3),
    "monitoringActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAnalyzed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_trust_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_trust_productId_key" ON "product_trust"("productId");

-- CreateIndex
CREATE INDEX "product_trust_overallTrustScore_idx" ON "product_trust"("overallTrustScore");

-- CreateIndex
CREATE INDEX "product_trust_trustBadge_idx" ON "product_trust"("trustBadge");

-- CreateIndex
CREATE INDEX "product_trust_counterfeiteRisk_idx" ON "product_trust"("counterfeiteRisk");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_trust" ADD CONSTRAINT "product_trust_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
