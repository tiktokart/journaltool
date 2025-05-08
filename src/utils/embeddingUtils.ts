import { Point } from '../types/embedding';
import seedrandom from 'seedrandom';

// Create a deterministic random number generator
const rng = seedrandom('embedding-seed-123');

/**
 * Get color based on emotional tone
 * @param emotionalTone The emotional tone
 * @returns Hex color code
 */
export const getEmotionColor = (emotionalTone: string): string => {
  const emotions: Record<string, string> = {
    "Joyful": "#FFD700",     // Gold color for Joyful
    "Joy": "#FFD700",        // Gold color for Joy
    "Happy": "#2ECC71",      // Light Green
    "Excited": "#F1C40F",    // Yellow
    "Peaceful": "#3498DB",   // Blue
    "Calm": "#2980B9",       // Dark Blue
    "Neutral": "#95A5A6",    // Gray
    "Anxious": "#E74C3C",    // Red
    "Angry": "#C0392B",      // Dark Red
    "Sad": "#9B59B6",        // Purple
    "Depressed": "#8E44AD",  // Dark Purple
    "Frustrated": "#E67E22", // Orange
    "Confused": "#F39C12",   // Light Orange
    "Scared": "#D35400",     // Burnt Orange
    "Disgusted": "#6C3483",  // Violet
    "Surprised": "#16A085",  // Teal
    "Fearful": "#D35400"     // Burnt Orange (same as Scared)
  };
  
  return emotions[emotionalTone] || "#95A5A6"; // Default to gray if not found
};

export const generateMockPoints = (
  depressedJournalReference: boolean = false,
  customWords?: string[] | Record<string, number> | number,
  sentimentOverride?: number
): Point[] => {
  // Set a seed for reproducible randomness 
  const rng = seedrandom("embedding-visualization-seed");
  
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
  
  // Use provided distribution if it exists, making sure to include all required properties
  if (Object.keys(emotionalDistribution).length > 0) {
    // Create a complete distribution object with all required properties
    const completedDistribution = {
      Joy: emotionalDistribution.Joy || 0,
      Sadness: emotionalDistribution.Sadness || 0,
      Anger: emotionalDistribution.Anger || 0,
      Fear: emotionalDistribution.Fear || 0,
      Surprise: emotionalDistribution.Surprise || 0,
      Disgust: emotionalDistribution.Disgust || 0,
      Trust: emotionalDistribution.Trust || 0,
      Anticipation: emotionalDistribution.Anticipation || 0,
      Neutral: emotionalDistribution.Neutral || 0
    };
    finalDistribution = completedDistribution;
  }
  
  // Generate the points
  const points: Point[] = [];
  
  for (let i = 0; i < pointCount; i++) {
    // Determine emotional tone based on distribution
    let emotionalTone = "Neutral";
    const emotionRoll = rng(); // Use our seeded random number generator
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
      (rng() * 2 - 1) * 15,
      (rng() * 2 - 1) * 15,
      (rng() * 2 - 1) * 15
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
          sentimentValue = 0.7 + rng() * 0.3; // 0.7-1.0
          break;
        case "Sadness":
        case "Fear":
        case "Anger":
        case "Disgust":
          sentimentValue = rng() * 0.3; // 0-0.3
          break;
        case "Surprise":
          sentimentValue = 0.3 + rng() * 0.4; // 0.3-0.7
          break;
        default:
          sentimentValue = 0.4 + rng() * 0.2; // 0.4-0.6
      }
    }
    
    // Create the point - removed 'size' property which is not in Point interface
    const point: Point = {
      id: `point-${i}`,
      position: position,
      word: word,
      color: getColorForEmotionalTone(emotionalTone),
      emotionalTone: emotionalTone,
      sentiment: sentimentValue,
      relationships: [],
      keywords: []
    };
    
    // Add related concepts/keywords
    const keywordCount = Math.floor(rng() * 4);
    if (keywordCount > 0) {
      const keywords = [];
      for (let k = 0; k < keywordCount; k++) {
        if (wordBank.length > 0) {
          // Choose a random word from the bank
          const randomIndex = Math.floor(rng() * wordBank.length);
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
    const relationshipCount = Math.floor(rng() * 7) + 3; // 3-10 relationships
    const relationships = [];
    
    // Create a set to keep track of points already used in relationships
    const usedRelationships = new Set<string>();
    
    for (let r = 0; r < relationshipCount; r++) {
      let targetIndex;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Find a target that hasn't been used yet, with a maximum number of attempts
      do {
        targetIndex = Math.floor(rng() * points.length);
        attempts++;
        if (attempts > maxAttempts) break;
      } while (targetIndex === index || usedRelationships.has(points[targetIndex].id));
      
      if (attempts <= maxAttempts) {
        const targetPoint = points[targetIndex];
        usedRelationships.add(targetPoint.id);
        
        // Relationship strength is stronger for points with the same emotional tone
        const sameEmotionalTone = point.emotionalTone === targetPoint.emotionalTone;
        const baseStrength = sameEmotionalTone ? 0.7 : 0.3;
        const strength = baseStrength + rng() * 0.3;
        
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
