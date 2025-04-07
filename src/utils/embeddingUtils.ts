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
    "Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Trust", "Anticipation", "Neutral"
  ];
  
  const defaultDistribution: EmotionalDistribution & { Neutral: number } = {
    Joy: 0.10,
    Sadness: 0.10,
    Anger: 0.10,
    Fear: 0.10,
    Surprise: 0.10,
    Disgust: 0.10,
    Trust: 0.10,
    Anticipation: 0.10,
    Neutral: 0.20
  };
  
  const depressedDistribution: EmotionalDistribution & { Neutral: number } = {
    Joy: 0.05,
    Sadness: 0.35,
    Anger: 0.10,
    Fear: 0.20,
    Surprise: 0.02,
    Disgust: 0.05,
    Trust: 0.03,
    Anticipation: 0.05,
    Neutral: 0.15
  };
  
  const distribution = customDistribution 
    ? { ...customDistribution, Neutral: customDistribution.Neutral || 0.15 }
    : (depressedJournalReference ? depressedDistribution : defaultDistribution);
  
  const emotionalWords = {
    Joy: ["happy", "excited", "thrilled", "pleased", "content", "cheerful", "delighted", "joyful", "grateful", "lively"],
    Sadness: ["sad", "depressed", "empty", "alone", "lonely", "miserable", "hopeless", "worthless", "helpless", "grief"],
    Anger: ["angry", "frustrated", "irritated", "annoyed", "furious", "enraged", "hostile", "bitter", "resentful", "outraged"],
    Fear: ["afraid", "anxious", "worried", "scared", "terrified", "nervous", "panic", "dread", "uneasy", "overwhelmed"],
    Surprise: ["surprised", "shocked", "amazed", "astonished", "startled", "unexpected", "sudden", "wonder", "stunned", "disbelief"],
    Disgust: ["disgusted", "repulsed", "revolted", "aversion", "dislike", "distaste", "loathing", "contempt", "hatred", "scorn"],
    Trust: ["trust", "faith", "belief", "confidence", "reliance", "dependence", "assurance", "certainty", "reliability", "credibility"],
    Anticipation: ["anticipation", "expectation", "awaiting", "hope", "looking", "forward", "eager", "excited", "prepare", "ready"],
    Neutral: ["the", "and", "or", "but", "because", "however", "therefore", "thus", "also", "moreover", 
              "furthermore", "nevertheless", "nonetheless", "meanwhile", "subsequently", "consequently",
              "next", "then", "after", "before", "during", "while", "since", "until", "when", "where",
              "how", "what", "why", "who", "which", "that", "this", "these", "those", "they", "them",
              "their", "there", "here", "now", "today", "tomorrow", "yesterday", "week", "month", "year",
              "time", "place", "thing", "person", "idea", "fact", "case", "point", "work", "way"]
  };
  
  const commonWords = [
    "time", "person", "year", "way", "day", "thing", "man", "world", "life", "hand",
    "part", "child", "eye", "woman", "place", "work", "week", "case", "point", "government",
    "company", "number", "group", "problem", "fact", "be", "have", "do", "say", "get",
    "make", "go", "know", "take", "see", "come", "think", "look", "want", "give",
    "use", "find", "tell", "ask", "work", "seem", "feel", "try", "leave", "call"
  ];
  
  emotionalWords.Neutral = [...emotionalWords.Neutral, ...commonWords];
  
  const depressedJournalWords = [
    "empty", "tired", "exhausted", "numb", "darkness", "pointless", "impossible", "burden",
    "failure", "disappointing", "tears", "struggle", "trapped", "escape", "chest", "weight",
    "heavy", "hopeless", "alone", "lonely", "abandoned", "worthless", "pain", "hurting",
    "broken", "sleep", "bed", "energy", "motivation", "effort", "meaningless", "thoughts",
    "endless", "nothingness", "void", "trying", "mask", "pretend", "function", "therapy",
    "medication", "crying", "anxiety", "overwhelmed", "isolation", "distant", "detached",
    "gray", "black", "blank", "fog", "invisible", "suffocating", "drowning", "falling"
  ];
  
  const weights = emotionalTones.map(tone => distribution[tone as keyof typeof distribution] || 0);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  const wordFrequency: Record<string, number> = {};
  
  for (let i = 0; i < particleCount; i++) {
    let emotionalToneIndex: number;
    let random = Math.random() * totalWeight;
    
    for (let j = 0; j < weights.length; j++) {
      if (random < weights[j]) {
        emotionalToneIndex = j;
        break;
      }
      random -= weights[j];
    }
    
    emotionalToneIndex = emotionalToneIndex !== undefined ? emotionalToneIndex : 0;
    
    const emotionalTone = emotionalTones[emotionalToneIndex];
    
    const clusterCenters = [
      [8, 8, 8],         // Joy
      [-8, -8, -5],      // Sadness
      [8, -8, 0],        // Anger
      [-8, 8, 0],        // Fear
      [0, 10, 0],        // Surprise
      [0, -10, 0],       // Disgust
      [10, 0, 5],        // Trust
      [-10, 0, 5],       // Anticipation
      [0, 0, 0]          // Neutral
    ];
    
    const variance = emotionalTone === "Neutral" ? 2 : 3;
    const clusterCenter = clusterCenters[emotionalToneIndex];
    const x = clusterCenter[0] + (Math.random() * variance * 2 - variance);
    const y = clusterCenter[1] + (Math.random() * variance * 2 - variance);
    const z = clusterCenter[2] + (Math.random() * variance * 2 - variance);
    
    let sentiment;
    if (emotionalTone === "Joy" || emotionalTone === "Trust") {
      sentiment = 0.6 + (Math.random() * 0.4);
    } else if (emotionalTone === "Anticipation" || emotionalTone === "Surprise") {
      sentiment = 0.4 + (Math.random() * 0.4);
    } else if (emotionalTone === "Disgust" || emotionalTone === "Anger") {
      sentiment = 0.1 + (Math.random() * 0.3);
    } else if (emotionalTone === "Sadness" || emotionalTone === "Fear") {
      sentiment = Math.random() * 0.3;
    } else if (emotionalTone === "Neutral") {
      sentiment = 0.4 + (Math.random() * 0.2);
    } else {
      sentiment = 0.4 + (Math.random() * 0.2);
    }
    
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
    } else if (emotionalTone === "Neutral") {
      r = 0.7; g = 0.7; b = 0.7;
    }
    
    let word;
    if (depressedJournalReference) {
      if (Math.random() < 0.7 && emotionalTone !== "Neutral") {
        word = depressedJournalWords[Math.floor(Math.random() * depressedJournalWords.length)];
      } else {
        const toneWords = emotionalWords[emotionalTone as keyof typeof emotionalWords];
        word = toneWords[Math.floor(Math.random() * toneWords.length)];
      }
    } else {
      const toneWords = emotionalWords[emotionalTone as keyof typeof emotionalWords];
      word = toneWords[Math.floor(Math.random() * toneWords.length)];
    }
    
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    
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
    const baseRelationships = 2;
    const frequencyBonus = Math.min(3, Math.floor((wordFrequency[point.word] || 1) / 2));
    const numRelationships = baseRelationships + frequencyBonus;
    
    const relationships = [];
    
    const similarPoints = mockPoints.filter((p, i) => 
      i !== idx && p.emotionalTone === point.emotionalTone
    );
    
    if (similarPoints.length > 0) {
      const sameEmotionCount = Math.min(similarPoints.length, 
        Math.max(1, Math.floor(numRelationships * 0.7)));
      
      for (let r = 0; r < sameEmotionCount; r++) {
        if (r < similarPoints.length) {
          const targetIndex = Math.floor(Math.random() * similarPoints.length);
          const targetPoint = similarPoints[targetIndex];
          
          if (!relationships.some(rel => rel.id === targetPoint.id)) {
            relationships.push({
              id: targetPoint.id,
              strength: 0.6 + Math.random() * 0.4,
              word: targetPoint.word
            });
          }
          
          similarPoints.splice(targetIndex, 1);
        }
      }
    }
    
    const remainingSlots = numRelationships - relationships.length;
    if (remainingSlots > 0) {
      const otherPoints = mockPoints.filter((p, i) => 
        i !== idx && !relationships.some(rel => rel.id === p.id)
      );
      
      for (let r = 0; r < remainingSlots && otherPoints.length > 0; r++) {
        const targetIndex = Math.floor(Math.random() * otherPoints.length);
        const targetPoint = otherPoints[targetIndex];
        
        const strength = 0.3 + Math.random() * 0.3;
        
        relationships.push({
          id: targetPoint.id,
          strength: strength,
          word: targetPoint.word
        });
        
        otherPoints.splice(targetIndex, 1);
      }
    }
    
    point.relationships = relationships;
  });
  
  return mockPoints;
};
