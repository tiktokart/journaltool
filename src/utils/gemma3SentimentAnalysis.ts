
interface GemmaAnalysisResult {
  sentiment: number;
  emotionalTones: { [key: string]: number };
  summary?: string;
  timeline?: any[];
  entities?: any[];
  keyPhrases?: string[];
  embeddingPoints?: any[];
  sourceDescription?: string;
  text?: string; // Add text field to ensure it's passed to components
}

export const analyzeTextWithGemma3 = async (text: string) => {
  try {
    console.log("Starting Gemma 3 analysis with text length:", text.length);
    
    // This is a placeholder for the actual Gemma 3 API call
    // In a real implementation, this would call the Gemma 3 API
    
    // Extract all significant words from the actual input text
    const significantWords = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter((word, i, arr) => arr.indexOf(word) === i);
      
    console.log(`Found ${significantWords.length} significant words in the document`);
    
    // Extract sentences for timeline analysis using the actual text
    const sentences = text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim());
      
    // Create a timeline with sentiment scores from the actual text
    const timeline = sentences.slice(0, Math.min(10, sentences.length)).map((sentence, index) => {
      // Simple sentiment estimation (would be replaced by actual API call)
      const randomSentiment = 0.3 + Math.random() * 0.6; 
      return {
        page: index + 1,
        score: randomSentiment,
        text: sentence
      };
    });
    
    // Extract actual entities from the text
    const entities = extractEntitiesFromText(text);
    
    // Extract actual key phrases from the text
    const keyPhrases = extractKeyPhrasesFromText(text);
    
    // Generate sentiment analysis (simulated)
    const sentimentResult = analyzeTextSentiment(text);
    const overallSentiment = sentimentResult.score;
    const emotionalTones = sentimentResult.tones;
    
    // Generate a summary based on actual text
    const summary = generateTextSummary(text);

    // Use all significant words for embedding, with reasonable limit
    const wordLimit = Math.min(500, significantWords.length);
    const filteredSignificantWords = significantWords.slice(0, wordLimit);
    
    // Create embedding points using the actual text words
    const embeddingPoints = generateEmbeddingsForWords(filteredSignificantWords, emotionalTones);
    
    // Calculate sentiment distribution based on actual text
    const sentimentDistribution = calculateSentimentDistribution(sentimentResult.score);
    
    return {
      text, // Return the original text
      sentiment: overallSentiment,
      emotionalTones,
      timeline,
      entities,
      keyPhrases,
      summary,
      embeddingPoints,
      distribution: sentimentDistribution
    };
  } catch (error) {
    console.error("Error in Gemma 3 analysis:", error);
    throw error;
  }
};

// Helper function to generate embeddings for actual text words
function generateEmbeddingsForWords(words: string[], emotionalTones: Record<string, number>) {
  return words.map((word, index) => {
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;
    
    // Generate a point in a sphere
    const radius = 10 + Math.random() * 10;
    const x = Math.cos(angle1) * Math.sin(angle2) * radius;
    const y = Math.sin(angle1) * Math.sin(angle2) * radius;
    const z = Math.cos(angle2) * radius;
    
    // Assign emotional tones based on the word and available tones
    const emotionalToneEntries = Object.entries(emotionalTones);
    const sortedTones = emotionalToneEntries.sort((a, b) => b[1] - a[1]);
    
    let emotionalTone;
    const random = Math.random();
    
    if (random < 0.7) {
      // 70% chance to get one of the top 2 emotional tones
      const topIndex = Math.floor(Math.random() * Math.min(2, sortedTones.length));
      emotionalTone = sortedTones[topIndex][0];
    } else {
      // 30% chance to get any other emotional tone
      const randomIndex = Math.floor(Math.random() * Math.min(sortedTones.length, 1));
      emotionalTone = sortedTones[randomIndex > 0 ? randomIndex : 0][0];
    }
    
    const sentiment = 0.2 + Math.random() * 0.6; // Between 0.2 and 0.8
    
    // Generate RGB color values based on sentiment
    const r = Math.floor(255 * (1 - sentiment));
    const g = Math.floor(255 * sentiment);
    const b = Math.floor(255 * 0.5);
    const color = [r/255, g/255, b/255] as [number, number, number];
    
    return {
      id: `word-${index}`,
      position: [x, y, z] as [number, number, number],
      word,
      sentiment,
      emotionalTone,
      color,
      relationships: generateRelationshipsFromText(index, words.length)
    };
  });
}

