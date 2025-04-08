
import { pipeline } from "@huggingface/transformers";
import { toast } from "sonner";

export async function analyzeTextWithGemma3(text: string): Promise<{
  sentiment: number;
  emotionalTones: { [key: string]: number };
}> {
  try {
    toast.info("Initializing Gemma 3 model...");
    
    // Try to initialize the sentiment-analysis pipeline with Gemma 3
    try {
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
          const firstResult = result[0];
          const labelText = typeof firstResult === 'object' && firstResult !== null 
            ? String((firstResult as any).label || '') 
            : '';
            
          const scoreValue = typeof firstResult === 'object' && firstResult !== null 
            ? Number((firstResult as any).score || 0.5) 
            : 0.5;
            
          if (labelText.toLowerCase().includes("positive")) {
            return scoreValue;
          } else if (labelText.toLowerCase().includes("negative")) {
            return 1 - scoreValue;
          }
        }
        return 0.5; // Neutral fallback
      });
      
      // Average the sentiment scores
      const averageSentiment = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
      
      // Process emotional tones from the analysis
      const emotionalTones = processEmotionalTones(text, averageSentiment);
      
      toast.success("Gemma 3 analysis complete!");
      
      return {
        sentiment: averageSentiment,
        emotionalTones
      };
    } catch (error) {
      console.error("Error with WebGPU sentiment pipeline, falling back to text analysis:", error);
      // If WebGPU fails, fall back to analysis method that works on all devices
      return textBasedSentimentAnalysis(text);
    }
  } catch (error) {
    console.error("Error analyzing text with Gemma 3:", error);
    toast.error("Failed to analyze text with Gemma 3, using fallback analysis");
    
    return textBasedSentimentAnalysis(text);
  }
}

// Process emotional tones based on text content and sentiment
function processEmotionalTones(text: string, sentiment: number): { [key: string]: number } {
  // Define emotional tone keywords
  const toneKeywords = {
    "Joy": ["happy", "joy", "delight", "pleased", "excited", "glad", "smile", "laugh", "celebrate"],
    "Sadness": ["sad", "sorrow", "unhappy", "miserable", "grief", "depressed", "cry", "tear", "upset"],
    "Fear": ["afraid", "scared", "fear", "terror", "horrified", "anxious", "dread", "panic", "worry"],
    "Anger": ["angry", "mad", "rage", "furious", "irritated", "annoyed", "hatred", "outraged", "bitter"],
    "Surprise": ["surprised", "amazed", "astonished", "shocked", "startled", "unexpected", "sudden", "wonder"],
    "Disgust": ["disgust", "revolted", "nauseous", "aversion", "repulsed", "distaste", "offensive", "gross"]
  };
  
  // Count occurrences of keywords for each tone
  const toneCounts: { [key: string]: number } = {};
  const textLower = text.toLowerCase();
  
  Object.entries(toneKeywords).forEach(([tone, keywords]) => {
    const count = keywords.reduce((sum, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textLower.match(regex);
      return sum + (matches ? matches.length : 0);
    }, 0);
    
    toneCounts[tone] = count;
  });
  
  // Convert counts to scores, considering sentiment
  const emotionalTones: { [key: string]: number } = {};
  const totalKeywords = Object.values(toneCounts).reduce((sum, count) => sum + count, 1); // Add 1 to avoid division by zero
  
  // Set base values for all tones
  Object.keys(toneKeywords).forEach(tone => {
    emotionalTones[tone] = 0.1; // Base value
  });
  
  // Adjust based on keyword counts
  Object.entries(toneCounts).forEach(([tone, count]) => {
    const baseScore = 0.1 + (count / totalKeywords) * 0.5; // Scale to 0.1-0.6 range
    emotionalTones[tone] = baseScore;
  });
  
  // Adjust based on sentiment
  emotionalTones["Joy"] += sentiment * 0.4; // Higher sentiment = more joy
  emotionalTones["Sadness"] += (1 - sentiment) * 0.4; // Lower sentiment = more sadness
  emotionalTones["Anger"] += (1 - sentiment) * 0.3; // Lower sentiment = more anger
  emotionalTones["Disgust"] += (1 - sentiment) * 0.2; // Lower sentiment = more disgust
  
  // Cap all values at 1.0
  Object.keys(emotionalTones).forEach(tone => {
    emotionalTones[tone] = Math.min(emotionalTones[tone], 1.0);
  });
  
  return emotionalTones;
}

// More sophisticated text-based sentiment analysis using the actual content
function textBasedSentimentAnalysis(text: string): { sentiment: number; emotionalTones: { [key: string]: number } } {
  console.log("Using text-based sentiment analysis on actual content");
  
  // Define more comprehensive word lists
  const positiveWords = [
    "good", "great", "excellent", "amazing", "wonderful", "best", "love", "happy", "positive", "success",
    "beautiful", "perfect", "fantastic", "awesome", "brilliant", "delightful", "joy", "triumph", "pleased",
    "grateful", "appreciate", "fortunate", "proud", "achieve", "benefit", "enjoy", "confident", "outstanding"
  ];
  const negativeWords = [
    "bad", "terrible", "awful", "horrible", "worst", "hate", "sad", "negative", "failure", "poor",
    "disappointed", "frustrating", "annoying", "miserable", "unpleasant", "ugly", "painful", "angry",
    "fear", "stress", "worry", "difficult", "trouble", "problem", "tragedy", "regret", "suffer", "disaster"
  ];
  
  const textLower = text.toLowerCase();
  
  // More sophisticated word counting - consider word boundaries
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = textLower.match(regex);
    positiveCount += matches ? matches.length : 0;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = textLower.match(regex);
    negativeCount += matches ? matches.length : 0;
  });
  
  // Extract sentences for more context-aware analysis
  const sentences = text.replace(/([.!?])\s*/g, "$1|").split("|");
  let positiveSentences = 0;
  let negativeSentences = 0;
  
  sentences.forEach(sentence => {
    if (sentence.trim().length === 0) return;
    const lowerSentence = sentence.toLowerCase();
    
    let sentencePositiveScore = 0;
    let sentenceNegativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerSentence.includes(word)) sentencePositiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerSentence.includes(word)) sentenceNegativeScore++;
    });
    
    if (sentencePositiveScore > sentenceNegativeScore) positiveSentences++;
    else if (sentenceNegativeScore > sentencePositiveScore) negativeSentences++;
  });
  
  // Combine word-level and sentence-level analysis
  const totalSentences = sentences.filter(s => s.trim().length > 0).length;
  const sentenceSentiment = totalSentences > 0 
    ? (positiveSentences - negativeSentences) / totalSentences 
    : 0;
  
  const totalWords = Math.max(1, positiveCount + negativeCount);
  const wordSentiment = (positiveCount - negativeCount) / totalWords;
  
  // Combined sentiment (normalized to 0-1)
  const rawSentiment = (wordSentiment * 0.7) + (sentenceSentiment * 0.3);
  const normalizedSentiment = Math.min(1, Math.max(0, (rawSentiment + 1) / 2));
  
  // Process emotional tones
  const emotionalTones = processEmotionalTones(text, normalizedSentiment);
  
  toast.success("Text-based sentiment analysis complete!");
  
  return {
    sentiment: normalizedSentiment,
    emotionalTones
  };
}
