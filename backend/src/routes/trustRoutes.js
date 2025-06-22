const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { generateContent } = require('../utils/geminiAnalysis');

const router = express.Router();
const prisma = new PrismaClient();

// Suspicious IP ranges (private networks often used for fake reviews)
const SUSPICIOUS_IP_RANGES = [
  { start: '192.168.0.0', end: '192.168.255.255', name: 'Private Class C' },
  { start: '10.0.0.0', end: '10.255.255.255', name: 'Private Class A' },
  { start: '172.16.0.0', end: '172.31.255.255', name: 'Private Class B' },
  { start: '127.0.0.0', end: '127.255.255.255', name: 'Loopback' }
];

class TrustAnalyzer {
  constructor(reviews) {
    this.reviews = reviews;
    this.ipGroups = {};
    this.analysis = {
      totalReviews: reviews.length,
      uniqueIPs: 0,
      ipDiversity: 0,
      clusteringScore: 0,
      suspiciousIPScore: 0,
      timePatternScore: 0,
      finalTrustScore: 0
    };
  }

  // Group reviews by IP address
  groupReviewsByIP() {
    this.reviews.forEach(review => {
      const ip = review.ipAddress || 'unknown';
      if (!this.ipGroups[ip]) {
        this.ipGroups[ip] = [];
      }
      this.ipGroups[ip].push(review);
    });
    
    this.analysis.uniqueIPs = Object.keys(this.ipGroups).filter(ip => ip !== 'unknown').length;
  }

  // Check if IP is in suspicious range
  isSuspiciousIP(ip) {
    if (!ip || ip === 'unknown') return false;
    
    const ipNum = this.ipToNumber(ip);
    return SUSPICIOUS_IP_RANGES.some(range => {
      const startNum = this.ipToNumber(range.start);
      const endNum = this.ipToNumber(range.end);
      return ipNum >= startNum && ipNum <= endNum;
    });
  }

  // Convert IP address to number for comparison
  ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  // Calculate IP diversity score (0-100)
  calculateIPDiversity() {
    if (this.analysis.totalReviews === 0) {
      this.analysis.ipDiversity = 0;
      return;
    }

    // Perfect diversity = each review has unique IP
    const diversityRatio = this.analysis.uniqueIPs / this.analysis.totalReviews;
    this.analysis.ipDiversity = Math.min(diversityRatio * 100, 100);
  }

  // Calculate clustering penalty (0-100, lower is better)
  calculateClusteringScore() {
    let clusteringPenalty = 0;
    const validIPs = Object.keys(this.ipGroups).filter(ip => ip !== 'unknown');
    
    validIPs.forEach(ip => {
      const reviewsFromIP = this.ipGroups[ip].length;
      if (reviewsFromIP > 1) {
        // Exponential penalty for clustering
        const clusterSize = reviewsFromIP;
        const penalty = Math.pow(clusterSize - 1, 1.5) * 10;
        clusteringPenalty += penalty;
      }
    });

    // Normalize penalty (higher clustering = lower score)
    const maxPossiblePenalty = Math.pow(this.analysis.totalReviews - 1, 1.5) * 10;
    const normalizedPenalty = Math.min(clusteringPenalty / maxPossiblePenalty * 100, 100);
    
    this.analysis.clusteringScore = 100 - normalizedPenalty;
  }

  // Calculate suspicious IP penalty
  calculateSuspiciousIPScore() {
    let suspiciousCount = 0;
    let totalValidReviews = 0;

    Object.keys(this.ipGroups).forEach(ip => {
      if (ip !== 'unknown') {
        totalValidReviews += this.ipGroups[ip].length;
        if (this.isSuspiciousIP(ip)) {
          suspiciousCount += this.ipGroups[ip].length;
        }
      }
    });

    if (totalValidReviews === 0) {
      this.analysis.suspiciousIPScore = 50; // Neutral score for no IP data
      return;
    }

    const suspiciousRatio = suspiciousCount / totalValidReviews;
    this.analysis.suspiciousIPScore = 100 - (suspiciousRatio * 100);
  }

