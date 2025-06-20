const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyBIeKW_bRNqEg256K4ZoDQpNimOp_ABsqM");

/**
 * Analyze call transcript using Gemini AI
 * @param {Array} transcript - Array of conversation objects [{type: 'agent/user', text: '', timestamp: ''}]
 * @param {Object} context - Additional context for analysis (optional)
 * @returns {Promise<string>} - AI-generated summary and analysis
 */
async function analyzeCallTranscript(transcript, context = {}) {
  try {
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      throw new Error('Invalid transcript provided');
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Format transcript for analysis
    const formattedTranscript = transcript
      .map(msg => `${msg.type.toUpperCase()}: ${msg.text}`)
      .join('\n');

    // Create analysis prompt
    const prompt = `
Analyze the following customer service call transcript between an Amazon customer service agent (Sakshi) and a customer regarding a return request.

TRANSCRIPT:
${formattedTranscript}

${context.productName ? `PRODUCT: ${context.productName}` : ''}
${context.returnReason ? `RETURN REASON: ${context.returnReason}` : ''}
${context.orderNumber ? `ORDER NUMBER: ${context.orderNumber}` : ''}

Please provide a comprehensive analysis including:

1. **Call Summary**: Brief overview of the conversation
2. **Customer Issue**: What problem the customer experienced
3. **Customer Sentiment**: Customer's emotional state and satisfaction level
4. **Resolution Offered**: What solution was provided or discussed
5. **Next Steps**: Any follow-up actions mentioned
6. **Call Quality**: Assessment of the agent's performance and customer service quality
7. **Key Insights**: Important points or concerns raised during the call

Format your response in a clear, structured manner that would be useful for customer service management and quality assurance.
`;

    // Generate analysis
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    return analysisText;
  } catch (error) {
    console.error('Error analyzing call transcript with Gemini:', error);
    throw new Error(`Failed to analyze transcript: ${error.message}`);
  }
}

/**
 * Analyze product reviews using Gemini AI
 * @param {Array} reviews - Array of review objects
 * @param {Object} productInfo - Product information
 * @returns {Promise<string>} - AI-generated analysis
 */
async function analyzeProductReviews(reviews, productInfo = {}) {
  try {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      throw new Error('Invalid reviews provided');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Format reviews for analysis
    const formattedReviews = reviews
      .map((review, index) => `
REVIEW ${index + 1}:
Rating: ${review.reviewRating}/5
Title: ${review.reviewTitle}
Body: ${review.reviewBody}
Date: ${review.reviewDate}
---`)
      .join('\n');

    const prompt = `
Analyze the following product reviews for insights and patterns.

PRODUCT: ${productInfo.name || 'Unknown Product'}
TOTAL REVIEWS: ${reviews.length}

REVIEWS:
${formattedReviews}

Please provide analysis including:
1. **Overall Sentiment**: General customer satisfaction
2. **Common Praise**: What customers like most
3. **Common Complaints**: Recurring issues or problems
4. **Quality Indicators**: Signs of product quality
5. **Trust Assessment**: Authenticity and reliability indicators
6. **Recommendations**: Suggestions for improvement

Provide a structured analysis that would help with product quality assessment and customer satisfaction improvement.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    return analysisText;
  } catch (error) {
    console.error('Error analyzing product reviews with Gemini:', error);
    throw new Error(`Failed to analyze reviews: ${error.message}`);
  }
}

/**
 * Generate content using Gemini AI with custom prompt
 * @param {string} prompt - Custom prompt for AI generation
 * @param {Object} options - Generation options
 * @returns {Promise<string>} - AI-generated content
 */
async function generateContent(prompt, options = {}) {
  try {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided');
    }

    const model = genAI.getGenerativeModel({ 
      model: options.model || 'gemini-pro',
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxOutputTokens || 2048,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    return generatedText;
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

module.exports = {
  analyzeCallTranscript,
  analyzeProductReviews,
  generateContent
}; 