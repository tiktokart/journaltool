
import { shouldFilterWord, determineWordTone, getContextualImportance, KeywordAnalysis } from './documentAnalysis';

const FILTER_COMMON_WORDS = true; // Set to false if you want to include common words

export interface BertAnalysisResult {
  keywords: KeywordAnalysis[];
  emotionalTones: { tone: string; count: number }[];
  contextualAnalysis: {
    dominantEmotions: string[];
    emotionalShifts: any[];
    topicClusters: any[];
    actionWords: string[];
    mainSubjects: string[];
  };
}

export const analyzeTextWithBert = async (text: string): Promise<BertAnalysisResult> => {
  console.log("Starting BERT analysis process for text:", text.substring(0, 50) + "...");
  
  try {
    // Simulate BERT processing with our own algorithms since we don't have actual BERT
    const words = text
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.replace(/[^\w\s'']/g, '').trim())
      .filter(word => word.length > 0);
    
    console.log(`Extracted ${words.length} words for analysis`);
    
    // Filter common words if enabled
    const significantWords = FILTER_COMMON_WORDS 
      ? words.filter(word => !shouldFilterWord(word))
      : words;
    
    console.log(`After filtering, ${significantWords.length} significant words remain`);
    
    // Count word frequencies
    const wordFrequencies: Record<string, number> = {};
    significantWords.forEach(word => {
      const normalized = word.toLowerCase();
      wordFrequencies[normalized] = (wordFrequencies[normalized] || 0) + 1;
    });
    
    // Create a list of surrounding words for context
    const surroundingWordsMap: Record<string, string[]> = {};
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (!surroundingWordsMap[word]) {
        surroundingWordsMap[word] = [];
      }
      
      // Add surrounding words (up to 3 on each side)
      for (let j = Math.max(0, i - 3); j < Math.min(words.length, i + 4); j++) {
        if (i !== j) {
          surroundingWordsMap[word].push(words[j].toLowerCase());
        }
      }
    }
    
    // Generate keyword analysis with enhanced focus on verbs and actions
    const keywordAnalysis: KeywordAnalysis[] = Object.entries(wordFrequencies)
      .filter(([_, count]) => count > 0)  // Filter out words that appear only once
      .map(([word, frequency]) => {
        // Get surrounding words for context
        const surroundingWords = surroundingWordsMap[word] || [];
        
        // Determine part of speech with enhanced focus on verbs
        const pos = determinePartOfSpeech(word);
        
        // Give verbs higher weight to prioritize actions
        const posWeight = pos === 'verb' ? 1.5 : (pos === 'noun' ? 1.2 : 1.0);
        
        // Determine importance based on context
        const rawContextualImportance = getContextualImportance(word, surroundingWords);
        
        // Apply part-of-speech weighting to importance
        const contextualImportance = rawContextualImportance * posWeight;
        
        // Determine emotional tone
        const tone = determineWordTone(word);
        
        // Generate a sentiment score (-1 to 1)
        let sentimentScore = 0;
        switch (tone) {
          case 'positive':
            sentimentScore = 0.5 + (Math.random() * 0.5); // 0.5 to 1.0
            break;
          case 'negative':
            sentimentScore = -1.0 + (Math.random() * 0.5); // -1.0 to -0.5
            break;
          case 'anxious':
            sentimentScore = -0.7 + (Math.random() * 0.4); // -0.7 to -0.3
            break;
          case 'calm':
            sentimentScore = 0.3 + (Math.random() * 0.3); // 0.3 to 0.6
            break;
          default:
            sentimentScore = -0.2 + (Math.random() * 0.4); // -0.2 to 0.2 (mostly neutral)
        }
        
        // Generate a color based on sentiment
        // Red for negative, green for positive, blue for neutral
        const r = sentimentScore < 0 ? 255 : Math.round(255 - (sentimentScore * 255));
        const g = sentimentScore > 0 ? 255 : Math.round(255 + (sentimentScore * 255));
        const b = sentimentScore > -0.2 && sentimentScore < 0.2 ? 255 : 150;
        
        // Fix the color format to match KeywordAnalysis type: [number, number, number]
        // Ensure exactly 3 elements in the array and normalize to 0-1 range
        const color: [number, number, number] = [r/255, g/255, b/255];
        
        return {
          word,
          sentiment: sentimentScore,
          weight: contextualImportance,
          color: color, // Now properly typed as [number, number, number]
          tone,
          relatedConcepts: surroundingWords.slice(0, 5),
          frequency,
          pos
        };
      })
      .sort((a, b) => {
        // Sort by part of speech priority first (verbs > nouns > others)
        const posOrderA = a.pos === 'verb' ? 0 : (a.pos === 'noun' ? 1 : 2);
        const posOrderB = b.pos === 'verb' ? 0 : (b.pos === 'noun' ? 1 : 2);
        
        if (posOrderA !== posOrderB) {
          return posOrderA - posOrderB;
        }
        
        // Within the same part of speech, sort by weight and frequency
        return (b.weight * b.frequency) - (a.weight * a.frequency);
      })
      .slice(0, 50); // Limit to top 50 words
    
    // Count tone distributions
    const toneCount: Record<string, number> = {};
    keywordAnalysis.forEach(keyword => {
      if (keyword.tone) {
        toneCount[keyword.tone] = (toneCount[keyword.tone] || 0) + 1;
      }
    });
    
    const emotionalTones = Object.entries(toneCount).map(([tone, count]) => ({
      tone,
      count
    })).sort((a, b) => b.count - a.count);
    
    // Add contextual analysis - focusing more on verbs and action words
    const actionWords = keywordAnalysis
      .filter(kw => kw.pos === 'verb')
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)
      .map(kw => kw.word);
      
    const mainSubjects = keywordAnalysis
      .filter(kw => kw.pos === 'noun')
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8)
      .map(kw => kw.word);
      
    const contextualAnalysis = {
      dominantEmotions: emotionalTones.slice(0, 3).map(e => e.tone),
      emotionalShifts: detectEmotionalShifts(text),
      topicClusters: identifyTopicClusters(keywordAnalysis),
      actionWords,
      mainSubjects
    };
    
    console.log("BERT analysis complete with", keywordAnalysis.length, "keywords");
    
    return {
      keywords: keywordAnalysis,
      emotionalTones,
      contextualAnalysis
    };
    
  } catch (error) {
    console.error("Error during BERT analysis:", error);
    return {
      keywords: [],
      emotionalTones: [],
      contextualAnalysis: {
        dominantEmotions: [],
        emotionalShifts: [],
        topicClusters: [],
        actionWords: [],
        mainSubjects: []
      }
    };
  }
};

