-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cluster_ID" INTEGER,
ADD COLUMN     "clustering_coef" DOUBLE PRECISION,
ADD COLUMN     "eigenvector_cent" DOUBLE PRECISION,
ADD COLUMN     "pagerank" DOUBLE PRECISION,
ADD COLUMN     "w_degree" INTEGER;
