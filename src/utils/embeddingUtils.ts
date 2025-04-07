
import * as THREE from 'three';
import { Point } from '../types/embedding';

export interface EmotionalDistribution {
  Joy: number;
  Sadness: number;
  Anger: number;
  Fear: number;
  Surprise: number;
  Disgust: number;
  Trust: number;
  Anticipation: number;
  Neutral: number;
}

// Color mapping for emotions (using RGB values)
const emotionColors = {
  Joy: new THREE.Color(1, 0.8, 0),        // Bright yellow
  Sadness: new THREE.Color(0, 0, 0.8),    // Blue
  Anger: new THREE.Color(0.8, 0, 0),      // Red
  Fear: new THREE.Color(0.5, 0, 0.5),     // Purple
  Surprise: new THREE.Color(1, 0.6, 0.8), // Pink
  Disgust: new THREE.Color(0.4, 0.8, 0),  // Green
  Trust: new THREE.Color(0, 0.6, 0.6),    // Teal
  Anticipation: new THREE.Color(1, 0.6, 0), // Orange
  Neutral: new THREE.Color(0.5, 0.5, 0.5)  // Gray
};

// Random words for the visualization
export const mockWords = [
  "life", "happy", "sad", "work", "future", "past", "memory", "dream", 
  "hope", "fear", "anger", "joy", "surprise", "disgust", "trust", "anticipation",
  "love", "hate", "anxiety", "peace", "conflict", "resolution", "challenge",
  "opportunity", "difficulty", "success", "failure", "relationship", "loneliness",
  "connection", "meaning", "purpose", "doubt", "certainty", "confusion", "clarity",
  "ambition", "contentment", "regret", "gratitude", "resentment", "forgiveness"
];

// Generate mock data points for the 3D visualization
export const generateMockPoints = (
  isDepressedJournal = false,
  customDistribution?: EmotionalDistribution,
  customWordBank?: string[]
): Point[] => {
  // Emotional tone distribution (can be customized)
  let distribution: EmotionalDistribution;
  
  if (customDistribution) {
    distribution = customDistribution;
  } else if (isDepressedJournal) {
    distribution = {
      Joy: 0.05,
      Sadness: 0.45,
      Anger: 0.15,
      Fear: 0.20,
      Surprise: 0.03,
      Disgust: 0.07,
      Trust: 0.03,
      Anticipation: 0.02,
      Neutral: 0.0
    };
  } else {
    distribution = {
      Joy: 0.20,
      Sadness: 0.15,
      Anger: 0.10,
      Fear: 0.10,
      Surprise: 0.10,
      Disgust: 0.05,
      Trust: 0.15,
      Anticipation: 0.15,
      Neutral: 0.0
    };
  }
  
  // Use custom word bank if provided
  const wordBank = customWordBank || mockWords;
  
  // Generate points
  const points: Point[] = [];
  const pointCount = 150;
  
  // To avoid duplicate words
  const usedWords = new Set<string>();
  
  // Create group centers
  const emotionCenters: Record<string, THREE.Vector3> = {};
  const emotions = Object.keys(distribution) as Array<keyof EmotionalDistribution>;
  
  emotions.forEach(emotion => {
    // Skip Neutral as it's not a cluster center
    if (emotion === 'Neutral') return;
    
    // Random position in 3D space
    emotionCenters[emotion] = new THREE.Vector3(
      (Math.random() * 2 - 1) * 2,
      (Math.random() * 2 - 1) * 2,
      (Math.random() * 2 - 1) * 2
    );
  });
  
  // Generate the points
  for (let i = 0; i < pointCount; i++) {
    // Select an emotion based on distribution
    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedEmotion: keyof EmotionalDistribution = 'Neutral';
    
    for (const emotion of emotions) {
      cumulativeProbability += distribution[emotion];
      if (rand < cumulativeProbability) {
        selectedEmotion = emotion;
        break;
      }
    }
    
    // Get a random word
    let word = '';
    let attempts = 0;
    do {
      word = wordBank[Math.floor(Math.random() * wordBank.length)];
      attempts++;
      // Avoid infinite loop
      if (attempts > 50) break;
    } while (usedWords.has(word) && attempts < 50);
    
    if (!usedWords.has(word)) {
      usedWords.add(word);
    }
    
    // Generate position based on the selected emotion
    let position;
    let color;
    
    if (selectedEmotion === 'Neutral') {
      // Neutral points are more scattered
      position = new THREE.Vector3(
        (Math.random() * 2 - 1) * 4,
        (Math.random() * 2 - 1) * 4,
        (Math.random() * 2 - 1) * 4
      );
      color = emotionColors.Neutral;
    } else {
      // Get the center of the selected emotion
      const center = emotionCenters[selectedEmotion];
      
      // Add some noise to the position
      position = new THREE.Vector3(
        center.x + (Math.random() * 2 - 1) * 0.5,
        center.y + (Math.random() * 2 - 1) * 0.5,
        center.z + (Math.random() * 2 - 1) * 0.5
      );
      
      color = emotionColors[selectedEmotion];
    }
    
    // Calculate a sentiment score (roughly) based on the emotion
    let sentiment = 0.5; // Neutral base
    
    // Positive emotions increase sentiment
    if (selectedEmotion === 'Joy' || selectedEmotion === 'Trust' || 
        selectedEmotion === 'Anticipation' || selectedEmotion === 'Surprise') {
      sentiment = 0.5 + Math.random() * 0.5;
    } 
    // Negative emotions decrease sentiment
    else if (selectedEmotion === 'Sadness' || selectedEmotion === 'Anger' || 
             selectedEmotion === 'Fear' || selectedEmotion === 'Disgust') {
      sentiment = 0.1 + Math.random() * 0.4;
    }
    
    // Generate some related words
    const relationships = [];
    const relationshipCount = Math.floor(Math.random() * 5) + 1;
    const availableWords = [...usedWords].filter(w => w !== word);
    
    for (let j = 0; j < relationshipCount && j < availableWords.length; j++) {
      relationships.push({
        word: availableWords[Math.floor(Math.random() * availableWords.length)],
        strength: 0.3 + Math.random() * 0.7
      });
    }
    
    // Create the point
    points.push({
      position: [position.x, position.y, position.z],
      color: [color.r, color.g, color.b],
      word: word,
      emotionalTone: selectedEmotion,
      sentiment: sentiment,
      relationships: relationships
    });
  }
  
  return points;
};
