import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Heart } from "lucide-react";

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
        bertAnalysis.keywords.forEach((keyword: any) => {
          if (keyword.tone) {
            const tone = keyword.tone.charAt(0).toUpperCase() + keyword.tone.slice(1);
            if (!emotionCategories[tone]) {
              emotionCategories[tone] = { count: 0, words: [] };
            }
            emotionCategories[tone].count += 1;
            emotionCategories[tone].words.push(keyword.word);
          }
        });
      } else if (journalEntries && journalEntries.length > 0) {
        // Fall back to basic keyword analysis if BERT isn't available
        const combinedText = journalEntries.map(entry => entry.text).join(' ').toLowerCase();
        
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
          actionPlan: 'Prioritize sleep, physical activity, and social connections. Consider starting a daily gratitude practice.',
          resourceLink: 'https://www.mentalhealth.gov/basics/what-is-mental-health',
          emotionCategory: 'General'
        }];
      }
      
      // Map emotions to suggestion types
      const suggestionMap: Record<string, Suggestion> = {
        'Sadness': {
          id: 'sadness',
          keyword: 'sadness',
          solutionStatement: 'Address feelings of sadness to improve emotional wellbeing.',
          actionPlan: '1. Engage in activities you enjoy\n2. Connect with supportive friends or family\n3. Consider talking to a therapist\n4. Practice self-compassion\n5. Get regular exercise to boost mood',
          resourceLink: 'https://www.apa.org/topics/depression',
          emotionCategory: 'Sadness'
        },
        'Fear': {
          id: 'anxiety',
          keyword: 'anxiety',
          solutionStatement: 'Develop strategies to manage anxiety symptoms.',
          actionPlan: '1. Identify anxiety triggers\n2. Practice deep breathing exercises\n3. Try grounding techniques when feeling overwhelmed\n4. Consider speaking with a mental health professional\n5. Limit caffeine and alcohol intake',
          resourceLink: 'https://adaa.org/understanding-anxiety',
          emotionCategory: 'Fear'
        },
        'Anger': {
          id: 'anger',
          keyword: 'anger',
          solutionStatement: 'Develop healthy ways to manage anger.',
          actionPlan: '1. Practice identifying anger triggers\n2. Use cooling-off techniques like deep breathing\n3. Write in a journal when feeling angry\n4. Consider physical exercise as an outlet\n5. Try mindfulness meditation',
          resourceLink: 'https://www.apa.org/topics/anger/control',
          emotionCategory: 'Anger'
        },
        'Disgust': {
          id: 'disgust',
          keyword: 'disgust',
          solutionStatement: 'Process feelings of disgust in healthy ways.',
          actionPlan: '1. Identify the source of disgust feelings\n2. Challenge thoughts that may be exaggerating the situation\n3. Engage in activities that bring positive emotions\n4. Consider speaking with a therapist\n5. Practice mindfulness and acceptance',
          resourceLink: 'https://www.psychologytoday.com/us/basics/disgust',
          emotionCategory: 'Disgust'
        },
        'Joy': {
          id: 'joy',
          keyword: 'joy',
          solutionStatement: 'Cultivate and maintain positive emotions.',
          actionPlan: '1. Practice gratitude daily\n2. Share positive experiences with others\n3. Engage in activities that bring joy\n4. Create a positive environment\n5. Celebrate small achievements',
          resourceLink: 'https://www.pursuit-of-happiness.org/',
          emotionCategory: 'Joy'
        },
        'Surprise': {
          id: 'surprise',
          keyword: 'surprise',
          solutionStatement: 'Process unexpected events and transitions.',
          actionPlan: '1. Allow yourself time to process surprising information\n2. Talk through unexpected events with trusted friends\n3. Practice adapting to change with flexibility\n4. Use journaling to reflect on surprises\n5. Find the opportunity within unexpected situations',
          resourceLink: 'https://www.mindtools.com/pages/article/managing-unexpected.htm',
          emotionCategory: 'Surprise'
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
      
      // If we have no suggestions from the emotions, add a general wellness one
      if (relevantSuggestions.length === 0) {
        relevantSuggestions.push({
          id: 'general',
          keyword: 'wellness',
          solutionStatement: 'Maintain good mental health through regular self-care practices.',
          actionPlan: '1. Prioritize sleep\n2. Engage in physical activity\n3. Nurture social connections\n4. Start a daily gratitude practice\n5. Make time for activities you enjoy',
          resourceLink: 'https://www.mentalhealth.gov/basics/what-is-mental-health',
          emotionCategory: 'General'
        });
      }
      
      // Special case suggestions based on specific keywords or patterns
      const combinedText = journalEntries.map(entry => entry.text).join(' ').toLowerCase();
      
      if (combinedText.includes('overwhelm')) {
        relevantSuggestions.push({
          id: 'overwhelmed',
          keyword: 'overwhelmed',
          solutionStatement: 'Manage feelings of being overwhelmed through structured approaches.',
          actionPlan: '1. Break tasks into smaller steps\n2. Practice prioritization\n3. Use time-blocking techniques\n4. Take short breaks throughout the day\n5. Don\'t hesitate to ask for help when needed',
          resourceLink: 'https://www.mind.org.uk/information-support/your-stories/10-ways-i-manage-feeling-overwhelmed/',
          emotionCategory: 'Stress',
          triggeringWords: ['overwhelmed', 'overwhelm', 'too much']
        });
      }
      
      if (combinedText.includes('sleep') || combinedText.includes('tired') || combinedText.includes('insomnia')) {
        relevantSuggestions.push({
          id: 'sleep',
          keyword: 'sleep',
          solutionStatement: 'Improve sleep quality for better mental health.',
          actionPlan: '1. Create a consistent sleep schedule\n2. Avoid screens before bed\n3. Create a comfortable sleep environment\n4. Limit caffeine and alcohol\n5. Try relaxation techniques before bedtime',
          resourceLink: 'https://www.sleepfoundation.org/mental-health',
          emotionCategory: 'Physical',
          triggeringWords: ['sleep', 'tired', 'insomnia', 'exhausted']
        });
      }
      
      if (combinedText.includes('lonely') || combinedText.includes('alone') || combinedText.includes('isolat')) {
        relevantSuggestions.push({
          id: 'lonely',
          keyword: 'lonely',
          solutionStatement: 'Combat feelings of loneliness to improve wellbeing.',
          actionPlan: '1. Reach out to friends or family\n2. Join community groups or classes\n3. Consider volunteer opportunities\n4. Use technology to connect with others\n5. Develop a self-care routine',
          resourceLink: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/loneliness/about-loneliness/',
          emotionCategory: 'Social',
          triggeringWords: ['lonely', 'alone', 'isolated', 'disconnected']
        });
      }
      
      // Limit to 3 most relevant suggestions
      return relevantSuggestions.slice(0, 3);
    };
    
    setSuggestions(generateSuggestions());
  }, [journalEntries, bertAnalysis]);
  
  // Check if we have any emotions or suggestions to display
  const hasEmotions = emotionTones.length > 0;
  const hasSuggestions = suggestions.length > 0;
  
  if (!hasSuggestions && !hasEmotions) {
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
        
        {/* Emotion summary chips - only show if emotions detected */}
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
                    <span key={idx} className={`inline-block px-2 py-1 rounded-full text-xs ${
                      tone.category === 'Sadness' ? 'bg-blue-100 text-blue-800' :
                      tone.category === 'Fear' ? 'bg-amber-100 text-amber-800' :
                      tone.category === 'Anger' ? 'bg-red-100 text-red-800' : 
                      tone.category === 'Disgust' ? 'bg-green-100 text-green-800' :
                      tone.category === 'Joy' ? 'bg-amber-100 text-amber-800' :
                      tone.category === 'Surprise' ? 'bg-teal-100 text-teal-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Emotional tones count display - only if emotions exist */}
        {emotionTones.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Emotional tones in your text:</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { tone: "Joyful", count: emotionTones.find(e => e.category === "Joy")?.count || 0, color: "bg-amber-100 text-amber-800" },
                { tone: "Excited", count: emotionTones.find(e => e.category.includes("Joy") || e.category.includes("Surprise"))?.count || 0, color: "bg-orange-100 text-orange-800" },
                { tone: "Angry", count: emotionTones.find(e => e.category === "Anger")?.count || 0, color: "bg-red-100 text-red-800" },
                { tone: "Sad", count: emotionTones.find(e => e.category === "Sadness")?.count || 0, color: "bg-blue-100 text-blue-800" },
                { tone: "Surprised", count: emotionTones.find(e => e.category === "Surprise")?.count || 0, color: "bg-green-100 text-green-800" },
                { tone: "Anxious", count: emotionTones.find(e => e.category === "Fear")?.count || 0, color: "bg-amber-100 text-amber-800" },
                { tone: "Neutral", count: emotionTones.find(e => e.category === "Neutral")?.count || 0, color: "bg-gray-100 text-gray-800" },
                { tone: "Fearful", count: emotionTones.find(e => e.category === "Fear")?.count || 0, color: "bg-purple-100 text-purple-800" },
                { tone: "Disgusted", count: emotionTones.find(e => e.category === "Disgust")?.count || 0, color: "bg-emerald-100 text-emerald-800" },
                { tone: "Calm", count: emotionTones.find(e => e.category === "Joy" || e.category === "Neutral")?.count || 0, color: "bg-sky-100 text-sky-800" }
              ].filter(item => item.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((item) => (
                  <span key={item.tone} className={`px-3 py-1 rounded-full ${item.color}`}>
                    {item.tone} <span className="font-semibold ml-1">{item.count}</span>
                  </span>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The suggestions below provide wellbeing resources based on detected emotions.
            </p>
          </div>
        )}
        
        {suggestions.length > 0 ? (
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
        ) : (
          <div className="text-center text-muted-foreground py-4 bg-yellow-soft/50 rounded-lg">
            <p className="font-medium">No specific suggestions available</p>
            <p className="text-sm mt-1">Not enough emotional patterns detected in your content.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MentalHealthSuggestions;