// Helper function to generate relationships between words
function generateRelationshipsFromText(index: number, totalCount: number) {
  const relationships = [];
  const relationshipCount = Math.floor(Math.random() * 5) + 1; // 1-5 relationships
  
  for (let i = 0; i < relationshipCount; i++) {
    let relatedIndex;
    do {
      relatedIndex = Math.floor(Math.random() * totalCount);
    } while (relatedIndex === index);
    
    relationships.push({
      id: `word-${relatedIndex}`,
      strength: Math.random() * 0.8 + 0.2 // Between 0.2 and 1.0
    });
  }
  
  return relationships;
}

// Helper function to extract key phrases from actual text
function extractKeyPhrasesFromText(text: string): string[] {
  // Common words to filter out
  const commonWords = ['the', 'and', 'in', 'of', 'to', 'a', 'is', 'that', 'for', 'it', 'with', 'as', 'was', 'be'];
  
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const keyPhrases: string[] = [];
  
  sentences.forEach(sentence => {
    const trimmedSentence = sentence.trim();
    if (trimmedSentence.length > 10 && trimmedSentence.length < 100) {
      // Filter the sentence to focus on important words
      const words = trimmedSentence.split(/\s+/);
      const filtered = words.filter(word => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()[\]{}]/g, '').trim();
        return cleanWord.length > 0 && !commonWords.includes(cleanWord);
      });
      
      // Only consider phrases with enough meaningful words
      if (filtered.length >= 2 && filtered.length <= 8) {
        // Reconstruct a simplified phrase from the filtered words
        const simplifiedPhrase = filtered.join(' ');
        if (simplifiedPhrase.length >= 5) {
          keyPhrases.push(simplifiedPhrase);
        }
      }
    }
  });
  
  // Return unique phrases
  return [...new Set(keyPhrases)].slice(0, 10); // Return at most 10 key phrases
}

// Helper function to extract entities from actual text
function extractEntitiesFromText(text: string): any[] {
  // A simple approach: look for capitalized words that might be entities
  const entityRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const potentialEntities = text.match(entityRegex) || [];
  
  // Filter common words that might be capitalized but aren't entities
  const commonWords = ["I", "The", "A", "An", "But", "Or", "On", "In", "At", "To", "And", "For"];
  const filteredEntities = potentialEntities
    .filter(entity => !commonWords.includes(entity))
    .filter((entity, index, self) => self.indexOf(entity) === index); // Remove duplicates
    
  // Get unique entities (limit to 15 for performance)
  const uniqueEntities = [...new Set(filteredEntities)].slice(0, 15);
  
  // For each entity, estimate a sentiment value based on surrounding text
  return uniqueEntities.map(entity => {
    const surroundingText = findSurroundingText(text, entity);
    const sentimentScore = estimateSentiment(surroundingText);
    
    return {
      name: entity,
      sentiment: sentimentScore,
      type: guessEntityType(entity, text),
      mentions: countOccurrences(text, entity),
    };
  });
}

// Helper function to find surrounding text around an entity
function findSurroundingText(text: string, entity: string): string {
  const index = text.indexOf(entity);
  if (index === -1) return "";
  
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + entity.length + 100);
  return text.slice(start, end);
}

// Helper function to estimate sentiment of a piece of text
function estimateSentiment(text: string): number {
  const negativeWords = [
    'sad', 'angry', 'upset', 'disappointed', 'frustrated',
    'anxious', 'worried', 'fear', 'hate', 'terrible',
    'awful', 'bad', 'worse', 'worst', 'horrible'
  ];
  
  const positiveWords = [
    'happy', 'joy', 'excited', 'good', 'great',
    'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific'
  ];
  
  const textLower = text.toLowerCase();
  let negativeCount = 0;
  let positiveCount = 0;
  
  negativeWords.forEach(word => {
    negativeCount += countOccurrences(textLower, word);
  });
  
  positiveWords.forEach(word => {
    positiveCount += countOccurrences(textLower, word);
  });
  
  if (positiveCount + negativeCount === 0) return 0.5; // Neutral
  return positiveCount / (positiveCount + negativeCount);
}

