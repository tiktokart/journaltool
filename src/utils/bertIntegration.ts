
import { analyzeSentiment, batchAnalyzeSentiment } from './bertSentimentAnalysis';

/**
 * Analyze text using BERT model
 * @param text Text to analyze
 * @returns Promise with analysis results
 */
export async function analyzeTextWithBert(text: string) {
  try {
    console.log("Analyzing text with BERT model");
    const result = await analyzeSentiment(text);
    console.log("BERT analysis result:", result);
    return result;
  } catch (error) {
    console.error("Error analyzing text with BERT:", error);
    throw error;
  }
}

/**
 * Analyze journal entries in batch
 * @param entries Array of journal entry texts
 * @returns Promise with array of analysis results
 */
export async function analyzeJournalEntries(entries: string[]) {
  try {
    console.log(`Analyzing ${entries.length} journal entries with BERT`);
    const results = await batchAnalyzeSentiment(entries);
    console.log("Batch analysis complete:", results);
    return results;
  } catch (error) {
    console.error("Error in batch journal analysis:", error);
    throw error;
  }
}

/**
 * Extract emotional keywords from text
 * @param text Text to analyze
 * @returns Array of emotional keywords
 */
export function extractEmotionalKeywords(text: string) {
  // Basic emotional keywords extraction
  const emotionalWords = [
    // Positive emotions
    { word: 'happy', emotion: 'Joy' },
    { word: 'joy', emotion: 'Joy' },
    { word: 'excited', emotion: 'Joy' },
    { word: 'glad', emotion: 'Joy' },
    { word: 'content', emotion: 'Contentment' },
    { word: 'peaceful', emotion: 'Contentment' },
    { word: 'relaxed', emotion: 'Contentment' },
    { word: 'calm', emotion: 'Contentment' },
    { word: 'confident', emotion: 'Confidence' },
    { word: 'proud', emotion: 'Confidence' },
    { word: 'motivated', emotion: 'Confidence' },
    { word: 'inspired', emotion: 'Confidence' },
    
    // Negative emotions
    { word: 'sad', emotion: 'Sadness' },
    { word: 'depressed', emotion: 'Sadness' },
    { word: 'unhappy', emotion: 'Sadness' },
    { word: 'miserable', emotion: 'Sadness' },
    { word: 'anxious', emotion: 'Anxiety' },
    { word: 'nervous', emotion: 'Anxiety' },
    { word: 'worried', emotion: 'Anxiety' },
    { word: 'stressed', emotion: 'Anxiety' },
    { word: 'angry', emotion: 'Anger' },
    { word: 'frustrated', emotion: 'Anger' },
    { word: 'irritated', emotion: 'Anger' },
    { word: 'annoyed', emotion: 'Anger' },
    { word: 'fearful', emotion: 'Fear' },
    { word: 'scared', emotion: 'Fear' },
    { word: 'afraid', emotion: 'Fear' },
    { word: 'terrified', emotion: 'Fear' },
    { word: 'confused', emotion: 'Confusion' },
    { word: 'uncertain', emotion: 'Confusion' },
    { word: 'unsure', emotion: 'Confusion' },
    { word: 'perplexed', emotion: 'Confusion' },
  ];

  // Tokenize input text
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  
  // Find emotional keywords
  const found = words
    .map(word => emotionalWords.find(ew => ew.word === word))
    .filter(match => match !== undefined);
  
  // Count occurrences of each emotion
  const emotions = found.reduce((acc, curr) => {
    const emotion = curr.emotion;
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    keywords: found,
    emotionCounts: emotions
  };
}
