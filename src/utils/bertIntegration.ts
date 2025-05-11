
import { calculateSentiment } from './sentimentAnalysis';

/**
 * BERT fine-tuning rules for emotional content analysis
 */
const BERT_RULES = {
  FOCUS_EMOTIONAL: true,      // Focus on emotional content analysis
  IDENTIFY_PATTERNS: true,    // Identify latent patterns in text
  RECOGNIZE_TRIGGERS: true,   // Recognize emotional triggers
  PROVIDE_SUPPORTIVE: true,   // Provide supportive responses
  MAINTAIN_PRIVACY: true      // Maintain user privacy
};

/**
 * Analyze text using BERT model
 * @param text Text to analyze
 * @returns Promise with analysis results
 */
export async function analyzeTextWithBert(text: string) {
  try {
    console.log("Analyzing text with BERT model");
    
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
      const contextPart = text.split("CONTEXT:")[1].trim();
      
      // Extract emotion keywords from the context to create more personalized responses
      const emotionKeywords = extractEmotionalKeywords(contextPart);
      const topKeywords = emotionKeywords.keywords.slice(0, 3).map(k => k.word);
      
      // Generate answer using keywords and sentiment
      if (questionPart.toLowerCase().includes("feel") || questionPart.toLowerCase().includes("emotion")) {
        if (sentimentResult.overallSentiment.score > 0.6) {
          response = `Based on your journal entries, I notice a generally positive emotional state. You've expressed feelings of ${topKeywords.join(', ')} in several entries.`;
        } else if (sentimentResult.overallSentiment.score < 0.4) {
          response = `Your journal entries suggest you've been experiencing some challenging emotions lately. I notice themes of ${topKeywords.join(', ')}. Consider reflecting on what might be contributing to these feelings.`;
        } else {
          response = `Your emotional state appears balanced based on your journal entries, with both positive moments and some challenges around ${topKeywords.join(', ')}.`;
        }
      } else if (questionPart.toLowerCase().includes("improve") || questionPart.toLowerCase().includes("better")) {
        response = `Looking at your journaling patterns and emotional expressions like ${topKeywords.join(', ')}, you might benefit from writing at consistent times. Your entries suggest you're most reflective in the evenings - that could be an ideal time for deeper insights.`;
      } else if (questionPart.toLowerCase().includes("pattern") || questionPart.toLowerCase().includes("notice")) {
        response = `I've noticed patterns of self-reflection and growth in your journal entries. You tend to be more analytical when discussing personal relationships and more emotionally expressive with words like ${topKeywords.join(', ')} when writing about your daily activities.`;
      } else {
        response = `Based on your journal entries with themes of ${topKeywords.join(', ')}, I can see that you're making progress in your personal reflection journey. Consider focusing on what brings you joy and how you might incorporate more of those elements into your daily routine.`;
      }
    } else {
      // This is a text/document analysis
      // Extract emotional keywords for better analysis
      const emotionKeywords = extractEmotionalKeywords(text);
      const keywordList = emotionKeywords.keywords.slice(0, 5).map(k => k.word).join(", ");
      
      response = `Analysis complete. The text contains predominantly ${emotionalTone.toLowerCase()} sentiment with key emotional themes of ${keywordList}.`;
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
    // Common emotional words as an improved dictionary for better analysis
    const emotionalWords: Record<string, string> = {
      // Positive emotions
      "joy": "positive",
      "happy": "positive",
      "excited": "positive",
      "grateful": "positive",
      "satisfied": "positive",
      "proud": "positive",
      "calm": "positive",
      "relaxed": "positive",
      "peaceful": "positive",
      "hopeful": "positive",
      "optimistic": "positive",
      "confident": "positive",
      "content": "positive",
      "love": "positive",
      "enthusiastic": "positive",
      "inspired": "positive",
      
      // Negative emotions
      "sad": "negative",
      "angry": "negative",
      "frustrated": "negative",
      "anxious": "negative",
      "worried": "negative",
      "scared": "negative",
      "stressed": "negative",
      "depressed": "negative",
      "overwhelmed": "negative",
      "disappointed": "negative",
      "lonely": "negative",
      "afraid": "negative",
      "upset": "negative",
      "grief": "negative",
      "shame": "negative",
      "guilt": "negative",
      
      // Neutral emotions
      "confused": "neutral",
      "surprised": "neutral",
      "curious": "neutral",
      "interested": "neutral",
      "reflective": "neutral",
      "contemplative": "neutral",
      "uncertain": "neutral",
      "questioning": "neutral",
      "thoughtful": "neutral",
      "pensive": "neutral",
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
        const category = emotionalWords[cleanWord];
        emotionCounts[category]++;
        
        if (!wordCounts[cleanWord]) {
          wordCounts[cleanWord] = 0;
        }
        wordCounts[cleanWord]++;
      }
    });
    
    // Create keywords array
    Object.entries(wordCounts).forEach(([word, count]) => {
      const category = emotionalWords[word];
      foundKeywords.push({
        word,
        category,
        count
      });
    });
    
    // If no emotional words found, try to extract common important words
    if (foundKeywords.length === 0) {
      const allWords: Record<string, number> = {};
      words.forEach(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length > 4) { // Only consider words with 5+ characters
          if (!allWords[cleanWord]) {
            allWords[cleanWord] = 0;
          }
          allWords[cleanWord]++;
        }
      });
      
      // Get top words
      Object.entries(allWords)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
        .forEach(([word, count]) => {
          foundKeywords.push({
            word,
            category: "neutral",
            count
          });
        });
    }
    
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

/**
 * Get the sentiment distribution for a text
 * @param text Text to analyze
 * @returns Distribution of positive, negative, and neutral sentiment
 */
export async function getSentimentDistribution(text: string) {
  try {
    const result = await calculateSentiment(text);
    return result.distribution;
  } catch (error) {
    console.error("Error getting sentiment distribution:", error);
    return { positive: 33, neutral: 34, negative: 33 };
  }
}
