
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Heart } from "lucide-react";
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
}

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
}

export const WellbeingResources = ({ embeddingPoints }: WellbeingResourcesProps) => {
  const { t } = useLanguage();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [averageSentiment, setAverageSentiment] = useState<number>(0);
  const [needsSupport, setNeedsSupport] = useState<boolean>(false);
  const [emotionalTones, setEmotionalTones] = useState<Map<string, number>>(new Map());
  const [hasNegativeWords, setHasNegativeWords] = useState<boolean>(false);

  useEffect(() => {
    if (!embeddingPoints || embeddingPoints.length === 0) return;
    
    // Calculate average sentiment
    let sentimentTotal = 0;
    embeddingPoints.forEach(point => {
      sentimentTotal += point.sentiment;
    });
    const avgSentiment = sentimentTotal / embeddingPoints.length;
    setAverageSentiment(avgSentiment);
    
    // Check if there are any negative words in the text
    const negativeWords = [
      'sad', 'angry', 'upset', 'disappointed', 'frustrated',
      'anxious', 'worried', 'fear', 'hate', 'terrible',
      'awful', 'bad', 'worse', 'worst', 'horrible',
      'depressed', 'depression', 'stress', 'stressed', 'unhappy',
      'miserable', 'hurt', 'pain', 'failure', 'fail',
      'worried', 'guilty', 'ashamed', 'regret', 'lonely',
      'alone', 'abandoned', 'sorry', 'trouble', 'problem'
    ];
    
    const wordsInText = embeddingPoints.map(point => point.word?.toLowerCase()).filter(Boolean);
    const foundNegativeWords = wordsInText.some(word => 
      negativeWords.some(negWord => word && word.includes(negWord))
    );
    
    setHasNegativeWords(foundNegativeWords);
    
    // Only show support notice if sentiment is low AND there are negative words
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
    
    // Create a master list of all available resources with their trigger words
    const allResources: ResourceItem[] = [
      {
        title: "Immediate Support Resources",
        description: "If you're feeling overwhelmed, talking with someone can help. Crisis lines provide immediate support.",
        tags: ["crisis", "support", "immediate"],
        link: "https://988lifeline.org/",
        triggerWords: ["overwhelm", "crisis", "suicid", "help", "desperate", "emergency", "panic", "hopeless"]
      },
      {
        title: "Managing Difficult Emotions",
        description: "Techniques like deep breathing, mindfulness, and gentle movement can help regulate emotions.",
        tags: ["self-care", "emotions", "regulation"],
        triggerWords: ["sad", "depress", "anxious", "anxiet", "worry", "stress", "emotion", "feel", "overwhelm", "difficult"]
      },
      {
        title: "Healthy Expression of Anger",
        description: "Learn to recognize anger triggers and develop constructive ways to express and channel anger.",
        tags: ["anger", "management", "expression"],
        triggerWords: ["anger", "angry", "mad", "rage", "furious", "frustrat", "irritat", "upset"]
      },
      {
        title: "Daily Wellness Practices",
        description: "Small daily habits like walking outdoors, quality sleep, and connecting with others can improve wellbeing.",
        tags: ["wellness", "habits", "daily"],
        triggerWords: ["health", "well", "habit", "sleep", "routine", "exercise", "connect", "practice", "daily", "regular"]
      }
    ];
    
    setResources(allResources);
    
    // Extract all words from embedding points
    const relevantResources = allResources.filter(resource => {
      // Check if any trigger word is present in the text
      return resource.triggerWords.some(triggerWord => 
        wordsInText.some(word => word && word.includes(triggerWord))
      );
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
          
          {filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredResources.map((resource, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:bg-lavender/30 transition-colors cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
                  <h3 className="font-medium mb-2 text-black">{resource.title}</h3>
                  <p className="text-sm text-black mb-3">{resource.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {resource.link && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm text-orange mt-2" 
                      onClick={() => window.open(resource.link, "_blank")}
                    >
                      Visit resource
                    </Button>
                  )}
                </div>
              ))}
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
