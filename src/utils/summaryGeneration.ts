
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
      "father", "power", "hour", "game", "line", "end", "member", "law", "car", "city",
      // Additional common nouns
      "mind", "heart", "body", "emotion", "feeling", "thought", "idea", "concept",
      "question", "answer", "solution", "community", "society", "culture", "history",
      "future", "goal", "dream", "plan", "experience", "moment", "health", "relationship",
      "challenge", "opportunity", "decision", "choice", "purpose", "meaning", "value"
    ];
    
    const actionVerbs = [
      "run", "walk", "talk", "speak", "eat", "drink", "sleep", "think", "know",
      "understand", "see", "look", "watch", "feel", "touch", "hear", "listen",
      "smell", "taste", "make", "create", "build", "design", "write", "draw",
      "read", "study", "learn", "teach", "tell", "say", "ask", "answer", "help",
      "work", "play", "start", "begin", "end", "finish", "stop", "go", "come",
      "arrive", "leave", "stay", "move", "change", "grow", "live", "die", "kill",
      "fight", "win", "lose", "find", "search", "seek", "try", "attempt", "succeed",
      "fail", "laugh", "cry", "smile", "frown", "give", "take", "buy", "sell",
      // Additional action verbs
      "analyze", "explore", "discover", "realize", "perceive", "observe", "recognize",
      "believe", "trust", "hope", "fear", "worry", "care", "love", "hate", "enjoy",
      "suffer", "endure", "overcome", "transform", "solve", "decide", "choose", "act",
      "reflect", "meditate", "contemplate", "consider", "evaluate", "assess", "improve",
      "develop", "progress", "achieve", "accomplish", "reach", "attain", "pursue"
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
    
    // Extract contextual relationships with improved analysis
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

    // Extract primary topics through context-aware analysis
    const primaryTopics = extractPrimaryTopics(text, frequentNouns, frequentVerbs);
    
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

    // Add primary topics
    if (primaryTopics.length > 0) {
      summary += `\n\nPrimary topics: ${primaryTopics.join(", ")}.`;
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
 * Extracts primary topics from the text using contextual analysis
 * @param text The document text to analyze
 * @param frequentNouns Array of frequent nouns with their counts
 * @param frequentVerbs Array of frequent verbs with their counts
 * @returns Array of primary topics extracted from the text
 */
const extractPrimaryTopics = (
  text: string,
  frequentNouns: [string, number][],
  frequentVerbs: [string, number][]
): string[] => {
  const topics: string[] = [];
  const textLower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Get top nouns and verbs
  const topNouns = frequentNouns.slice(0, 5).map(item => item[0]);
  const topVerbs = frequentVerbs.slice(0, 5).map(item => item[0]);
  
  // Topic categories with associated keywords
  const topicCategories: Record<string, string[]> = {
    "Personal Growth": ["learn", "grow", "improve", "develop", "change", "progress", "goal", "dream", "future", "plan"],
    "Mental Health": ["feel", "emotion", "mind", "stress", "anxiety", "depression", "therapy", "wellness", "mental", "health"],
    "Relationships": ["friend", "family", "relationship", "love", "connect", "bond", "together", "partner", "marriage", "communication"],
    "Work & Career": ["work", "job", "career", "business", "professional", "company", "success", "achievement", "project", "goal"],
    "Education": ["learn", "study", "school", "college", "university", "education", "knowledge", "student", "teach", "course"],
    "Philosophy": ["meaning", "purpose", "life", "exist", "question", "belief", "value", "philosophy", "thought", "idea"],
    "Creativity": ["create", "art", "write", "design", "imagine", "creative", "idea", "express", "inspire", "innovative"],
    "Physical Health": ["body", "health", "exercise", "fitness", "diet", "nutrition", "sleep", "energy", "strength", "wellness"]
  };
  
  // Check for topic matches based on frequent words
  for (const [topic, keywords] of Object.entries(topicCategories)) {
    let matchingKeywords = 0;
    
    for (const noun of topNouns) {
      if (keywords.includes(noun)) {
        matchingKeywords++;
      }
    }
    
    for (const verb of topVerbs) {
      if (keywords.includes(verb)) {
        matchingKeywords++;
      }
    }
    
    // Check for topic keywords in context (full sentences)
    let contextualMatches = 0;
    for (const keyword of keywords) {
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          contextualMatches++;
          break; // Only count each keyword once per sentence
        }
      }
    }
    
    // Determine if this is a primary topic based on keyword matches and contextual matches
    if (matchingKeywords >= 2 || contextualMatches >= 3) {
      topics.push(topic);
    }
  }
  
  // Analyze semantic relationships between frequent words to infer additional topics
  if (topNouns.length > 0 && topVerbs.length > 0) {
    // Get sentences containing both top nouns and verbs
    for (const noun of topNouns.slice(0, 3)) {
      for (const verb of topVerbs.slice(0, 3)) {
        const matchingSentences = sentences.filter(sentence => 
          sentence.toLowerCase().includes(noun) && sentence.toLowerCase().includes(verb)
        );
        
        if (matchingSentences.length >= 2) {
          // Infer a topic from this noun-verb relationship
          const inferredTopic = inferTopicFromRelationship(noun, verb, matchingSentences);
          if (inferredTopic && !topics.includes(inferredTopic)) {
            topics.push(inferredTopic);
          }
        }
      }
    }
  }
  
  return topics;
};

