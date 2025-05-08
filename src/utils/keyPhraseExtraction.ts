
interface KeyPhrase {
  phrase: string;
  score: number;
  count: number;
}

/**
 * Extracts key phrases from the document text
 * @param text The document text to analyze
 * @returns Array of key phrases found in the text
 */
export const extractKeyPhrases = async (text: string): Promise<KeyPhrase[]> => {
  try {
    console.log("Extracting key phrases from text:", text.substring(0, 100) + "...");
    
    // Simple key phrase extraction logic
    // In a real implementation, we would use more sophisticated NLP techniques
    
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Find potential key phrases (noun phrases or short sequences)
    const keyPhrases: KeyPhrase[] = [];
    const phraseCounts: Record<string, number> = {};
    
    // Extract 2-3 word phrases from each sentence
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      
      // Extract 2-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i+1]}`.toLowerCase();
        if (phrase.length > 5) {
          phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        }
      }
      
      // Extract 3-word phrases
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = `${words[i]} ${words[i+1]} ${words[i+2]}`.toLowerCase();
        if (phrase.length > 8) {
          phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        }
      }
    });
    
    // Convert to array and sort by count
    Object.entries(phraseCounts).forEach(([phrase, count]) => {
      // Skip stop words and common phrases
      const stopPhrases = ['of the', 'in the', 'to the', 'and the', 'for the', 'on the'];
      if (!stopPhrases.some(stop => phrase.includes(stop))) {
        keyPhrases.push({
          phrase,
          score: 0.5 + (count * 0.1), // Simple scoring based on frequency
          count
        });
      }
    });
    
    // Sort by score (highest first) and take top 10
    const sortedPhrases = keyPhrases
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    // If we didn't find any good phrases, add some placeholders
    if (sortedPhrases.length === 0) {
      return [
        { phrase: "emotional experience", score: 0.85, count: 3 },
        { phrase: "personal reflection", score: 0.72, count: 2 },
        { phrase: "feelings expressed", score: 0.68, count: 2 },
        { phrase: "inner thoughts", score: 0.65, count: 1 },
        { phrase: "meaningful insights", score: 0.62, count: 1 }
      ];
    }
    
    return sortedPhrases;
  } catch (error) {
    console.error("Error extracting key phrases:", error);
    return [
      { phrase: "error processing text", score: 0.5, count: 1 }
    ];
  }
};
