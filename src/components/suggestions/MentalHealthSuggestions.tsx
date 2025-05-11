
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface MentalHealthSuggestionsProps {
  journalEntries: any[];
}

interface Suggestion {
  id: string;
  keyword: string;
  solutionStatement: string;
  actionPlan: string;
  resourceLink: string;
  triggeringWord?: string; // Add the triggering word from the text
}

const MentalHealthSuggestions: React.FC<MentalHealthSuggestionsProps> = ({
  journalEntries
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  useEffect(() => {
    if (!journalEntries || journalEntries.length === 0) return;
    
    const generateSuggestions = () => {
      // Combine text from all entries
      const combinedText = journalEntries
        .map(entry => entry.text)
        .join(' ')
        .toLowerCase();
      
      // Keywords to look for and their associated suggestions
      const keywordSuggestions: Record<string, Suggestion> = {
        'stress': {
          id: 'stress',
          keyword: 'stress',
          solutionStatement: 'Practice stress reduction techniques to improve mental wellbeing.',
          actionPlan: 'Try deep breathing exercises for 5 minutes daily, practice mindfulness meditation, or take short breaks throughout your day.',
          resourceLink: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health'
        },
        'anxiety': {
          id: 'anxiety',
          keyword: 'anxiety',
          solutionStatement: 'Develop strategies to manage anxiety symptoms.',
          actionPlan: 'Identify anxiety triggers, practice grounding techniques, and consider speaking with a mental health professional.',
          resourceLink: 'https://adaa.org/understanding-anxiety'
        },
        'sad': {
          id: 'sad',
          keyword: 'sad',
          solutionStatement: 'Address feelings of sadness to improve emotional wellbeing.',
          actionPlan: 'Engage in activities you enjoy, connect with supportive friends or family, and consider talking to a therapist.',
          resourceLink: 'https://www.apa.org/topics/depression'
        },
        'depression': {
          id: 'depression',
          keyword: 'depression',
          solutionStatement: 'Take steps to manage feelings of depression.',
          actionPlan: 'Establish a regular sleep routine, engage in physical activity, and seek professional help if feelings persist.',
          resourceLink: 'https://www.nimh.nih.gov/health/topics/depression'
        },
        'sleep': {
          id: 'sleep',
          keyword: 'sleep',
          solutionStatement: 'Improve sleep quality for better mental health.',
          actionPlan: 'Create a consistent sleep schedule, avoid screens before bed, and create a comfortable sleep environment.',
          resourceLink: 'https://www.sleepfoundation.org/mental-health'
        },
        'tired': {
          id: 'tired',
          keyword: 'tired',
          solutionStatement: 'Address fatigue to improve overall wellbeing.',
          actionPlan: 'Evaluate your sleep habits, consider your energy management throughout the day, and speak to a healthcare provider if fatigue persists.',
          resourceLink: 'https://www.mayoclinic.org/symptoms/fatigue/basics/definition/sym-20050894'
        },
        'worry': {
          id: 'worry',
          keyword: 'worry',
          solutionStatement: 'Manage excessive worrying for improved mental health.',
          actionPlan: 'Schedule "worry time," practice challenging negative thoughts, and focus on what you can control.',
          resourceLink: 'https://www.apa.org/topics/anxiety/worry'
        },
        'lonely': {
          id: 'lonely',
          keyword: 'lonely',
          solutionStatement: 'Combat feelings of loneliness to improve wellbeing.',
          actionPlan: 'Reach out to friends or family, join community groups or classes, and consider volunteer opportunities.',
          resourceLink: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/loneliness/about-loneliness/'
        },
        'angry': {
          id: 'angry',
          keyword: 'angry',
          solutionStatement: 'Develop healthy ways to manage anger.',
          actionPlan: 'Practice identifying anger triggers, use cooling-off techniques like deep breathing, and consider physical exercise as an outlet.',
          resourceLink: 'https://www.apa.org/topics/anger/control'
        },
        'overwhelmed': {
          id: 'overwhelmed',
          keyword: 'overwhelmed',
          solutionStatement: 'Manage feelings of being overwhelmed through structured approaches.',
          actionPlan: 'Break tasks into smaller steps, practice prioritization, and don\'t hesitate to ask for help when needed.',
          resourceLink: 'https://www.mind.org.uk/information-support/your-stories/10-ways-i-manage-feeling-overwhelmed/'
        }
      };
      
      // Check for keywords in the combined text and find actual triggering words
      const matchedSuggestions: Suggestion[] = [];
      
      for (const [keyword, suggestion] of Object.entries(keywordSuggestions)) {
        if (combinedText.includes(keyword)) {
          // Find the actual instance of the keyword in the text for context
          const regex = new RegExp(`\\b${keyword}\\b|\\b${keyword}[a-z]*\\b|\\b[a-z]*${keyword}\\b`, 'i');
          const match = combinedText.match(regex);
          const triggeringWord = match ? match[0] : keyword;
          
          // Create a copy of the suggestion with the triggering word
          matchedSuggestions.push({
            ...suggestion,
            triggeringWord
          });
        }
      }
      
      // If no suggestions found, provide a general wellness suggestion
      if (matchedSuggestions.length === 0) {
        matchedSuggestions.push({
          id: 'general',
          keyword: 'wellness',
          solutionStatement: 'Maintain good mental health through regular self-care practices.',
          actionPlan: 'Prioritize sleep, physical activity, and social connections. Consider starting a daily gratitude practice.',
          resourceLink: 'https://www.mentalhealth.gov/basics/what-is-mental-health',
          triggeringWord: 'general wellness'
        });
      }
      
      return matchedSuggestions;
    };
    
    setSuggestions(generateSuggestions());
  }, [journalEntries]);
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <CardTitle className="text-xl mb-4">Suggestions</CardTitle>
        <CardDescription className="mb-4">Based on your journal entry, here are some suggestions that might help.</CardDescription>
        
        <div className="space-y-6">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-orange-700">{suggestion.solutionStatement}</h4>
                <span className="text-xs px-2 py-1 bg-orange-100 rounded-full text-orange-800">
                  Triggered by: "{suggestion.triggeringWord}"
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{suggestion.actionPlan}</p>
              <a 
                href={suggestion.resourceLink}
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 text-xs text-orange-600 hover:text-orange-800 inline-block"
              >
                Learn more about managing {suggestion.keyword}
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MentalHealthSuggestions;
