
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
    
    // If no text is provided, return default values
    if (!text || text.trim().length === 0) {
      console.log("No text provided for sentiment analysis, returning defaults");
      return {
        overallSentiment: { score: 0.5, label: "Neutral" },
        distribution: { positive: 33, neutral: 34, negative: 33 }
      };
    }
    
    // Simple sentiment analysis based on basic word counting
    // This is a placeholder for actual sentiment analysis
    const words = text.toLowerCase().split(/\s+/);
    
    // Extended positive and negative word lists for better accuracy
    const positiveWords = [
      'good', 'great', 'happy', 'excellent', 'positive', 'love', 'enjoy', 'wonderful', 'joy',
      'pleased', 'delighted', 'grateful', 'thankful', 'excited', 'hopeful', 'optimistic',
      'amazing', 'awesome', 'fantastic', 'superb', 'terrific', 'brilliant', 'outstanding',
      'perfect', 'pleasant', 'satisfied', 'triumph', 'victory', 'win', 'success', 'achieve',
      'friend', 'friendship', 'supportive', 'caring', 'kindness', 'generous', 'healing',
      'confidence', 'trust', 'inspiring', 'inspiration', 'passion', 'empowering', 'peaceful',
      'calm', 'serene', 'harmonious', 'balance', 'progress', 'growth', 'improvement',
      'beautiful', 'lovely', 'attractive', 'impressive', 'favorable', 'refreshing', 'energetic'
    ];
    
    const negativeWords = [
      'bad', 'sad', 'terrible', 'negative', 'hate', 'awful', 'horrible', 'poor', 'worry',
      'annoyed', 'angry', 'upset', 'disappointed', 'frustrated', 'anxious', 'afraid', 'stressed',
      'miserable', 'depressed', 'gloomy', 'painful', 'hurt', 'unhappy', 'tragedy', 'tragic',
      'failure', 'fail', 'lose', 'lost', 'worst', 'trouble', 'difficult', 'trauma', 'traumatic',
      'suffering', 'suffer', 'pain', 'agony', 'distress', 'misfortune', 'disaster', 'grief',
      'sorrow', 'mourning', 'despair', 'hopeless', 'helpless', 'lonely', 'loneliness', 
      'abandoned', 'rejected', 'worthless', 'useless', 'pathetic', 'embarrassed', 'ashamed',
      'guilty', 'regret', 'remorse', 'fear', 'dread', 'terror', 'horrified', 'scared'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    console.log(`Found ${positiveCount} positive words and ${negativeCount} negative words`);
    
    // Count neutral words as those that are not in positive or negative lists
    const neutralCount = words.length - positiveCount - negativeCount;
    const totalWords = words.length || 1; // Avoid division by zero
    
    // Calculate percentages for distribution
    const positivePercentage = (positiveCount / totalWords) * 100;
    const negativePercentage = (negativeCount / totalWords) * 100;
    const neutralPercentage = 100 - positivePercentage - negativePercentage;
    
    // Calculate weighted sentiment score (0-1)
    const sentimentScore = 0.5 + ((positiveCount - negativeCount) / (positiveCount + negativeCount + 1)) * 0.5;
    
    // Determine sentiment label
    let sentimentLabel = "Neutral";
    if (sentimentScore > 0.65) sentimentLabel = "Positive";
    else if (sentimentScore < 0.35) sentimentLabel = "Negative";
    
    const distribution = {
      positive: Math.round(positivePercentage),
      neutral: Math.round(neutralPercentage),
      negative: Math.round(negativePercentage)
    };
    
    console.log("Calculated sentiment:", {
      score: sentimentScore,
      label: sentimentLabel,
      distribution
    });
    
    return {
      overallSentiment: {
        score: sentimentScore,
        label: sentimentLabel
      },
      distribution
    };
  } catch (error) {
    console.error("Error calculating sentiment:", error);
    return {
      overallSentiment: { score: 0.5, label: "Neutral" },
      distribution: { positive: 33, neutral: 34, negative: 33 }
    };
  }
};
