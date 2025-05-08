
/**
 * Generates a summary of the document text with enhanced contextual analysis
 * @param text The document text to summarize
 * @returns A summary of the document with context-aware insights
 */
export const generateSummary = async (text: string): Promise<string> => {
  try {
    // This would normally call an AI model API
    console.log("Generating contextual summary for text:", text.substring(0, 100) + "...");
    
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
    
    // Extract contextual relationships
    const contextualRelationships = extractContextualRelationships(text, frequentNouns, frequentVerbs);
    
    // Basic statistics
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = sentences.length;
    const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    // Add pronouns resolution with more sophisticated analysis
    let pronounRelationships = analyzePronounRelationships(text, frequentNouns);
    
    // Extract document themes based on contextual analysis
    const documentThemes = extractDocumentThemes(text, frequentNouns, frequentVerbs);
    
    // Analyze emotional tone based on word choice
    const emotionalTone = analyzeEmotionalTone(text);
    
    // Create a more informative summary with contextual insights
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
    
    // Add contextual relationships if available
    if (contextualRelationships.length > 0) {
      summary += `\n\nContextual relationships identified: ${contextualRelationships.join(". ")}.`;
    }
    
    // Add the pronoun resolution insights
    if (pronounRelationships.length > 0) {
      summary += `\n\nPronoun analysis: ${pronounRelationships.join(" ")}`;
    }
    
    // Add document themes
    if (documentThemes.length > 0) {
      summary += `\n\nDocument themes: ${documentThemes.join(", ")}.`;
    }
    
    // Add emotional tone analysis
    if (emotionalTone) {
      summary += `\n\nOverall emotional tone: ${emotionalTone}.`;
    }
    
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary for this document.";
  }
};

/**
 * Extracts contextual relationships between subjects and actions in the text
 */
const extractContextualRelationships = (
  text: string, 
  frequentNouns: [string, number][], 
  frequentVerbs: [string, number][]
): string[] => {
  const relationships: string[] = [];
  
  // Only proceed if we have both nouns and verbs
  if (frequentNouns.length === 0 || frequentVerbs.length === 0) {
    return relationships;
  }
  
  // Get top nouns and verbs
  const topNouns = frequentNouns.slice(0, 3).map(item => item[0]);
  const topVerbs = frequentVerbs.slice(0, 3).map(item => item[0]);
  
  // Simple sentence patterns to look for
  const sentences = text.toLowerCase().split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  for (const noun of topNouns) {
    for (const verb of topVerbs) {
      // Look for sentences containing both the noun and verb
      const matchingSentences = sentences.filter(sentence => 
        sentence.includes(noun) && sentence.includes(verb)
      );
      
      if (matchingSentences.length > 0) {
        // We found a relationship between this noun and verb
        relationships.push(`"${noun}" is associated with the action "${verb}"`);
      }
    }
  }
  
  // If we found no relationships through sentence matching, try to infer some
  if (relationships.length === 0 && topNouns.length > 0 && topVerbs.length > 0) {
    relationships.push(`The document discusses "${topNouns[0]}" in contexts involving "${topVerbs[0]}"`);
  }
  
  return relationships;
};

/**
 * Analyzes pronoun usage to determine what entities they refer to
 */
const analyzePronounRelationships = (text: string, frequentNouns: [string, number][]): string[] => {
  const insights: string[] = [];
  
  if (frequentNouns.length === 0) {
    return insights;
  }
  
  const textLower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const pronouns = ["he", "she", "they", "it", "them", "him", "her", "his", "hers", "their", "theirs"];
  
  // Count pronouns in the text
  const pronounCounts: Record<string, number> = {};
  pronouns.forEach(pronoun => {
    const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
    const matches = textLower.match(regex);
    pronounCounts[pronoun] = matches ? matches.length : 0;
  });
  
  // Find most frequent pronouns
  const frequentPronouns = Object.entries(pronounCounts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([pronoun]) => pronoun);
  
  if (frequentPronouns.length === 0) {
    return insights;
  }
  
  // Top nouns these pronouns likely refer to
  const topNouns = frequentNouns.slice(0, 3).map(item => item[0]);
  
  // Analyze gender associations
  const malePronouns = ["he", "him", "his"];
  const femalePronouns = ["she", "her", "hers"];
  const pluralPronouns = ["they", "them", "their", "theirs"];
  const neutralPronouns = ["it", "its"];
  
  const hasMalePronouns = malePronouns.some(p => frequentPronouns.includes(p));
  const hasFemalePronouns = femalePronouns.some(p => frequentPronouns.includes(p));
  const hasPluralPronouns = pluralPronouns.some(p => frequentPronouns.includes(p));
  const hasNeutralPronouns = neutralPronouns.some(p => frequentPronouns.includes(p));
  
  if (hasMalePronouns && topNouns.length > 0) {
    insights.push(`Male pronouns (he/him/his) likely refer to "${topNouns[0]}".`);
  }
  
  if (hasFemalePronouns && topNouns.length > 0) {
    insights.push(`Female pronouns (she/her/hers) likely refer to "${topNouns[0]}".`);
  }
  
  if (hasPluralPronouns && topNouns.length > 0) {
    insights.push(`Plural pronouns (they/them/their) likely refer to collective nouns like "${topNouns[0]}".`);
  }
  
  if (hasNeutralPronouns && topNouns.length > 0) {
    insights.push(`Neutral pronouns (it/its) likely refer to concepts like "${topNouns[0]}".`);
  }
  
  return insights;
};