  // Calculate time pattern score (reviews from same IP posted too close together)
  calculateTimePatternScore() {
    let timeViolations = 0;
    const validIPs = Object.keys(this.ipGroups).filter(ip => ip !== 'unknown');
    
    validIPs.forEach(ip => {
      const reviews = this.ipGroups[ip];
      if (reviews.length > 1) {
        // Sort reviews by date
        const sortedReviews = reviews.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate));
        
        // Check time gaps between reviews from same IP
        for (let i = 1; i < sortedReviews.length; i++) {
          const timeDiff = new Date(sortedReviews[i].reviewDate) - new Date(sortedReviews[i-1].reviewDate);
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // Reviews from same IP within 24 hours are suspicious
          if (hoursDiff < 24) {
            timeViolations++;
          }
        }
      }
    });

    const maxPossibleViolations = this.analysis.totalReviews;
    const violationRatio = timeViolations / maxPossibleViolations;
    this.analysis.timePatternScore = 100 - (violationRatio * 100);
  }

  // Calculate final weighted trust score
  calculateFinalTrustScore() {
    const weights = {
      ipDiversity: 0.3,        // 30% - How diverse are the IPs
      clustering: 0.25,        // 25% - Penalty for IP clustering
      suspiciousIP: 0.25,      // 25% - Penalty for suspicious IP ranges
      timePattern: 0.2         // 20% - Penalty for suspicious timing
    };

    this.analysis.finalTrustScore = Math.round(
      (this.analysis.ipDiversity * weights.ipDiversity) +
      (this.analysis.clusteringScore * weights.clustering) +
      (this.analysis.suspiciousIPScore * weights.suspiciousIP) +
      (this.analysis.timePatternScore * weights.timePattern)
    );

    // Ensure score is between 0 and 100
    this.analysis.finalTrustScore = Math.max(0, Math.min(100, this.analysis.finalTrustScore));
  }

  // Get detailed analysis breakdown
  getDetailedAnalysis() {
    const ipBreakdown = {};
    Object.keys(this.ipGroups).forEach(ip => {
      ipBreakdown[ip] = {
        reviewCount: this.ipGroups[ip].length,
        isSuspicious: ip !== 'unknown' ? this.isSuspiciousIP(ip) : false,
        reviews: this.ipGroups[ip].map(r => ({
          id: r.id,
          rating: r.reviewRating,
          date: r.reviewDate
        }))
      };
    });

    return {
      trustScore: this.analysis.finalTrustScore,
      breakdown: {
        totalReviews: this.analysis.totalReviews,
        uniqueIPs: this.analysis.uniqueIPs,
        ipDiversityScore: Math.round(this.analysis.ipDiversity),
        clusteringScore: Math.round(this.analysis.clusteringScore),
        suspiciousIPScore: Math.round(this.analysis.suspiciousIPScore),
        timePatternScore: Math.round(this.analysis.timePatternScore)
      },
      ipBreakdown,
      recommendations: this.getRecommendations()
    };
  }

  // Get trust recommendations based on analysis
  getRecommendations() {
    const recommendations = [];
    
    if (this.analysis.ipDiversity < 50) {
      recommendations.push('Low IP diversity detected - many reviews may be from same sources');
    }
    
    if (this.analysis.clusteringScore < 60) {
      recommendations.push('High IP clustering detected - multiple reviews from same IP addresses');
    }
    
    if (this.analysis.suspiciousIPScore < 70) {
      recommendations.push('Reviews from suspicious IP ranges detected (private networks)');
    }
    
    if (this.analysis.timePatternScore < 70) {
      recommendations.push('Suspicious timing patterns - reviews from same IPs posted too close together');
    }

    if (this.analysis.finalTrustScore >= 80) {
      recommendations.push('High trust score - IP patterns appear legitimate');
    } else if (this.analysis.finalTrustScore >= 60) {
      recommendations.push('Moderate trust score - some suspicious patterns detected');
    } else {
      recommendations.push('Low trust score - multiple suspicious IP patterns detected');
    }

    return recommendations;
  }

  // Run complete analysis
  analyze() {
    this.groupReviewsByIP();
    this.calculateIPDiversity();
    this.calculateClusteringScore();
    this.calculateSuspiciousIPScore();
    this.calculateTimePatternScore();
    this.calculateFinalTrustScore();
    
    return this.getDetailedAnalysis();
  }
}

