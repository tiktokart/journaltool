
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
}

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
}

export const WellbeingResources = ({ embeddingPoints }: WellbeingResourcesProps) => {
  const { t } = useLanguage();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [averageSentiment, setAverageSentiment] = useState<number>(0);
  const [needsSupport, setNeedsSupport] = useState<boolean>(false);
  const [emotionalTones, setEmotionalTones] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!embeddingPoints || embeddingPoints.length === 0) return;
    
    // Calculate average sentiment
    let sentimentTotal = 0;
    embeddingPoints.forEach(point => {
      sentimentTotal += point.sentiment;
    });
    const avgSentiment = sentimentTotal / embeddingPoints.length;
    setAverageSentiment(avgSentiment);
    
    // Identify if support is needed
    setNeedsSupport(avgSentiment < 0.4);
    
    // Count emotional tones
    const emotions = new Map<string, number>();
    embeddingPoints.forEach(point => {
      if (point.emotionalTone) {
        const count = emotions.get(point.emotionalTone) || 0;
        emotions.set(point.emotionalTone, count + 1);
      }
    });
    setEmotionalTones(emotions);
    
    // Generate resources based on emotional tones and sentiment
    const suggestedResources: ResourceItem[] = [];
    
    if (avgSentiment < 0.3) {
      suggestedResources.push({
        title: "Immediate Support Resources",
        description: "If you're feeling overwhelmed, talking with someone can help. Crisis lines provide immediate support.",
        tags: ["crisis", "support", "immediate"],
        link: "https://988lifeline.org/"
      });
    }
    
    if (emotions.has("Sadness") || emotions.has("Fear")) {
      suggestedResources.push({
        title: "Managing Difficult Emotions",
        description: "Techniques like deep breathing, mindfulness, and gentle movement can help regulate emotions.",
        tags: ["self-care", "emotions", "regulation"],
      });
    }
    
    if (emotions.has("Anger")) {
      suggestedResources.push({
        title: "Healthy Expression of Anger",
        description: "Learn to recognize anger triggers and develop constructive ways to express and channel anger.",
        tags: ["anger", "management", "expression"],
      });
    }
    
    // Add general wellness resources
    suggestedResources.push({
      title: "Daily Wellness Practices",
      description: "Small daily habits like walking outdoors, quality sleep, and connecting with others can improve wellbeing.",
      tags: ["wellness", "habits", "daily"],
    });
    
    setResources(suggestedResources);
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
          
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((resource, index) => (
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
        </CardContent>
      </Card>
    </div>
  );
};
