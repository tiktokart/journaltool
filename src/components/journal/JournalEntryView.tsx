
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, BookOpen, FileText, Activity, Heart, AlertTriangle, ArrowRight } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Point } from "@/types/embedding";

interface Entry {
  id: string;
  text: string;
  date: string;
  [key: string]: any;
}

interface JournalEntryViewProps {
  selectedEntry: Entry | null;
  documentStats: { wordCount: number; sentenceCount: number; paragraphCount: number };
  mainSubjects: string[];
  bertAnalysis: any;
  isDetailedAnalysisOpen: boolean;
  setIsDetailedAnalysisOpen: (isOpen: boolean) => void;
  isSuggestionsOpen: boolean;
  setIsSuggestionsOpen: (isOpen: boolean) => void;
}

interface ActionPlan {
  title: string;
  steps: string[];
  category: string;
  triggerWords: string[];
  expanded?: boolean;
}

const JournalEntryView: React.FC<JournalEntryViewProps> = ({
  selectedEntry,
  documentStats,
  mainSubjects,
  bertAnalysis,
  isDetailedAnalysisOpen,
  setIsDetailedAnalysisOpen,
  isSuggestionsOpen,
  setIsSuggestionsOpen
}) => {
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  const [emotionTones, setEmotionTones] = useState<Map<string, number>>(new Map());
  const [emotionCategories, setEmotionCategories] = useState<Record<string, string[]>>({});
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  
  // Database of mental health resources and action plans
  const mentalHealthDatabase = {
    emotions: {
      "Joy": {
        title: "Cultivate Positive Emotions",
        steps: [
          "Practice gratitude daily by listing three things you appreciate",
          "Share your positive experiences with trusted friends or family",
          "Engage in activities that bring you authentic joy",
          "Create a physical environment that uplifts your mood",
          "Celebrate small achievements and milestones"
        ],
        triggerWords: ["happy", "joy", "excite", "pleasure", "content", "delight", "cheer"]
      },
      "Sadness": {
        title: "Managing Difficult Emotions",
        steps: [
          "Practice deep breathing exercises (4-7-8 technique)",
          "Try a short mindfulness meditation focused on acceptance",
          "Express your feelings through journaling or creative outlets",
          "Establish a gentle movement routine, even if just a short walk",
          "Create a self-care kit with items that engage your senses"
        ],
        triggerWords: ["sad", "unhappy", "depress", "miserable", "down", "blue", "grief", "sorrow", "melancholy"]
      },
      "Anxiety": {
        title: "Managing Anxiety and Worry",
        steps: [
          "Use grounding techniques like the 5-4-3-2-1 sensory exercise",
          "Practice progressive muscle relaxation to release physical tension",
          "Challenge anxious thoughts by writing evidence for and against them",
          "Create a worry period: set aside 15-30 minutes to focus on worries",
          "Develop a regular meditation practice focused on present awareness"
        ],
        triggerWords: ["anxious", "worry", "stress", "tense", "nervous", "fear", "overwhelm", "panic", "dread", "apprehension"]
      },
      "Anger": {
        title: "Healthy Expression of Anger",
        steps: [
          "Identify your personal anger triggers and early warning signs",
          "Practice time-outs: step away from triggering situations briefly",
          "Release physical tension through exercise or safe physical outlets",
          "Use 'I statements' when expressing feelings ('I feel frustrated when...')",
          "Try anger reduction techniques like deep breathing or counting to ten"
        ],
        triggerWords: ["angry", "mad", "frustrat", "irritat", "annoy", "rage", "resent", "hostile", "bitter", "fury"]
      },
      "Overwhelm": {
        title: "Managing Feelings of Overwhelm",
        steps: [
          "Break large tasks into smaller, manageable steps",
          "Practice prioritization using urgent/important matrix",
          "Implement time-blocking in your schedule",
          "Take short breaks throughout the day to reset",
          "Practice saying 'no' to new commitments when needed"
        ],
        triggerWords: ["overwhelm", "too much", "burden", "swamp", "drown", "flood", "crush", "pressure"]
      },
      "Sleep": {
        title: "Improving Sleep Quality",
        steps: [
          "Create a consistent sleep schedule, even on weekends",
          "Develop a calming bedtime routine (reading, gentle stretching)",
          "Make your bedroom comfortable, dark, quiet and cool",
          "Limit screen time 1-2 hours before bed",
          "Avoid caffeine and alcohol close to bedtime"
        ],
        triggerWords: ["sleep", "insomnia", "tired", "fatigue", "exhausted", "rest", "dream", "night", "bed"]
      },
      "Loneliness": {
        title: "Addressing Feelings of Loneliness",
        steps: [
          "Reach out to one friend or family member for a conversation",
          "Join a group activity aligned with your interests",
          "Consider volunteer opportunities to connect with others",
          "Use technology mindfully to foster genuine connections",
          "Develop a nurturing relationship with yourself through self-compassion"
        ],
        triggerWords: ["lonely", "alone", "isolat", "disconnect", "abandoned", "rejected", "solitary"]
      },
      "General": {
        title: "Daily Wellness Practices",
        steps: [
          "Start a morning routine that includes 10 minutes of movement",
          "Prioritize 7-9 hours of quality sleep each night",
          "Take short breaks every hour during focused work",
          "Stay hydrated by drinking water throughout the day",
          "Spend time outdoors to connect with nature daily"
        ],
        triggerWords: []
      }
    }
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
  
  // Generate embedding points from BERT analysis for suggestions
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

  const { subjects, actions } = extractSubjectsAndActions();

  // Emotion category styling
  const getEmotionBadgeStyles = (emotion: string) => {
    switch(emotion) {
      case "Joy":
      case "Joyful":
        return "bg-yellow-100 text-yellow-800";
      case "Sadness":
      case "Sad":
        return "bg-blue-100 text-blue-800";
      case "Anxiety":
      case "Fear":
        return "bg-amber-100 text-amber-800";
      case "Contentment":
      case "Calm":
        return "bg-green-100 text-green-800";
      case "Confusion":
        return "bg-purple-100 text-purple-800";
      case "Anger":
        return "bg-red-100 text-red-800";
      case "Overwhelm":
        return "bg-orange-100 text-orange-800";
      case "Sleep":
        return "bg-indigo-100 text-indigo-800";
      case "Loneliness":
        return "bg-teal-100 text-teal-800";
      case "Neutral":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Toggle action plan expansion
  const togglePlanExpansion = (title: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  if (!selectedEntry) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <div>
          <p className="text-gray-500 mb-3">Select an entry from the list to view it</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1 font-pacifico flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
          Journal Entry
        </h2>
        <p className="text-gray-600">
          {format(new Date(selectedEntry.date), 'MMMM d, yyyy - h:mm a')}
        </p>
        <div className="w-16 h-1 bg-purple-400 mt-1"></div>
      </div>
      
      <Collapsible defaultOpen={true} className="mb-4">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-purple-50 rounded-lg font-medium">
          <span className="font-pacifico flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Entry Content
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 border border-t-0 rounded-b-lg">
            <div className="prose max-w-none font-georgia">
              <p className="whitespace-pre-wrap">{selectedEntry.text}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Detailed Analyzed Data Section */}
      <Collapsible open={isDetailedAnalysisOpen} onOpenChange={setIsDetailedAnalysisOpen} className="mb-4 border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <h3 className="text-lg font-medium font-pacifico flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Detailed Analyzed Data
          </h3>
          {isDetailedAnalysisOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 bg-white">
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium mb-3">Content Overview</h3>
                <div>
                  <p className="mb-4">Document Statistics</p>
                  <p className="text-gray-700 mb-1">
                    This document contains {documentStats.wordCount || 0} words, 
                    {documentStats.sentenceCount || 0} sentences, and 
                    approximately {documentStats.paragraphCount || 0} paragraphs.
                  </p>
                </div>
                
                <div className="mt-6">
                  <p className="mb-4">Document Structure</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold">{documentStats.wordCount || 0}</p>
                      <p className="text-sm text-gray-600">Words</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-purple-600">{documentStats.sentenceCount || 0}</p>
                      <p className="text-sm text-gray-600">Sentences</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {documentStats.paragraphCount || 0}
                      </p>
                      <p className="text-sm text-gray-600">Paragraphs</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium mb-3">Content Analysis</h3>
                
                {/* Main Subjects - Nouns, Objects, Concepts */}
                <div className="mb-5">
                  <h4 className="text-md font-medium mb-2">Main Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {subjects && subjects.length > 0 ? subjects.slice(0, 7).map((subject: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm"
                      >
                        {subject.word || subject.text}
                      </span>
                    )) : (
                      <p className="text-gray-500">No main subjects detected</p>
                    )}
                  </div>
                </div>
                
                {/* Emotional Analysis - Actions, Verbs */}
                <div>
                  <h4 className="text-md font-medium mb-2">Emotional Analysis</h4>
                  <div className="flex flex-wrap gap-2">
                    {actions && actions.length > 0 ? actions.slice(0, 5).map((action: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm text-white"
                        style={{ 
                          backgroundColor: action.color || 
                            (action.sentiment && action.sentiment > 0.5 ? '#68D391' : '#FC8181')
                        }}
                      >
                        {action.word || action.text}
                      </span>
                    )) : (
                      <p className="text-gray-500">No emotional keywords detected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Suggestions Section - Updated with action plans from mental health database */}
      <Collapsible open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen} className="mb-4 border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <h3 className="text-lg font-medium flex items-center">
            <Heart className="h-5 w-5 mr-2 text-rose-500" />
            Suggestions
          </h3>
          {isSuggestionsOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 bg-white">
            <p className="text-gray-700 mb-4">
              Based on the text analysis, here are some suggestions that might help.
            </p>

            {/* Detected emotions section with new styling */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
                <div className="w-full">
                  <p className="font-medium mb-3">Detected emotions:</p>
                  
                  {/* Render emotion categories */}
                  {Object.entries(emotionCategories)
                    .filter(([category, words]) => words.length > 0)
                    .map(([category, words]) => (
                      <div key={category} className="mb-3">
                        <div className="text-gray-600 mb-1">{category}:</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {words.slice(0, 5).map((word, idx) => (
                            <span 
                              key={idx} 
                              className={`inline-block px-2 py-1 rounded-full text-xs ${getEmotionBadgeStyles(category)}`}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  
                  {/* Emotional tones count display */}
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Emotional tones in your text:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(emotionTones.entries())
                        .map(([emotion, count], idx) => (
                          <span 
                            key={idx} 
                            className={`px-3 py-1 rounded-full ${getEmotionBadgeStyles(emotion)}`}
                          >
                            {emotion} <span className="font-semibold ml-1">{count}</span>
                          </span>
                        ))}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Based on these emotions, we've created personalized action plans to help support your wellbeing.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Plans */}
            <div className="space-y-5">
              {actionPlans.length > 0 ? (
                actionPlans.map((plan, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg overflow-hidden"
                    style={{
                      borderColor: plan.category === "Joy" ? "#FDE68A" :
                                  plan.category === "Sadness" ? "#BFDBFE" :
                                  plan.category === "Anxiety" ? "#FDE68A" :
                                  plan.category === "Anger" ? "#FCA5A5" :
                                  plan.category === "Contentment" ? "#A7F3D0" :
                                  plan.category === "Overwhelm" ? "#FDBA74" :
                                  plan.category === "Sleep" ? "#C7D2FE" :
                                  plan.category === "Loneliness" ? "#99F6E4" : "#E5E7EB"
                    }}
                  >
                    <div 
                      className="p-4"
                      style={{
                        backgroundColor: plan.category === "Joy" ? "#FFFBEB" :
                                      plan.category === "Sadness" ? "#EFF6FF" :
                                      plan.category === "Anxiety" ? "#FFFBEB" :
                                      plan.category === "Anger" ? "#FEF2F2" :
                                      plan.category === "Contentment" ? "#ECFDF5" :
                                      plan.category === "Overwhelm" ? "#FFF7ED" :
                                      plan.category === "Sleep" ? "#EEF2FF" :
                                      plan.category === "Loneliness" ? "#F0FDFA" : "#F9FAFB"
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg">{plan.title}</h3>
                        <Badge className={getEmotionBadgeStyles(plan.category)}>
                          {plan.category}
                        </Badge>
                      </div>
                      
                      {/* Display trigger words if any */}
                      {plan.triggerWords.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Triggered by:</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.triggerWords.slice(0, 3).map((word, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action plan steps with expand/collapse */}
                      <div className="mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto flex items-center gap-1 mb-2 hover:bg-transparent"
                          onClick={() => togglePlanExpansion(plan.title)}
                        >
                          <ArrowRight className={`h-4 w-4 transition-transform ${expandedPlans[plan.title] ? 'rotate-90' : ''}`} />
                          <span className="text-sm">
                            {expandedPlans[plan.title] ? "Hide action plan" : "Show action plan"}
                          </span>
                        </Button>
                        
                        {expandedPlans[plan.title] && (
                          <div className="pl-5 border-l-2 border-gray-200 mt-3 space-y-2 animate-fadeIn">
                            <ol className="list-decimal list-outside space-y-2 text-sm ml-4">
                              {plan.steps.map((step, stepIdx) => (
                                <li key={stepIdx} className="text-gray-700">{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium mb-1">Consider adding more details</h4>
                    <p className="text-sm">Your entry could benefit from more specific examples or situations.</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium mb-1">Reflect on your emotions</h4>
                    <p className="text-sm">Try exploring why you felt the way you did during these events.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JournalEntryView;
