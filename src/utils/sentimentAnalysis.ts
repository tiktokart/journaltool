
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
    
    // Enhanced sentiment analysis based on text content
    const words = text.toLowerCase().split(/\s+/);
    
    // Extended positive and negative word lists for better accuracy
    // Include more verbs and action words
    const positiveWords = [
      // Original list
      'good', 'great', 'happy', 'excellent', 'positive', 'love', 'enjoy', 'wonderful', 'joy',
      'pleased', 'delighted', 'grateful', 'thankful', 'excited', 'hopeful', 'optimistic',
      'amazing', 'awesome', 'fantastic', 'superb', 'terrific', 'brilliant', 'outstanding',
      'perfect', 'pleasant', 'satisfied', 'triumph', 'victory', 'win', 'success', 'achieve',
      'friend', 'friendship', 'supportive', 'caring', 'kindness', 'generous', 'healing',
      'confidence', 'trust', 'inspiring', 'inspiration', 'passion', 'empowering', 'peaceful',
      'calm', 'serene', 'harmonious', 'balance', 'progress', 'growth', 'improvement',
      'beautiful', 'lovely', 'attractive', 'impressive', 'favorable', 'refreshing', 'energetic',
      
      // Added action verbs (positive)
      'accomplish', 'encourage', 'embrace', 'celebrate', 'praise', 'thrive', 'flourish', 
      'elevate', 'motivate', 'inspire', 'laugh', 'smile', 'succeed', 'prosper', 'help',
      'create', 'build', 'develop', 'strengthen', 'enhance', 'boost', 'uplift', 'empower',
      'transform', 'overcome', 'achieved', 'welcomed', 'supported', 'protected', 'nurtured',
      'healed', 'recovered', 'reconnected', 'reunited', 'restored', 'revitalized'
    ];
    
    const negativeWords = [
      // Original list
      'bad', 'sad', 'terrible', 'negative', 'hate', 'awful', 'horrible', 'poor', 'worry',
      'annoyed', 'angry', 'upset', 'disappointed', 'frustrated', 'anxious', 'afraid', 'stressed',
      'miserable', 'depressed', 'gloomy', 'painful', 'hurt', 'unhappy', 'tragedy', 'tragic',
      'failure', 'fail', 'lose', 'lost', 'worst', 'trouble', 'difficult', 'trauma', 'traumatic',
      'suffering', 'suffer', 'pain', 'agony', 'distress', 'misfortune', 'disaster', 'grief',
      'sorrow', 'mourning', 'despair', 'hopeless', 'helpless', 'lonely', 'loneliness', 
      'abandoned', 'rejected', 'worthless', 'useless', 'pathetic', 'embarrassed', 'ashamed',
      'guilty', 'regret', 'remorse', 'fear', 'dread', 'terror', 'horrified', 'scared',
      
      // Added action verbs (negative)
      'struggle', 'fight', 'argue', 'destroy', 'damage', 'ruin', 'shatter', 'break', 'hurt',
      'wound', 'injure', 'crush', 'devastate', 'collapse', 'failed', 'defeated', 'rejected',
      'attacked', 'betrayed', 'abandoned', 'ignored', 'neglected', 'criticized', 'blamed',
      'punished', 'threatened', 'intimidated', 'manipulated', 'exploited', 'trapped',
      'suffered', 'endured', 'tolerated', 'withstood', 'experienced', 'confronted'
    ];
    
    // Subject/noun lists to enhance the analysis
    const positiveSubjects = [
      'friend', 'family', 'love', 'support', 'home', 'success', 'achievement', 'opportunity',
      'joy', 'happiness', 'peace', 'harmony', 'beauty', 'nature', 'sunshine', 'comfort',
      'blessing', 'gift', 'reward', 'triumph', 'victory', 'celebration', 'progress', 'growth',
      'improvement', 'breakthrough', 'accomplishment', 'milestone', 'connection', 'relationship',
      'friendship', 'partnership', 'teamwork', 'collaboration', 'community'
    ];
    
    const negativeSubjects = [
      'enemy', 'conflict', 'hate', 'rejection', 'failure', 'loss', 'defeat', 'obstacle',
      'sorrow', 'depression', 'anxiety', 'fear', 'trauma', 'pain', 'suffering', 'distress',
      'misfortune', 'disaster', 'tragedy', 'crisis', 'problem', 'difficulty', 'challenge',
      'struggle', 'hardship', 'burden', 'pressure', 'stress', 'tension', 'conflict',
      'argument', 'fight', 'battle', 'war', 'disaster'
    ];
    
    // Combine all positive and negative words
    const allPositiveWords = [...positiveWords, ...positiveSubjects];
    const allNegativeWords = [...negativeWords, ...negativeSubjects];
    
    // Count all matches
    let positiveCount = 0;
    let negativeCount = 0;
    let totalMatchedWords = 0;
    
    // Track which words were matched for debugging
    const matchedPositiveWords: string[] = [];
    const matchedNegativeWords: string[] = [];
    
    words.forEach(word => {
      if (allPositiveWords.includes(word)) {
        positiveCount++;
        totalMatchedWords++;
        matchedPositiveWords.push(word);
      }
      if (allNegativeWords.includes(word)) {
        negativeCount++;
        totalMatchedWords++;
        matchedNegativeWords.push(word);
      }
    });
    
    console.log(`Found ${positiveCount} positive words: ${matchedPositiveWords.slice(0, 10).join(', ')}${matchedPositiveWords.length > 10 ? '...' : ''}`);
    console.log(`Found ${negativeCount} negative words: ${matchedNegativeWords.slice(0, 10).join(', ')}${matchedNegativeWords.length > 10 ? '...' : ''}`);
    
    // Calculate neutral words (includes all non-matched words)
    const neutralCount = words.length - positiveCount - negativeCount;
    const totalWords = words.length || 1; // Avoid division by zero
    
    // Calculate actual raw counts for the distribution
    const distribution = {
      positive: positiveCount,
      neutral: neutralCount,
      negative: negativeCount
    };
    
    // Calculate percentages for visualization
    const positivePercentage = Math.round((positiveCount / totalWords) * 100);
    const negativePercentage = Math.round((negativeCount / totalWords) * 100);
    const neutralPercentage = 100 - positivePercentage - negativePercentage;
    
    // Calculate weighted sentiment score (0-1)
    // Adjusted to be more sensitive to changes in positive/negative ratios
    const positiveRatio = totalMatchedWords > 0 ? positiveCount / totalMatchedWords : 0.5;
    const sentimentScore = Math.max(0.1, Math.min(0.9, positiveRatio));
    
    // Determine sentiment label with more granularity
    let sentimentLabel = "Neutral";
    if (sentimentScore > 0.65) sentimentLabel = "Positive";
    else if (sentimentScore < 0.35) sentimentLabel = "Negative";
    
    const distributionPercentages = {
      positive: positivePercentage,
      neutral: neutralPercentage,
      negative: negativePercentage
    };
    
    console.log("Calculated sentiment:", {
      score: sentimentScore,
      label: sentimentLabel,
      distribution,
      distributionPercentages,
      wordCounts: {
        total: totalWords,
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount
      }
    });
    
    return {
      overallSentiment: {
        score: sentimentScore,
        label: sentimentLabel
      },
      distribution: distributionPercentages
    };
  } catch (error) {
    console.error("Error calculating sentiment:", error);
    return {
      overallSentiment: { score: 0.5, label: "Neutral" },
      distribution: { positive: 33, neutral: 34, negative: 33 }
    };
  }
};
