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
        text: sentence,
        sentiment: randomSentiment,
        timestamp: new Date(Date.now() - (sentences.length - index) * 86400000).toISOString()
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
    
    return {
      sentiment: overallSentiment,
      emotionalTones,
      timeline,
      entities,
      keyPhrases,
      summary
    };
  } catch (error) {
    console.error("Error in Gemma 3 analysis:", error);
    throw error;
  }
};

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

// Helper function to generate timeline data
function generateTimeline(text: string, overallSentiment: number): any[] {
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  // If there are very few sentences, return a minimal timeline
  if (sentences.length < 5) {
    return [
      { time: "Beginning", sentiment: overallSentiment },
      { time: "End", sentiment: overallSentiment }
    ];
  }
  
  const timelinePoints = [];
  const segmentCount = Math.min(10, Math.max(5, Math.floor(sentences.length / 3)));
  
  for (let i = 0; i < segmentCount; i++) {
    const segmentStart = Math.floor((i * sentences.length) / segmentCount);
    const segmentEnd = Math.floor(((i + 1) * sentences.length) / segmentCount);
    const segment = sentences.slice(segmentStart, segmentEnd).join(" ");
    
    const segmentSentiment = estimateSentiment(segment);
    const timePoint = i === 0 ? "Beginning" : 
                      i === segmentCount - 1 ? "End" : 
                      `Point ${i}`;
    
    timelinePoints.push({
      time: timePoint,
      sentiment: segmentSentiment
    });
  }
  
  return timelinePoints;
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
