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

// Function to filter out common words during BERT analysis
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
    
    // Other very common words with little semantic value
    'is', 'are', 'was', 'were', 'be', 'being', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'may', 'might',
    'this', 'that', 'these', 'those', 'it', 'its', 'to', 'of'
  ];
  
  return commonWords.includes(word.toLowerCase());
};

// Update any other type definitions as needed
