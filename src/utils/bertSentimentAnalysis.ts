
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
 * Initialize the BERT sentiment analysis model
 */
export const initBertModel = async (): Promise<void> => {
  // If model is already loaded or currently loading, don't try to load it again
  if (sentimentPipeline || isModelLoading) {
    return;
  }
  
  // If we've already tried to load the model too many times, don't try again
  if (modelLoadAttempts >= MAX_LOAD_ATTEMPTS) {
    throw new Error(`Failed to load BERT model after ${MAX_LOAD_ATTEMPTS} attempts`);
  }
  
  isModelLoading = true;
  modelLoadAttempts++;
  
  try {
    console.log("Initializing BERT sentiment analysis model...");
    
    // Use a model that's compatible with transformers.js in the browser
    // The ONNX version is more reliable for browser usage
    sentimentPipeline = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english" // Using Xenova's version which is browser-compatible
    );
    
    console.log("BERT model loaded successfully");
    
    // Reset loading state and attempts after successful load
    isModelLoading = false;
  } catch (error) {
    console.error("Error loading BERT model:", error);
    isModelLoading = false;
    throw new Error("Failed to load BERT model");
  }
};

/**
 * Analyze sentiment of a given text using BERT
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
    
    // Convert the BERT sentiment result to a normalized score between 0 and 1
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
