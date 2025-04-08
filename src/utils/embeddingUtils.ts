
import { Point } from '@/types/embedding';

export const generateMockPoints = (
  depressedJournalReference: boolean | string,
  emotionalDistribution?: { [key: string]: number },
  customWordBank?: string[]
): Point[] => {
  const points: Point[] = [];
  const emotionalTones = ['Joy', 'Sadness', 'Fear', 'Anger', 'Surprise', 'Disgust'];
  const isDepressed = typeof depressedJournalReference === 'boolean' 
    ? depressedJournalReference 
    : depressedJournalReference === 'true';
  
  // Define count based on custom word bank if available
  const count = customWordBank ? Math.min(customWordBank.length, 500) : 150;
  
  // Default distribution if none provided
  const defaultDistribution = {
    Joy: isDepressed ? 0.1 : 0.3,
    Sadness: isDepressed ? 0.4 : 0.1,
    Fear: isDepressed ? 0.3 : 0.1,
    Anger: isDepressed ? 0.1 : 0.1,
    Surprise: isDepressed ? 0.05 : 0.2,
    Disgust: isDepressed ? 0.05 : 0.1,
    Trust: isDepressed ? 0.0 : 0.1,
    Anticipation: isDepressed ? 0.0 : 0.1,
    Neutral: 0.0
  };
  
  const distribution = emotionalDistribution || defaultDistribution;
  
  // Generate mock point data
  for (let i = 0; i < count; i++) {
    // Choose emotional tone based on distribution
    let chosenTone = "Neutral";
    const emotionRoll = Math.random();
    let cumulativeProbability = 0;
    
    for (const [tone, probability] of Object.entries(distribution)) {
      cumulativeProbability += probability;
      if (emotionRoll < cumulativeProbability) {
        chosenTone = tone;
        break;
      }
    }
    
    // Randomize position with some clustering
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 30 * Math.pow(Math.random(), 1/3);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    // Add some noise and clustering
    const position: [number, number, number] = [x, y, z];
    
    // Adjusted sentiment based on emotional tone
    let sentiment = 0.5;
    if (chosenTone === 'Joy' || chosenTone === 'Trust') {
      sentiment = 0.7 + (Math.random() * 0.3);
    } else if (chosenTone === 'Sadness' || chosenTone === 'Fear' || chosenTone === 'Anger' || chosenTone === 'Disgust') {
      sentiment = Math.random() * 0.4;
    } else {
      sentiment = 0.3 + (Math.random() * 0.4);
    }
    
    // Colors based on position and sentiment
    const red = chosenTone === 'Anger' || chosenTone === 'Disgust' ? 0.8 : sentiment < 0.4 ? 0.7 : 0.2;
    const green = chosenTone === 'Joy' ? 0.8 : (sentiment > 0.6 ? 0.7 : (position[1] + 40) / 80);
    const blue = chosenTone === 'Sadness' || chosenTone === 'Fear' ? 0.8 : sentiment; 
    const color: [number, number, number] = [red, green, blue];
    
    // Generate a word when custom bank is provided
    const word = customWordBank ? customWordBank[i % customWordBank.length] : `Word_${i+1}`;
    
    points.push({
      id: `point-${i}`,
      position,
      color,
      sentiment,
      word,
      emotionalTone: chosenTone,
      relationships: [],
      keywords: [
        `keyword_${Math.floor(Math.random() * 20) + 1}`,
        `keyword_${Math.floor(Math.random() * 20) + 1}`,
        `keyword_${Math.floor(Math.random() * 20) + 1}`,
      ]
    });
  }
  
  // Add relationships between points
  points.forEach(point => {
    const relationships = [];
    const relationshipCount = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < relationshipCount; i++) {
      const randomIndex = Math.floor(Math.random() * points.length);
      const randomPoint = points[randomIndex];
      
      if (randomPoint.id !== point.id) {
        relationships.push({
          id: randomPoint.id,
          strength: Math.random()
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
