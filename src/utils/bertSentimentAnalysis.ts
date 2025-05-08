
import { pipeline } from "@huggingface/transformers";

// Cache for the sentiment analysis pipeline to avoid reloading the model
let sentimentPipeline: any = null;
let isModelLoading = false;
let modelLoadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

export interface SentimentResult {
  label: string;
  score: number;
  normalizedScore: number; // 0-1 scale where 1 is most positive
}

/**
 * Initialize the ModernBERT sentiment analysis model
 */
export const initBertModel = async (): Promise<void> => {
  // If model is already loaded or currently loading, don't try to load it again
  if (sentimentPipeline || isModelLoading) {
    return;
  }
  
  // If we've already tried to load the model too many times, don't try again
  if (modelLoadAttempts >= MAX_LOAD_ATTEMPTS) {
    throw new Error(`Failed to load ModernBERT model after ${MAX_LOAD_ATTEMPTS} attempts`);
  }
  
  isModelLoading = true;
  modelLoadAttempts++;
  
  try {
    console.log("Initializing ModernBERT sentiment analysis model...");
    
    // Use ModernBERT from answerdotai
    // This is a more modern model with better performance
    sentimentPipeline = await pipeline(
      "sentiment-analysis",
      "answerdotai/ModernBERT-large"
      // Removed the quantized option as it's causing a TypeScript error
    );
    
    console.log("ModernBERT model loaded successfully");
    
    // Reset loading state and attempts after successful load
    isModelLoading = false;
  } catch (error) {
    console.error("Error loading ModernBERT model:", error);
    isModelLoading = false;
    throw new Error("Failed to load ModernBERT model");
  }
};

/**
 * Analyze sentiment of a given text using ModernBERT
 * @param text The text to analyze
 * @returns Promise resolving to sentiment result
 */
export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  // Skip empty or very short text
  if (!text || text.trim().length < 2) {
    return {
      label: "NEUTRAL",
      score: 0.5,
      normalizedScore: 0.5
    };
  }
  
  if (!sentimentPipeline) {
    try {
      await initBertModel();
    } catch (error) {
      console.warn("Falling back to neutral sentiment due to model initialization failure:", error);
      return {
        label: "NEUTRAL",
        score: 0.5,
        normalizedScore: 0.5
      };
    }
  }

  try {
    // Limit text length to avoid memory issues with very long text
    const truncatedText = text.length > 2000 ? text.substring(0, 2000) : text;
    
    // Analyze the sentiment using the pipeline
    const result = await sentimentPipeline(truncatedText);
    
    if (!result || result.length === 0) {
      throw new Error("No result from sentiment analysis");
    }

    const { label, score } = result[0];
    
    // Convert the ModernBERT sentiment result to a normalized score between 0 and 1
    // where 1 is the most positive
    const normalizedScore = label.toLowerCase() === "positive" 
      ? score 
      : 1 - score;

    return {
      label,
      score,
      normalizedScore
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    // Return a neutral sentiment if analysis fails
    return {
      label: "NEUTRAL",
      score: 0.5,
      normalizedScore: 0.5
    };
  }
};

/**
 * Batch analyze multiple texts
 * @param texts Array of texts to analyze
 * @returns Promise resolving to array of sentiment results
 */
