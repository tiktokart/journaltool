import { Point } from '@/types/embedding';

export const generateMockPoints = (
  depressedJournalReference: boolean | string,
  count: number = 150,
  sentimentScore?: number | { [key: string]: number }
): Point[] => {
  const points: Point[] = [];
  const emotionalTones = ['Joy', 'Sadness', 'Fear', 'Anger', 'Surprise', 'Disgust'];
  const isDepressed = typeof depressedJournalReference === 'boolean' 
    ? depressedJournalReference 
    : depressedJournalReference === 'true';
  
  // Handle different types for sentimentScore
  let baseSentimentValue: number;
  
  if (sentimentScore === undefined) {
    baseSentimentValue = isDepressed ? 0.3 : 0.7;
  } else if (typeof sentimentScore === 'number') {
    baseSentimentValue = sentimentScore;
  } else {
    // If an object was passed, calculate the average of numerical values
    const values = Object.values(sentimentScore).filter(val => typeof val === 'number');
    const sum = values.reduce((acc, val) => acc + val, 0);
    baseSentimentValue = values.length > 0 ? sum / values.length : 0.5;
  }
  
  // Generate mock point data
  for (let i = 0; i < count; i++) {
    const isDepressedWord = isDepressed && Math.random() < 0.7;
    
    // Randomize position with some clustering
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 30 * Math.pow(Math.random(), 1/3);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    // Add some noise and clustering
    const position: [number, number, number] = [x, y, z];
    
    // Adjusted sentiment for variation
    let sentiment = baseSentimentValue + (Math.random() * 0.4 - 0.2);
    sentiment = Math.max(0.1, Math.min(0.9, sentiment)); // Clamp between 0.1 and 0.9
    
    // Colors based on position and sentiment
    const red = isDepressedWord ? 0.8 : 0.2;
    const green = (position[1] + 40) / 80;
    const blue = sentiment; 
    const color: [number, number, number] = [red, green, blue];
    
    const emotionalTone = emotionalTones[Math.floor(Math.random() * emotionalTones.length)];
    
    // Generate a random word when none is provided
    // This will be replaced with actual words from the document later
    const word = `Word_${i+1}`;
    
    points.push({
      id: `point-${i}`,
      position,
      color,
      sentiment,
      word,
      emotionalTone: isDepressedWord ? (Math.random() < 0.7 ? 'Sadness' : 'Fear') : emotionalTone,
      relationships: [],
      size: 1 + Math.random(),
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
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    z: Math.random() * 100 - 50,
    word: `Word${id}`,
    sentiment: Math.random(),
    emotionalTone: getRandomEmotion(),
    relationships: []
  };
};

export const generateMockPoints = (depressedJournalReference: boolean = false): Point[] => {
  const mockPointsCount = 200;
  const mockPoints: Point[] = [];
  
  for (let i = 0; i < mockPointsCount; i++) {
    let emotionalTone = getRandomEmotion();
    // If depressed journal reference, make 40% of the points sad or fearful
    if (depressedJournalReference && Math.random() < 0.4) {
      emotionalTone = Math.random() < 0.5 ? "Sadness" : "Fear";
    }
    
    const point: Point = {
      id: i.toString(),
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 100 - 50,
      word: `Word${i}`,
      sentiment: Math.random(),
      emotionalTone,
      relationships: []
    };
    
    // Add some relationships for each point (1 to 3 relationships)
    const relationshipsCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < relationshipsCount; j++) {
      const targetId = Math.floor(Math.random() * mockPointsCount);
      if (targetId !== i) {
        point.relationships.push({
          id: targetId.toString(),
          word: `Word${targetId}`,
          strength: Math.random()
        });
      }
    }
    
    mockPoints.push(point);
  }
  
  return mockPoints;
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
