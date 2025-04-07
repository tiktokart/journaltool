
import { Point } from "../types/embedding";

export const getEmotionColor = (emotion: string): string => {
  switch (emotion) {
    case "Joy": return "rgb(255, 230, 0)";
    case "Sadness": return "rgb(0, 128, 230)";
    case "Anger": return "rgb(230, 26, 26)";
    case "Fear": return "rgb(153, 0, 204)";
    case "Surprise": return "rgb(255, 128, 0)";
    case "Disgust": return "rgb(51, 204, 51)";
    case "Trust": return "rgb(0, 204, 153)";
    case "Anticipation": return "rgb(230, 128, 179)";
    default: return "rgb(179, 179, 179)";
  }
};

export const getSentimentLabel = (score: number): string => {
  if (score >= 0.7) return "Very Positive";
  if (score >= 0.5) return "Positive";
  if (score >= 0.4) return "Neutral";
  if (score >= 0.25) return "Negative";
  return "Very Negative";
};

export const generateMockPoints = (): Point[] => {
  const mockPoints: Point[] = [];
  const particleCount = 5000;
  
  const emotionalTones = [
    "Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Trust", "Anticipation"
  ];
  
  const commonKeywords = [
    "life", "feel", "time", "experience", "emotions", "thoughts", "mind", "people",
    "understand", "journey", "reflection", "growth", "challenge", "struggle", "hope",
    "frustration", "happiness", "anxiety", "motivation", "future", "past", "present"
  ];
  
  for (let i = 0; i < particleCount; i++) {
    // Generate points in a 3D gaussian distribution
    const radius = 10 * Math.pow(Math.random(), 1/3);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    // Color based on position (sentiment score)
    const distanceFromCenter = Math.sqrt(x*x + y*y + z*z) / 10;
    const sentiment = 1 - distanceFromCenter;
    
    // Generate random emotions and matching colors
    const emotionalToneIndex = Math.floor(Math.random() * emotionalTones.length);
    const emotionalTone = emotionalTones[emotionalToneIndex];
    
    // Color based on emotional tone
    let r = 0.7, g = 0.7, b = 0.7; // Default light grey
    
    if (emotionalTone === "Joy") {
      r = 1.0; g = 0.9; b = 0.0; // Yellow/gold
    } else if (emotionalTone === "Sadness") {
      r = 0.0; g = 0.5; b = 0.9; // Blue
    } else if (emotionalTone === "Anger") {
      r = 0.9; g = 0.1; b = 0.1; // Red
    } else if (emotionalTone === "Fear") {
      r = 0.6; g = 0.0; b = 0.8; // Purple
    } else if (emotionalTone === "Surprise") {
      r = 1.0; g = 0.5; b = 0.0; // Orange
    } else if (emotionalTone === "Disgust") {
      r = 0.2; g = 0.8; b = 0.2; // Green
    } else if (emotionalTone === "Trust") {
      r = 0.0; g = 0.8; b = 0.6; // Teal
    } else if (emotionalTone === "Anticipation") {
      r = 0.9; g = 0.5; b = 0.7; // Pink
    }
    
    // Generate random keywords
    const keywordCount = 2 + Math.floor(Math.random() * 4);
    const keywords = [];
    for (let k = 0; k < keywordCount; k++) {
      keywords.push(commonKeywords[Math.floor(Math.random() * commonKeywords.length)]);
    }
    
    mockPoints.push({
      id: `point-${i}`,
      text: `Sample text ${i}`,
      sentiment: sentiment,
      position: [x, y, z],
      color: [r, g, b],
      keywords: keywords,
      emotionalTone: emotionalTone,
      relationships: []
    });
  }
  
  // Add some relationships
  for (let i = 0; i < 20; i++) {
    const pointIndex = Math.floor(Math.random() * mockPoints.length);
    const relatedPoints = 2 + Math.floor(Math.random() * 3);
    
    const relationships = [];
    for (let j = 0; j < relatedPoints; j++) {
      let relatedIndex;
      do {
        relatedIndex = Math.floor(Math.random() * mockPoints.length);
      } while (relatedIndex === pointIndex);
      
      relationships.push({
        id: mockPoints[relatedIndex].id,
        strength: 0.3 + Math.random() * 0.7,
        word: commonKeywords[Math.floor(Math.random() * commonKeywords.length)]
      });
    }
    
    mockPoints[pointIndex].relationships = relationships;
  }
  
  return mockPoints;
};