/**
 * Infers a topic from a noun-verb relationship
 */
const inferTopicFromRelationship = (
  noun: string,
  verb: string,
  sentences: string[]
): string | null => {
  // Map of noun-verb combinations to potential topics
  const topicMappings: Record<string, Record<string, string>> = {
    "mind": {
      "think": "Critical Thinking",
      "feel": "Emotional Intelligence",
      "change": "Cognitive Growth",
      "explore": "Intellectual Curiosity"
    },
    "life": {
      "change": "Life Transitions",
      "improve": "Self-Improvement",
      "balance": "Work-Life Balance",
      "enjoy": "Quality of Life"
    },
    "work": {
      "enjoy": "Job Satisfaction",
      "balance": "Work-Life Balance",
      "improve": "Professional Development"
    },
    "time": {
      "manage": "Time Management",
      "spend": "Time Allocation",
      "waste": "Productivity"
    }
  };
  
  // Check if we have a mapping for this noun-verb combination
  if (topicMappings[noun] && topicMappings[noun][verb]) {
    return topicMappings[noun][verb];
  }
  
  // Create a generalized topic if no specific mapping exists
  return null;
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
  
  // Enhanced contextual relationship extraction
  // Look for sentences where both noun and verb appear
  const relationshipMap: Record<string, string[]> = {};
  
  for (const noun of topNouns) {
    relationshipMap[noun] = [];
    
    for (const verb of topVerbs) {
      // Look for sentences containing both the noun and verb
      const matchingSentences = sentences.filter(sentence => 
        sentence.includes(noun) && sentence.includes(verb)
      );
      
      if (matchingSentences.length > 0) {
        // Extract the relationship from the sentence structure
        relationshipMap[noun].push(verb);
      }
    }
  }
  
  // Convert relationships map to readable insights
  for (const [noun, relatedVerbs] of Object.entries(relationshipMap)) {
    if (relatedVerbs.length > 0) {
      relationships.push(`"${noun}" is associated with ${relatedVerbs.map(v => `"${v}"`).join(", ")}`);
    }
  }
  
  // Analyze subject-verb-object patterns for deeper insights
  const subjectVerbPatterns: Record<string, string[]> = {};
  
  for (const sentence of sentences) {
    // This is a simplified approximation
    for (const noun of topNouns) {
      if (sentence.includes(noun)) {
        for (const verb of topVerbs) {
          if (sentence.includes(verb)) {
            // Look for potential objects after the verb
            const verbIndex = sentence.indexOf(verb);
            const afterVerb = sentence.substring(verbIndex + verb.length);
            
            // Check if any other noun appears after the verb
            for (const objectNoun of topNouns) {
              if (objectNoun !== noun && afterVerb.includes(objectNoun)) {
                if (!subjectVerbPatterns[noun]) {
                  subjectVerbPatterns[noun] = [];
                }
                subjectVerbPatterns[noun].push(`${verb} ${objectNoun}`);
                break;
              }
            }
          }
        }
      }
    }
  }
  
  // Add subject-verb-object insights to relationships
  for (const [subject, patterns] of Object.entries(subjectVerbPatterns)) {
    if (patterns.length > 0) {
      const uniquePatterns = [...new Set(patterns)];
      relationships.push(`"${subject}" appears to ${uniquePatterns[0]}`);
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
  
  // Enhanced pronoun resolution with contextual analysis
  // Analyze sentences to determine pronoun references
  const pronounReferences: Record<string, string[]> = {};
  
  for (const pronoun of frequentPronouns) {
    pronounReferences[pronoun] = [];
    
    // Find sentences with this pronoun
    const sentencesWithPronoun = sentences.filter(s => 
      new RegExp(`\\b${pronoun}\\b`, 'i').test(s)
    );
    
    for (const sentence of sentencesWithPronoun) {
      // Look for nouns that appear before this pronoun in the sentence or in the previous sentence
      const pronounIndex = sentence.toLowerCase().indexOf(pronoun);
      const beforePronoun = sentence.substring(0, pronounIndex);
      
      for (const [noun, _] of frequentNouns) {
        if (beforePronoun.toLowerCase().includes(noun)) {
          pronounReferences[pronoun].push(noun);
          break;
        }
      }
    }
  }
  
  // Top nouns these pronouns likely refer to
  const topNouns = frequentNouns.slice(0, 3).map(item => item[0]);
  
  // Generate insights based on pronoun references
  for (const [pronoun, references] of Object.entries(pronounReferences)) {
    if (references.length > 0) {
      // Get unique references
      const uniqueReferences = [...new Set(references)];
      if (uniqueReferences.length > 0) {
        insights.push(`${pronoun} typically refers to ${uniqueReferences.map(r => `"${r}"`).join(" or ")}.`);
      }
    }
  }
  
  // Analyze gender associations
  const malePronouns = ["he", "him", "his"];
  const femalePronouns = ["she", "her", "hers"];
  const pluralPronouns = ["they", "them", "their", "theirs"];
  const neutralPronouns = ["it", "its"];
  
  const hasMalePronouns = malePronouns.some(p => frequentPronouns.includes(p));
  const hasFemalePronouns = femalePronouns.some(p => frequentPronouns.includes(p));
  const hasPluralPronouns = pluralPronouns.some(p => frequentPronouns.includes(p));
  const hasNeutralPronouns = neutralPronouns.some(p => frequentPronouns.includes(p));
  
  if (hasMalePronouns && topNouns.length > 0 && insights.length === 0) {
    insights.push(`Male pronouns likely refer to "${topNouns[0]}".`);
  }
  
  if (hasFemalePronouns && topNouns.length > 0 && insights.length === 0) {
    insights.push(`Female pronouns likely refer to "${topNouns[0]}".`);
  }
  
  if (hasPluralPronouns && topNouns.length > 0 && insights.length === 0) {
    insights.push(`Plural pronouns likely refer to collective nouns like "${topNouns[0]}".`);
  }
  
  if (hasNeutralPronouns && topNouns.length > 0 && insights.length === 0) {
    insights.push(`Neutral pronouns likely refer to concepts like "${topNouns[0]}".`);
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
    "Professional": ["work", "job", "career", "business", "company", "industry", "market", "professional"],
    "Philosophical": ["meaning", "purpose", "existence", "reality", "truth", "knowledge", "wisdom", "belief"],
    "Social": ["people", "group", "society", "community", "culture", "relationship", "interaction", "network"],
    "Political": ["government", "policy", "law", "rights", "freedom", "democracy", "authority", "power"]
  };
  
  const textLower = text.toLowerCase();
  
  // Enhanced theme detection with contextual analysis
  // Check for theme matches based on word frequency and context
  for (const [theme, relatedWords] of Object.entries(themeCategories)) {
    let matchCount = 0;
    let contextScore = 0;
    
    for (const word of relatedWords) {
      // Count occurrences of this theme word
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches && matches.length >= 2) {
        matchCount++;
        contextScore += matches.length;
      }
    }
    
    // Check for co-occurrence of theme words in the same sentences
    const sentences = text.toLowerCase().split(/[.!?]+/).filter(s => s.trim().length > 0);
    let sentenceMatches = 0;
    
    for (const sentence of sentences) {
      let wordsInSentence = 0;
      for (const word of relatedWords) {
        if (sentence.includes(word)) {
          wordsInSentence++;
        }
      }
      
      if (wordsInSentence >= 2) {
        sentenceMatches++;
      }
    }
    
    contextScore += sentenceMatches * 2; // Weight sentence co-occurrence more heavily
    
    // If we have multiple matches to this theme or strong contextual evidence, include it
    if (matchCount >= 2 || contextScore >= 5) {
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
  
  // Look for emotional themes based on the combination of nouns and verbs
  const emotionalNouns = ["heart", "feeling", "emotion", "love", "fear", "anger", "joy", "sadness"];
  const emotionalVerbs = ["feel", "love", "hate", "fear", "enjoy", "suffer", "worry", "care"];
  
  const hasEmotionalNouns = frequentNouns.some(([noun]) => emotionalNouns.includes(noun));
  const hasEmotionalVerbs = frequentVerbs.some(([verb]) => emotionalVerbs.includes(verb));
  
  if (hasEmotionalNouns || hasEmotionalVerbs) {
    if (!themes.includes("Emotional")) {
      themes.push("Emotional");
    }
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
    "Positive": ["happy", "good", "great", "excellent", "wonderful", "amazing", "joy", "love", "pleased", "satisfied", 
                "grateful", "thankful", "optimistic", "hopeful", "content", "delighted", "proud", "enthusiastic"],
    "Negative": ["sad", "bad", "terrible", "awful", "horrible", "disappointing", "angry", "upset", "frustrated", "fear",
                "depressed", "anxious", "worried", "scared", "stressed", "miserable", "regretful", "ashamed"],
    "Analytical": ["analyze", "examine", "study", "consider", "investigate", "explore", "understand", "explain", "conclude",
                  "evaluate", "assess", "compare", "contrast", "measure", "calculate", "determine", "observe"],
    "Confident": ["certain", "sure", "confident", "definitely", "absolutely", "clearly", "undoubtedly", "obviously",
                "assured", "convinced", "positive", "resolute", "decisive", "determined", "firm", "assertive"],
    "Tentative": ["perhaps", "maybe", "might", "possibly", "probably", "seems", "appears", "could", "uncertain",
                "doubtful", "questionable", "tentative", "hesitant", "unsure", "wondering", "speculate"],
    "Neutral": ["describe", "state", "report", "inform", "present", "note", "observe", "mention", "indicate",
              "specify", "document", "record", "detail", "outline", "summarize", "relate", "convey"]
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
  
  // Enhanced contextual analysis for emotional tone
  // Look for phrases that modify emotional intensity
  const intensifiers = ["very", "extremely", "incredibly", "deeply", "profoundly", "utterly", "absolutely"];
  const diminishers = ["somewhat", "slightly", "a bit", "rather", "fairly", "kind of", "sort of"];
  
  let intensificationScore = 0;
  let diminishmentScore = 0;
  
  for (const intensifier of intensifiers) {
    const regex = new RegExp(`${intensifier}\\s+(\\w+)`, 'gi');
    const matches = [...textLower.matchAll(regex)];
    
    for (const match of matches) {
      const word = match[1];
      for (const [emotion, words] of Object.entries(emotionCategories)) {
        if (words.includes(word)) {
          emotionScores[emotion] += 2; // Boost the score of this emotion
          intensificationScore++;
        }
      }
    }
  }
  
  for (const diminisher of diminishers) {
    const regex = new RegExp(`${diminisher}\\s+(\\w+)`, 'gi');
    const matches = [...textLower.matchAll(regex)];
    
    for (const match of matches) {
      const word = match[1];
      for (const [emotion, words] of Object.entries(emotionCategories)) {
        if (words.includes(word)) {
          emotionScores[emotion] -= 1; // Reduce the score of this emotion
          diminishmentScore++;
        }
      }
    }
  }
  
  // Find dominant emotions (top 2)
  const sortedEmotions = Object.entries(emotionScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0)
    .map(([emotion]) => emotion);
  
  // Add contextual modifiers based on intensifiers and diminishers
  let emotionalTone = "";
  
  if (sortedEmotions.length === 0) {
    emotionalTone = "Neutral or factual";
  } else if (sortedEmotions.length === 1) {
    emotionalTone = intensificationScore > diminishmentScore ? 
      `Strongly ${sortedEmotions[0].toLowerCase()}` : 
      sortedEmotions[0];
  } else {
    // Look for emotional transitions or mixed emotions
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstHalfSentences = sentences.slice(0, Math.floor(sentences.length / 2)).join(" ");
    const secondHalfSentences = sentences.slice(Math.floor(sentences.length / 2)).join(" ");
    
    let firstHalfScores: Record<string, number> = {};
    let secondHalfScores: Record<string, number> = {};
    
    for (const [emotion, words] of Object.entries(emotionCategories)) {
      firstHalfScores[emotion] = 0;
      secondHalfScores[emotion] = 0;
      
      for (const word of words) {
        const regexFirst = new RegExp(`\\b${word}\\b`, 'gi');
        const regexSecond = new RegExp(`\\b${word}\\b`, 'gi');
        
        const firstHalfMatches = firstHalfSentences.match(regexFirst);
        const secondHalfMatches = secondHalfSentences.match(regexSecond);
        
        if (firstHalfMatches) firstHalfScores[emotion] += firstHalfMatches.length;
        if (secondHalfMatches) secondHalfScores[emotion] += secondHalfMatches.length;
      }
    }
    
    const dominantFirstHalf = Object.entries(firstHalfScores)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    const dominantSecondHalf = Object.entries(secondHalfScores)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    if (dominantFirstHalf !== dominantSecondHalf) {
      emotionalTone = `Transitions from ${dominantFirstHalf.toLowerCase()} to ${dominantSecondHalf.toLowerCase()}`;
    } else {
      emotionalTone = `${sortedEmotions[0]} with elements of ${sortedEmotions[1]}`;
    }
  }
  
  return emotionalTone;
};
