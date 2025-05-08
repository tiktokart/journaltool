
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
    console.log("Starting Gemma 3 analysis...");
    
    // This is a placeholder for the actual Gemma 3 API call
    // In a real implementation, this would call the Gemma 3 API
    
    // For now, we'll simulate the API response
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    // Extract sentences for timeline analysis
    const sentences = text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim());
      
    // Create a simulated timeline with sentiment scores
    const timeline = sentences.slice(0, Math.min(10, sentences.length)).map((sentence, index) => {
      const randomSentiment = 0.3 + Math.random() * 0.6; // Between 0.3 and 0.9
      return {
        page: index + 1, // Changed to page for consistency with expected format
        score: randomSentiment, // Changed to score for consistency
        text: sentence
      };
    });
    
    // Create simulated entities with sentiment scores
    const commonEntities = ['anxiety', 'fear', 'breathing', 'heart', 'mind', 'thoughts', 'body', 'control', 'panic', 'calm'];
    const entities = commonEntities.map(name => {
      const randomScore = 0.2 + Math.random() * 0.6; // Between 0.2 and 0.8
      const randomMentions = Math.floor(Math.random() * 10) + 1; // Between 1 and 10
      return {
        name,
        score: randomScore,
        mentions: randomMentions
      };
    });
    
    // Create simulated key phrases
    const keyPhrases = [
      'racing heart', 
      'shortness of breath', 
      'overwhelming fear', 
      'feeling of doom', 
      'loss of control',
      'chest tightness',
      'tunnel vision',
      'sudden dizziness',
      'fear of dying',
      'intense worry'
    ].map(phrase => {
      return {
        text: phrase,
        score: 0.4 + Math.random() * 0.5, // Between 0.4 and 0.9
        sentiment: Math.random() > 0.7 ? 'positive' : 'negative' // Mostly negative
      };
    });
    
    // Main sentiment calculation (simulated)
    const overallSentiment = 0.3 + Math.random() * 0.3; // Between 0.3 and 0.6 (mostly negative/neutral)
    
    // Create emotional tones distribution
    const emotionalTones = {
      'Anxious': 0.6 + Math.random() * 0.3,
      'Fearful': 0.5 + Math.random() * 0.3,
      'Worried': 0.5 + Math.random() * 0.4,
      'Confused': 0.4 + Math.random() * 0.4,
      'Overwhelmed': 0.5 + Math.random() * 0.4,
      'Hopeful': 0.2 + Math.random() * 0.3,
      'Relieved': 0.1 + Math.random() * 0.3
    };
    
    // Generate a simulated summary
    const summary = `This text describes an experience with anxiety and panic. The narrative reveals feelings of ${
      Math.random() > 0.5 ? 'intense fear' : 'overwhelming anxiety'
    } and physical symptoms like ${
      Math.random() > 0.5 ? 'rapid heartbeat' : 'shortness of breath'
    }. The emotional tone is predominantly negative with some moments of ${
      Math.random() > 0.5 ? 'hope' : 'reflection'
    } towards the end.`;

    // Extract significant words from the text for visualization
    const significantWords = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter((word, i, arr) => arr.indexOf(word) === i);

    // Use all significant words for visualization, with reasonable limit
    const wordLimit = Math.min(500, significantWords.length);
    const filteredSignificantWords = significantWords.slice(0, wordLimit);
    
    // Create embedding points using actual text from the document
    const embeddingPoints = filteredSignificantWords.map((word, index) => {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      
      // Generate a point in a sphere
      const radius = 10 + Math.random() * 10;
      const x = Math.cos(angle1) * Math.sin(angle2) * radius;
      const y = Math.sin(angle1) * Math.sin(angle2) * radius;
      const z = Math.cos(angle2) * radius;
      
      // Assign a sentiment score based on emotional tones
      const emotionalToneEntries = Object.entries(emotionalTones);
      const sortedTones = emotionalToneEntries.sort((a, b) => b[1] - a[1]);
      
      // Assign emotional tones based on sentiment scores
      let emotionalTone;
      const random = Math.random();
      
      if (random < 0.7) {
        // 70% chance to get one of the top 2 emotional tones
        const topIndex = Math.floor(Math.random() * Math.min(2, sortedTones.length));
        emotionalTone = sortedTones[topIndex][0];
      } else {
        // 30% chance to get any other emotional tone
        const randomIndex = Math.floor(Math.random() * sortedTones.length);
        emotionalTone = sortedTones[randomIndex][0];
      }
      
      const sentiment = 0.2 + Math.random() * 0.6; // Between 0.2 and 0.8
      
      // Generate a color based on sentiment (from red to green)
      const r = Math.floor(255 * (1 - sentiment));
      const g = Math.floor(255 * sentiment);
      const b = Math.floor(255 * 0.5); // Add some blue to avoid pure red/green
      
      return {
        id: `word-${index}`,
        position: [x, y, z],
        word: word,
        sentiment: sentiment,
        emotionalTone: emotionalTone,
        color: [r/255, g/255, b/255],
        relationships: generateMockRelationships(index, filteredSignificantWords.length)
      };
    });
    
    return {
      text, // Make sure we return the original text
      sentiment: overallSentiment,
      emotionalTones,
      timeline,
      entities,
      keyPhrases,
      summary,
      embeddingPoints
    };
  } catch (error) {
    console.error("Error in Gemma 3 analysis:", error);
    throw error;
  }
};

// Helper function to generate mock relationships
function generateMockRelationships(index: number, totalCount: number) {
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

// Helper function to extract key phrases from text
function extractKeyPhrases(text: string, wordsToFilter: string[]): string[] {
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const keyPhrases: string[] = [];
  
  sentences.forEach(sentence => {
    const trimmedSentence = sentence.trim();
    if (trimmedSentence.length > 10 && trimmedSentence.length < 100) {
      // Filter the sentence to focus on important words
      const words = trimmedSentence.split(/\s+/);
      const filtered = words.filter(word => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()[\]{}]/g, '').trim();
        return cleanWord.length > 0 && !wordsToFilter.includes(cleanWord);
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
  
  return keyPhrases.slice(0, 10); // Return at most 10 key phrases
}

// Helper function to extract entities from text
function extractEntities(text: string, wordsToFilter: string[]): any[] {
  // A simple approach: look for capitalized words that might be entities
  const entityRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const potentialEntities = text.match(entityRegex) || [];
  
  // Filter common words that might be capitalized but aren't entities
  const commonWords = ["I", "The", "A", "An", "But", "Or", "On", "In", "At", "To", "And", "For"];
  const filteredEntities = potentialEntities
    .filter(entity => !commonWords.includes(entity))
    .filter((entity, index, self) => self.indexOf(entity) === index); // Remove duplicates
  
  // For each entity, estimate a sentiment value
  return filteredEntities.map(entity => {
    // Check if the entity contains words to filter
    const entityWords = entity.split(/\s+/);
    const isPrimaryEntity = !entityWords.some(word => 
      wordsToFilter.includes(word.toLowerCase())
    );
    
    const surroundingText = findSurroundingText(text, entity);
    const sentimentScore = estimateSentiment(surroundingText);
    
    return {
      name: entity,
      sentiment: sentimentScore,
      type: guessEntityType(entity, text),
      count: countOccurrences(text, entity),
      isPrimaryEntity: isPrimaryEntity // Mark entities that don't contain filtered words
    };
  }).filter(entity => entity.isPrimaryEntity); // Keep only primary entities
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

// Helper function to guess entity type
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
