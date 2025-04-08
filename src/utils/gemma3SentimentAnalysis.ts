
import { pipeline } from "@huggingface/transformers";
import { toast } from "sonner";

export async function analyzeTextWithGemma3(text: string): Promise<{
  sentiment: number;
  emotionalTones: { [key: string]: number };
}> {
  try {
    toast.info("Initializing Gemma 3 model...");
    
    // Initialize the sentiment-analysis pipeline with Gemma 3
    const classifier = await pipeline(
      "sentiment-analysis",
      "onnx-community/gemma-3-small-8B",
      { device: "webgpu" }
    );
    
    toast.info("Analyzing text with Gemma 3...");
    
    // Split text into chunks of reasonable size to avoid overwhelming the model
    const chunkSize = 512;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    
    // Process each chunk and average the results
    const results = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const result = await classifier(chunk);
          return result;
        } catch (error) {
          console.error("Error processing chunk:", error);
          return null;
        }
      })
    );
    
    // Filter out null results and compute sentiment score
    const validResults = results.filter(r => r !== null);
    
    if (validResults.length === 0) {
      throw new Error("Failed to get valid analysis results");
    }
    
    // Process the results to get sentiment score
    const sentiments = validResults.map(result => {
      if (Array.isArray(result) && result.length > 0) {
        // Normalize label to positive/negative
        const label = result[0].label.toLowerCase();
        if (label.includes("positive")) {
          return result[0].score;
        } else if (label.includes("negative")) {
          return 1 - result[0].score;
        } else {
          return 0.5; // Neutral
        }
      }
      return 0.5;
    });
    
    // Average the sentiment scores
    const averageSentiment = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
    
    // Mock emotional tones for now (in a real app, we'd extract from Gemma 3)
    const emotionalTones = {
      "Joy": averageSentiment > 0.7 ? 0.8 : 0.2,
      "Sadness": averageSentiment < 0.3 ? 0.8 : 0.2,
      "Fear": averageSentiment < 0.4 ? 0.6 : 0.1,
      "Anger": averageSentiment < 0.3 ? 0.7 : 0.1,
      "Surprise": Math.random() * 0.5,
      "Disgust": averageSentiment < 0.3 ? 0.5 : 0.1,
    };
    
    toast.success("Gemma 3 analysis complete!");
    
    return {
      sentiment: averageSentiment,
      emotionalTones
    };
  } catch (error) {
    console.error("Error analyzing text with Gemma 3:", error);
    toast.error("Failed to analyze text with Gemma 3");
    
    // Return default values in case of error
    return {
      sentiment: 0.5,
      emotionalTones: {
        "Joy": 0.2,
        "Sadness": 0.2,
        "Fear": 0.2,
        "Anger": 0.2,
        "Surprise": 0.2,
        "Disgust": 0.2
      }
    };
  }
}
