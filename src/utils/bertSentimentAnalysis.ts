import { pipeline } from "@huggingface/transformers";

// Cache for the sentiment analysis pipeline to avoid reloading the model
let sentimentPipeline: any = null;

export interface SentimentResult {
  label: string;
  score: number;
  normalizedScore: number; // 0-1 scale where 1 is most positive
}

/**
 * Initialize the BERT sentiment analysis model
 */
export const initBertModel = async (): Promise<void> => {
  if (!sentimentPipeline) {
    try {
      console.log("Initializing BERT sentiment analysis model...");
      // Use a smaller distilled BERT model for faster loading and inference
      sentimentPipeline = await pipeline(
        "sentiment-analysis",
        "distilbert-base-uncased-finetuned-sst-2-english"
      );
      console.log("BERT model loaded successfully");
    } catch (error) {
      console.error("Error loading BERT model:", error);
      throw new Error("Failed to load BERT model");
    }
  }
};

/**
 * Analyze sentiment of a given text using BERT
 * @param text The text to analyze
 * @returns Promise resolving to sentiment result
 */
export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  if (!sentimentPipeline) {
    await initBertModel();
  }

  try {
    // Analyze the sentiment using the pipeline
    const result = await sentimentPipeline(text);
    
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
  if (!sentimentPipeline) {
    await initBertModel();
  }

  // For small batches, process sequentially to avoid memory issues
  if (texts.length <= 10) {
    const results: SentimentResult[] = [];
    for (const text of texts) {
      results.push(await analyzeSentiment(text));
    }
    return results;
  }

  try {
    // For larger batches, use the pipeline's native batching
    const rawResults = await sentimentPipeline(texts);
    
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
    // Return neutral sentiments if analysis fails
    return texts.map(() => ({
      label: "NEUTRAL",
      score: 0.5,
      normalizedScore: 0.5
    }));
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
