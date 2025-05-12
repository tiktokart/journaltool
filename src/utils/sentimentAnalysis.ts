
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
    
    // Extended positive and negative word lists for better accuracy
    const positiveWords = [
      'good', 'great', 'happy', 'excellent', 'positive', 'love', 'enjoy', 'wonderful', 'joy',
      'pleased', 'delighted', 'grateful', 'thankful', 'excited', 'hopeful', 'optimistic',
      'amazing', 'awesome', 'fantastic', 'superb', 'terrific', 'brilliant', 'outstanding',
      'perfect', 'pleasant', 'satisfied', 'triumph', 'victory', 'win', 'success', 'achieve',
      'friend', 'friendship', 'supportive', 'caring', 'kindness', 'generous', 'healing'
    ];
    const negativeWords = [
      'bad', 'sad', 'terrible', 'negative', 'hate', 'awful', 'horrible', 'poor', 'worry',
      'annoyed', 'angry', 'upset', 'disappointed', 'frustrated', 'anxious', 'afraid', 'stressed',
      'miserable', 'depressed', 'gloomy', 'painful', 'hurt', 'unhappy', 'tragedy', 'tragic',
      'failure', 'fail', 'lose', 'lost', 'worst', 'trouble', 'difficult', 'trauma', 'traumatic',
      'suffering', 'suffer', 'pain', 'agony', 'distress', 'misfortune', 'disaster'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const neutralCount = words.length - positiveCount - negativeCount;
    const totalSentimentWords = words.length || 1; // Avoid division by zero
    
    // Calculate a more balanced sentiment score 
    const positivePercentage = (positiveCount / totalSentimentWords) * 100;
    const negativePercentage = (negativeCount / totalSentimentWords) * 100;
    const neutralPercentage = 100 - positivePercentage - negativePercentage;
    
    // Calculate sentiment score (0-1)
    const sentimentScore = 0.5 + ((positiveCount - negativeCount) / totalSentimentWords) * 0.5;
    
    // Determine sentiment label
    let sentimentLabel = "Neutral";
    if (sentimentScore > 0.65) sentimentLabel = "Positive";
    else if (sentimentScore < 0.35) sentimentLabel = "Negative";
    
    console.log("Calculated sentiment distribution:", {
      positive: positivePercentage,
      neutral: neutralPercentage,
      negative: negativePercentage
    });
    
    return {
      overallSentiment: {
        score: sentimentScore,
        label: sentimentLabel
      },
      distribution: {
        positive: Math.round(positivePercentage),
        neutral: Math.round(neutralPercentage),
        negative: Math.round(negativePercentage)
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
