const FormData = require('form-data');
const axios = require('axios');

const IMAGE_VERIFICATION_API = 'http://3.105.188.203:5000/verify-seller-image';

/**
 * Verifies the authenticity of a product image by comparing seller's image with reviewer's image
 * @param {string} sellerImage - URL of the seller's product image
 * @param {Buffer} reviewerImage - Buffer of the image uploaded by reviewer
 * @returns {Promise<{authenticity_score: number, analysis: string}>}
 */
async function verifyProductImage(sellerImage, reviewerImage) {
  try {
    // Create form data
    const formData = new FormData();
    
    // Get seller image from URL and convert to buffer
    const sellerImageResponse = await axios.get(sellerImage, { responseType: 'arraybuffer' });
    const sellerImageBuffer = Buffer.from(sellerImageResponse.data);

    // Add both images to form data
    formData.append('seller_image', sellerImageBuffer, { filename: 'seller_image.jpg' });
    formData.append('reviewer_image', reviewerImage, { filename: 'reviewer_image.jpg' });

    // Make request to verification API
    const response = await axios.post(IMAGE_VERIFICATION_API, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error verifying product image:', error);
    throw new Error('Failed to verify product image');
  }
}

module.exports = {
  verifyProductImage,
}; 