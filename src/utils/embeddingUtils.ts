import { Point } from "../types/embedding";
import { analyzeSentiment, batchAnalyzeSentiment, getSentimentLabel as getBertSentimentLabel } from "./bertSentimentAnalysis";

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
  return getBertSentimentLabel(score);
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
  Neutral: number;
}

const panicAttackText = `I didn't see it coming. One moment, everything felt fine, and the next, my chest was tight, and my mind was racing. I was sitting in my apartment, casually scrolling through some emails, when it started. I could feel the pressure building up in my chest like a weight I couldn't escape. My breath became shallow and quick. I tried to breathe normally, but it felt like the air wasn't reaching my lungs.

My heart was pounding in my ears, a frantic drumbeat that made it harder to focus. I couldn't stop thinking about how I was going to pass out, how everything was spiraling, and how I couldn't control it. I told myself, "It's just a panic attack. You've been through this before." But knowing it didn't make it go away. I could feel my hands trembling as I tried to steady myself, gripping the edge of the couch.

My thoughts were all over the place—stuck in loops that didn't make sense. I thought about deadlines, the work I hadn't finished, and how overwhelmed I felt by everything. It's strange, because these things didn't seem as important when I was calm, but in the midst of the panic, they felt like the end of the world.

I closed my eyes, trying to ground myself. I focused on the feel of the fabric under my fingertips, the cool air that was coming through the window, the distant sounds of traffic outside. Slowly, the moments passed. The tension in my chest loosened a little, and my breath returned to normal, but my body still felt like it was vibrating with energy that didn't belong. I wanted to lie down, to stop the sensation that something was off.

But then, it started to recede. I could feel the fear easing, the panic starting to leave me. I stayed still, focusing on my breathing until the feeling completely passed, but I could still hear my heart pounding, though slower now. The lingering feeling was unsettling, like I wasn't sure whether the panic was really gone or just hiding, waiting for the next wave.

It's funny how it can just happen, out of nowhere. One second, you're fine, and the next, you're gripped by something you can't even explain. I can't help but wonder if there's a deeper cause to it all. Stress? Lack of sleep? Or is it just something I'll have to learn to live with?

As the episode ended, I felt a bit drained, like I had just run a marathon in my mind. I'm trying not to judge myself too harshly for what happened. It's easy to feel embarrassed about it, to feel like I should have more control. But that's not how it works, is it? It just happens. It's part of the process.

I'm going to try to focus on taking it one step at a time and not letting the fear of another panic attack consume me. I can't control it, but I can control how I react to it. Right now, all I want is peace—peace that I know will return, even if it takes a little time.

Time to breathe and move on`;

export const extractWordsFromText = (text: string): string[] => {
  return text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3);
};

