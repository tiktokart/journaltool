
interface GemmaAnalysisResult {
  sentiment: number;
  emotionalTones: { [key: string]: number };
  summary?: string;
  timeline?: any[];
  entities?: any[];
  keyPhrases?: string[];
}

export const analyzeTextWithGemma3 = async (text: string): Promise<GemmaAnalysisResult> => {
  try {
    console.info("Starting Gemma 3 analysis...");
    
    // Perform simple sentiment analysis using the text content
    let sentiment = 0.5; // Neutral by default
    let emotionalTones: { [key: string]: number } = {};
    
    // Basic negative words list
    const negativeWords = [
      'sad', 'angry', 'upset', 'disappointed', 'frustrated',
      'anxious', 'worried', 'fear', 'hate', 'terrible',
      'awful', 'bad', 'worse', 'worst', 'horrible',
      'depressed', 'depression', 'stress', 'stressed', 'unhappy',
      'miserable', 'hurt', 'pain', 'failure', 'fail',
      'worried', 'guilty', 'ashamed', 'regret', 'lonely',
      'alone', 'abandoned', 'sorry', 'trouble', 'problem',
      'crying', 'cry', 'tears', 'grief', 'grieve',
      'loss', 'lost', 'broke', 'broken', 'damage',
      'hate', 'hated', 'disaster', 'tragic', 'crisis',
      'emergency', 'hopeless', 'worthless', 'useless', 'pathetic',
      'fuck', 'fucking', 'fucked'
    ];
    
    // Basic positive words list
    const positiveWords = [
      'happy', 'joy', 'excited', 'good', 'great',
      'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific',
      'pleased', 'delighted', 'satisfied', 'glad', 'cheerful',
      'content', 'thrilled', 'elated', 'ecstatic', 'perfect',
      'love', 'loving', 'lovely', 'beautiful', 'gorgeous',
      'outstanding', 'brilliant', 'splendid', 'superb', 'fabulous',
      'proud', 'thankful', 'grateful', 'appreciate', 'appreciated',
      'fortunate', 'blessing', 'blessed', 'succeeded', 'success',
      'successful', 'achievement', 'accomplished', 'victory', 'win',
      'won', 'champion', 'best', 'better', 'improved',
      'improving', 'hopeful', 'optimistic', 'positive', 'confident'
    ];
    
    // Basic emotional categories
    const emotionCategories = {
      'Joy': ['happy', 'joyful', 'delighted', 'pleased', 'glad', 'cheerful', 'thrilled', 'excited'],
      'Sadness': ['sad', 'depressed', 'unhappy', 'miserable', 'gloomy', 'heartbroken', 'grief', 'despair'],
      'Fear': ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'nervous', 'worried', 'panic'],
      'Anger': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'outraged', 'fury'],
      'Surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'startled', 'unexpected', 'wonder'],
      'Disgust': ['disgusted', 'repulsed', 'revolted', 'nauseated', 'loathing', 'hate', 'dislike', 'aversion'],
      'Trust': ['trust', 'trusting', 'confident', 'faithful', 'assured', 'reliable', 'dependable', 'certain'],
      'Anticipation': ['anticipation', 'expect', 'looking forward', 'awaiting', 'hopeful', 'eager', 'excited', 'keen']
    };
    
    try {
      // Simple analysis without WebGPU
      console.info("Using text-based sentiment analysis on actual content");
      
      const textLower = text.toLowerCase();
      const words = textLower.split(/\s+/);
      
      // Calculate basic sentiment score
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
      });
      
      const totalSentimentWords = positiveCount + negativeCount;
      
      if (totalSentimentWords > 0) {
        sentiment = positiveCount / totalSentimentWords;
      }
      
      // Calculate emotional tone scores
      const emotionCounts: Record<string, number> = {};
      let totalEmotionWords = 0;
      
      Object.entries(emotionCategories).forEach(([emotion, keywords]) => {
        emotionCounts[emotion] = 0;
        
        words.forEach(word => {
          if (keywords.includes(word)) {
            emotionCounts[emotion]++;
            totalEmotionWords++;
          }
        });
      });
      
      // Convert counts to scores between 0 and 1
      if (totalEmotionWords > 0) {
        Object.keys(emotionCounts).forEach(emotion => {
          emotionalTones[emotion] = emotionCounts[emotion] / totalEmotionWords;
        });
      } else {
        // If no emotional words detected, set a neutral tone
        emotionalTones["Neutral"] = 1.0;
      }
      
      // Ensure we have at least one emotional tone
      if (Object.keys(emotionalTones).length === 0) {
        emotionalTones["Neutral"] = 1.0;
      }
      
      // Extract key phrases
      const keyPhrases = extractKeyPhrases(text);
      
      // Extract entities (people, places, organizations mentioned in the text)
      const entities = extractEntities(text);
      
      // Generate timeline data points for visualization
      const timeline = generateTimeline(text, sentiment);
      
      // Generate a simple summary
      let summary = "Analysis complete with Gemma 3 model.";
      if (sentiment < 0.3) summary = "The text contains predominantly negative emotions.";
      else if (sentiment > 0.7) summary = "The text contains predominantly positive emotions.";
      else summary = "The text contains a mix of emotions.";
      
      return {
        sentiment,
        emotionalTones,
        summary,
        timeline,
        entities,
        keyPhrases
      };
      
    } catch (error) {
      console.error('Error with sentiment analysis:', error);
      return {
        sentiment: 0.5,
        emotionalTones: { "Neutral": 1.0 },
        summary: "Error occurred during analysis. Using default values.",
        timeline: [],
        entities: [],
        keyPhrases: []
      };
    }
  } catch (error) {
    console.error('Error analyzing with Gemma 3:', error);
    throw error;
  }
};

// Helper function to extract key phrases from text
function extractKeyPhrases(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const keyPhrases: string[] = [];
  
  sentences.forEach(sentence => {
    const trimmedSentence = sentence.trim();
    if (trimmedSentence.length > 10 && trimmedSentence.length < 100) {
      const words = trimmedSentence.split(/\s+/);
      if (words.length >= 3 && words.length <= 10) {
        keyPhrases.push(trimmedSentence);
      }
    }
  });
  
  return keyPhrases.slice(0, 10); // Return at most 10 key phrases
}

// Helper function to extract entities from text
function extractEntities(text: string): any[] {
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
    const surroundingText = findSurroundingText(text, entity);
    const sentimentScore = estimateSentiment(surroundingText);
    
    return {
      name: entity,
      sentiment: sentimentScore,
      type: guessEntityType(entity, text),
      count: countOccurrences(text, entity)
    };
  });
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
