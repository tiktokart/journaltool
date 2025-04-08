import { Point } from '@/types/embedding';

export const generateMockPoints = (
  depressedJournalReference: boolean = false,
  customWords?: string[] | Record<string, number> | number,
  sentimentOverride?: number
): Point[] => {
  // Set a seed for reproducible randomness 
  Math.seedrandom("embedding-visualization-seed");
  
  // Determine how many points to generate
  let pointCount: number = 150;  // default value
  
  // Process customWords parameter based on its type
  let wordBank: string[] = [];
  let emotionalDistribution: Record<string, number> = {};
  
  if (typeof customWords === 'number') {
    // If a number is provided, use it as the point count
    pointCount = customWords;
  } else if (Array.isArray(customWords)) {
    // If an array is provided, use it as custom words
    wordBank = customWords;
    pointCount = Math.min(wordBank.length, 500); // Use word count or cap at 500
  } else if (customWords && typeof customWords === 'object') {
    // If an object is provided, use it as emotional distribution
    emotionalDistribution = customWords as Record<string, number>;
  }
  
  // Default emotional distribution for general text
  const defaultDistribution = {
    Joy: 0.15,
    Sadness: 0.15, 
    Anger: 0.1,
    Fear: 0.1,
    Surprise: 0.1,
    Disgust: 0.05,
    Trust: 0.2,
    Anticipation: 0.15,
    Neutral: 0
  };
  
  // If this is for a depressed journal reference, shift the emotional tone distribution
  const depressedDistribution = {
    Joy: 0.05,
    Sadness: 0.35,
    Anger: 0.15,
    Fear: 0.25,
    Surprise: 0.05,
    Disgust: 0.05,
    Trust: 0.05,
    Anticipation: 0.05,
    Neutral: 0
  };
  
  // Sample words related to panic attacks and anxiety
  const anxietyWords = [
    "heart", "racing", "breath", "struggling", "panic", "attack", "fear", "chest", 
    "tight", "dizzy", "lightheaded", "worry", "overwhelmed", "trapped", "control", 
    "helpless", "terror", "anxiety", "adrenaline", "survival", "suffocating", "hyperventilating",
    "mind", "racing", "thoughts", "dying", "collapse", "palpitations", "sweat", "trembling",
    "shaking", "nausea", "detached", "unreal", "faint", "nervous", "stress", "pressure",
    "mental", "health", "mindfulness", "meditation", "breathing", "techniques", "therapy", 
    "coping", "strategies", "trigger", "response", "body", "physical", "symptoms"
  ];
  
  // Choose the appropriate distribution and words based on parameters
  let finalDistribution = defaultDistribution;
  if (depressedJournalReference) {
    finalDistribution = depressedDistribution;
    if (!wordBank.length) {
      wordBank = anxietyWords;
    }
  }
  
  // Use provided distribution if it exists
  if (Object.keys(emotionalDistribution).length > 0) {
    finalDistribution = emotionalDistribution;
  }
  
  // Generate the points
  const points: Point[] = [];
  
  for (let i = 0; i < pointCount; i++) {
    // Determine emotional tone based on distribution
    let emotionalTone = "Neutral";
    const emotionRoll = Math.random();
    let cumulativeProbability = 0;
    
    for (const [tone, probability] of Object.entries(finalDistribution)) {
      cumulativeProbability += probability;
      if (emotionRoll < cumulativeProbability) {
        emotionalTone = tone;
        break;
      }
    }
    
    // Generate a point position
    const position: [number, number, number] = [
      (Math.random() * 2 - 1) * 15,
      (Math.random() * 2 - 1) * 15,
      (Math.random() * 2 - 1) * 15
    ];
    
    // Choose a word from the bank or generate a generic one
    let word = `Word${i + 1}`;
    if (wordBank.length > 0) {
      const wordIndex = i % wordBank.length;
      word = wordBank[wordIndex];
    }
    
    // Generate a sentiment value (0-1) with bias based on emotional tone
    let sentimentValue: number;
    if (sentimentOverride !== undefined) {
      // Use global sentiment override if provided
      sentimentValue = sentimentOverride;
    } else {
      // Otherwise calculate based on emotional tone
      switch (emotionalTone) {
        case "Joy":
        case "Trust":
        case "Anticipation":
          sentimentValue = 0.7 + Math.random() * 0.3; // 0.7-1.0
          break;
        case "Sadness":
        case "Fear":
        case "Anger":
        case "Disgust":
          sentimentValue = Math.random() * 0.3; // 0-0.3
          break;
        case "Surprise":
          sentimentValue = 0.3 + Math.random() * 0.4; // 0.3-0.7
          break;
        default:
          sentimentValue = 0.4 + Math.random() * 0.2; // 0.4-0.6
      }
    }
    
    // Create the point
    const point: Point = {
      id: `point-${i}`,
      position: position,
      word: word,
      color: getColorForEmotionalTone(emotionalTone),
      size: 0.4 + Math.random() * 0.6, // Random size between 0.4 and 1.0
      emotionalTone: emotionalTone,
      sentiment: sentimentValue,
      relationships: [],
      keywords: []
    };
    
    // Add related concepts/keywords
    const keywordCount = Math.floor(Math.random() * 4);
    if (keywordCount > 0) {
      const keywords = [];
      for (let k = 0; k < keywordCount; k++) {
        if (wordBank.length > 0) {
          // Choose a random word from the bank
          const randomIndex = Math.floor(Math.random() * wordBank.length);
          keywords.push(wordBank[randomIndex]);
        } else {
          keywords.push(`Concept ${k + 1}`);
        }
      }
      point.keywords = keywords;
    }
    
    points.push(point);
  }
  
  // Add relationships between points
  points.forEach((point, index) => {
    const relationshipCount = Math.floor(Math.random() * 7) + 3; // 3-10 relationships
    const relationships = [];
    
    // Create a set to keep track of points already used in relationships
    const usedRelationships = new Set<string>();
    
    for (let r = 0; r < relationshipCount; r++) {
      let targetIndex;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Find a target that hasn't been used yet, with a maximum number of attempts
      do {
        targetIndex = Math.floor(Math.random() * points.length);
        attempts++;
        if (attempts > maxAttempts) break;
      } while (targetIndex === index || usedRelationships.has(points[targetIndex].id));
      
      if (attempts <= maxAttempts) {
        const targetPoint = points[targetIndex];
        usedRelationships.add(targetPoint.id);
        
        // Relationship strength is stronger for points with the same emotional tone
        const sameEmotionalTone = point.emotionalTone === targetPoint.emotionalTone;
        const baseStrength = sameEmotionalTone ? 0.7 : 0.3;
        const strength = baseStrength + Math.random() * 0.3;
        
        relationships.push({
          id: targetPoint.id,
          word: targetPoint.word,
          strength: strength
        });
      }
    }
    
    point.relationships = relationships;
  });
  
  return points;
};

