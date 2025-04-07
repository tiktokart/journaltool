
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

interface EmotionalDistribution {
  Joy: number;
  Sadness: number;
  Anger: number;
  Fear: number;
  Surprise: number;
  Disgust: number;
  Trust: number;
  Anticipation: number;
}

export const generateMockPoints = (
  depressedJournalReference = false, 
  customDistribution?: EmotionalDistribution
): Point[] => {
  const mockPoints: Point[] = [];
  const particleCount = depressedJournalReference ? 300 : 200;
  
  const emotionalTones = [
    "Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Trust", "Anticipation"
  ];
  
  // Default distribution
  const defaultDistribution: EmotionalDistribution = {
    Joy: 0.125,
    Sadness: 0.125,
    Anger: 0.125,
    Fear: 0.125,
    Surprise: 0.125,
    Disgust: 0.125,
    Trust: 0.125,
    Anticipation: 0.125
  };
  
  // Distribution for depressed journal
  const depressedDistribution: EmotionalDistribution = {
    Joy: 0.05,
    Sadness: 0.45,
    Anger: 0.1,
    Fear: 0.25,
    Surprise: 0.02,
    Disgust: 0.05,
    Trust: 0.03,
    Anticipation: 0.05
  };
  
  // Choose the right distribution
  const distribution = customDistribution || (depressedJournalReference ? depressedDistribution : defaultDistribution);
  
  const emotionalWords = {
    Joy: ["happy", "excited", "thrilled", "pleased", "content", "cheerful", "delighted", "joyful", "grateful", "lively"],
    Sadness: ["sad", "depressed", "empty", "alone", "lonely", "miserable", "hopeless", "worthless", "helpless", "grief"],
    Anger: ["angry", "frustrated", "irritated", "annoyed", "furious", "enraged", "hostile", "bitter", "resentful", "outraged"],
    Fear: ["afraid", "anxious", "worried", "scared", "terrified", "nervous", "panic", "dread", "uneasy", "overwhelmed"],
    Surprise: ["surprised", "shocked", "amazed", "astonished", "startled", "unexpected", "sudden", "wonder", "stunned", "disbelief"],
    Disgust: ["disgusted", "repulsed", "revolted", "aversion", "dislike", "distaste", "loathing", "contempt", "hatred", "scorn"],
    Trust: ["trust", "faith", "belief", "confidence", "reliance", "dependence", "assurance", "certainty", "reliability", "credibility"],
    Anticipation: ["anticipation", "expectation", "awaiting", "hope", "looking", "forward", "eager", "excited", "prepare", "ready"]
  };
  
  const depressedJournalWords = [
    "empty", "tired", "exhausted", "numb", "darkness", "pointless", "impossible", "burden",
    "failure", "disappointing", "tears", "struggle", "trapped", "escape", "chest", "weight",
    "heavy", "hopeless", "alone", "lonely", "abandoned", "worthless", "pain", "hurting",
    "broken", "sleep", "bed", "energy", "motivation", "effort", "meaningless", "thoughts",
    "endless", "nothingness", "void", "trying", "mask", "pretend", "function", "therapy",
    "medication", "crying", "anxiety", "overwhelmed", "isolation", "distant", "detached",
    "gray", "black", "blank", "fog", "invisible", "suffocating", "drowning", "falling"
  ];
  
  // Convert distribution to weights array for random selection
  const weights = emotionalTones.map(tone => distribution[tone as keyof EmotionalDistribution]);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  // Word frequency tracking
  const wordFrequency: Record<string, number> = {};
  
  // Create points based on distribution
  for (let i = 0; i < particleCount; i++) {
    // Select emotional tone based on distribution
    let emotionalToneIndex: number;
    let random = Math.random() * totalWeight;
    
    for (let j = 0; j < weights.length; j++) {
      if (random < weights[j]) {
        emotionalToneIndex = j;
        break;
      }
      random -= weights[j];
    }
    
    // Default to first emotion if something went wrong
    emotionalToneIndex = emotionalToneIndex !== undefined ? emotionalToneIndex : 0;
    
    const emotionalTone = emotionalTones[emotionalToneIndex];
    
    // Cluster centers for each emotion
    const clusterCenters = [
      [8, 8, 8],         // Joy
      [-8, -8, -5],      // Sadness
      [8, -8, 0],        // Anger
      [-8, 8, 0],        // Fear
      [0, 10, 0],        // Surprise
      [0, -10, 0],       // Disgust
      [10, 0, 5],        // Trust
      [-10, 0, 5]        // Anticipation
    ];
    
    const variance = 3;
    const clusterCenter = clusterCenters[emotionalToneIndex];
    const x = clusterCenter[0] + (Math.random() * variance * 2 - variance);
    const y = clusterCenter[1] + (Math.random() * variance * 2 - variance);
    const z = clusterCenter[2] + (Math.random() * variance * 2 - variance);
    
    // Determine sentiment based on emotional tone
    let sentiment;
    if (emotionalTone === "Joy" || emotionalTone === "Trust") {
      sentiment = 0.6 + (Math.random() * 0.4);
    } else if (emotionalTone === "Anticipation" || emotionalTone === "Surprise") {
      sentiment = 0.4 + (Math.random() * 0.4);
    } else if (emotionalTone === "Disgust" || emotionalTone === "Anger") {
      sentiment = 0.1 + (Math.random() * 0.3);
    } else if (emotionalTone === "Sadness" || emotionalTone === "Fear") {
      sentiment = Math.random() * 0.3;
    } else {
      sentiment = 0.4 + (Math.random() * 0.2);
    }
    
    if (depressedJournalReference) {
      sentiment = Math.max(0.05, sentiment * 0.8);
    }
    
    // Color based on emotional tone
    let r = 0.7, g = 0.7, b = 0.7;
    
    if (emotionalTone === "Joy") {
      r = 1.0; g = 0.9; b = 0.0;
    } else if (emotionalTone === "Sadness") {
      r = 0.0; g = 0.5; b = 0.9;
    } else if (emotionalTone === "Anger") {
      r = 0.9; g = 0.1; b = 0.1;
    } else if (emotionalTone === "Fear") {
      r = 0.6; g = 0.0; b = 0.8;
    } else if (emotionalTone === "Surprise") {
      r = 1.0; g = 0.5; b = 0.0;
    } else if (emotionalTone === "Disgust") {
      r = 0.2; g = 0.8; b = 0.2;
    } else if (emotionalTone === "Trust") {
      r = 0.0; g = 0.8; b = 0.6;
    } else if (emotionalTone === "Anticipation") {
      r = 0.9; g = 0.5; b = 0.7;
    }
    
    // Select a word based on emotional tone or use depressed journal words
    let word;
    if (depressedJournalReference) {
      if (Math.random() < 0.7) {
        word = depressedJournalWords[Math.floor(Math.random() * depressedJournalWords.length)];
      } else {
        const toneWords = emotionalWords[emotionalTone as keyof typeof emotionalWords];
        word = toneWords[Math.floor(Math.random() * toneWords.length)];
      }
    } else {
      const toneWords = emotionalWords[emotionalTone as keyof typeof emotionalWords];
      word = toneWords[Math.floor(Math.random() * toneWords.length)];
    }
    
    // Track word frequency
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    
    // Add related keywords
    const keywordCount = 1 + Math.floor(Math.random() * 3);
    const keywords = [];
    
    for (let k = 0; k < keywordCount; k++) {
      let relatedWord;
      
      const toneWords = emotionalWords[emotionalTone as keyof typeof emotionalWords];
      relatedWord = toneWords[Math.floor(Math.random() * toneWords.length)];
      
      if (relatedWord !== word) {
        keywords.push(relatedWord);
      }
    }
    
    mockPoints.push({
      id: `point-${i}`,
      word: word,
      sentiment: sentiment,
      position: [x, y, z],
      color: [r, g, b],
      keywords: keywords,
      emotionalTone: emotionalTone,
      relationships: []
    });
  }
  
  // Add relationships between points, with stronger relationships between same emotional tones
  mockPoints.forEach((point, idx) => {
    // More relationships for higher frequency words
    const baseRelationships = 2;
    const frequencyBonus = Math.min(3, Math.floor((wordFrequency[point.word] || 1) / 2));
    const numRelationships = baseRelationships + frequencyBonus;
    
    const relationships = [];
    
    // Add relationships to other points with same emotional tone
    const similarPoints = mockPoints.filter((p, i) => 
      i !== idx && p.emotionalTone === point.emotionalTone
    );
    
    if (similarPoints.length > 0) {
      // Calculate how many same-emotion relationships to create
      const sameEmotionCount = Math.min(similarPoints.length, 
        Math.max(1, Math.floor(numRelationships * 0.7)));
      
      // Add strong relationships to points with same emotion
      for (let r = 0; r < sameEmotionCount; r++) {
        if (r < similarPoints.length) {
          const targetIndex = Math.floor(Math.random() * similarPoints.length);
          const targetPoint = similarPoints[targetIndex];
          
          if (!relationships.some(rel => rel.id === targetPoint.id)) {
            relationships.push({
              id: targetPoint.id,
              strength: 0.6 + Math.random() * 0.4, // Strong relationship
              word: targetPoint.word
            });
          }
          
          // Remove from array to avoid duplicates
          similarPoints.splice(targetIndex, 1);
        }
      }
    }
    
    // Fill remaining relationship slots with other points
    const remainingSlots = numRelationships - relationships.length;
    if (remainingSlots > 0) {
      const otherPoints = mockPoints.filter((p, i) => 
        i !== idx && !relationships.some(rel => rel.id === p.id)
      );
      
      for (let r = 0; r < remainingSlots && otherPoints.length > 0; r++) {
        const targetIndex = Math.floor(Math.random() * otherPoints.length);
        const targetPoint = otherPoints[targetIndex];
        
        // Weaker relationship for different emotions
        const strength = 0.3 + Math.random() * 0.3;
        
        relationships.push({
          id: targetPoint.id,
          strength: strength,
          word: targetPoint.word
        });
        
        // Remove from array to avoid duplicates
        otherPoints.splice(targetIndex, 1);
      }
    }
    
    point.relationships = relationships;
  });
  
  return mockPoints;
};