export const generatePointsFromText = (): Point[] => {
  const wordsArray = extractWordsFromText(panicAttackText);
  const uniqueWords = [...new Set(wordsArray)];
  
  const emotionalMapping: Record<string, { emotion: string, sentiment: number }> = {
    "panic": { emotion: "Fear", sentiment: 0.15 },
    "attack": { emotion: "Fear", sentiment: 0.18 },
    "anxiety": { emotion: "Fear", sentiment: 0.20 },
    "tight": { emotion: "Fear", sentiment: 0.25 },
    "chest": { emotion: "Fear", sentiment: 0.22 },
    "racing": { emotion: "Fear", sentiment: 0.23 },
    "pressure": { emotion: "Fear", sentiment: 0.19 },
    "shallow": { emotion: "Fear", sentiment: 0.24 },
    "pounding": { emotion: "Fear", sentiment: 0.17 },
    "spiraling": { emotion: "Fear", sentiment: 0.15 },
    "control": { emotion: "Fear", sentiment: 0.30 },
    "trembling": { emotion: "Fear", sentiment: 0.18 },
    "overwhelmed": { emotion: "Sadness", sentiment: 0.20 },
    "deadlines": { emotion: "Sadness", sentiment: 0.25 },
    "world": { emotion: "Fear", sentiment: 0.22 },
    "grounding": { emotion: "Trust", sentiment: 0.55 },
    "focus": { emotion: "Trust", sentiment: 0.60 },
    "breathe": { emotion: "Trust", sentiment: 0.65 },
    "recede": { emotion: "Joy", sentiment: 0.60 },
    "easing": { emotion: "Joy", sentiment: 0.65 },
    "peace": { emotion: "Joy", sentiment: 0.75 },
    "process": { emotion: "Trust", sentiment: 0.58 },
    "drained": { emotion: "Sadness", sentiment: 0.22 },
    "embarrassed": { emotion: "Sadness", sentiment: 0.19 },
    "harshly": { emotion: "Anger", sentiment: 0.20 },
    "time": { emotion: "Anticipation", sentiment: 0.50 },
    "move": { emotion: "Anticipation", sentiment: 0.55 }
  };
  
  const depressedDistribution: EmotionalDistribution = {
    Joy: 0.05,
    Sadness: 0.30,
    Anger: 0.05,
    Fear: 0.35,
    Surprise: 0.03,
    Disgust: 0.02,
    Trust: 0.10,
    Anticipation: 0.05,
    Neutral: 0.05
  };
  
  const wordFrequency: Record<string, number> = {};
  wordsArray.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  const mockPoints: Point[] = [];
  
  const significantWords = Object.keys(emotionalMapping);
  
  significantWords.forEach((word, idx) => {
    if (wordsArray.includes(word)) {
      const { emotion, sentiment } = emotionalMapping[word];
      const clusterCenters: Record<string, [number, number, number]> = {
        "Joy": [8, 8, 8],
        "Sadness": [-8, -8, -5],
        "Anger": [8, -8, 0],
        "Fear": [-8, 8, 0],
        "Surprise": [0, 10, 0],
        "Disgust": [0, -10, 0],
        "Trust": [10, 0, 5],
        "Anticipation": [-10, 0, 5],
        "Neutral": [0, 0, 0]
      };
      
      const variance = 3;
      const clusterCenter = clusterCenters[emotion];
      const x = clusterCenter[0] + (Math.random() * variance * 2 - variance);
      const y = clusterCenter[1] + (Math.random() * variance * 2 - variance);
      const z = clusterCenter[2] + (Math.random() * variance * 2 - variance);
      
      let r = 0.7, g = 0.7, b = 0.7;
      
      if (emotion === "Joy") {
        r = 1.0; g = 0.9; b = 0.0;
      } else if (emotion === "Sadness") {
        r = 0.0; g = 0.5; b = 0.9;
      } else if (emotion === "Anger") {
        r = 0.9; g = 0.1; b = 0.1;
      } else if (emotion === "Fear") {
        r = 0.6; g = 0.0; b = 0.8;
      } else if (emotion === "Surprise") {
        r = 1.0; g = 0.5; b = 0.0;
      } else if (emotion === "Disgust") {
        r = 0.2; g = 0.8; b = 0.2;
      } else if (emotion === "Trust") {
        r = 0.0; g = 0.8; b = 0.6;
      } else if (emotion === "Anticipation") {
        r = 0.9; g = 0.5; b = 0.7;
      } else {
        r = 0.7; g = 0.7; b = 0.7;
      }
      
      const frequency = wordFrequency[word] || 1;
      
      mockPoints.push({
        id: `point-${idx}`,
        word: word,
        sentiment: sentiment,
        position: [x, y, z],
        color: [r, g, b],
        keywords: [emotion.toLowerCase(), "feeling", "emotion"],
        emotionalTone: emotion,
        relationships: []
      });
    }
  });
  
  const commonWords = uniqueWords
    .filter(word => !significantWords.includes(word) && word.length > 3);
  
  commonWords.forEach((word, idx) => {
    const weights = Object.entries(depressedDistribution).map(([emotion, weight]) => ({ emotion, weight }));
    const totalWeight = weights.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    let selectedEmotion = "Neutral";
    
    for (const { emotion, weight } of weights) {
      if (random < weight) {
        selectedEmotion = emotion;
        break;
      }
      random -= weight;
    }
    
    let sentiment = 0.4;
    if (["Joy", "Trust", "Anticipation"].includes(selectedEmotion)) {
      sentiment = 0.5 + Math.random() * 0.3;
    } else if (["Sadness", "Fear", "Anger", "Disgust"].includes(selectedEmotion)) {
      sentiment = 0.1 + Math.random() * 0.3;
    } else {
      sentiment = 0.3 + Math.random() * 0.2;
    }
    
    const clusterCenters: Record<string, [number, number, number]> = {
      "Joy": [8, 8, 8],
      "Sadness": [-8, -8, -5],
      "Anger": [8, -8, 0],
      "Fear": [-8, 8, 0],
      "Surprise": [0, 10, 0],
      "Disgust": [0, -10, 0],
      "Trust": [10, 0, 5],
      "Anticipation": [-10, 0, 5],
      "Neutral": [0, 0, 0]
    };
    
    const variance = selectedEmotion === "Neutral" ? 2 : 3;
    const clusterCenter = clusterCenters[selectedEmotion];
    const x = clusterCenter[0] + (Math.random() * variance * 2 - variance);
    const y = clusterCenter[1] + (Math.random() * variance * 2 - variance);
    const z = clusterCenter[2] + (Math.random() * variance * 2 - variance);
    
    let r = 0.7, g = 0.7, b = 0.7;
    
    if (selectedEmotion === "Joy") {
      r = 1.0; g = 0.9; b = 0.0;
    } else if (selectedEmotion === "Sadness") {
      r = 0.0; g = 0.5; b = 0.9;
    } else if (selectedEmotion === "Anger") {
      r = 0.9; g = 0.1; b = 0.1;
    } else if (selectedEmotion === "Fear") {
      r = 0.6; g = 0.0; b = 0.8;
    } else if (selectedEmotion === "Surprise") {
      r = 1.0; g = 0.5; b = 0.0;
    } else if (selectedEmotion === "Disgust") {
      r = 0.2; g = 0.8; b = 0.2;
    } else if (selectedEmotion === "Trust") {
      r = 0.0; g = 0.8; b = 0.6;
    } else if (selectedEmotion === "Anticipation") {
      r = 0.9; g = 0.5; b = 0.7;
    }
    
    mockPoints.push({
      id: `common-${idx}`,
      word: word,
      sentiment: sentiment,
      position: [x, y, z],
      color: [r, g, b],
      keywords: [],
      emotionalTone: selectedEmotion,
      relationships: []
    });
  });
  
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

export const generateMockPoints = (
  depressedJournalReference = false, 
  customDistribution?: EmotionalDistribution,
  customWordBank?: string[]
): Point[] => {
  if (depressedJournalReference) {
    return generatePointsFromText();
  }
  
  const mockPoints: Point[] = [];
  const particleCount = depressedJournalReference ? 500 : 400;
  
  const emotionalTones = [
    "Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Trust", "Anticipation", "Neutral"
  ];
  
  const defaultDistribution: EmotionalDistribution = {
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
  
  const depressedDistribution: EmotionalDistribution = {
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
  
  const useCustomWordBank = customWordBank && customWordBank.length > 0;
  let selectedCustomWords: string[] = [];
  
  if (useCustomWordBank) {
    const customWordProbability = 0.9;
    const customWordCount = Math.min(customWordBank.length, Math.ceil(particleCount * customWordProbability));
    
    const shuffledWordBank = [...customWordBank].sort(() => Math.random() - 0.5);
    selectedCustomWords = shuffledWordBank.slice(0, customWordCount);
  }
  
  const customWordIndices: number[] = [];
  
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
    
    if (useCustomWordBank && selectedCustomWords.length > 0 && (i < selectedCustomWords.length || Math.random() < 0.9)) {
      const wordIndex = i % selectedCustomWords.length;
      word = selectedCustomWords[wordIndex];
      customWordIndices.push(i);
    } else if (depressedJournalReference) {
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
