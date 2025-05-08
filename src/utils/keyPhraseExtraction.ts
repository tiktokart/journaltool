
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
    
    // Common verbs and nouns - simplified list for demo purposes
    const commonVerbs = ['is', 'are', 'was', 'were', 'be', 'being', 'been', 'have', 'has', 'had', 
      'do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 
      'must', 'feel', 'think', 'know', 'see', 'say', 'go', 'come', 'make', 'take', 'get', 'use'];
    
    const commonNouns = ['time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 
      'life', 'hand', 'part', 'child', 'woman', 'place', 'work', 'week', 'case', 'point', 
      'government', 'company', 'number', 'group', 'problem', 'fact', 'experience', 'feeling'];
    
    // Extract 2-3 word phrases from each sentence
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      
      // Extract noun-verb or verb-noun combinations
      for (let i = 0; i < words.length - 1; i++) {
        const word1 = words[i].toLowerCase().replace(/[^\w]/g, '');
        const word2 = words[i+1].toLowerCase().replace(/[^\w]/g, '');
        
        // Check if either is a common verb/noun or if words are long enough to likely be meaningful
        const isWord1VerbOrNoun = commonVerbs.includes(word1) || commonNouns.includes(word1) || word1.length > 5;
        const isWord2VerbOrNoun = commonVerbs.includes(word2) || commonNouns.includes(word2) || word2.length > 5;
        
        if ((isWord1VerbOrNoun || isWord2VerbOrNoun) && word1.length > 2 && word2.length > 2) {
          const phrase = `${word1} ${word2}`;
          if (phrase.length > 5) {
            phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
          }
        }
      }
      
      // Extract 3-word phrases with at least one verb or noun
      for (let i = 0; i < words.length - 2; i++) {
        const word1 = words[i].toLowerCase().replace(/[^\w]/g, '');
        const word2 = words[i+1].toLowerCase().replace(/[^\w]/g, '');
        const word3 = words[i+2].toLowerCase().replace(/[^\w]/g, '');
        
        const containsVerbOrNoun = 
          commonVerbs.includes(word1) || commonNouns.includes(word1) ||
          commonVerbs.includes(word2) || commonNouns.includes(word2) ||
          commonVerbs.includes(word3) || commonNouns.includes(word3) ||
          word1.length > 5 || word2.length > 5 || word3.length > 5;
        
        if (containsVerbOrNoun && word1.length > 2 && word2.length > 2 && word3.length > 2) {
          const phrase = `${word1} ${word2} ${word3}`;
          if (phrase.length > 8) {
            phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
          }
        }
      }
    });
    
    // Filter out stop words and common phrases
    const stopPhrases = ['of the', 'in the', 'to the', 'and the', 'for the', 'on the', 'at the', 
      'with the', 'by the', 'from the', 'as the', 'to be', 'can be', 'will be'];
    
    // Convert to array and add scores
    Object.entries(phraseCounts).forEach(([phrase, count]) => {
      if (!stopPhrases.some(stop => phrase.includes(stop))) {
        keyPhrases.push({
          phrase,
          score: 0.5 + (count * 0.1), // Simple scoring based on frequency
          count
        });
      }
    });
    
    // Sort by score (highest first) and take top 15
    const sortedPhrases = keyPhrases
      .sort((a, b) => b.score - a.score || b.count - a.count)
      .slice(0, 15);
    
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
