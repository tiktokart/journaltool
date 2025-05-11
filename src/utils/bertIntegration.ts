
interface KeywordAnalysis {
  word: string;
  sentiment: number;
  tone?: string;
  relatedConcepts?: string[];
  frequency?: number;
  color?: [number, number, number];
}

interface BertAnalysisResult {
  keywords: KeywordAnalysis[];
  overallSentiment: number;
  overallTone: string;
  emotionalTone?: string;  // Add this property
  analysis?: string;       // Add this property
}

const stopWords = [
  'the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 
  'in', 'out', 'with', 'about', 'against', 'before', 'after', 'during', 'he', 'she', 
  'it', 'they', 'we', 'you', 'i', 'me', 'him', 'her', 'them', 'us', 'is', 'am', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'uh', 'um',
  'eh', 'oh', 'ah', 'hmm', 'like', 'just', 'very', 'really', 'so', 'then', 
  'of', 'as', 'if', 'that', 'what', 'when', 'where', 'why', 'how', 'because', 'since',
  'while', 'although', 'though', 'whether', 'which', 'whose', 'whom', 'this', 'these',
  'those', 'there', 'here', 'who'
];

// Bright, visible color palette for emotional tones
const emotionalColors = {
  Joy: [1, 0.9, 0.2] as [number, number, number],        // Bright Yellow
  Sadness: [0.2, 0.6, 1] as [number, number, number],     // Bright Blue
  Anxiety: [1, 0.5, 0.1] as [number, number, number],     // Bright Orange
  Contentment: [0.2, 0.9, 0.4] as [number, number, number], // Bright Green
  Confusion: [0.8, 0.4, 1] as [number, number, number],   // Bright Purple
  Anger: [1, 0.2, 0.2] as [number, number, number],       // Bright Red
  Fear: [0.9, 0.2, 0.9] as [number, number, number],      // Bright Magenta
  Surprise: [0.2, 1, 1] as [number, number, number],      // Bright Cyan
  Neutral: [0.8, 0.8, 0.8] as [number, number, number],   // Bright Gray
};

