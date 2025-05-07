
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LifeBuoy, Heart, ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Point } from "@/types/embedding";
import { useLanguage } from "@/contexts/LanguageContext";

interface Resource {
  id: string;
  title: string;
  description: string;
  steps?: string[];
  triggerWords: string[];
  emotions: string[];
}

interface WellbeingResourcesProps {
  embeddingPoints?: Point[];
}

export const WellbeingResources = ({ embeddingPoints = [] }: WellbeingResourcesProps) => {
  const { t } = useLanguage();
  const [activeResources, setActiveResources] = useState<Resource[]>([]);
  const [triggeredWords, setTriggeredWords] = useState<Map<string, string[]>>(new Map());

  // Resources database
  const resources: Resource[] = [
    {
      id: "anxiety",
      title: "Anxiety Management Techniques",
      description: "Strategies to manage feelings of anxiety and worry.",
      steps: [
        "Practice deep breathing: Inhale for 4 seconds, hold for 2, and exhale for 6.",
        "Use grounding techniques: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
        "Challenge anxious thoughts by examining evidence for and against them.",
        "Practice progressive muscle relaxation by tensing and releasing each muscle group.",
        "Limit caffeine and alcohol which can increase anxiety symptoms."
      ],
      triggerWords: ["anxiety", "anxious", "worry", "fear", "panic", "stress", "scared", "nervous", "tense", "uneasy"],
      emotions: ["Fear", "Anxiety"]
    },
    {
      id: "depression",
      title: "Depression Support Resources",
      description: "Approaches to help manage depressive feelings and thoughts.",
      steps: [
        "Set small, achievable daily goals to build a sense of accomplishment.",
        "Maintain a regular sleep schedule, aiming for 7-9 hours per night.",
        "Engage in physical activity, even if it's just a short walk outside.",
        "Reach out to a trusted friend or family member about how you're feeling.",
        "Practice self-compassion and challenge negative self-talk."
      ],
      triggerWords: ["depression", "sad", "hopeless", "empty", "worthless", "tired", "exhausted", "lonely", "despair", "numb"],
      emotions: ["Sadness", "Depression"]
    },
    {
      id: "anger",
      title: "Healthy Anger Management",
      description: "Methods to process and express anger in constructive ways.",
      steps: [
        "Take a timeout when you feel anger building and count to 10 before responding.",
        "Use "I" statements when expressing frustration (e.g., "I feel upset when...").",
        "Identify specific triggers and plan alternative responses.",
        "Channel energy into physical activities like exercise or household tasks.",
        "Practice relaxation techniques like deep breathing or visualization."
      ],
      triggerWords: ["anger", "angry", "rage", "furious", "mad", "frustrated", "irritated", "resentful", "hostile", "bitter"],
      emotions: ["Anger", "Rage"]
    },
    {
      id: "grief",
      title: "Grief and Loss Support",
      description: "Support for processing grief and coping with loss.",
      steps: [
        "Allow yourself to feel emotions without judgment or rushing the process.",
        "Create personal rituals to honor and remember what you've lost.",
        "Join a support group to connect with others experiencing similar feelings.",
        "Take care of your physical needs like sleep, nutrition, and exercise.",
        "Seek professional help if grief feels overwhelming or persistent."
      ],
      triggerWords: ["grief", "loss", "death", "mourning", "missing", "gone", "heartbreak", "sorrow", "bereavement", "devastated"],
      emotions: ["Sadness", "Grief"]
    },
    {
      id: "stress",
      title: "Stress Reduction Techniques",
      description: "Practices to reduce and manage everyday stress.",
      steps: [
        "Identify and address sources of stress in your life when possible.",
        "Practice mindfulness meditation for 5-10 minutes daily.",
        "Maintain boundaries between work and personal life.",
        "Use time management strategies to reduce feeling overwhelmed.",
        "Incorporate regular breaks into your day to reset and recharge."
      ],
      triggerWords: ["stress", "stressed", "overwhelm", "pressure", "burnout", "tension", "overload", "strain", "burden", "hectic"],
      emotions: ["Stress", "Fear", "Anxiety"]
    }
  ];

  useEffect(() => {
    if (!embeddingPoints || embeddingPoints.length === 0) return;
    
    // Map to track which words trigger each resource
    const newTriggeredWords = new Map<string, string[]>();
    const matchedResources = new Set<Resource>();
    
    // Get all unique words from embedding points
    const documentWords = embeddingPoints
      .filter(point => point.word)
      .map(point => point.word.toLowerCase());
    
    // Check each resource against the document words
    resources.forEach(resource => {
      const matches: string[] = [];
      
      // Check for trigger words
      resource.triggerWords.forEach(triggerWord => {
        const matchingWords = documentWords.filter(word => 
          word === triggerWord || word.includes(triggerWord)
        );
        
        if (matchingWords.length > 0) {
          matches.push(...matchingWords);
        }
      });
      
      // Check for emotional tones
      embeddingPoints.forEach(point => {
        if (point.emotionalTone && resource.emotions.includes(point.emotionalTone) && point.word) {
          matches.push(point.word.toLowerCase());
        }
      });
      
      // If we found matches, add this resource
      if (matches.length > 0) {
        matchedResources.add(resource);
        
        // De-duplicate the matching words
        const uniqueMatches = Array.from(new Set(matches));
        newTriggeredWords.set(resource.id, uniqueMatches);
      }
    });
    
    setTriggeredWords(newTriggeredWords);
    setActiveResources(Array.from(matchedResources));
  }, [embeddingPoints]);

  if (activeResources.length === 0) {
    return null;
  }

  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <LifeBuoy className="h-5 w-5 mr-2 text-primary" />
          Resources and Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {activeResources.map((resource) => (
              <AccordionItem key={resource.id} value={resource.id}>
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      <span>{resource.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {resource.description}
                    </div>
                    
                    {triggeredWords.has(resource.id) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground mr-1">Triggered by:</span>
                        {(triggeredWords.get(resource.id) || []).slice(0, 5).map((word, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {word}
                          </Badge>
                        ))}
                        {(triggeredWords.get(resource.id) || []).length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{(triggeredWords.get(resource.id) || []).length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {resource.steps && (
                    <ol className="space-y-2 pl-5 list-decimal">
                      {resource.steps.map((step, index) => (
                        <li key={index} className="text-sm">
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            These resources are provided based on words and emotions detected in your text. 
            For immediate support, please contact a mental health professional.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
