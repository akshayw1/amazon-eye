-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "productAnalysisId" TEXT;

-- CreateTable
CREATE TABLE "review_info" (
    "id" TEXT NOT NULL,
    "reviewRating" INTEGER NOT NULL,
    "numberOfHelpful" INTEGER NOT NULL,
    "reviewBody" TEXT NOT NULL,
    "reviewTitle" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_analysis" (
    "id" TEXT NOT NULL,
    "product_ID" TEXT NOT NULL,
    "n_of_reviews" INTEGER NOT NULL,
    "avg_review_rating" DOUBLE PRECISION NOT NULL,
    "avg_days_between_reviews" DOUBLE PRECISION NOT NULL,
    "max_days_between_reviews" INTEGER NOT NULL,
    "min_days_between_reviews" INTEGER NOT NULL,
    "cluster_ID" INTEGER NOT NULL,
    "pagerank" DOUBLE PRECISION NOT NULL,
    "eigenvector_cent" DOUBLE PRECISION NOT NULL,
    "clustering_coef" DOUBLE PRECISION NOT NULL,
    "w_degree" INTEGER NOT NULL,
    "fake_score" DOUBLE PRECISION NOT NULL,
    "fake" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_info_productId_idx" ON "review_info"("productId");

-- CreateIndex
CREATE INDEX "review_info_reviewerId_idx" ON "review_info"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "product_analysis_product_ID_key" ON "product_analysis"("product_ID");

-- CreateIndex
CREATE INDEX "product_analysis_product_ID_idx" ON "product_analysis"("product_ID");

-- CreateIndex
CREATE INDEX "product_analysis_fake_score_idx" ON "product_analysis"("fake_score");

-- CreateIndex
CREATE INDEX "product_analysis_cluster_ID_idx" ON "product_analysis"("cluster_ID");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productAnalysisId_fkey" FOREIGN KEY ("productAnalysisId") REFERENCES "product_analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_info" ADD CONSTRAINT "review_info_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_info" ADD CONSTRAINT "review_info_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_analysis" ADD CONSTRAINT "product_analysis_to_product" FOREIGN KEY ("product_ID") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_analysis" ADD CONSTRAINT "product_analysis_to_trust" FOREIGN KEY ("product_ID") REFERENCES "product_trust"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
