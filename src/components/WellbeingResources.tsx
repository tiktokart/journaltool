
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Point } from '@/types/embedding';
import { Heart, HelpCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
}

interface SuggestionItem {
  id: string;
  title: string;
  steps: string[];
  relatedEmotions: string[];
  priority: number;
}

export const WellbeingResources = ({ embeddingPoints }: WellbeingResourcesProps) => {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  
  // These are the negative emotion keywords that we'll use to trigger suggestions
  const negativeKeywords = [
    'anger', 'angry', 'rage', 'furious', 'livid',
    'sad', 'depressed', 'grief', 'sorrow', 'depression', 
    'anxious', 'anxiety', 'worry', 'stressed', 'nervous',
    'fear', 'scared', 'terrified', 'panic', 'dread',
    'lonely', 'alone', 'isolated', 'abandoned', 'rejected',
    'guilty', 'shame', 'regret', 'remorse', 'embarrassed',
    'tired', 'exhausted', 'fatigue', 'drained', 'burnout',
    'hopeless', 'despair', 'helpless', 'worthless', 'suicidal'
  ];

  useEffect(() => {
    if (!embeddingPoints || embeddingPoints.length === 0) return;

    // Extract all emotional tones from the points
    const emotionalTones = embeddingPoints
      .map(point => point.emotionalTone)
      .filter(tone => tone) as string[];

    // Count the frequency of each emotional tone
    const toneFrequency = emotionalTones.reduce<Record<string, number>>((acc, tone) => {
      acc[tone] = (acc[tone] || 0) + 1;
      return acc;
    }, {});

    // Extract unique words from the embedding points
    const contentWords = embeddingPoints.map(point => point.word.toLowerCase());
    
    // Check if any of the embedding points contain negative emotion keywords
    const foundNegativeKeywords = negativeKeywords.filter(keyword => 
      contentWords.includes(keyword)
    );

    // Define our wellbeing suggestions with their related emotions
    const allSuggestions: SuggestionItem[] = [
      {
        id: 'anxiety-breathing',
        title: 'Deep Breathing for Anxiety Relief',
        steps: [
          'Find a quiet, comfortable place to sit or lie down',
          'Place one hand on your chest and the other on your abdomen',
          'Breathe in slowly through your nose for 4 counts',
          'Hold your breath for 2 counts',
          'Exhale slowly through your mouth for 6 counts',
          'Repeat for 5-10 minutes'
        ],
        relatedEmotions: ['anxiety', 'anxious', 'stress', 'stressed', 'worry', 'nervous', 'panic', 'fear', 'scared'],
        priority: 1
      },
      {
        id: 'mindfulness-meditation',
        title: 'Mindfulness Meditation',
        steps: [
          'Sit in a comfortable position with your back straight',
          'Close your eyes or maintain a soft gaze',
          'Focus your attention on your breath',
          'When your mind wanders, gently bring your attention back to your breath',
          'Start with 5 minutes and gradually increase the time'
        ],
        relatedEmotions: ['stress', 'anxiety', 'worry', 'overthinking', 'restless'],
        priority: 2
      },
      {
        id: 'sadness-gratitude',
        title: 'Gratitude Practice for Low Mood',
        steps: [
          'Take a moment to reflect on three things you're grateful for today',
          'Write them down in a journal if possible',
          'Consider why you're grateful for each item',
          'Notice how reflecting on gratitude affects your mood',
          'Make this a daily practice, especially when feeling low'
        ],
        relatedEmotions: ['sad', 'depression', 'depressed', 'low', 'down', 'hopeless', 'grief', 'sorrow'],
        priority: 1
      },
      {
        id: 'anger-management',
        title: 'Healthy Anger Management',
        steps: [
          'Recognize when you're becoming angry (notice physical sensations)',
          'Take a timeout – remove yourself from the triggering situation if possible',
          'Use deep breathing to calm your physiological response',
          'Express your feelings using "I" statements rather than blame',
          'Engage in physical activity to release tension',
          'Consider whether your anger is masking another emotion'
        ],
        relatedEmotions: ['anger', 'angry', 'rage', 'furious', 'irritated', 'annoyed'],
        priority: 2
      },
      {
        id: 'social-connection',
        title: 'Building Social Connections',
        steps: [
          'Reach out to one friend or family member today',
          'Join a group based on your interests (online or in person)',
          'Practice active listening in your conversations',
          'Share your feelings with someone you trust',
          'Volunteer in your community'
        ],
        relatedEmotions: ['lonely', 'alone', 'isolated', 'disconnected', 'rejected'],
        priority: 2
      }
    ];

    // Filter suggestions based on found negative keywords
    let activeSuggestions: SuggestionItem[] = [];
    
    if (foundNegativeKeywords.length > 0) {
      foundNegativeKeywords.forEach(keyword => {
        // Find suggestions that relate to this keyword
        const matchingSuggestions = allSuggestions.filter(suggestion => 
          suggestion.relatedEmotions.includes(keyword)
        );
        
        // Add any new matching suggestions to our active suggestions
        matchingSuggestions.forEach(suggestion => {
          if (!activeSuggestions.some(s => s.id === suggestion.id)) {
            activeSuggestions.push({
              ...suggestion,
              relatedEmotions: suggestion.relatedEmotions.filter(emotion => 
                foundNegativeKeywords.includes(emotion)
              )
            });
          }
        });
      });
      
      // Sort by priority
      activeSuggestions.sort((a, b) => a.priority - b.priority);
    }
    
    setSuggestions(activeSuggestions);
  }, [embeddingPoints]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border border-border shadow-md bg-card mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <HelpCircle className="h-5 w-5 mr-2 text-primary" />
          {t("resourcesAndSupport")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {t("resourcesDescription")}
          </p>
        </div>
        
        <Accordion type="multiple" className="w-full">
          {suggestions.map((suggestion) => (
            <AccordionItem key={suggestion.id} value={suggestion.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center text-left">
                  <Heart className="h-4 w-4 mr-2 text-rose-500" />
                  <span>{suggestion.title}</span>
                  
                  {suggestion.relatedEmotions.length > 0 && (
                    <div className="ml-3 flex flex-wrap gap-1">
                      {suggestion.relatedEmotions.map((emotion, i) => (
                        <Badge key={i} variant="outline" className="text-xs py-0 px-2">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  {suggestion.steps.map((step, i) => (
                    <li key={i} className="pl-1">{step}</li>
                  ))}
                </ol>
                
                <div className="mt-4 flex items-start gap-2 p-3 bg-primary/10 rounded-md">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {t("seekProfessionalHelp")}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