// Helper function to count occurrences of a word in text
function countOccurrences(text: string, word: string): number {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

// Helper function to guess entity type based on context
function guessEntityType(entity: string, context: string): string {
  const personTitles = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Sir", "Lady", "Lord"];
  const locationPrefixes = ["in ", "at ", "to ", "from "];
  const organizationIndicators = ["Corp", "Inc", "Ltd", "Company", "Organization", "Foundation", "University"];
  
  // Check if it might be a person
  if (personTitles.some(title => context.includes(`${title} ${entity}`))) {
    return "Person";
  }
  
  // Check if it might be a location
  if (locationPrefixes.some(prefix => context.includes(`${prefix}${entity}`))) {
    return "Location";
  }
  
  // Check if it might be an organization
  if (organizationIndicators.some(indicator => entity.includes(indicator))) {
    return "Organization";
  }
  
  // Default to "Other" if we can't determine
  return "Other";
}

// Generate a simple summary based on actual text
function generateTextSummary(text: string): string {
  const sentences = text
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 0)
    .map(sentence => sentence.trim());
  
  // Get a few sentences from beginning, middle, and end
  let summary = "";
  if (sentences.length > 0) {
    const beginning = sentences[0];
    
    let middle = "";
    if (sentences.length > 2) {
      const middleIdx = Math.floor(sentences.length / 2);
      middle = sentences[middleIdx];
    }
    
    let end = "";
    if (sentences.length > 1) {
      end = sentences[sentences.length - 1];
    }
    
    summary = beginning;
    if (middle) summary += " " + middle;
    if (end && end !== beginning) summary += " " + end;
  }
  
  return summary || "Summary could not be generated from the provided text.";
}

// Basic sentiment analysis on the actual text
function analyzeTextSentiment(text: string) {
  // Simplified sentiment analysis
  const negativeWords = [
    'sad', 'angry', 'upset', 'disappointed', 'frustrated',
    'anxious', 'worried', 'fear', 'hate', 'terrible',
    'awful', 'bad', 'worse', 'worst', 'horrible'
  ];
  
  const positiveWords = [
    'happy', 'joy', 'excited', 'good', 'great',
    'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific'
  ];
  
  // Emotional tone categories
  const tones: Record<string, number> = {
    'Anxious': 0,
    'Fearful': 0,
    'Worried': 0, 
    'Confused': 0,
    'Overwhelmed': 0,
    'Hopeful': 0,
    'Relieved': 0
  };
  
  // Count word occurrences and update tone scores
  const textLower = text.toLowerCase();
  
  // Calculate overall sentiment
  let negativeCount = 0;
  let positiveCount = 0;
  
  negativeWords.forEach(word => {
    const count = countOccurrences(textLower, word);
    negativeCount += count;
    
    // Update relevant tones based on negative words
    if (word === 'anxious' || word === 'anxiety') tones['Anxious'] += count * 0.2;
    if (word === 'fear' || word === 'afraid') tones['Fearful'] += count * 0.2;
    if (word === 'worried' || word === 'worry') tones['Worried'] += count * 0.2;
    if (word === 'confused') tones['Confused'] += count * 0.2;
    if (word === 'overwhelmed') tones['Overwhelmed'] += count * 0.2;
  });
  
  positiveWords.forEach(word => {
    const count = countOccurrences(textLower, word);
    positiveCount += count;
    
    // Update relevant tones based on positive words
    if (word === 'hope' || word === 'hopeful') tones['Hopeful'] += count * 0.2;
    if (word === 'relief' || word === 'relieved') tones['Relieved'] += count * 0.2;
  });
  
  // Calculate overall sentiment score (0 to 1)
  let score = 0.5; // Default to neutral
  if (positiveCount + negativeCount > 0) {
    score = positiveCount / (positiveCount + negativeCount);
  }
  
  // Set base levels for emotional tones based on text length
  Object.keys(tones).forEach(tone => {
    tones[tone] = Math.max(0.1, tones[tone]);
  });
  
  // Boost the most prominent tones
  const tonesArray = Object.entries(tones);
  tonesArray.sort((a, b) => b[1] - a[1]);
  
  if (tonesArray.length > 0) {
    // Boost the top 2 tones
    tones[tonesArray[0][0]] += 0.3;
    if (tonesArray.length > 1) {
      tones[tonesArray[1][0]] += 0.2;
    }
  }
  
  return { score, tones };
}

// Calculate sentiment distribution percentages
function calculateSentimentDistribution(score: number) {
  // Convert the sentiment score to distribution percentages
  const positivePercentage = Math.round(score * 100);
  const negativePercentage = Math.round((1 - score) * 0.5 * 100);
  const neutralPercentage = 100 - positivePercentage - negativePercentage;
  
  return {
    positive: positivePercentage,
    neutral: neutralPercentage,
    negative: negativePercentage
  };
}