export const getEmotionColor = (emotion: string): string => {
  const colors: Record<string, string> = {
    "Joy": "#FFC107", // Amber
    "Sadness": "#2196F3", // Blue
    "Anger": "#F44336", // Red
    "Fear": "#9C27B0", // Purple
    "Surprise": "#FF9800", // Orange
    "Disgust": "#4CAF50", // Green
    "Trust": "#3F51B5", // Indigo
    "Anticipation": "#E91E63", // Pink
    "Neutral": "#9E9E9E" // Gray
  };

  // Handle case insensitivity by converting to lowercase for comparison
  // but maintaining the original casing for the map lookup
  const normalizedEmotion = emotion.toLowerCase();
  
  for (const key in colors) {
    if (key.toLowerCase() === normalizedEmotion) {
      return colors[key];
    }
  }
  
  return "#9E9E9E"; // Default to gray if no matching emotion
};

export const generatePlaceholderPoint = (id: number): Point => {
  return {
    id: id.toString(),
    position: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
    word: `Word${id}`,
    sentiment: Math.random(),
    emotionalTone: getRandomEmotion(),
    color: [Math.random(), Math.random(), Math.random()],
    relationships: []
  };
};

export const getRandomEmotion = (): string => {
  const emotions = [
    "Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Trust", "Anticipation", "Neutral"
  ];
  return emotions[Math.floor(Math.random() * emotions.length)];
};

export const getSentimentLabel = (score: number | string): string => {
  // Handle string scores (convert to number if possible)
  let numericScore: number;
  
  if (typeof score === 'string') {
    numericScore = parseFloat(score);
    if (isNaN(numericScore)) {
      return "Neutral"; // Default fallback if conversion fails
    }
  } else {
    numericScore = score;
  }
  
  if (numericScore >= 0.75) return "Very Positive";
  if (numericScore >= 0.6) return "Positive";
  if (numericScore >= 0.4) return "Neutral";
  if (numericScore >= 0.25) return "Negative";
  return "Very Negative";
};

export const getEmotionalToneDistribution = (points: Point[]): Record<string, number> => {
  const distribution: Record<string, number> = {
    Joy: 0,
    Sadness: 0,
    Anger: 0,
    Fear: 0,
    Surprise: 0,
    Disgust: 0,
    Trust: 0,
    Anticipation: 0,
    Neutral: 0
  };
  
  if (!points || points.length === 0) return distribution;
  
  // Count the occurrences of each emotional tone
  points.forEach(point => {
    if (point.emotionalTone) {
      const tone = point.emotionalTone;
      if (distribution[tone] !== undefined) {
        distribution[tone]++;
      }
    } else {
      distribution.Neutral++;
    }
  });
  
  return distribution;
};

export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

export const getColorForEmotionalTone = (emotion: string): [number, number, number] => {
  const colors: Record<string, [number, number, number]> = {
    "Joy": [0.8, 0.7, 0.2],
    "Sadness": [0.2, 0.4, 0.8],
    "Anger": [0.8, 0.2, 0.2],
    "Fear": [0.2, 0.2, 0.8],
    "Surprise": [0.8, 0.8, 0.2],
    "Disgust": [0.2, 0.8, 0.2],
    "Trust": [0.2, 0.8, 0.8],
    "Anticipation": [0.8, 0.2, 0.8],
    "Neutral": [0.5, 0.5, 0.5]
  };

  // Handle case insensitivity by converting to lowercase for comparison
  // but maintaining the original casing for the map lookup
  const normalizedEmotion = emotion.toLowerCase();
  
  for (const key in colors) {
    if (key.toLowerCase() === normalizedEmotion) {
      return colors[key];
    }
  }
  
  return [0.5, 0.5, 0.5]; // Default to gray if no matching emotion
};