export const batchAnalyzeSentiment = async (texts: string[]): Promise<SentimentResult[]> => {
  // Filter out empty texts
  const validTexts = texts.filter(text => text && text.trim().length >= 2);
  
  if (validTexts.length === 0) {
    return [];
  }
  
  if (!sentimentPipeline) {
    try {
      await initBertModel();
    } catch (error) {
      console.warn("Falling back to neutral sentiments due to model initialization failure:", error);
      return validTexts.map(() => ({
        label: "NEUTRAL",
        score: 0.5,
        normalizedScore: 0.5
      }));
    }
  }

  // For small batches, process sequentially to avoid memory issues
  if (validTexts.length <= 10) {
    try {
      const results: SentimentResult[] = [];
      for (const text of validTexts) {
        results.push(await analyzeSentiment(text));
      }
      return results;
    } catch (error) {
      console.error("Error in sequential batch sentiment analysis:", error);
      return validTexts.map(() => ({
        label: "NEUTRAL",
        score: 0.5,
        normalizedScore: 0.5
      }));
    }
  }

  try {
    // Truncate long texts to avoid memory issues
    const truncatedTexts = validTexts.map(text => 
      text.length > 2000 ? text.substring(0, 2000) : text
    );
    
    // For larger batches, use the pipeline's native batching
    const rawResults = await sentimentPipeline(truncatedTexts);
    
    return rawResults.map((result: any) => {
      const { label, score } = result;
      const normalizedScore = label.toLowerCase() === "positive" 
        ? score 
        : 1 - score;
      
      return {
        label,
        score,
        normalizedScore
      };
    });
  } catch (error) {
    console.error("Error batch analyzing sentiment:", error);
    // Try sequential processing if batch processing fails
    try {
      console.log("Falling back to sequential processing for batch sentiment analysis");
      const results: SentimentResult[] = [];
      for (const text of validTexts) {
        results.push(await analyzeSentiment(text));
      }
      return results;
    } catch (secondError) {
      console.error("Sequential fallback also failed:", secondError);
      // Return neutral sentiments if both methods fail
      return validTexts.map(() => ({
        label: "NEUTRAL",
        score: 0.5,
        normalizedScore: 0.5
      }));
    }
  }
};

/**
 * Get a label for a sentiment score
 * @param score Normalized sentiment score (0-1)
 * @returns Sentiment label
 */
export const getSentimentLabel = (score: number): string => {
  if (score >= 0.7) return "Very Positive";
  if (score >= 0.5) return "Positive";
  if (score >= 0.4) return "Neutral";
  if (score >= 0.25) return "Negative";
  return "Very Negative";
};

/**
 * Get a color for a sentiment score - ensures emotions always have a color
 * @param score Normalized sentiment score (0-1)
 * @returns Color string in hex format
 */
export const getSentimentColor = (score: number): string => {
  if (score >= 0.7) return "#27AE60"; // Very Positive - Green
  if (score >= 0.5) return "#3498DB"; // Positive - Blue
  if (score >= 0.4) return "#F39C12"; // Neutral - Orange
  if (score >= 0.25) return "#E67E22"; // Negative - Dark Orange
  return "#E74C3C"; // Very Negative - Red
};

/**
 * Map emotional tone to a color
 * @param emotion Emotional tone label
 * @returns Color string in hex format
 */
export const getEmotionColor = (emotion: string): string => {
  const emotions: Record<string, string> = {
    "Joy": "#FFD700",        // Gold color for Joy
    "Joyful": "#F1C40F",     // Yellow color for Joyful (changed from gold to distinguish from Joy)
    "Happy": "#2ECC71",      // Light Green
    "Excited": "#E67E22",    // Orange
    "Peaceful": "#3498DB",   // Blue
    "Calm": "#2980B9",       // Dark Blue
    "Neutral": "#95A5A6",    // Gray
    "Anxious": "#E74C3C",    // Red
    "Angry": "#C0392B",      // Dark Red
    "Sad": "#9B59B6",        // Purple
    "Depressed": "#8E44AD",  // Dark Purple
    "Frustrated": "#D35400", // Burnt Orange
    "Confused": "#F39C12",   // Light Orange
    "Scared": "#7F8C8D",     // Dark Gray
    "Disgusted": "#6C3483",  // Violet
    "Surprised": "#16A085",  // Teal
    "Fearful": "#D35400"     // Burnt Orange (same as Scared)
  };
  
  // Return the color for the emotion or default to gray if not found
  return emotions[emotion] || "#95A5A6";
};