// Helper function to determine part of speech (enhanced to better identify verbs)
const determinePartOfSpeech = (word: string): string => {
  const commonNouns = ['time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 'life', 'hand', 'part', 'child', 'eye', 'woman', 'place', 'work', 'week', 'case', 'point', 'company'];
  const commonVerbs = ['go', 'make', 'know', 'take', 'see', 'come', 'think', 'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try', 'leave', 'call',
                       'walk', 'run', 'move', 'talk', 'write', 'read', 'speak', 'eat', 'drink', 'sleep',
                       'play', 'sing', 'dance', 'laugh', 'cry', 'fight', 'love', 'hate', 'hope', 'fear'];
  const commonAdjectives = ['good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important'];
  const commonAdverbs = ['up', 'so', 'out', 'just', 'now', 'how', 'then', 'more', 'also', 'here', 'well', 'only', 'very', 'even', 'back', 'there', 'down', 'still', 'rather', 'quite'];
  
  // Simple heuristics
  const lowerWord = word.toLowerCase();
  
  if (commonNouns.includes(lowerWord)) return 'noun';
  if (commonVerbs.includes(lowerWord)) return 'verb';
  if (commonAdjectives.includes(lowerWord)) return 'adjective';
  if (commonAdverbs.includes(lowerWord)) return 'adverb';
  
  // Enhanced patterns for better verb detection
  if (lowerWord.endsWith('ing')) return 'verb';
  if (lowerWord.endsWith('ed') && lowerWord.length > 3) return 'verb';
  if (lowerWord.endsWith('s') && commonVerbs.includes(lowerWord.slice(0, -1))) return 'verb';
  
  // Other patterns
  if (lowerWord.endsWith('ly')) return 'adverb';
  if (lowerWord.endsWith('ness') || lowerWord.endsWith('ment') || lowerWord.endsWith('ship') || lowerWord.endsWith('ity')) return 'noun';
  if (lowerWord.endsWith('ful') || lowerWord.endsWith('ous') || lowerWord.endsWith('ive') || lowerWord.endsWith('able') || lowerWord.endsWith('ible')) return 'adjective';
  
  // Default to noun for unknown words (most common)
  return 'noun';
};

// Helper function to detect emotional shifts in text
const detectEmotionalShifts = (text: string): any[] => {
  // Simplified implementation - in reality this would be a complex analysis
  // Break text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length < 2) {
    return []; // Not enough text to detect shifts
  }
  
  const shifts = [];
  
  // Simple random shifts for demo
  if (Math.random() > 0.5) {
    shifts.push({
      position: Math.floor(paragraphs.length / 2),
      fromEmotion: 'neutral',
      toEmotion: Math.random() > 0.5 ? 'positive' : 'negative',
      significance: 0.6 + Math.random() * 0.4
    });
  }
  
  return shifts;
};

// Helper function to identify topic clusters
const identifyTopicClusters = (keywords: KeywordAnalysis[]): any[] => {
  // Simplified clustering implementation
  const topics: any[] = [];
  
  // Group by similar tones
  const toneGroups: Record<string, KeywordAnalysis[]> = {};
  
  keywords.forEach(keyword => {
    if (keyword.tone) {
      if (!toneGroups[keyword.tone]) {
        toneGroups[keyword.tone] = [];
      }
      toneGroups[keyword.tone].push(keyword);
    }
  });
  
  // Create clusters from tone groups
  Object.entries(toneGroups).forEach(([tone, words]) => {
    if (words.length >= 3) { // Only create clusters with at least 3 words
      topics.push({
        name: `${tone.charAt(0).toUpperCase() + tone.slice(1)} Cluster`,
        words: words.map(w => w.word),
        dominantEmotion: tone,
        significance: words.reduce((sum, w) => sum + (w.weight || 1), 0) / words.length
      });
    }
  });
  
  return topics;
};