// GET /api/trust/analyze/:productId - Analyze trust score based on IP patterns
router.get('/analyze/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get all reviews for the product
    const reviews = await prisma.reviewInfo.findMany({
      where: { productId },
      select: {
        id: true,
        reviewRating: true,
        reviewDate: true,
        ipAddress: true
      },
      orderBy: { reviewDate: 'asc' }
    });

    if (reviews.length === 0) {
      return res.json({
        productId,
        productName: product.name,
        trustScore: 50, // Neutral score for no reviews
        message: 'No reviews found for analysis',
        breakdown: {
          totalReviews: 0,
          uniqueIPs: 0,
          ipDiversityScore: 0,
          clusteringScore: 0,
          suspiciousIPScore: 0,
          timePatternScore: 0
        },
        recommendations: ['No reviews available for trust analysis']
      });
    }

    // Run trust analysis
    const analyzer = new TrustAnalyzer(reviews);
    const analysis = analyzer.analyze();

    res.json({
      productId,
      productName: product.name,
      ...analysis,
      analyzedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing trust score:', error);
    res.status(500).json({ 
      message: 'Error analyzing trust score',
      error: error.message 
    });
  }
});

// GET /api/trust/batch-analyze - Analyze multiple products at once
router.post('/batch-analyze', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }

    const results = [];

    for (const productId of productIds) {
      try {
        // Get product
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true }
        });

        if (!product) {
          results.push({
            productId,
            error: 'Product not found'
          });
          continue;
        }

        // Get reviews
        const reviews = await prisma.reviewInfo.findMany({
          where: { productId },
          select: {
            id: true,
            reviewRating: true,
            reviewDate: true,
            ipAddress: true
          }
        });

        if (reviews.length === 0) {
          results.push({
            productId,
            productName: product.name,
            trustScore: 50,
            totalReviews: 0
          });
          continue;
        }

        // Analyze trust
        const analyzer = new TrustAnalyzer(reviews);
        const analysis = analyzer.analyze();

        results.push({
          productId,
          productName: product.name,
          trustScore: analysis.trustScore,
          totalReviews: analysis.breakdown.totalReviews,
          uniqueIPs: analysis.breakdown.uniqueIPs
        });

      } catch (error) {
        results.push({
          productId,
          error: error.message
        });
      }
    }

    res.json({
      results,
      analyzedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in batch analysis:', error);
    res.status(500).json({ 
      message: 'Error in batch analysis',
      error: error.message 
    });
  }
});

