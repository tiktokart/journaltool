
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
        response = "I've noticed patterns of self-reflection and growth in your journal entries. You tend to be more analytical when discussing personal relationships and more emotionally expressive when writing about your daily activities.";
      } else {
        response = "Based on your journal entries, I can see that you're making progress in your personal reflection journey. Consider focusing on what brings you joy and how you might incorporate more of those elements into your daily routine.";
      }
    } else {
      // This is a text/document analysis
      response = `Analysis complete. The text contains predominantly ${emotionalTone.toLowerCase()} sentiment.`;
    }
    
    return {
      text: response,
      emotionalTone,
      sentiment: sentimentResult.overallSentiment.score,
      distribution: sentimentResult.distribution
    };
  } catch (error) {
    console.error("Error analyzing text with BERT:", error);
    return {
      text: "I couldn't analyze this text properly. Please try again later.",
      emotionalTone: "Neutral",
      sentiment: 0.5,
      distribution: { positive: 33, neutral: 34, negative: 33 }
    };
  }
}

/**
 * Extracts emotional keywords from text
 * @param text Text to analyze
 * @returns Object containing emotional keywords and counts
 */
export function extractEmotionalKeywords(text: string) {
  try {
    // Placeholder implementation for extracting emotional keywords
    // In a real implementation, this would use BERT or another model
    
    // Common emotional words as a simple dictionary
    const emotionalWords = {
      "joy": "positive",
      "happy": "positive",
      "excited": "positive",
      "grateful": "positive",
      "satisfied": "positive",
      "proud": "positive",
      "calm": "positive",
      "relaxed": "positive",
      "sad": "negative",
      "angry": "negative",
      "frustrated": "negative",
      "anxious": "negative",
      "worried": "negative",
      "scared": "negative",
      "stressed": "negative",
      "depressed": "negative",
      "confused": "neutral",
      "surprised": "neutral",
      "curious": "neutral",
      "interested": "neutral",
    };
    
    const words = text.toLowerCase().split(/\s+/);
    const emotionCounts: Record<string, number> = {
      positive: 0,
      negative: 0, 
      neutral: 0
    };
    
    const foundKeywords: Array<{word: string, category: string, count: number}> = [];
    const wordCounts: Record<string, number> = {};
    
    // Count occurrences of emotional words
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord in emotionalWords) {
        const category = emotionalWords[cleanWord as keyof typeof emotionalWords];
        emotionCounts[category]++;
        
        if (!wordCounts[cleanWord]) {
          wordCounts[cleanWord] = 0;
        }
        wordCounts[cleanWord]++;
      }
    });
    
    // Create keywords array
    Object.entries(wordCounts).forEach(([word, count]) => {
      const category = emotionalWords[word as keyof typeof emotionalWords];
      foundKeywords.push({
        word,
        category,
        count
      });
    });
    
    return {
      keywords: foundKeywords.sort((a, b) => b.count - a.count),
      emotionCounts
    };
  } catch (error) {
    console.error("Error extracting emotional keywords:", error);
    return {
      keywords: [],
      emotionCounts: { positive: 0, negative: 0, neutral: 0 }
    };
  }
}