/**
 * Extracts high-level themes from the document based on word usage patterns
 */
const extractDocumentThemes = (
  text: string, 
  frequentNouns: [string, number][],
  frequentVerbs: [string, number][]
): string[] => {
  const themes: string[] = [];
  
  // Theme categories with related words
  const themeCategories: Record<string, string[]> = {
    "Personal Reflection": ["feel", "think", "believe", "experience", "perspective", "view", "opinion", "self"],
    "Analysis": ["analyze", "examine", "study", "investigate", "research", "explore", "understand", "explain"],
    "Narrative": ["story", "event", "happen", "occur", "experience", "incident", "situation", "scene"],
    "Instructional": ["guide", "instruct", "teach", "learn", "step", "process", "method", "way", "how"],
    "Emotional": ["feel", "emotion", "happy", "sad", "angry", "joy", "fear", "love", "hate", "excited"],
    "Academic": ["study", "research", "theory", "concept", "argument", "evidence", "data", "findings"],
    "Professional": ["work", "job", "career", "business", "company", "industry", "market", "professional"]
  };
  
  const textLower = text.toLowerCase();
  
  // Check for theme matches based on word frequency
  for (const [theme, relatedWords] of Object.entries(themeCategories)) {
    let matchCount = 0;
    
    for (const word of relatedWords) {
      // Count occurrences of this theme word
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches && matches.length >= 2) {
        matchCount++;
      }
    }
    
    // If we have multiple matches to this theme, include it
    if (matchCount >= 2) {
      themes.push(theme);
    }
  }
  
  // Check noun and verb patterns for additional themes
  const allTopWords = [...frequentNouns, ...frequentVerbs].map(item => item[0]);
  
  if (allTopWords.some(word => ["time", "year", "day", "week", "month", "hour", "past", "future", "history"].includes(word))) {
    themes.push("Temporal");
  }
  
  if (allTopWords.some(word => ["place", "location", "here", "there", "where", "country", "city", "home"].includes(word))) {
    themes.push("Spatial");
  }
  
  return themes;
};

/**
 * Analyzes the emotional tone of the text based on word choice
 */
const analyzeEmotionalTone = (text: string): string => {
  const textLower = text.toLowerCase();
  
  // Emotion categories with related words
  const emotionCategories: Record<string, string[]> = {
    "Positive": ["happy", "good", "great", "excellent", "wonderful", "amazing", "joy", "love", "pleased", "satisfied"],
    "Negative": ["sad", "bad", "terrible", "awful", "horrible", "disappointing", "angry", "upset", "frustrated", "fear"],
    "Analytical": ["analyze", "examine", "study", "consider", "investigate", "explore", "understand", "explain", "conclude"],
    "Confident": ["certain", "sure", "confident", "definitely", "absolutely", "clearly", "undoubtedly", "obviously"],
    "Tentative": ["perhaps", "maybe", "might", "possibly", "probably", "seems", "appears", "could", "uncertain"],
    "Neutral": ["describe", "state", "report", "inform", "present", "note", "observe", "mention", "indicate"]
  };
  
  // Count matches for each emotion category
  const emotionScores: Record<string, number> = {};
  
  for (const [emotion, words] of Object.entries(emotionCategories)) {
    let score = 0;
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    emotionScores[emotion] = score;
  }
  
  // Find dominant emotions (top 2)
  const sortedEmotions = Object.entries(emotionScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0)
    .map(([emotion]) => emotion);
  
  if (sortedEmotions.length === 0) {
    return "Neutral or factual";
  }
  
  if (sortedEmotions.length === 1) {
    return sortedEmotions[0];
  }
  
  return `${sortedEmotions[0]} with elements of ${sortedEmotions[1]}`;
};
