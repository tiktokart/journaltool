
import { Point } from '@/types/embedding';

export const generateMockPoints = (
  depressedJournalReference: boolean | string,
  count: number = 150,
  sentimentScore?: number
): Point[] => {
  const points: Point[] = [];
  const emotionalTones = ['Joy', 'Sadness', 'Fear', 'Anger', 'Surprise', 'Disgust'];
  const isDepressed = typeof depressedJournalReference === 'boolean' 
    ? depressedJournalReference 
    : depressedJournalReference === 'true';
  
  // Use provided sentiment score or generate based on depression flag
  const baseSentimentValue = sentimentScore !== undefined 
    ? sentimentScore 
    : isDepressed ? 0.3 : 0.7;
  
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
    const position = [x, y, z];
    
    // Adjusted sentiment for variation
    let sentiment = baseSentimentValue + (Math.random() * 0.4 - 0.2);
    sentiment = Math.max(0.1, Math.min(0.9, sentiment)); // Clamp between 0.1 and 0.9
    
    // Colors based on position and sentiment
    const red = isDepressedWord ? 0.8 : 0.2;
    const green = (position[1] + 40) / 80;
    const blue = sentiment; 
    const color = [red, green, blue];
    
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
  const colors: { [key: string]: string } = {
    'Joy': '#FFD700',       // Gold
    'Sadness': '#4169E1',   // Royal Blue
    'Fear': '#800080',      // Purple
    'Anger': '#FF4500',     // Red-Orange
    'Surprise': '#32CD32',  // Lime Green
    'Disgust': '#8B4513',   // Saddle Brown
    'Neutral': '#A9A9A9'    // Dark Gray
  };
  
  return colors[emotion] || colors['Neutral'];
};

// More utility functions can be added here as needed
