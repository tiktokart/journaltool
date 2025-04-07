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

export const generateMockPoints = (depressedJournalReference = false): Point[] => {
  const mockPoints: Point[] = [];
  const particleCount = depressedJournalReference ? 300 : 5000;
  
  const emotionalTones = [
    "Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Trust", "Anticipation"
  ];
  
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
  
  for (let i = 0; i < particleCount; i++) {
    let emotionalToneIndex;
    if (depressedJournalReference) {
      const weights = [0.05, 0.45, 0.1, 0.25, 0.02, 0.05, 0.03, 0.05];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      
      for (let j = 0; j < weights.length; j++) {
        if (random < weights[j]) {
          emotionalToneIndex = j;
          break;
        }
        random -= weights[j];
      }
      if (emotionalToneIndex === undefined) emotionalToneIndex = 1;
    } else {
      emotionalToneIndex = Math.floor(Math.random() * emotionalTones.length);
    }
    
    const emotionalTone = emotionalTones[emotionalToneIndex];
    
    let radius = 8 + (Math.random() * 4);
    
    const clusterCenters = [
      [8, 8, 8],
      [-8, -8, -5],
      [8, -8, 0],
      [-8, 8, 0],
      [0, 10, 0],
      [0, -10, 0],
      [10, 0, 5],
      [-10, 0, 5]
    ];
    
    const variance = 3;
    const clusterCenter = clusterCenters[emotionalToneIndex];
    const x = clusterCenter[0] + (Math.random() * variance * 2 - variance);
    const y = clusterCenter[1] + (Math.random() * variance * 2 - variance);
    const z = clusterCenter[2] + (Math.random() * variance * 2 - variance);
    
    let sentiment;
    if (emotionalTone === "Joy" || emotionalTone === "Trust") sentiment = 0.6 + (Math.random() * 0.4);
    else if (emotionalTone === "Anticipation" || emotionalTone === "Surprise") sentiment = 0.4 + (Math.random() * 0.4);
    else if (emotionalTone === "Disgust" || emotionalTone === "Anger") sentiment = 0.1 + (Math.random() * 0.3);
    else if (emotionalTone === "Sadness" || emotionalTone === "Fear") sentiment = Math.random() * 0.3;
    else sentiment = 0.4 + (Math.random() * 0.2);
    
    if (depressedJournalReference) {
      sentiment = Math.max(0.05, sentiment * 0.8);
    }
    
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
  
  mockPoints.forEach((point, idx) => {
    const numRelationships = 2 + Math.floor(Math.random() * 3);
    const relationships = [];
    
    for (let r = 0; r < numRelationships; r++) {
      const similarPoints = mockPoints.filter((p, i) => 
        i !== idx && p.emotionalTone === point.emotionalTone
      );
      
      if (similarPoints.length > 0) {
        const targetPoint = similarPoints[Math.floor(Math.random() * similarPoints.length)];
        
        if (!relationships.some(rel => rel.id === targetPoint.id)) {
          relationships.push({
            id: targetPoint.id,
            strength: 0.5 + Math.random() * 0.5,
            word: targetPoint.word
          });
        }
      }
    }
    
    point.relationships = relationships;
  });
  
  return mockPoints;
};