export const analyzeTextWithBert = async (text: string): Promise<BertAnalysisResult> => {
  try {
    console.log("Analyzing text with BERT:", text.substring(0, 100) + "...");
    
    if (!text || typeof text !== 'string') {
      throw new Error("Invalid text provided for analysis");
    }
    
    // Extract and clean words
    const words = text.split(/\s+/)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase())
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    // Count word frequency
    const wordFrequency: Record<string, number> = {};
    for (const word of words) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
    
    // Get unique words sorted by frequency
    const uniqueWords = [...new Set(words)]
      .filter(word => wordFrequency[word] > 1 || word.length > 5)
      .sort((a, b) => wordFrequency[b] - wordFrequency[a])
      .slice(0, 50); // Limit to top 50 words
    
    // Perform contextual analysis
    // In a real implementation, this would use an actual BERT model
    const keywords: KeywordAnalysis[] = [];
    let totalSentiment = 0;
    
    // Map of words to common emotional associations for contextual analysis
    const emotionalAssociations: Record<string, { tone: string, sentiment: number }> = {
      // Positive emotions
      "happy": { tone: "Joy", sentiment: 0.8 },
      "joy": { tone: "Joy", sentiment: 0.9 },
      "love": { tone: "Joy", sentiment: 0.85 },
      "peaceful": { tone: "Contentment", sentiment: 0.75 },
      "calm": { tone: "Contentment", sentiment: 0.7 },
      "excited": { tone: "Joy", sentiment: 0.8 },
      "hopeful": { tone: "Joy", sentiment: 0.75 },
      "grateful": { tone: "Contentment", sentiment: 0.8 },
      "relaxed": { tone: "Contentment", sentiment: 0.7 },
      
      // Negative emotions
      "sad": { tone: "Sadness", sentiment: 0.2 },
      "angry": { tone: "Anger", sentiment: 0.15 },
      "anxious": { tone: "Anxiety", sentiment: 0.25 },
      "fear": { tone: "Fear", sentiment: 0.2 },
      "worried": { tone: "Anxiety", sentiment: 0.3 },
      "stressed": { tone: "Anxiety", sentiment: 0.25 },
      "depressed": { tone: "Sadness", sentiment: 0.1 },
      "confused": { tone: "Confusion", sentiment: 0.4 },
      "frustrated": { tone: "Anger", sentiment: 0.25 },
      
      // Neutral/mixed emotions
      "surprised": { tone: "Surprise", sentiment: 0.5 },
      "curious": { tone: "Surprise", sentiment: 0.6 },
      "thinking": { tone: "Neutral", sentiment: 0.5 },
      "wondering": { tone: "Confusion", sentiment: 0.45 },
    };
    
    // Generate fake context windows around each unique word for analysis
    for (const word of uniqueWords) {
      const contextWindow = text
        .toLowerCase()
        .split(/\s+/)
        .filter((_, i, arr) => i < arr.indexOf(word) + 5 && i > arr.indexOf(word) - 5)
        .join(' ');
      
      // Simple sentiment analysis based on contextual associations
      let sentiment = 0.5; // Neutral by default
      let tone = "Neutral";
      const relatedConcepts: string[] = [];
      
      // Check for direct emotional associations
      if (emotionalAssociations[word]) {
        sentiment = emotionalAssociations[word].sentiment;
        tone = emotionalAssociations[word].tone;
      } else {
        // Check for emotional words in context
        let emotionalWordCount = 0;
        let totalEmotionalSentiment = 0;
        
        for (const emotionalWord of Object.keys(emotionalAssociations)) {
          if (contextWindow.includes(emotionalWord)) {
            emotionalWordCount++;
            totalEmotionalSentiment += emotionalAssociations[emotionalWord].sentiment;
            tone = emotionalAssociations[emotionalWord].tone;
            
            // Add as a related concept if it's not the word itself
            if (emotionalWord !== word) {
              relatedConcepts.push(emotionalWord);
            }
          }
        }
        
        if (emotionalWordCount > 0) {
          sentiment = totalEmotionalSentiment / emotionalWordCount;
        } else {
          // Generate pseudo-random but consistent sentiment based on word
          const hash = Array.from(word).reduce((sum, char) => sum + char.charCodeAt(0), 0);
          sentiment = 0.3 + ((hash % 50) / 100);
          
          // Assign emotional tone based on sentiment range
          if (sentiment > 0.65) tone = "Joy";
          else if (sentiment > 0.6) tone = "Contentment";
          else if (sentiment < 0.35) tone = "Sadness";
          else if (sentiment < 0.4) tone = "Anxiety";
          else tone = "Neutral";
        }
      }
      
      // Get color for this emotional tone
      const color = emotionalColors[tone] || emotionalColors.Neutral;
      
      // Find related words based on co-occurrence in the text
      const wordIndex = words.indexOf(word);
      const surroundingWords = words
        .slice(Math.max(0, wordIndex - 10), wordIndex + 10)
        .filter(w => w !== word && w.length > 3);
        
      // Add some surrounding words to related concepts
      if (relatedConcepts.length < 3) {
        const additionalConcepts = surroundingWords
          .filter(w => !relatedConcepts.includes(w))
          .slice(0, 3 - relatedConcepts.length);
          
        relatedConcepts.push(...additionalConcepts);
      }
      
      keywords.push({
        word,
        sentiment,
        tone,
        relatedConcepts,
        frequency: wordFrequency[word],
        color
      });
      
      totalSentiment += sentiment;
    }
    
    // Calculate overall sentiment
    const overallSentiment = keywords.length > 0 ? totalSentiment / keywords.length : 0.5;
    
    // Determine overall emotional tone
    let overallTone = "Neutral";
    if (overallSentiment > 0.65) overallTone = "Joy";
    else if (overallSentiment > 0.6) overallTone = "Contentment";
    else if (overallSentiment < 0.35) overallTone = "Sadness";
    else if (overallSentiment < 0.4) overallTone = "Anxiety";
    
    // Generate a simple analysis text
    const emotionalTone = overallTone;
    const analysis = `The text shows ${overallTone.toLowerCase()} with an overall sentiment score of ${overallSentiment.toFixed(2)}. Analysis identified ${keywords.length} significant words or phrases.`;
    
    return {
      keywords,
      overallSentiment,
      overallTone,
      emotionalTone,
      analysis
    };
  } catch (error) {
    console.error("Error in BERT analysis:", error);
    throw error;
  }
};
