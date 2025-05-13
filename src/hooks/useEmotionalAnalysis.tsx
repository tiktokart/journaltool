
import { useState, useEffect } from 'react';
import { Point } from '@/types/embedding';
import { mentalHealthDatabase } from '@/utils/mentalHealthDatabase';

interface Entry {
  id: string;
  text: string;
  date: string;
  [key: string]: any;
}

interface ActionPlan {
  title: string;
  steps: string[];
  category: string;
  triggerWords: string[];
  expanded?: boolean;
}

export const useEmotionalAnalysis = (selectedEntry: Entry | null, bertAnalysis: any) => {
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  const [emotionTones, setEmotionTones] = useState<Map<string, number>>(new Map());
  const [emotionCategories, setEmotionCategories] = useState<Record<string, string[]>>({});
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  // Toggle action plan expansion
  const togglePlanExpansion = (title: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Extract nouns/objects (subjects) and verbs/actions (emotions) from BERT analysis
  const extractSubjectsAndActions = () => {
    if (!bertAnalysis?.keywords) return { subjects: [], actions: [] };
    
    const subjects: any[] = [];
    const actions: any[] = [];
    
    bertAnalysis.keywords.forEach((keyword: any) => {
      // Check if keyword has POS (part of speech) information
      if (keyword.pos) {
        // Nouns, proper nouns, and noun phrases are subjects
        if (keyword.pos.includes('NOUN') || keyword.pos.includes('PROPN') || keyword.pos.includes('NN')) {
          subjects.push(keyword);
        }
        // Verbs and action words are actions
        else if (keyword.pos.includes('VERB') || keyword.pos.includes('VB')) {
          actions.push(keyword);
        }
      } else {
        // If no POS data, use tone to categorize
        if (keyword.tone && keyword.tone.toLowerCase().includes('action')) {
          actions.push(keyword);
        } else {
          subjects.push(keyword);
        }
      }
    });
    
    return { subjects, actions };
  };

  // Generate embedding points and analyze emotional content
  useEffect(() => {
    if (selectedEntry && bertAnalysis?.keywords) {
      // Filter to only use keywords from this specific entry
      const entryKeywords = bertAnalysis.keywords.filter((keyword: any) => keyword.text || keyword.word);
      
      const points: Point[] = entryKeywords.map((keyword: any, index: number) => ({
        id: `entry-keyword-${index}`,
        word: keyword.word || keyword.text || "",
        emotionalTone: keyword.tone || "Neutral",
        sentiment: keyword.sentiment || 0.5,
        color: keyword.color || "#9b87f5"
      }));
      setEmbeddingPoints(points);
      
      // Count emotional tones
      const toneMap = new Map<string, number>();
      const categoryMap: Record<string, string[]> = {
        "Neutral": [],
        "Joy": [],
        "Sadness": [],
        "Anxiety": [],
        "Contentment": [],
        "Confusion": []
      };
      
      // Text content for word matching
      const entryText = selectedEntry.text.toLowerCase();
      
      // Process keywords for emotional tones
      entryKeywords.forEach((keyword: any) => {
        if (keyword.tone) {
          // Normalize the tone name
          let toneName = keyword.tone;
          if (toneName.includes("Fear") || toneName.includes("Anxiety")) toneName = "Anxiety";
          if (toneName.includes("Joy") || toneName.includes("Happy")) toneName = "Joy";
          if (toneName.includes("Sad") || toneName.includes("Depress")) toneName = "Sadness";
          if (toneName.includes("Neutral") || !toneName) toneName = "Neutral";
          if (toneName.includes("Content")) toneName = "Contentment";
          if (toneName.includes("Confus")) toneName = "Confusion";
          
          // Update count
          const count = toneMap.get(toneName) || 0;
          toneMap.set(toneName, count + 1);
          
          // Add word to category
          const word = keyword.word || keyword.text;
          if (word && !categoryMap[toneName]?.includes(word)) {
            if (!categoryMap[toneName]) categoryMap[toneName] = [];
            categoryMap[toneName].push(word);
          }
        }
      });
      
      setEmotionTones(toneMap);
      setEmotionCategories(categoryMap);
      
      // Generate action plans based on text content and emotion analysis
      const detectedPlans: ActionPlan[] = [];
      const addedCategories = new Set<string>();
      
      // First check for direct keyword matches
      Object.entries(mentalHealthDatabase.emotions).forEach(([category, plan]) => {
        // Skip if we've already added this category
        if (addedCategories.has(category)) return;
        
        // Check trigger words
        const matchedTriggers: string[] = [];
        plan.triggerWords.forEach(trigger => {
          if (entryText.includes(trigger)) {
            matchedTriggers.push(trigger);
          }
        });
        
        // Add plan if we found trigger matches
        if (matchedTriggers.length > 0) {
          detectedPlans.push({
            title: plan.title,
            steps: plan.steps,
            category: category,
            triggerWords: matchedTriggers,
            expanded: detectedPlans.length === 0 // Expand first plan by default
          });
          addedCategories.add(category);
        }
      });
      
      // Then add plans based on detected emotion categories
      Array.from(toneMap.keys()).forEach(tone => {
        const normalizedTone = tone.charAt(0).toUpperCase() + tone.slice(1);
        
        // Check if we have a plan for this emotion
        if (mentalHealthDatabase.emotions[normalizedTone] && !addedCategories.has(normalizedTone)) {
          detectedPlans.push({
            title: mentalHealthDatabase.emotions[normalizedTone].title,
            steps: mentalHealthDatabase.emotions[normalizedTone].steps,
            category: normalizedTone,
            triggerWords: categoryMap[normalizedTone] || [],
            expanded: detectedPlans.length === 0 // Expand first plan by default
          });
          addedCategories.add(normalizedTone);
        }
      });
      
      // Add general wellness plan if no specific plans were detected
      if (detectedPlans.length === 0) {
        detectedPlans.push({
          title: mentalHealthDatabase.emotions.General.title,
          steps: mentalHealthDatabase.emotions.General.steps,
          category: "General",
          triggerWords: [],
          expanded: true
        });
      }
      
      // Limit to 3 most relevant plans
      setActionPlans(detectedPlans.slice(0, 3));
      
      // Set initial expanded states
      const initialExpandedState: Record<string, boolean> = {};
      detectedPlans.slice(0, 3).forEach((plan, index) => {
        initialExpandedState[plan.title] = index === 0; // Only expand first plan
      });
      setExpandedPlans(initialExpandedState);
    }
  }, [bertAnalysis, selectedEntry]);

  return {
    embeddingPoints,
    emotionTones,
    emotionCategories,
    actionPlans,
    expandedPlans,
    togglePlanExpansion,
    extractSubjectsAndActions
  };
};