// GET /api/trust/edit-history/:productId - Analyze trust score based on product edit history patterns
router.get('/edit-history/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get product edit history
    const editHistory = await prisma.productEditHistory.findMany({
      where: { productId },
      include: {
        editor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (editHistory.length === 0) {
      return res.json({
        productId,
        productName: product.name,
        editTrustScore: 100, // Perfect score for no edits (untouched product)
        message: 'No edit history found - product appears untouched',
        editAnalysis: {
          totalEdits: 0,
          uniqueEditors: 0,
          editFrequency: 'None',
          suspiciousPatterns: [],
          recommendations: ['Product has no edit history - this indicates stability']
        }
      });
    }

    // Format edit history for Gemini analysis
    const formattedEdits = editHistory.map((edit, index) => {
      return `
EDIT ${index + 1}:
Date: ${edit.createdAt}
Editor: ${edit.editor.name} (${edit.editor.email}) - Role: ${edit.editor.role}
Field Changed: ${edit.fieldChanged}
Old Value: ${edit.oldValue || 'NULL'}
New Value: ${edit.newValue || 'NULL'}
Edit Type: ${edit.editType}
Reason: ${edit.editReason || 'No reason provided'}
---`;
    }).join('\n');

    // Create analysis prompt for Gemini
    const prompt = `
Analyze the following product edit history for suspicious patterns and calculate a trust score from 0-100.

PRODUCT INFORMATION:
Name: ${product.name}
Category: ${product.category}
Created: ${product.createdAt}
Last Updated: ${product.updatedAt}
Current Price: $${product.price}

EDIT HISTORY (${editHistory.length} total edits):
${formattedEdits}

ANALYSIS CRITERIA:
Please analyze the edit patterns and provide a trust score (0-100) based on:

1. **Edit Frequency**: Excessive edits may indicate manipulation
2. **Editor Diversity**: Multiple different editors vs single editor making many changes
3. **Price Manipulation**: Frequent price changes, especially increases after good reviews
4. **Description Changes**: Frequent description updates could indicate deceptive practices
5. **Timing Patterns**: Edits clustered around review periods or promotional events
6. **Editor Roles**: Admin vs Seller edits (sellers editing their own products frequently is suspicious)
7. **Edit Reasons**: Missing or vague reasons for edits
8. **Value Changes**: Dramatic changes in product information

SCORING GUIDELINES:
- 90-100: Minimal, legitimate edits with clear reasons
- 70-89: Some edits but appear legitimate with reasonable patterns
- 50-69: Moderate edit activity with some suspicious patterns
- 30-49: High edit frequency with multiple suspicious patterns
- 0-29: Excessive edits with clear manipulation patterns

Please provide your response in the following JSON format:
{
  "trustScore": [0-100],
  "analysis": {
    "totalEdits": ${editHistory.length},
    "uniqueEditors": [count],
    "editFrequency": "[Low/Medium/High/Excessive]",
    "suspiciousPatterns": [
      "pattern description 1",
      "pattern description 2"
    ],
    "keyFindings": [
      "finding 1",
      "finding 2"
    ],
    "recommendations": [
      "recommendation 1",
      "recommendation 2"
    ]
  },
  "riskFactors": {
    "priceManipulation": "[Low/Medium/High]",
    "descriptionChanges": "[Low/Medium/High]",
    "editFrequency": "[Low/Medium/High]",
    "editorConsistency": "[Good/Moderate/Poor]"
  }
}

Ensure the JSON is valid and parseable.
`;

    // Get AI analysis from Gemini
    const aiResponse = await generateContent(prompt, {
      model: 'gemini-2.0-flash',
      temperature: 0.3, // Lower temperature for more consistent scoring
      maxOutputTokens: 2048
    });

    // Try to parse JSON from AI response
    let analysisResult;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('AI Response:', aiResponse);
      
      // Fallback analysis if JSON parsing fails
      analysisResult = {
        trustScore: calculateFallbackScore(editHistory),
        analysis: {
          totalEdits: editHistory.length,
          uniqueEditors: [...new Set(editHistory.map(e => e.editedBy))].length,
          editFrequency: editHistory.length > 20 ? 'Excessive' : editHistory.length > 10 ? 'High' : editHistory.length > 5 ? 'Medium' : 'Low',
          suspiciousPatterns: ['AI analysis failed - using fallback calculation'],
          keyFindings: ['Unable to perform detailed pattern analysis'],
          recommendations: ['Manual review recommended due to analysis failure']
        },
        riskFactors: {
          priceManipulation: 'Unknown',
          descriptionChanges: 'Unknown',
          editFrequency: editHistory.length > 10 ? 'High' : 'Medium',
          editorConsistency: 'Unknown'
        }
      };
    }

    // Calculate additional metrics
    const uniqueEditors = [...new Set(editHistory.map(e => e.editedBy))].length;
    const priceEdits = editHistory.filter(e => e.fieldChanged === 'price').length;
    const descriptionEdits = editHistory.filter(e => e.fieldChanged === 'description').length;
    
    // Response with comprehensive analysis
    res.json({
      productId,
      productName: product.name,
      editTrustScore: analysisResult.trustScore,
      editAnalysis: analysisResult.analysis,
      riskFactors: analysisResult.riskFactors,
      statistics: {
        totalEdits: editHistory.length,
        uniqueEditors,
        priceEdits,
        descriptionEdits,
        editorsInvolved: [...new Set(editHistory.map(e => e.editor.name))],
        firstEdit: editHistory[0]?.createdAt,
        lastEdit: editHistory[editHistory.length - 1]?.createdAt
      },
      analyzedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing product edit history:', error);
    res.status(500).json({
      message: 'Error analyzing product edit history',
      error: error.message
    });
  }
});

// Fallback scoring function when AI parsing fails
function calculateFallbackScore(editHistory) {
  let score = 100;
  
  // Penalize excessive edits
  if (editHistory.length > 20) score -= 40;
  else if (editHistory.length > 10) score -= 25;
  else if (editHistory.length > 5) score -= 10;
  
  // Check for price manipulation
  const priceEdits = editHistory.filter(e => e.fieldChanged === 'price').length;
  if (priceEdits > 5) score -= 20;
  else if (priceEdits > 3) score -= 10;
  
  // Check editor diversity
  const uniqueEditors = [...new Set(editHistory.map(e => e.editedBy))].length;
  if (uniqueEditors === 1 && editHistory.length > 10) score -= 15;
  
  return Math.max(0, score);
}

// GET /api/trust/burst-detection/:productId - Detect temporal review bursts
router.get('/burst-detection/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { windowHours = 24, minReviewsInWindow = 5 } = req.query;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await prisma.reviewInfo.findMany({
      where: { productId },
      select: {
        id: true,
        reviewRating: true,
        reviewDate: true,
        ipAddress: true
      },
      orderBy: { reviewDate: 'asc' }
    });

    if (reviews.length === 0) {
      return res.json({
        productId,
        productName: product.name,
        burstScore: 0,
        message: 'No reviews found',
        bursts: []
      });
    }

    // Detect bursts using sliding window
    const bursts = [];
    const windowMs = parseInt(windowHours) * 60 * 60 * 1000;
    const minReviews = parseInt(minReviewsInWindow);

    for (let i = 0; i < reviews.length; i++) {
      const windowStart = new Date(reviews[i].reviewDate);
      const windowEnd = new Date(windowStart.getTime() + windowMs);
      
      const reviewsInWindow = reviews.filter(r => {
        const reviewTime = new Date(r.reviewDate);
        return reviewTime >= windowStart && reviewTime <= windowEnd;
      });

      if (reviewsInWindow.length >= minReviews) {
        // Calculate burst metrics
        const avgRating = reviewsInWindow.reduce((sum, r) => sum + r.reviewRating, 0) / reviewsInWindow.length;
        const uniqueIPs = [...new Set(reviewsInWindow.map(r => r.ipAddress).filter(ip => ip))].length;
        const ipDiversity = reviewsInWindow.length > 0 ? uniqueIPs / reviewsInWindow.length : 0;

        bursts.push({
          startTime: windowStart,
          endTime: windowEnd,
          reviewCount: reviewsInWindow.length,
          averageRating: Math.round(avgRating * 100) / 100,
          uniqueIPs: uniqueIPs,
          ipDiversity: Math.round(ipDiversity * 100) / 100,
          suspiciousScore: calculateBurstSuspicion(reviewsInWindow.length, avgRating, ipDiversity)
        });
      }
    }

    // Remove overlapping bursts, keep the largest ones
    const filteredBursts = filterOverlappingBursts(bursts);
    
    // Calculate overall burst score
    const maxBurstSize = Math.max(...filteredBursts.map(b => b.reviewCount), 0);
    const avgBurstRating = filteredBursts.length > 0 
      ? filteredBursts.reduce((sum, b) => sum + b.averageRating, 0) / filteredBursts.length 
      : 0;
    
    let burstScore = 0;
    if (filteredBursts.length > 0) {
      burstScore = Math.min(100, (maxBurstSize * 10) + 
                           (filteredBursts.length * 15) + 
                           (avgBurstRating > 4.5 || avgBurstRating < 2 ? 25 : 0));
    }

    res.json({
      productId,
      productName: product.name,
      burstScore: Math.round(burstScore),
      windowHours: parseInt(windowHours),
      minReviewsInWindow: minReviews,
      burstsDetected: filteredBursts.length,
      bursts: filteredBursts.map(burst => ({
        ...burst,
        startTime: burst.startTime.toISOString(),
        endTime: burst.endTime.toISOString(),
        riskLevel: burst.suspiciousScore > 70 ? 'HIGH' : burst.suspiciousScore > 40 ? 'MEDIUM' : 'LOW'
      })),
      recommendations: getBurstRecommendations(filteredBursts, burstScore),
      analyzedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error detecting review bursts:', error);
    res.status(500).json({
      message: 'Error detecting review bursts',
      error: error.message
    });
  }
});

