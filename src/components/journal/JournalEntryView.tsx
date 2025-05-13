
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, BookOpen, FileText, Activity, Heart, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
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
    }
  }, [bertAnalysis, selectedEntry]);

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
      case "Neutral":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate suggestions based on emotions
  const generateSuggestions = () => {
    // Only generate if we have analysis data
    if (!bertAnalysis || !emotionTones.size) return [];
    
    // Map emotions to suggestions
    const suggestions = [];
    
    // Check for sadness
    if (emotionCategories["Sadness"]?.length > 0) {
      suggestions.push({
        title: "Managing Difficult Emotions",
        description: "Techniques like deep breathing, mindfulness, and gentle movement can help regulate emotions.",
        tags: ["self-care", "emotions", "regulation"],
        category: "Sadness",
        words: emotionCategories["Sadness"].slice(0, 5),
        actionPlan: [
          "Practice deep breathing exercises",
          "Try a 5-minute mindfulness meditation daily",
          "Express your feelings through journaling or creative outlets",
          "Establish a regular exercise routine, even if it's just a short walk",
          "Create a self-soothing kit with items that engage your five senses"
        ]
      });
    }
    
    // Check for anxiety
    if (emotionCategories["Anxiety"]?.length > 0) {
      suggestions.push({
        title: "Immediate Support Resources",
        description: "If you're feeling overwhelmed, talking with someone can help. Crisis lines provide immediate support.",
        tags: ["crisis", "support", "immediate"],
        category: "Fear",
        words: emotionCategories["Anxiety"].slice(0, 5),
        actionPlan: [
          "Take a moment to breathe deeply and acknowledge your feelings",
          "Reach out to a trusted friend or family member",
          "Remove yourself from stressful environments if possible",
          "Focus on the present moment using grounding techniques",
          "Consider talking to a mental health professional"
        ]
      });
    }
    
    // Check for joy
    if (emotionCategories["Joy"]?.length > 0) {
      suggestions.push({
        title: "Cultivate and maintain positive emotions",
        description: "Practices to amplify and sustain positive emotions in your daily life.",
        tags: ["joy", "happiness", "positive"],
        category: "Joy",
        words: emotionCategories["Joy"].slice(0, 5),
        actionPlan: [
          "Practice gratitude daily",
          "Share positive experiences with others",
          "Engage in activities that bring joy",
          "Create a positive environment",
          "Celebrate small achievements"
        ]
      });
    }
    
    // Add a general wellness suggestion if we don't have specific emotions or as a fallback
    if (suggestions.length === 0) {
      suggestions.push({
        title: "Daily Wellness Practices",
        description: "Small daily habits like walking outdoors, quality sleep, and connecting with others can improve wellbeing.",
        tags: ["wellness", "habits", "daily"],
        category: "General",
        words: [],
        actionPlan: [
          "Start a morning routine that includes 10 minutes of movement",
          "Prioritize 7-9 hours of sleep each night with a consistent schedule",
          "Take short breaks every hour if doing focused work",
          "Stay hydrated by drinking water throughout the day",
          "Spend at least 15-30 minutes outdoors each day"
        ]
      });
    }
    
    return suggestions;
  };

  const suggestions = generateSuggestions();

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

      {/* Suggestions Section - Updated to match the new design */}
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
                    The suggestions below provide wellbeing resources based on detected emotions.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Suggestions grid */}
            {suggestions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-purple-50/30 transition-colors">
                    <h3 className="font-medium mb-2 text-black">{suggestion.title}</h3>
                    <p className="text-sm text-black mb-3">{suggestion.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {suggestion.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Category badge */}
                    {suggestion.category && (
                      <div className="mt-2 mb-3">
                        <Badge className={`bg-${suggestion.category === 'Joy' ? 'yellow' : suggestion.category === 'Sadness' ? 'blue' : suggestion.category === 'Fear' ? 'amber' : 'green'}-100 
                          text-${suggestion.category === 'Joy' ? 'yellow' : suggestion.category === 'Sadness' ? 'blue' : suggestion.category === 'Fear' ? 'amber' : 'green'}-800 border-none`}>
                          Addresses {suggestion.category.toLowerCase()} concerns
                        </Badge>
                      </div>
                    )}
                    
                    {/* Triggered words */}
                    {suggestion.words && suggestion.words.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Triggered by:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.words.map((word, i) => (
                            <Badge key={i} className={`bg-${suggestion.category === 'Joy' ? 'yellow' : suggestion.category === 'Sadness' ? 'blue' : suggestion.category === 'Fear' ? 'amber' : 'green'}-100 
                              text-${suggestion.category === 'Joy' ? 'yellow' : suggestion.category === 'Sadness' ? 'blue' : suggestion.category === 'Fear' ? 'amber' : 'green'}-800 text-xs`}>
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Action plan section */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-sm font-medium text-black mb-2">Action Plan:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        {suggestion.actionPlan.map((step, idx) => (
                          <li key={idx} className="pl-1">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JournalEntryView;
