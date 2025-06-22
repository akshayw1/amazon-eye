const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const csv = require('csv-parse');
const path = require('path');

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, '../../product_clean/selected_120_products.csv');

async function importNetworkData() {
  try {
    const parser = fs
      .createReadStream(CSV_PATH)
      .pipe(csv.parse({
        columns: true,
        skip_empty_lines: true
      }));

    console.log('Starting network data import...');
    
    for await (const record of parser) {
      try {
        // Find the product by originalProductId
        const product = await prisma.product.findFirst({
          where: {
            originalProductId: parseInt(record.product_ID)
          }
        });

        if (!product) {
          console.log(`No product found for originalProductId: ${record.product_ID}`);
          continue;
        }

        // Update the product with network analysis data
        await prisma.product.update({
          where: {
            id: product.id
          },
          data: {
            clusterId: record.cluster_ID ? parseInt(record.cluster_ID) : null,
            pageRank: record.pagerank ? parseFloat(record.pagerank) : null,
            eigenvectorCent: record.eigenvector_cent ? parseFloat(record.eigenvector_cent) : null,
            clusteringCoef: record.clustering_coef ? parseFloat(record.clustering_coef) : null,
            weightedDegree: record.w_degree ? parseInt(record.w_degree) : null
          }
        });

        console.log(`Updated network data for product ID: ${product.id}`);
      } catch (error) {
        console.error(`Error processing record:`, record, error);
      }
    }

    console.log('Network data import completed successfully!');
  } catch (error) {
    console.error('Error importing network data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importNetworkData(); 