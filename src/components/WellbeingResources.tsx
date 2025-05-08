
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Heart, AlertTriangle, ArrowRight } from "lucide-react";
import { Point } from "@/types/embedding";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getEmotionColor } from "@/utils/embeddingUtils";
import { getEmotionColor as getBertEmotionColor } from "@/utils/bertSentimentAnalysis";

interface ResourceItem {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  triggerWords: string[]; // Words that trigger this resource
  emotionCategory?: string; // The emotion category this resource addresses
  actionPlan?: string[]; // Action steps to resolve the concern
  hideMatchedWords?: boolean; // Flag to hide matched trigger words for sensitive topics
}

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
  sourceDescription?: string;
}

interface DetectedConcern {
  word: string;
  category: string;
}

interface TriggerMatch {
  resourceIndex: number;
  matchedWords: string[];
}

export const WellbeingResources = ({ embeddingPoints, sourceDescription }: WellbeingResourcesProps) => {
  const { t } = useLanguage();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [averageSentiment, setAverageSentiment] = useState<number>(0);
  const [needsSupport, setNeedsSupport] = useState<boolean>(false);
  const [emotionalTones, setEmotionalTones] = useState<Map<string, number>>(new Map());
  const [hasNegativeWords, setHasNegativeWords] = useState<boolean>(false);
  const [detectedConcerns, setDetectedConcerns] = useState<DetectedConcern[]>([]);
  const [triggerMatches, setTriggerMatches] = useState<TriggerMatch[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [dataProcessed, setDataProcessed] = useState<boolean>(false);

  // Define the negative emotion categories we want to detect
  const negativeEmotionCategories = {
    'Anger': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'outraged', 'fury', 'hate', 'hatred'],
    'Fear': ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'nervous', 'worried', 'panic', 'fear'],
    'Disgust': ['disgusted', 'repulsed', 'revolted', 'nauseated', 'loathing', 'dislike', 'aversion', 'hate'],
    'Sadness': ['sad', 'depressed', 'unhappy', 'miserable', 'gloomy', 'heartbroken', 'grief', 'despair', 'sorry']
  };
  
  // Define sensitive related keywords - blacklisted from UI display
  const sensitiveKeywords = ['drug', 'substance', 'alcohol', 'addiction', 'addicted', 
    'abuse', 'abusing', 'smoke', 'smoking', 'weed', 'marijuana', 'cocaine', 'heroin', 'opioid', 'pill', 'pills', 
    'overdose', 'withdrawal', 'relapse', 'clean', 'sober', 'recovery', 'rehab', 'detox'];

  useEffect(() => {
    // Set visible after a short delay for animation effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Only process data once per embedding points set
    if (!embeddingPoints || embeddingPoints.length === 0 || dataProcessed) {
      return;
    }
    
    console.log(`WellbeingResources: Processing ${embeddingPoints.length} points`);
    console.log("Sample words:", embeddingPoints.slice(0, 5).map(p => p.word).join(", "));
    
    // Extract all words to detect trigger words in the text
    const wordsInText = embeddingPoints.map(point => point.word?.toLowerCase()).filter(Boolean);
    const emotionalToneMap = new Map<string, number>();
    
    // Count emotional tones from embedding points
    embeddingPoints.forEach(point => {
      if (point.emotionalTone) {
        const count = emotionalToneMap.get(point.emotionalTone) || 0;
        emotionalToneMap.set(point.emotionalTone, count + 1);
      }
    });
    
    // Calculate average sentiment
    let sentimentTotal = 0;
    embeddingPoints.forEach(point => {
      sentimentTotal += point.sentiment || 0.5;
    });
    const avgSentiment = embeddingPoints.length > 0 ? sentimentTotal / embeddingPoints.length : 0.5;
    setAverageSentiment(avgSentiment);
    setEmotionalTones(emotionalToneMap);
    
    // Detect concerns based on emotion categories and words
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
    
    // Also look for emotional tones in the embedding points
    embeddingPoints.forEach(point => {
      if (!point.emotionalTone) return;
      
      const emotionalTone = point.emotionalTone.toLowerCase();
      
      // Map emotional tones to our concern categories
      let category = null;
      if (emotionalTone.includes('angry') || emotionalTone.includes('rage') || emotionalTone.includes('frustrated')) {
        category = 'Anger';
      } else if (emotionalTone.includes('sad') || emotionalTone.includes('depress') || emotionalTone.includes('unhappy')) {
        category = 'Sadness';
      } else if (emotionalTone.includes('fear') || emotionalTone.includes('anxi') || emotionalTone.includes('worr')) {
        category = 'Fear';
      } else if (emotionalTone.includes('disgust') || emotionalTone.includes('hate')) {
        category = 'Disgust';
      }
      
      if (category && !foundConcerns.some(c => c.word === emotionalTone)) {
        foundConcerns.push({
          word: emotionalTone,
          category
        });
      }
    });
    
    setDetectedConcerns(foundConcerns);
    setHasNegativeWords(foundConcerns.length > 0);
    setNeedsSupport(avgSentiment < 0.4 && foundConcerns.length > 0);
    
    // Create a master list of all available resources with their trigger words and emotion categories
    const allResources: ResourceItem[] = [
      {
        title: "Immediate Support Resources",
        description: "If you're feeling overwhelmed, talking with someone can help. Crisis lines provide immediate support.",
        tags: ["crisis", "support", "immediate"],
        link: "https://988lifeline.org/",
        triggerWords: ["overwhelm", "crisis", "suicid", "help", "desperate", "emergency", "panic", "hopeless"],
        emotionCategory: "Fear",
        actionPlan: [
          "Take a moment to breathe deeply and acknowledge your feelings",
          "Call a crisis helpline like 988 if you need immediate support",
          "Reach out to a trusted friend or family member",
          "Remove yourself from stressful environments if possible",
          "Focus on the present moment using grounding techniques"
        ]
      },
      {
        title: "Managing Difficult Emotions",
        description: "Techniques like deep breathing, mindfulness, and gentle movement can help regulate emotions.",
        tags: ["self-care", "emotions", "regulation"],
        triggerWords: ["sad", "depress", "anxiet", "worry", "stress", "emotion", "feel", "overwhelm", "difficult"],
        emotionCategory: "Sadness",
        actionPlan: [
          "Practice deep breathing exercises (4-7-8 technique: inhale for 4, hold for 7, exhale for 8)",
          "Try a 5-minute mindfulness meditation daily",
          "Express your feelings through journaling or creative outlets",
          "Establish a regular exercise routine, even if it's just a short walk",
          "Create a self-soothing kit with items that engage your five senses"
        ]
      },
      {
        title: "Healthy Expression of Anger",
        description: "Learn to recognize anger triggers and develop constructive ways to express and channel anger.",
        tags: ["anger", "management", "expression"],
        triggerWords: ["anger", "angry", "mad", "rage", "furious", "frustrat", "irritat", "upset"],
        emotionCategory: "Anger",
        actionPlan: [
          "Identify your personal anger triggers and early warning signs",
          "Practice time-outs: step away from triggering situations for 10-15 minutes",
          "Release physical tension through exercise or activities like punching a pillow",
          "Use 'I statements' when expressing feelings (\"I feel frustrated when...\")",
          "Consider anger management techniques like progressive muscle relaxation"
        ]
      },
      {
        title: "Coping with Negative Feelings",
        description: "Strategies for dealing with disgust, aversion, and other challenging emotions.",
        tags: ["coping", "negative", "emotions"],
        triggerWords: ["disgust", "hate", "avers", "loath", "repuls", "revolt", "nauseat"],
        emotionCategory: "Disgust",
        actionPlan: [
          "Practice cognitive reframing to challenge negative thoughts",
          "Use systematic desensitization to gradually reduce aversive responses",
          "Implement distraction techniques when negative feelings arise",
          "Try the 'opposite action' technique (acting opposite to the emotion)",
          "Consider talking to a professional about specific phobias or aversions"
        ]
      },
      {
        title: "Daily Wellness Practices",
        description: "Small daily habits like walking outdoors, quality sleep, and connecting with others can improve wellbeing.",
        tags: ["wellness", "habits", "daily"],
        triggerWords: ["health", "well", "habit", "sleep", "routine", "exercise", "connect", "practice", "daily", "regular"],
        actionPlan: [
          "Start a morning routine that includes 10 minutes of movement",
          "Prioritize 7-9 hours of sleep each night with a consistent schedule",
          "Take short breaks every hour if doing focused work",
          "Stay hydrated by drinking water throughout the day",
          "Spend at least 15-30 minutes outdoors each day"
        ]
      },
      // Sensitive content resources with updated neutral language and hide matched words flag
      {
        title: "Recovery Support",
        description: "Find treatment facilities and programs through SAMHSA's national helpline.",
        tags: ["treatment", "support"],
        link: "https://findtreatment.samhsa.gov/",
        triggerWords: sensitiveKeywords,
        hideMatchedWords: true, // Add flag to hide matched words for this sensitive resource
        actionPlan: [
          "Call SAMHSA's National Helpline at 1-800-662-HELP (4357) for 24/7 support",
          "Use the SAMHSA treatment locator to find nearby options",
          "Consider speaking with your primary care doctor about treatment options",
          "Reach out to a trusted person who can support your recovery journey",
          "Attend a local support group meeting"
        ]
      },
      // Keep other professional resources but only show them when relevant
      {
        title: "Professional Mental Health Resources",
        description: "Access to professional psychiatry resources for mental health assessment and treatment.",
        tags: ["professional", "psychiatry", "research"],
        link: "https://psychiatryonline.org/",
        triggerWords: ["psychiatr", "mental health", "treatment", "dsm", "profession", "diagnosis", "disorder"],
        emotionCategory: "Sadness",
        actionPlan: [
          "Schedule an appointment with a mental health provider",
          "Research evidence-based treatments for your specific concerns",
          "Create a list of questions to ask during professional consultations",
          "Consider joining support groups related to your specific challenges",
          "Ask your provider about self-help resources to complement professional care"
        ]
      },
      // Add positive resources triggered by joyful emotions
      {
        title: "Enhancing Joy and Happiness",
        description: "Practices to amplify and sustain positive emotions in your daily life.",
        tags: ["joy", "happiness", "positive"],
        triggerWords: ["joy", "happy", "happi", "cheer", "delight", "content", "satisf", "excite", "grateful", "bliss"],
        emotionCategory: "Joy",
        actionPlan: [
          "Start a gratitude journal to record three positive experiences each day",
          "Schedule regular activities that bring you joy and fulfillment",
          "Practice savoring - consciously enjoying positive experiences in the moment",
          "Share your positive feelings with others to amplify their effect",
          "Build a 'joy toolkit' of activities, memories, or items that lift your spirits"
        ]
      }
    ];
    
    setResources(allResources);
    
    // Find direct trigger word matches in the text
    const matches: TriggerMatch[] = [];
    
    allResources.forEach((resource, index) => {
      const matchedTriggerWords: string[] = [];
      
      // Check each embedding point against resource trigger words
      embeddingPoints.forEach(point => {
        if (!point.word) return;
        const word = point.word.toLowerCase();
        
        // Check if any trigger word is contained in this word
        resource.triggerWords.forEach(trigger => {
          if (word.includes(trigger) && !matchedTriggerWords.includes(word)) {
            matchedTriggerWords.push(word);
          }
        });
        
        // If resource has an emotion category, check if the point's emotional tone matches
        if (resource.emotionCategory && point.emotionalTone) {
          const pointEmotion = point.emotionalTone.toLowerCase();
          const resourceEmotion = resource.emotionCategory.toLowerCase();
          
          if (pointEmotion.includes(resourceEmotion) || 
              (resourceEmotion === 'joy' && (pointEmotion.includes('happy') || pointEmotion.includes('excite'))) ||
              (resourceEmotion === 'anger' && pointEmotion.includes('frustrat')) ||
              (resourceEmotion === 'sadness' && (pointEmotion.includes('depress') || pointEmotion.includes('unhappy'))) ||
              (resourceEmotion === 'fear' && (pointEmotion.includes('anxi') || pointEmotion.includes('worr')))
          ) {
            if (!matchedTriggerWords.includes(`emotion:${pointEmotion}`)) {
              matchedTriggerWords.push(`emotion:${pointEmotion}`);
            }
          }
        }
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
    
    // Process resources to show to the user based on triggers and emotions
    let relevantResources: ResourceItem[] = [];
    
    // Add resources that match detected emotion categories
    if (foundConcerns.length > 0) {
      const detectedCategories = [...new Set(foundConcerns.map(c => c.category))];
      
      // Get resources that match these categories
      const categorizedResources = allResources.filter(resource => 
        resource.emotionCategory && detectedCategories.includes(resource.emotionCategory)
      );
      
      // Add them if not already included
      categorizedResources.forEach(resource => {
        if (!relevantResources.some(r => r.title === resource.title)) {
          relevantResources.push(resource);
        }
      });
    }
    
    // Check for positive emotions - show joy resources if present
    const hasJoyfulEmotions = Array.from(emotionalToneMap.keys()).some(emotion => 
      emotion.toLowerCase().includes('joy') || 
      emotion.toLowerCase().includes('happy') || 
      emotion.toLowerCase().includes('excite')
    );
    
    if (hasJoyfulEmotions) {
      const joyResource = allResources.find(r => r.title === "Enhancing Joy and Happiness");
      if (joyResource && !relevantResources.some(r => r.title === joyResource.title)) {
        relevantResources.push(joyResource);
      }
    }
    
    // Add resources based on direct trigger word matches
    matches.forEach(match => {
      const matchedResource = allResources[match.resourceIndex];
      if (!relevantResources.some(r => r.title === matchedResource.title)) {
        relevantResources.push(matchedResource);
      }
    });
    
    // Always include daily wellness practices to ensure we show something
    const wellnessResource = allResources.find(r => r.title === "Daily Wellness Practices");
    if (wellnessResource && !relevantResources.some(r => r.title === wellnessResource.title)) {
      relevantResources.push(wellnessResource);
    }
    
    // Force expanded state of first action plan to ensure visibility
    if (relevantResources.length > 0) {
      setExpandedPlans(prev => ({
        ...prev,
        [relevantResources[0].title]: true
      }));
    }
    
    setFilteredResources(relevantResources);
    setDataProcessed(true);
    
  }, [embeddingPoints, dataProcessed]);
  
  // Reset data processed flag when embedding points change
  useEffect(() => {
    if (embeddingPoints && embeddingPoints !== window.lastProcessedEmbeddingPoints) {
      setDataProcessed(false);
      window.lastProcessedEmbeddingPoints = embeddingPoints;
    }
  }, [embeddingPoints]);
  
  // Find trigger matches for a specific resource
  const getResourceTriggerMatches = (resourceTitle: string): string[] => {
    const resourceIndex = resources.findIndex(r => r.title === resourceTitle);
    if (resourceIndex === -1) return [];
    
    const match = triggerMatches.find(m => m.resourceIndex === resourceIndex);
    if (!match) return [];
    
    return match.matchedWords
      .filter(word => !sensitiveKeywords.includes(word)) // Filter out sensitive keywords
      .filter(word => !word.startsWith('emotion:')); // Filter out emotion prefixes for display
  };
  
  // Get emotion triggers for a specific resource
  const getResourceEmotionTriggers = (resourceTitle: string): string[] => {
    const resourceIndex = resources.findIndex(r => r.title === resourceTitle);
    if (resourceIndex === -1) return [];
    
    const match = triggerMatches.find(m => m.resourceIndex === resourceIndex);
    if (!match) return [];
    
    return match.matchedWords
      .filter(word => word.startsWith('emotion:'))
      .map(word => word.replace('emotion:', ''));
  };
  
  const handleResourceClick = (resource: ResourceItem) => {
    if (resource.link) {
      window.open(resource.link, "_blank");
    } else {
      toast.info(`Resource information: ${resource.description}`);
    }
  };

  const togglePlan = (resourceTitle: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [resourceTitle]: !prev[resourceTitle]
    }));
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

  // Always ensure we show at least one resource suggestion
  const displayResources = filteredResources.length > 0 ? filteredResources : resources.slice(0, 1);

  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className="border border-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Heart className="h-5 w-5 mr-2 text-orange animate-pulse" />
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
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange mt-0.5" />
              <div>
                <p className="font-medium text-black">Detected emotions:</p>
                <div className="mt-2 space-y-2">
                  {Object.entries(concernsByCategory).length > 0 ? (
                    Object.entries(concernsByCategory).map(([category, words]) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No specific concerns detected.</p>
                  )}
                  
                  {Array.from(emotionalTones.entries()).length > 0 && (
                    <div className="mt-3 border-t pt-3 border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Emotional tones in your text:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(emotionalTones.entries())
                          .sort((a, b) => b[1] - a[1]) // Sort by frequency, most common first
                          .map(([emotion, count], idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              style={{ 
                                backgroundColor: `${getBertEmotionColor(emotion)}20`, 
                                color: getBertEmotionColor(emotion),
                                borderColor: getBertEmotionColor(emotion)
                              }}
                              className="flex items-center gap-1"
                            >
                              {emotion}
                              <span className="ml-1 bg-white/20 rounded-full px-1 text-xs">{count}</span>
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  The suggestions below provide wellbeing resources based on detected emotions.
                </p>
              </div>
            </div>
          </div>
          
          {displayResources.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {displayResources.map((resource, index) => {
                const triggerMatches = getResourceTriggerMatches(resource.title);
                const emotionTriggers = getResourceEmotionTriggers(resource.title);
                const isExpanded = expandedPlans[resource.title] || false;
                
                return (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4 hover:bg-lavender/30 transition-colors cursor-pointer"
                  >
                    <div onClick={() => handleResourceClick(resource)}>
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
                      
                      {/* Show detected trigger words ONLY if matches exist AND resource doesn't have hideMatchedWords flag */}
                      {triggerMatches.length > 0 && !resource.hideMatchedWords && (
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
                      
                      {/* Show detected emotions that triggered this resource */}
                      {emotionTriggers.length > 0 && !resource.hideMatchedWords && (
                        <div className="mt-2 mb-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Emotions that triggered this suggestion:</p>
                          <div className="flex flex-wrap gap-1">
                            {emotionTriggers.map((emotion, i) => {
                              const emotionColor = getBertEmotionColor(emotion) || getEmotionColor(emotion);
                              return (
                                <Badge 
                                  key={i} 
                                  style={{
                                    backgroundColor: `${emotionColor}20`,
                                    color: emotionColor,
                                    borderColor: emotionColor
                                  }}
                                  className="text-xs"
                                >
                                  {emotion}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Plan Section */}
                    {resource.actionPlan && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-sm text-orange hover:text-orange/80 hover:bg-transparent flex items-center gap-1 mb-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlan(resource.title);
                          }}
                        >
                          <ArrowRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          {isExpanded ? "Hide action plan" : "Show action plan"}
                        </Button>
                        
                        {isExpanded && (
                          <div className="mt-2 pl-4 border-l-2 border-orange/30 animate-fadeIn">
                            <p className="text-sm font-medium text-black mb-2">Action Plan:</p>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                              {resource.actionPlan.map((step, idx) => (
                                <li key={idx} className="pl-1">{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
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
            <div className="text-center text-muted-foreground py-4 bg-yellow-soft/50 rounded-lg">
              <p className="font-medium">Suggestions are loading...</p>
              <p className="text-sm mt-1">Analyzing your content to provide relevant resources.</p>
            </div>
          )}

          {/* Add source description display */}
          {sourceDescription && (
            <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              {sourceDescription}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Add this for tracking processed embeddings
declare global {
  interface Window {
    lastProcessedEmbeddingPoints?: Point[];
    documentEmbeddingPoints?: Point[];
    documentEmbeddingActions?: {
      focusOnEmotionalGroup?: (tone: string) => void;
      resetEmotionalGroupFilter?: () => void;
      resetView?: () => void;
    };
  }
}
