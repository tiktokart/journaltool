
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Heart, AlertTriangle, ArrowRight } from "lucide-react";
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
  actionPlan?: string[]; // Action steps to resolve the concern
  hideMatchedWords?: boolean; // Flag to hide matched trigger words for sensitive topics
}

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
  sourceDescription?: string; // Add sourceDescription prop
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
  const [isVisible, setIsVisible] = useState<boolean>(false);

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
    if (!embeddingPoints || embeddingPoints.length === 0) {
      console.log("WellbeingResources: No embedding points provided");
      return;
    }
    
    console.log(`WellbeingResources: Processing ${embeddingPoints.length} points`);
    console.log("Sample words:", embeddingPoints.slice(0, 5).map(p => p.word).join(", "));
    
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
    
    // Check for sensitive content related words - but don't display them in UI
    const hasSensitiveContentConcerns = wordsInText.some(word => 
      sensitiveKeywords.some(keyword => word && word.includes(keyword))
    );
    
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
      {
        title: "Finding Treatment Resources",
        description: "Find local treatment options for mental health and substance use disorders.",
        tags: ["find help", "treatment", "local resources"],
        link: "https://findtreatment.gov/",
        triggerWords: ["find help", "treatment", "therapy", "counseling", "therapist", "professional"],
        emotionCategory: "Sadness",
        actionPlan: [
          "Search for providers who specialize in your specific concerns",
          "Check which therapists accept your insurance or offer sliding scale fees",
          "Prepare for your first appointment by noting your symptoms and goals",
          "Consider different therapy types (CBT, DBT, psychodynamic, etc.)",
          "Schedule an initial consultation to assess fit with potential therapists"
        ]
      },
      {
        title: "Research-Based Approaches",
        description: "Access data, research findings, and evidence-based approaches from mental health institutions.",
        tags: ["research", "data", "evidence"],
        link: "https://www.nimh.nih.gov/research/research-conducted-at-nimh/nimh-data-archive",
        triggerWords: ["research", "evidence", "study", "data", "science", "experiment"],
        actionPlan: [
          "Explore current research on conditions you're experiencing",
          "Look for clinical trials that may be recruiting participants",
          "Learn about emerging treatments and their effectiveness",
          "Use evidence-based self-help resources from reputable sources",
          "Share relevant research with your healthcare providers"
        ]
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
    
    // Filter resources based on detected concerns, trigger word matches and sensitive content keywords
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
    
    // Always include sensitive content-related resources if keywords are detected
    // This ensures the resource appears even if we hide the trigger words
    if (hasSensitiveContentConcerns) {
      const sensitiveResource = allResources.find(r => r.title === "Recovery Support");
      if (sensitiveResource && !relevantResources.some(r => r.title === sensitiveResource.title)) {
        relevantResources.push(sensitiveResource);
      }
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
    
    // Make sure we're showing at least one resource (for testing purposes)
    // This ensures suggestions always appear when documents are uploaded
    if (relevantResources.length === 0 && allResources.length > 0) {
      relevantResources.push(allResources[0]);
    }
    
    setFilteredResources(relevantResources);
    
    // Force display suggestions for testing - REMOVE THIS IN PRODUCTION
    if (filteredResources.length === 0 && resources.length > 0) {
      console.log("Forcing display of suggestions for testing");
      setFilteredResources([resources[0]]);
      setHasNegativeWords(true);  // Force display of concerns section
      setDetectedConcerns([{word: "test", category: "Sadness"}]);
    }
  }, [embeddingPoints]);
  
  // Find trigger matches for a specific resource
  const getResourceTriggerMatches = (resourceTitle: string): string[] => {
    const resourceIndex = resources.findIndex(r => r.title === resourceTitle);
    if (resourceIndex === -1) return [];
    
    const match = triggerMatches.find(m => m.resourceIndex === resourceIndex);
    return match ? match.matchedWords.filter(word => !sensitiveKeywords.includes(word)) : [];
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
    console.log("WellbeingResources: No embedding points, not rendering");
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
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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
          
          {/* Always show concerns section for testing */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange mt-0.5" />
              <div>
                <p className="font-medium text-black">Detected concerns:</p>
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
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  The suggestions below provide general wellbeing resources.
                </p>
              </div>
            </div>
          </div>
          
          {filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredResources.map((resource, index) => {
                const triggerMatches = getResourceTriggerMatches(resource.title);
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
                    </div>
                    
                    {/* Action Plan Section - Now always expanded by default */}
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
