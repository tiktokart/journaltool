
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MentalHealthSuggestionsProps {
  journalEntries: any[];
  bertAnalysis?: any;
}

interface Suggestion {
  id: string;
  keyword: string;
  solutionStatement: string;
  actionPlan: string;
  resourceLink: string;
  triggeringWords?: string[]; // Array of words that triggered this suggestion
  emotionCategory?: string; // The emotion category this suggestion addresses
}

interface EmotionTone {
  category: string;
  count: number;
  words: string[];
}

const MentalHealthSuggestions: React.FC<MentalHealthSuggestionsProps> = ({
  journalEntries,
  bertAnalysis
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [emotionTones, setEmotionTones] = useState<EmotionTone[]>([]);
  
  useEffect(() => {
    // First, analyze the emotions using BERT if available
    const analyzeEmotions = () => {
      const emotionCategories: Record<string, { count: number, words: string[] }> = {};
      
      // If BERT analysis is available, use it for more accurate emotional tone detection
      if (bertAnalysis && bertAnalysis.keywords) {
        console.log("Using BERT analysis for suggestion generation with", bertAnalysis.keywords.length, "keywords");
        
        // Process the actual BERT keywords
        bertAnalysis.keywords.forEach((keyword: any) => {
          if (keyword.tone) {
            const tone = keyword.tone.charAt(0).toUpperCase() + keyword.tone.slice(1);
            if (!emotionCategories[tone]) {
              emotionCategories[tone] = { count: 0, words: [] };
            }
            emotionCategories[tone].count += keyword.weight ? Math.round(keyword.weight * 1.5) : 1;
            emotionCategories[tone].words.push(keyword.word);
          }
        });
        
        // If available, also add the actionWords and mainSubjects from contextual analysis
        if (bertAnalysis.contextualAnalysis) {
          if (bertAnalysis.contextualAnalysis.actionWords) {
            if (!emotionCategories['Action']) {
              emotionCategories['Action'] = { count: 0, words: [] };
            }
            emotionCategories['Action'].words.push(...bertAnalysis.contextualAnalysis.actionWords);
            emotionCategories['Action'].count = bertAnalysis.contextualAnalysis.actionWords.length;
          }
          
          if (bertAnalysis.contextualAnalysis.mainSubjects) {
            if (!emotionCategories['Topic']) {
              emotionCategories['Topic'] = { count: 0, words: [] };
            }
            emotionCategories['Topic'].words.push(...bertAnalysis.contextualAnalysis.mainSubjects);
            emotionCategories['Topic'].count = bertAnalysis.contextualAnalysis.mainSubjects.length;
          }
        }
      } else if (journalEntries && journalEntries.length > 0) {
        // Fall back to basic keyword analysis if BERT isn't available
        const combinedText = journalEntries.map(entry => entry.text).join(' ').toLowerCase();
        console.log("No BERT analysis available, using basic keyword analysis on", combinedText.length, "characters");
        
        const emotionKeywords = {
          'Sadness': ['sad', 'unhappy', 'depressed', 'miserable', 'grief', 'sorrow', 'blue'],
          'Fear': ['fearful', 'afraid', 'scared', 'terrified', 'anxious', 'nervous', 'worried', 'panic'],
          'Anger': ['angry', 'mad', 'furious', 'outraged', 'irritated', 'annoyed', 'frustrated'],
          'Disgust': ['disgusted', 'revolted', 'appalled', 'disgusting', 'gross', 'repulsed'],
          'Joy': ['happy', 'joyful', 'delighted', 'pleased', 'glad', 'content', 'cheerful'],
          'Surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'startled'],
          'Neutral': ['ok', 'fine', 'average', 'neutral', 'normal']
        };
        
        // Check for each emotion keyword in the text
        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
          const foundWords: string[] = [];
          keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b|\\b${keyword}[a-z]*\\b|\\b[a-z]*${keyword}\\b`, 'gi');
            const matches = combinedText.match(regex);
            if (matches) {
              foundWords.push(...matches);
            }
          });
          
          if (foundWords.length > 0) {
            emotionCategories[emotion] = { 
              count: foundWords.length, 
              words: [...new Set(foundWords)] // Remove duplicates
            };
          }
        });
        
        // Also look for specific verbs that indicate actions
        const actionVerbs = ['go', 'make', 'take', 'try', 'want', 'need', 'feel', 'think', 'work', 'do'];
        const foundActions: string[] = [];
        
        actionVerbs.forEach(verb => {
          const regex = new RegExp(`\\b${verb}\\b|\\b${verb}[a-z]*\\b`, 'gi');
          const matches = combinedText.match(regex);
          if (matches) {
            foundActions.push(...matches);
          }
        });
        
        if (foundActions.length > 0) {
          emotionCategories['Action'] = {
            count: foundActions.length,
            words: [...new Set(foundActions)]
          };
        }
      }
      
      // Convert to array and sort by count
      return Object.entries(emotionCategories).map(([category, data]) => ({
        category,
        count: data.count,
        words: [...new Set(data.words)].slice(0, 5) // Limit to 5 unique words per emotion
      })).sort((a, b) => b.count - a.count);
    };
    
    const generateSuggestions = () => {
      const emotions = analyzeEmotions();
      setEmotionTones(emotions);
      
      // If no emotions detected, provide general suggestions
      if (emotions.length === 0) {
        return [{
          id: 'general',
          keyword: 'wellness',
          solutionStatement: 'Maintain good mental health through regular self-care practices.',
          actionPlan: '1. Prioritize sleep\n2. Physical activity\n3. Social connections\n4. Daily gratitude practice\n5. Activities you enjoy',
          resourceLink: 'https://www.mentalhealth.gov/basics/what-is-mental-health',
          emotionCategory: 'General'
        }];
      }
      
      // Extract text for specific keyword detection
      const combinedText = journalEntries.map(entry => entry.text).join(' ').toLowerCase();
      
      // Map emotions to suggestion types - focusing on action-oriented advice
      const suggestionMap: Record<string, Suggestion> = {
        'Sadness': {
          id: 'sadness',
          keyword: 'sadness',
          solutionStatement: 'Address feelings of sadness through active coping strategies.',
          actionPlan: "1. Schedule one enjoyable activity daily\n2. Connect with a supportive friend\n3. Practice 10 minutes of mindful breathing\n4. Write three things you're grateful for\n5. Get 30 minutes of movement each day",
          resourceLink: 'https://www.apa.org/topics/depression',
          emotionCategory: 'Sadness'
        },
        'Fear': {
          id: 'anxiety',
          keyword: 'anxiety',
          solutionStatement: 'Manage anxiety with practical grounding techniques.',
          actionPlan: '1. Use the 5-4-3-2-1 grounding technique\n2. Practice 4-7-8 breathing when feeling anxious\n3. Limit news and social media to specific times\n4. Challenge negative thoughts with evidence\n5. Progressive muscle relaxation before bed',
          resourceLink: 'https://adaa.org/understanding-anxiety',
          emotionCategory: 'Fear'
        },
        'Anger': {
          id: 'anger',
          keyword: 'anger',
          solutionStatement: 'Channel anger into constructive actions.',
          actionPlan: '1. Take a 10-minute timeout before responding\n2. Physical exercise to release tension\n3. Journal your thoughts without censoring\n4. Identify specific triggers and plan responses\n5. Practice assertive communication techniques',
          resourceLink: 'https://www.apa.org/topics/anger/control',
          emotionCategory: 'Anger'
        },
        'Action': {
          id: 'action',
          keyword: 'action',
          solutionStatement: 'Harness your motivation for positive change.',
          actionPlan: '1. Break goals into small, achievable steps\n2. Create a visual progress tracker\n3. Schedule specific times for important tasks\n4. Find an accountability partner\n5. Celebrate small wins regularly',
          resourceLink: 'https://www.mindtools.com/pages/article/newHTE_90.htm',
          emotionCategory: 'Motivation'
        },
        'Topic': {
          id: 'focus',
          keyword: 'focus',
          solutionStatement: 'Develop clarity around the themes in your writing.',
          actionPlan: '1. Identify recurring topics in your journal\n2. Explore how these topics connect to your values\n3. Consider what aspects need more attention\n4. Research one area of interest more deeply\n5. Set specific goals related to your main themes',
          resourceLink: 'https://positivepsychology.com/values-clarification/',
          emotionCategory: 'Insight'
        }
      };
      
      // Add suggestions based on detected emotions
      const relevantSuggestions: Suggestion[] = [];
      
      emotions.slice(0, 3).forEach(emotion => {
        const suggestion = suggestionMap[emotion.category];
        if (suggestion) {
          relevantSuggestions.push({
            ...suggestion,
            triggeringWords: emotion.words.slice(0, 3)
          });
        }
      });
      
      // Check for actual specific triggers in the text
      const specificTriggers = [
        {
          patterns: ['overwhelm', 'too much', 'can\'t handle', 'stressed out'],
          suggestion: {
            id: 'overwhelmed',
            keyword: 'overwhelmed',
            solutionStatement: 'Break down overwhelming situations into manageable steps.',
            actionPlan: '1. List everything that feels overwhelming\n2. Identify one small action for each item\n3. Schedule just 15 minutes for each action\n4. Use a timer to create work boundaries\n5. Ask specifically for help with one task',
            resourceLink: 'https://www.mind.org.uk/information-support/your-stories/10-ways-i-manage-feeling-overwhelmed/',
            emotionCategory: 'Stress',
          }
        },
        {
          patterns: ['sleep', 'tired', 'insomnia', 'exhausted', 'fatigue', 'rest'],
          suggestion: {
            id: 'sleep',
            keyword: 'sleep',
            solutionStatement: 'Improve sleep quality with practical evening routines.',
            actionPlan: '1. Set a fixed bedtime and wake time\n2. Create a 30-minute wind-down routine\n3. Keep devices out of the bedroom\n4. Limit caffeine after noon\n5. Make your bedroom cool, dark, and quiet',
            resourceLink: 'https://www.sleepfoundation.org/mental-health',
            emotionCategory: 'Physical',
          }
        },
        {
          patterns: ['lonely', 'alone', 'isolat', 'no one', 'disconnected'],
          suggestion: {
            id: 'lonely',
            keyword: 'lonely',
            solutionStatement: 'Build meaningful connections even during periods of isolation.',
            actionPlan: '1. Schedule one social contact daily (text, call, or in-person)\n2. Join an online group based on your interests\n3. Volunteer virtually or safely in-person\n4. Create a regular check-in with a friend\n5. Practice being comfortable with solitude through mindfulness',
            resourceLink: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/loneliness/about-loneliness/',
            emotionCategory: 'Social',
          }
        }
      ];
      
      // Check for specific triggers in the text
      specificTriggers.forEach(trigger => {
        const hasPattern = trigger.patterns.some(pattern => 
          combinedText.includes(pattern) || 
          (bertAnalysis?.keywords?.some((kw: any) => kw.word.toLowerCase().includes(pattern)))
        );
        
        if (hasPattern) {
          const matchedTriggerWords = trigger.patterns.filter(pattern => 
            combinedText.includes(pattern) ||
            (bertAnalysis?.keywords?.some((kw: any) => kw.word.toLowerCase().includes(pattern)))
          );
          
          relevantSuggestions.push({
            ...trigger.suggestion,
            triggeringWords: matchedTriggerWords.slice(0, 3)
          });
        }
      });
      
      // If we have no suggestions from the emotions, add a general wellness one
      if (relevantSuggestions.length === 0) {
        relevantSuggestions.push({
          id: 'general',
          keyword: 'wellness',
          solutionStatement: 'Build a personalized mental wellness routine.',
          actionPlan: '1. Start with just 5 minutes of meditation daily\n2. Take a 10-minute walk outside each day\n3. Call or message one person you care about\n4. Write down three positive moments each evening\n5. Schedule one enjoyable activity every day',
          resourceLink: 'https://www.mentalhealth.gov/basics/what-is-mental-health',
          emotionCategory: 'General'
        });
      }
      
      // Limit to 3 most relevant suggestions
      return relevantSuggestions.slice(0, 3);
    };
    
    setSuggestions(generateSuggestions());
  }, [journalEntries, bertAnalysis]);
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <CardTitle className="text-xl mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-rose-500" /> 
          Suggestions
        </CardTitle>
        <CardDescription className="mb-4">Based on the text analysis, here are some suggestions that might help.</CardDescription>
        
        {/* Emotion summary chips */}
        {emotionTones.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
              Detected emotions:
            </h4>
            
            {/* Group emotions by category */}
            {emotionTones.map(tone => (
              <div key={tone.category} className="mb-3">
                <div className="text-xs text-gray-600 mb-1">{tone.category}:</div>
                <div className="flex flex-wrap gap-1">
                  {tone.words.map((word, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs cursor-help ${
                          tone.category === 'Sadness' ? 'bg-blue-100 text-blue-800' :
                          tone.category === 'Fear' ? 'bg-amber-100 text-amber-800' :
                          tone.category === 'Anger' ? 'bg-red-100 text-red-800' : 
                          tone.category === 'Disgust' ? 'bg-green-100 text-green-800' :
                          tone.category === 'Joy' ? 'bg-yellow-100 text-yellow-800' :
                          tone.category === 'Surprise' ? 'bg-teal-100 text-teal-800' :
                          tone.category === 'Action' ? 'bg-purple-100 text-purple-800' :
                          tone.category === 'Topic' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {word}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Category: {tone.category}</p>
                        {tone.category === 'Action' && <p className="text-xs">Action words indicate your motivation and intentions</p>}
                        {tone.category === 'Topic' && <p className="text-xs">Main subjects in your text</p>}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Emotional tones count display */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Emotional tones in your text:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { tone: "Joyful", count: emotionTones.find(e => e.category === "Joy")?.count || 0, color: "bg-yellow-100 text-yellow-800" },
              { tone: "Action-oriented", count: emotionTones.find(e => e.category === "Action")?.count || 0, color: "bg-purple-100 text-purple-800" },
              { tone: "Topic-focused", count: emotionTones.find(e => e.category === "Topic")?.count || 0, color: "bg-indigo-100 text-indigo-800" },
              { tone: "Angry", count: emotionTones.find(e => e.category === "Anger")?.count || 0, color: "bg-red-100 text-red-800" },
              { tone: "Sad", count: emotionTones.find(e => e.category === "Sadness")?.count || 0, color: "bg-blue-100 text-blue-800" },
              { tone: "Anxious", count: emotionTones.find(e => e.category === "Fear")?.count || 0, color: "bg-amber-100 text-amber-800" },
              { tone: "Neutral", count: emotionTones.find(e => e.category === "Neutral")?.count || 0, color: "bg-gray-100 text-gray-800" }
            ].filter(item => item.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((item) => (
                <span key={item.tone} className={`px-3 py-1 rounded-full ${item.color}`}>
                  {item.tone} <span className="font-semibold ml-1">{item.count}</span>
                </span>
              ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            These suggestions are based on the emotions and themes detected in your journal entry.
          </p>
        </div>
        
        <div className="space-y-6">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-orange-700">{suggestion.solutionStatement}</h4>
                {suggestion.triggeringWords && suggestion.triggeringWords.length > 0 && (
                  <span className="text-xs px-2 py-1 bg-orange-100 rounded-full text-orange-800">
                    Triggered by: "{suggestion.triggeringWords.join(', ')}"
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-1 text-orange-700">Action Plan:</h5>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {suggestion.actionPlan}
                </div>
                <a 
                  href={suggestion.resourceLink}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-3 text-xs text-orange-600 hover:text-orange-800 inline-block"
                >
                  Learn more about managing {suggestion.keyword}
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MentalHealthSuggestions;
