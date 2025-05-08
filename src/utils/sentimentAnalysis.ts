
/**
 * Calculates sentiment scores for the document text
 * @param text The document text to analyze
 * @returns Object containing overall sentiment and distribution
 */
export const calculateSentiment = async (text: string): Promise<{
  overallSentiment: { score: number; label: string };
  distribution: { positive: number; neutral: number; negative: number };
}> => {
  try {
    console.log("Analyzing sentiment for text:", text.substring(0, 100) + "...");
    
    // Simple sentiment analysis based on basic word counting
    // This is a placeholder for actual sentiment analysis
    const words = text.toLowerCase().split(/\s+/);
    
    // Simple positive and negative word lists
    const positiveWords = ['good', 'great', 'happy', 'excellent', 'positive', 'love', 'enjoy', 'wonderful', 'joy'];
    const negativeWords = ['bad', 'sad', 'terrible', 'negative', 'hate', 'awful', 'horrible', 'poor', 'worry'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const totalSentimentWords = positiveCount + negativeCount || 1; // Avoid division by zero
    const sentimentScore = (positiveCount / totalSentimentWords) || 0.5;
    
    // Determine sentiment label
    let sentimentLabel = "Neutral";
    if (sentimentScore > 0.6) sentimentLabel = "Positive";
    else if (sentimentScore < 0.4) sentimentLabel = "Negative";
    
    // Calculate distribution percentages
    const positivePercentage = Math.round(sentimentScore * 100);
    const negativePercentage = Math.round((1 - sentimentScore) * 0.7 * 100);
    const neutralPercentage = 100 - positivePercentage - negativePercentage;
    
    return {
      overallSentiment: {
        score: sentimentScore,
        label: sentimentLabel
      },
      distribution: {
        positive: positivePercentage,
        neutral: neutralPercentage,
        negative: negativePercentage
      }
    };
  } catch (error) {
    console.error("Error calculating sentiment:", error);
    return {
      overallSentiment: { score: 0.5, label: "Neutral" },
      distribution: { positive: 33, neutral: 34, negative: 33 }
    };
  }
};