// Helper function to calculate burst suspicion score
function calculateBurstSuspicion(reviewCount, avgRating, ipDiversity) {
  let score = reviewCount * 8; // Base score from review count
  
  // Extreme ratings are more suspicious
  if (avgRating >= 4.5 || avgRating <= 2) score += 30;
  else if (avgRating >= 4 || avgRating <= 2.5) score += 15;
  
  // Low IP diversity is suspicious
  if (ipDiversity < 0.3) score += 40;
  else if (ipDiversity < 0.6) score += 20;
  
  return Math.min(100, score);
}

// Helper function to filter overlapping bursts
function filterOverlappingBursts(bursts) {
  if (bursts.length === 0) return [];
  
  // Sort by suspicion score descending
  bursts.sort((a, b) => b.suspiciousScore - a.suspiciousScore);
  
  const filtered = [];
  for (const burst of bursts) {
    // Check if this burst overlaps significantly with any already selected burst
    const hasOverlap = filtered.some(existing => {
      const overlapStart = Math.max(burst.startTime.getTime(), existing.startTime.getTime());
      const overlapEnd = Math.min(burst.endTime.getTime(), existing.endTime.getTime());
      const overlapDuration = Math.max(0, overlapEnd - overlapStart);
      const burstDuration = burst.endTime.getTime() - burst.startTime.getTime();
      return (overlapDuration / burstDuration) > 0.5; // More than 50% overlap
    });
    
    if (!hasOverlap) {
      filtered.push(burst);
    }
  }
  
  return filtered;
}

// Helper function to get recommendations based on burst analysis
function getBurstRecommendations(bursts, burstScore) {
  const recommendations = [];
  
  if (bursts.length === 0) {
    recommendations.push('No suspicious review bursts detected');
    return recommendations;
  }
  
  if (burstScore >= 70) {
    recommendations.push('HIGH RISK: Multiple review bursts detected with suspicious patterns');
  } else if (burstScore >= 40) {
    recommendations.push('MEDIUM RISK: Some review bursts detected, investigate timing patterns');
  }
  
  const hasLowIPDiversity = bursts.some(b => b.ipDiversity < 0.3);
  if (hasLowIPDiversity) {
    recommendations.push('Low IP diversity in review bursts - possible coordinated fake reviews');
  }
  
  const hasExtremeRatings = bursts.some(b => b.averageRating >= 4.5 || b.averageRating <= 2);
  if (hasExtremeRatings) {
    recommendations.push('Extreme ratings detected in bursts - possible manipulation');
  }
  
  const maxBurstSize = Math.max(...bursts.map(b => b.reviewCount));
  if (maxBurstSize >= 20) {
    recommendations.push(`Large review burst detected (${maxBurstSize} reviews) - investigate authenticity`);
  }
  
  return recommendations;
}

module.exports = router; 