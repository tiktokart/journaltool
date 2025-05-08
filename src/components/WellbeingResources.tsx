
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Heart, AlertTriangle } from "lucide-react";
import { Point } from "@/types/embedding";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ResourceItem {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  triggerWords: string[]; // Words that trigger this resource
  emotionCategory?: string; // The emotion category this resource addresses
}

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
}

interface DetectedConcern {
  word: string;
  category: string;
}

interface TriggerMatch {
  resourceIndex: number;
  matchedWords: string[];
}

export const WellbeingResources = ({ embeddingPoints }: WellbeingResourcesProps) => {
  const { t } = useLanguage();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [averageSentiment, setAverageSentiment] = useState<number>(0);
  const [needsSupport, setNeedsSupport] = useState<boolean>(false);
  const [emotionalTones, setEmotionalTones] = useState<Map<string, number>>(new Map());
  const [hasNegativeWords, setHasNegativeWords] = useState<boolean>(false);
  const [detectedConcerns, setDetectedConcerns] = useState<DetectedConcern[]>([]);
  const [triggerMatches, setTriggerMatches] = useState<TriggerMatch[]>([]);

  // Define the negative emotion categories we want to detect
  const negativeEmotionCategories = {
    'Anger': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'outraged', 'fury', 'hate', 'hatred'],
    'Fear': ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'nervous', 'worried', 'panic', 'fear'],
    'Disgust': ['disgusted', 'repulsed', 'revolted', 'nauseated', 'loathing', 'dislike', 'aversion', 'hate'],
    'Sadness': ['sad', 'depressed', 'unhappy', 'miserable', 'gloomy', 'heartbroken', 'grief', 'despair', 'sorry']
  };

  useEffect(() => {
    if (!embeddingPoints || embeddingPoints.length === 0) return;
    
    // Calculate average sentiment
    let sentimentTotal = 0;
    embeddingPoints.forEach(point => {
      sentimentTotal += point.sentiment;
    });
    const avgSentiment = sentimentTotal / embeddingPoints.length;
    setAverageSentiment(avgSentiment);
    
    // Extract all words from the text
    const wordsInText = embeddingPoints.map(point => point.word?.toLowerCase()).filter(Boolean);
    
    // Detect concerns with their categories
    const foundConcerns: DetectedConcern[] = [];
    
    wordsInText.forEach(word => {
      if (!word) return;
      
      // Check each emotion category
      Object.entries(negativeEmotionCategories).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          if (word.includes(keyword) && !foundConcerns.some(c => c.word === keyword)) {
            foundConcerns.push({
              word: keyword,
              category
            });
          }
        });
      });
    });
    
    // Set the detected concerns
    setDetectedConcerns(foundConcerns);
    
    // Set if any negative words were found in our specific categories
    const foundNegativeWords = foundConcerns.length > 0;
    setHasNegativeWords(foundNegativeWords);
    
    // Only show support notice if sentiment is low AND there are negative words in our categories
    setNeedsSupport(avgSentiment < 0.4 && foundNegativeWords);
    
    // Count emotional tones
    const emotions = new Map<string, number>();
    embeddingPoints.forEach(point => {
      if (point.emotionalTone) {
        const count = emotions.get(point.emotionalTone) || 0;
        emotions.set(point.emotionalTone, count + 1);
      }
    });
    setEmotionalTones(emotions);
    
    // Create a master list of all available resources with their trigger words and emotion categories
    const allResources: ResourceItem[] = [
      {
        title: "Immediate Support Resources",
        description: "If you're feeling overwhelmed, talking with someone can help. Crisis lines provide immediate support.",
        tags: ["crisis", "support", "immediate"],
        link: "https://988lifeline.org/",
        triggerWords: ["overwhelm", "crisis", "suicid", "help", "desperate", "emergency", "panic", "hopeless"],
        emotionCategory: "Fear"
      },
      {
        title: "Managing Difficult Emotions",
        description: "Techniques like deep breathing, mindfulness, and gentle movement can help regulate emotions.",
        tags: ["self-care", "emotions", "regulation"],
        triggerWords: ["sad", "depress", "anxiet", "worry", "stress", "emotion", "feel", "overwhelm", "difficult"],
        emotionCategory: "Sadness"
      },
      {
        title: "Healthy Expression of Anger",
        description: "Learn to recognize anger triggers and develop constructive ways to express and channel anger.",
        tags: ["anger", "management", "expression"],
        triggerWords: ["anger", "angry", "mad", "rage", "furious", "frustrat", "irritat", "upset"],
        emotionCategory: "Anger"
      },
      {
        title: "Coping with Negative Feelings",
        description: "Strategies for dealing with disgust, aversion, and other challenging emotions.",
        tags: ["coping", "negative", "emotions"],
        triggerWords: ["disgust", "hate", "avers", "loath", "repuls", "revolt", "nauseat"],
        emotionCategory: "Disgust"
      },
      {
        title: "Daily Wellness Practices",
        description: "Small daily habits like walking outdoors, quality sleep, and connecting with others can improve wellbeing.",
        tags: ["wellness", "habits", "daily"],
        triggerWords: ["health", "well", "habit", "sleep", "routine", "exercise", "connect", "practice", "daily", "regular"]
      },
      // Add professional mental health resources
      {
        title: "PsychiatryOnline Resources",
        description: "Access to professional psychiatry journals, DSM-5, and clinical resources for mental health assessment and treatment.",
        tags: ["professional", "psychiatry", "research"],
        link: "https://psychiatryonline.org/",
        triggerWords: ["psychiatr", "mental health", "treatment", "dsm", "profession", "diagnosis", "disorder"],
        emotionCategory: "Sadness"
      },
      {
        title: "SAMHSA Treatment Locator",
        description: "Find substance use or mental health treatment facilities and programs in your area through SAMHSA's national helpline.",
        tags: ["treatment", "therapy", "professional help"],
        link: "https://findtreatment.samhsa.gov/",
        triggerWords: ["treatment", "therap", "help", "professional", "clinic", "substance", "alcohol", "drug"],
        emotionCategory: "Fear"
      },
      {
        title: "FindTreatment.gov Services",
        description: "Official resource to find local treatment options for mental health and substance use disorders.",
        tags: ["find help", "treatment", "local resources"],
        link: "https://findtreatment.gov/",
        triggerWords: ["find help", "treatment", "therapy", "counseling", "therapist", "professional"],
        emotionCategory: "Sadness"
      },
      {
        title: "NIMH Data Resources",
        description: "Access data, research findings, and evidence-based approaches from the National Institute of Mental Health.",
        tags: ["research", "data", "evidence"],
        link: "https://www.nimh.nih.gov/research/research-conducted-at-nimh/nimh-data-archive",
        triggerWords: ["research", "evidence", "study", "data", "science", "experiment"],
      },
      {
        title: "APA PsycINFO Database",
        description: "Comprehensive database of psychological research and literature from the American Psychological Association.",
        tags: ["research", "psychology", "literature"],
        link: "https://www.apa.org/pubs/databases/psycinfo",
        triggerWords: ["research", "psychology", "article", "journal", "study", "literature", "evidence"],
      },
      {
        title: "WHO MiNDbank Resources",
        description: "World Health Organization's collection of mental health policies, strategies, laws, and service standards.",
        tags: ["policy", "global", "standards"],
        link: "https://www.mindbank.info/",
        triggerWords: ["policy", "law", "right", "standard", "global", "international", "world"],
      }
    ];
    
    setResources(allResources);
    
    // Find direct trigger word matches in the text
    const matches: TriggerMatch[] = [];
    
    allResources.forEach((resource, index) => {
      const matchedTriggerWords: string[] = [];
      
      // Check each word in text against resource trigger words
      wordsInText.forEach(word => {
        if (!word) return;
        
        // Check if any trigger word is contained in this word
        resource.triggerWords.forEach(trigger => {
          if (word.includes(trigger) && !matchedTriggerWords.includes(word)) {
            matchedTriggerWords.push(word);
          }
        });
      });
      
      // If we found matches, add to our matches array
      if (matchedTriggerWords.length > 0) {
        matches.push({
          resourceIndex: index,
          matchedWords: matchedTriggerWords
        });
      }
    });
    
    setTriggerMatches(matches);
    
    // Filter resources based on detected concerns and trigger word matches
    let relevantResources: ResourceItem[] = [];
    
    // First add resources that match detected emotion categories
    if (foundConcerns.length > 0) {
      // Get the unique categories from our concerns
      const detectedCategories = [...new Set(foundConcerns.map(c => c.category))];
      
      // Get resources that match these categories
      const categorizedResources = allResources.filter(resource => 
        resource.emotionCategory && detectedCategories.includes(resource.emotionCategory)
      );
      
      relevantResources = [...categorizedResources];
    }
    
    // Then add resources that have direct trigger word matches but aren't already included
    matches.forEach(match => {
      const matchedResource = allResources[match.resourceIndex];
      if (!relevantResources.some(r => r.title === matchedResource.title)) {
        relevantResources.push(matchedResource);
      }
    });
    
    // If no specific resources match but sentiment is low AND there are negative words, add the general support resource
    if (relevantResources.length === 0 && avgSentiment < 0.4 && foundNegativeWords) {
      const supportResource = allResources.find(r => r.title === "Immediate Support Resources");
      if (supportResource) {
        relevantResources.push(supportResource);
      }
    }
    
    // Always include daily wellness practices if no other resources match
    if (relevantResources.length === 0) {
      const wellnessResource = allResources.find(r => r.title === "Daily Wellness Practices");
      if (wellnessResource) {
        relevantResources.push(wellnessResource);
      }
    }
    
    setFilteredResources(relevantResources);
  }, [embeddingPoints]);
  
  // Find trigger matches for a specific resource
  const getResourceTriggerMatches = (resourceTitle: string): string[] => {
    const resourceIndex = resources.findIndex(r => r.title === resourceTitle);
    if (resourceIndex === -1) return [];
    
    const match = triggerMatches.find(m => m.resourceIndex === resourceIndex);
    return match ? match.matchedWords : [];
  };
  
  const handleResourceClick = (resource: ResourceItem) => {
    if (resource.link) {
      window.open(resource.link, "_blank");
    } else {
      toast.info(`Resource information: ${resource.description}`);
    }
  };

  if (!embeddingPoints || embeddingPoints.length === 0) {
    return null;
  }

  // Group concerns by category for display
  const concernsByCategory: Record<string, string[]> = {};
  detectedConcerns.forEach(concern => {
    if (!concernsByCategory[concern.category]) {
      concernsByCategory[concern.category] = [];
    }
    concernsByCategory[concern.category].push(concern.word);
  });

  return (
    <div>
      <Card className="border border-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Heart className="h-5 w-5 mr-2 text-orange" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {needsSupport && (
            <div className="bg-yellow-soft p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-orange mt-0.5" />
                <div>
                  <p className="font-medium text-black">Support Notice</p>
                  <p className="text-sm text-black mt-1">
                    Your entries show patterns that may benefit from additional support. 
                    Consider reaching out to a mental health professional.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {hasNegativeWords && Object.keys(concernsByCategory).length > 0 && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange mt-0.5" />
                <div>
                  <p className="font-medium text-black">Detected concerns:</p>
                  <div className="mt-2 space-y-2">
                    {Object.entries(concernsByCategory).map(([category, words]) => (
                      <div key={category} className="mb-2">
                        <span className="text-sm font-medium text-gray-700">{category}:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {words.map((word, index) => (
                            <Badge key={index} variant="outline" className="bg-orange/10 text-orange border-orange">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    The suggestions below address these concerns.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredResources.map((resource, index) => {
                const triggerMatches = getResourceTriggerMatches(resource.title);
                return (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4 hover:bg-lavender/30 transition-colors cursor-pointer"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <h3 className="font-medium mb-2 text-black">{resource.title}</h3>
                    <p className="text-sm text-black mb-3">{resource.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {resource.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {resource.emotionCategory && Object.keys(concernsByCategory).includes(resource.emotionCategory) && (
                      <div className="mt-2 mb-2">
                        <Badge className="bg-orange/20 text-orange border-none">
                          Addresses {resource.emotionCategory.toLowerCase()} concerns
                        </Badge>
                      </div>
                    )}
                    
                    {/* Show detected trigger words that matched this resource */}
                    {triggerMatches.length > 0 && (
                      <div className="mt-2 mb-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Words that triggered this suggestion:</p>
                        <div className="flex flex-wrap gap-1">
                          {triggerMatches.map((word, i) => (
                            <Badge key={i} className="bg-orange/10 text-orange border-orange text-xs">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {resource.link && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm text-orange mt-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(resource.link, "_blank");
                        }}
                      >
                        Visit resource
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Keep working on your self. You are doing good.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
