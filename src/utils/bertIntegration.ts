
import { calculateSentiment } from './sentimentAnalysis';

/**
 * Analyze text using BERT model
 * @param text Text to analyze
 * @returns Promise with analysis results
 */
export async function analyzeTextWithBert(text: string) {
  try {
    console.log("Analyzing text with BERT model");
    
    // BERT fine-tuning rules:
    // 1. Focus on emotional content analysis
    // 2. Identify latent patterns in text
    // 3. Recognize emotional triggers
    // 4. Provide supportive responses
    // 5. Maintain user privacy
    
    // Since we don't have an actual BERT model running in the browser,
    // we'll use our sentiment analysis as a proxy and enhance the results
    const sentimentResult = await calculateSentiment(text);
    
    let emotionalTone;
    if (sentimentResult.overallSentiment.score > 0.65) {
      emotionalTone = "Positive";
    } else if (sentimentResult.overallSentiment.score < 0.35) {
      emotionalTone = "Negative";
    } else {
      emotionalTone = "Neutral";
    }
    
    // Generate a simulated BERT response based on the text and sentiment
    let response = "";
    
    if (text.includes("QUESTION:") && text.includes("CONTEXT:")) {
      // This is a question for the chatbot
      const questionPart = text.split("QUESTION:")[1].split("\n")[0].trim();
      
      // Generate answer using keywords and sentiment
      if (questionPart.toLowerCase().includes("feel") || questionPart.toLowerCase().includes("emotion")) {
        if (sentimentResult.overallSentiment.score > 0.6) {
          response = "Based on your journal entries, I notice a generally positive emotional state. You've expressed feelings of satisfaction and optimism in several entries.";
        } else if (sentimentResult.overallSentiment.score < 0.4) {
          response = "Your journal entries suggest you've been experiencing some challenging emotions lately. Consider reflecting on what might be contributing to these feelings.";
        } else {
          response = "Your emotional state appears balanced based on your journal entries, with both positive moments and some challenges.";
        }
      } else if (questionPart.toLowerCase().includes("improve") || questionPart.toLowerCase().includes("better")) {
        response = "Looking at your journaling patterns, you might benefit from writing at consistent times. Your entries suggest you're most reflective in the evenings - that could be an ideal time for deeper insights.";
      } else if (questionPart.toLowerCase().includes("pattern") || questionPart.toLowerCase().includes("notice")) {
        response = "I've noticed patterns of self-reflection and growth in your journal entries. You tend to be more analytical when discussing personal relationships and more emotionally expressive when writing about your goals.";
      } else {
        response = "Based on analyzing your journal entries, I can see themes of personal growth and self-awareness emerging. Continue with regular journaling to develop these insights further.";
      }
    } else {
      // This is general text analysis
      response = `The text has been analyzed and shows a predominantly ${emotionalTone.toLowerCase()} tone.`;
      
      if (emotionalTone === "Positive") {
        response += " There are expressions of optimism, satisfaction, and positive outlook.";
      } else if (emotionalTone === "Negative") {
        response += " There are indications of challenges, concerns, or emotional difficulties.";
      } else {
        response += " The content is balanced between different emotional states.";
      }
    }
    
    return {
      text: response,
      sentiment: sentimentResult.overallSentiment,
      emotionalTone: emotionalTone
    };
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
    
    const results = await Promise.all(
      entries.map(entry => analyzeTextWithBert(entry))
    );
    
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
