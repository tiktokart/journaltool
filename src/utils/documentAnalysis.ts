// Update the KeywordAnalysis interface to support both string and array color formats
export interface KeywordAnalysis {
  word: string;
  sentiment: number;
  weight: number;
  color: string | [number, number, number];
  tone?: string;
  relatedConcepts?: string[];
  frequency?: number;
  pos?: string;
}

// Add the missing analyzePdfContent function that was causing the build error
export const analyzePdfContent = async (pdfText: string) => {
  try {
    console.log("Analyzing PDF content:", pdfText.substring(0, 100) + "...");
    
    // Create a more comprehensive analysis result
    return {
      text: pdfText,
      fileName: "document.pdf",
      fileSize: `${Math.round(pdfText.length / 1024)} KB`,
      wordCount: pdfText.split(/\s+/).filter(Boolean).length,
      sourceDescription: `Extracted from PDF`,
      summary: pdfText.substring(0, 200) + "...",
      // Include empty BERT analysis structure to prevent undefined errors
      bertAnalysis: {
        keywords: [],
        emotionalTones: [],
        contextualAnalysis: {}
      }
    };
  } catch (error) {
    console.error("Error analyzing PDF content:", error);
    throw error;
  }
};

// Function to filter out common words during BERT analysis - expanded list
export const shouldFilterWord = (word: string): boolean => {
  // Common words to filter - prepositions, conjunctions, articles
  const commonWords = [
    // Articles
    'a', 'an', 'the',
    
    // Common prepositions
    'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
    'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
    
    // Common conjunctions
    'and', 'but', 'or', 'nor', 'yet', 'so', 'because', 'although', 'since',
    
    // Pronouns
    'i', 'me', 'my', 'mine', 'myself',
    'you', 'your', 'yours', 'yourself',
    'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself',
    'we', 'us', 'our', 'ours', 'ourselves',
    'they', 'them', 'their', 'theirs', 'themselves',
    'this', 'that', 'these', 'those',
    'who', 'whom', 'whose',
    'which', 'what',
    
    // Common verbs
    'is', 'are', 'was', 'were', 'be', 'being', 'been',
    'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing',
    'will', 'would', 'shall', 'should',
    'can', 'could', 'may', 'might', 'must',
    'go', 'goes', 'went', 'gone', 'going',
    'get', 'gets', 'got', 'getting',
    'make', 'makes', 'made', 'making',
    'say', 'says', 'said', 'saying',
    'see', 'sees', 'saw', 'seen', 'seeing',
    'come', 'comes', 'came', 'coming',
    
    // Other common words
    'to', 'of', 'just', 'very', 'too', 'also', 'then', 'than',
    'only', 'not', 'now', 'even', 'if', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'some', 'such', 'no', 'yes', 'every'
  ];
  
  return commonWords.includes(word.toLowerCase());
};

// Add contextual awareness to the filtering process
export const getContextualImportance = (word: string, surroundingWords: string[]): number => {
  // Words that increase importance when they appear nearby
  const importanceMarkers = [
    'extremely', 'very', 'highly', 'deeply', 'truly',
    'especially', 'particularly', 'significantly',
    'critical', 'crucial', 'important', 'essential',
    'never', 'always', 'must', 'definitely',
    'feeling', 'feel', 'felt', 'experiencing', 'experienced',
    'believe', 'think', 'thought', 'opinion'
  ];
  
  // Check if any importance markers are nearby
  const hasImportanceMarker = surroundingWords.some(w => 
    importanceMarkers.includes(w.toLowerCase())
  );
  
  // Base importance score
  let score = 1;
  
  // Adjust based on contextual factors
  if (hasImportanceMarker) {
    score += 0.5;
  }
  
  // Adjust based on word properties
  if (word.length > 8) {
    score += 0.3; // Longer words tend to be more significant
  }
  
  // Capitalize words tend to be proper nouns or important concepts
  if (word[0] === word[0].toUpperCase() && word.length > 1) {
    score += 0.4;
  }
  
  return score;
};

// Function to determine emotional tone of a word
export const determineWordTone = (word: string): string => {
  const emotionalWords = {
    positive: [
      'good', 'great', 'happy', 'excellent', 'positive', 'love', 'enjoy', 'wonderful', 'joy',
      'pleased', 'delighted', 'grateful', 'thankful', 'excited', 'hopeful', 'optimistic',
      'brilliant', 'fantastic', 'marvelous', 'superb', 'terrific', 'awesome', 'beautiful'
    ],
    negative: [
      'bad', 'sad', 'terrible', 'negative', 'hate', 'awful', 'horrible', 'poor', 'worry',
      'annoyed', 'angry', 'upset', 'disappointed', 'frustrated', 'anxious', 'afraid', 'stressed',
      'depressed', 'miserable', 'gloomy', 'unhappy', 'lonely', 'distressed', 'painful'
    ],
    anxious: [
      'anxious', 'worried', 'nervous', 'tense', 'uneasy', 'scared', 'fearful', 'afraid',
      'panicked', 'apprehensive', 'alarmed', 'concerned', 'stressed', 'restless'
    ],
    calm: [
      'calm', 'relaxed', 'peaceful', 'serene', 'tranquil', 'composed', 'collected',
      'centered', 'balanced', 'restful', 'quiet', 'still'
    ]
  };
  
  const lowerWord = word.toLowerCase();
  
  for (const [tone, words] of Object.entries(emotionalWords)) {
    if (words.includes(lowerWord)) {
      return tone;
    }
  }
  
  return 'neutral';
};
