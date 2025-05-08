
/**
 * Generates a summary of the document text
 * @param text The document text to summarize
 * @returns A summary of the document
 */
export const generateSummary = async (text: string): Promise<string> => {
  try {
    // This would normally call an AI model API
    console.log("Generating summary for text:", text.substring(0, 100) + "...");
    
    // Extract word counts for nouns and actions
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      // Clean the word of punctuation
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    // Lists of common nouns and action verbs to check against
    const commonNouns = [
      "time", "person", "year", "way", "day", "thing", "man", "woman", "life", 
      "child", "world", "school", "family", "student", "group", "country", 
      "problem", "hand", "place", "week", "company", "system", "program", "work",
      "government", "number", "night", "point", "home", "water", "room", "mother",
      "area", "money", "story", "fact", "month", "lot", "right", "book", "eye",
      "job", "word", "business", "issue", "side", "kind", "head", "house", "friend",
      "father", "power", "hour", "game", "line", "end", "member", "law", "car", "city"
    ];
    
    const actionVerbs = [
      "run", "walk", "talk", "speak", "eat", "drink", "sleep", "think", "know",
      "understand", "see", "look", "watch", "feel", "touch", "hear", "listen",
      "smell", "taste", "make", "create", "build", "design", "write", "draw",
      "read", "study", "learn", "teach", "tell", "say", "ask", "answer", "help",
      "work", "play", "start", "begin", "end", "finish", "stop", "go", "come",
      "arrive", "leave", "stay", "move", "change", "grow", "live", "die", "kill",
      "fight", "win", "lose", "find", "search", "seek", "try", "attempt", "succeed",
      "fail", "laugh", "cry", "smile", "frown", "give", "take", "buy", "sell"
    ];
    
    // Find frequently mentioned nouns and verbs
    const frequentNouns: [string, number][] = [];
    const frequentVerbs: [string, number][] = [];
    
    Object.entries(wordCounts).forEach(([word, count]) => {
      if (count >= 3) {
        if (commonNouns.includes(word)) {
          frequentNouns.push([word, count]);
        } else if (actionVerbs.includes(word)) {
          frequentVerbs.push([word, count]);
        }
      }
    });
    
    // Sort by frequency
    frequentNouns.sort((a, b) => b[1] - a[1]);
    frequentVerbs.sort((a, b) => b[1] - a[1]);
    
    // For the first few sentences analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentences = sentences.slice(0, 3).join('. ');
    
    // Basic statistics
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = sentences.length;
    const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    // Add pronouns resolution hint if we have frequent nouns
    let pronounRelationship = "";
    if (frequentNouns.length > 0) {
      const topNoun = frequentNouns[0][0];
      if (text.toLowerCase().includes("they") || text.toLowerCase().includes("them")) {
        pronounRelationship = `\nPronouns like "they" or "them" in this text likely refer to "${topNoun}".`;
      }
    }
    
    // Create a more informative summary
    let summary = `This document contains ${wordCount} words across ${sentenceCount} sentences and approximately ${paragraphCount} paragraphs.
    
It begins with: "${firstSentences}".`;

    // Add information about main subjects (nouns mentioned 3+ times)
    if (frequentNouns.length > 0) {
      summary += `\n\nMain subjects discussed include: ${frequentNouns.slice(0, 5).map(([noun, count]) => `"${noun}" (mentioned ${count} times)`).join(", ")}.`;
    }
    
    // Add information about key actions (verbs mentioned 3+ times)
    if (frequentVerbs.length > 0) {
      summary += `\n\nKey actions in the text include: ${frequentVerbs.slice(0, 5).map(([verb, count]) => `"${verb}" (${count} times)`).join(", ")}.`;
    }
    
    // Add the pronoun resolution hint if available
    if (pronounRelationship) {
      summary += pronounRelationship;
    }
    
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary for this document.";
  }
};
