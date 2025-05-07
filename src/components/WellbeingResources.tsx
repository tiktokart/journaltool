
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, HelpCircle, Mail, Link as LinkIcon } from "lucide-react";
import { Point } from "@/types/embedding";
import { useLanguage } from "@/contexts/LanguageContext";

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
}

export function WellbeingResources({ embeddingPoints = [] }: WellbeingResourcesProps) {
  const { t } = useLanguage();
  const [dominantEmotions, setDominantEmotions] = useState<{ emotion: string; count: number }[]>([]);

  useEffect(() => {
    if (!embeddingPoints || embeddingPoints.length === 0) return;

    // Count emotions
    const emotionCounts: Record<string, number> = {};
    let totalPoints = 0;

    embeddingPoints.forEach(point => {
      if (point.emotionalTone) {
        emotionCounts[point.emotionalTone] = (emotionCounts[point.emotionalTone] || 0) + 1;
        totalPoints++;
      }
    });

    // Convert to array and sort
    const emotionsArray = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: totalPoints > 0 ? (count / totalPoints) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);  // Get top 3 emotions

    setDominantEmotions(emotionsArray);
  }, [embeddingPoints]);

  const getResourcesForEmotion = (emotion: string): { title: string; description: string; link?: string }[] => {
    // Simplified mapping of emotions to wellbeing resources
    const emotionResourceMap: Record<string, { title: string; description: string; link?: string }[]> = {
      "Anger": [
        {
          title: "Anger Management Techniques",
          description: "Practice deep breathing, take a timeout, and identify possible solutions."
        },
        {
          title: "Physical Activity",
          description: "Exercise releases tension and improves mood."
        }
      ],
      "Sadness": [
        {
          title: "Reach Out to Friends",
          description: "Social connections can help lift your spirits."
        },
        {
          title: "Self-Care Activities",
          description: "Do things that bring you joy and comfort."
        }
      ],
      "Fear": [
        {
          title: "Grounding Techniques",
          description: "Practice the 5-4-3-2-1 method: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste."
        },
        {
          title: "Challenge Negative Thoughts",
          description: "Question the evidence for your fears and consider alternative perspectives."
        }
      ],
      "Joy": [
        {
          title: "Gratitude Practice",
          description: "Keep a gratitude journal to maintain positive feelings."
        },
        {
          title: "Share Your Happiness",
          description: "Spread joy by sharing positive experiences with others."
        }
      ],
      "Surprise": [
        {
          title: "Journal About Unexpected Events",
          description: "Reflect on how surprises impact your perspective."
        },
        {
          title: "Embrace Spontaneity",
          description: "Occasionally do something unplanned to keep life interesting."
        }
      ],
      "Disgust": [
        {
          title: "Mindfulness Meditation",
          description: "Practice non-judgmental awareness of your thoughts and feelings."
        },
        {
          title: "Reframe Your Perspective",
          description: "Look for alternative viewpoints about what's bothering you."
        }
      ],
      "Trust": [
        {
          title: "Set Healthy Boundaries",
          description: "Maintain trust through clear communication and boundaries."
        },
        {
          title: "Build Trust Gradually",
          description: "Remember that trust takes time to develop fully."
        }
      ],
      "Anticipation": [
        {
          title: "Plan Something to Look Forward To",
          description: "Create future events that excite you."
        },
        {
          title: "Balance Planning with Presence",
          description: "While anticipating the future, remember to enjoy the present moment."
        }
      ],
      "Neutral": [
        {
          title: "Explore New Interests",
          description: "Try something new to spark emotion and engagement."
        },
        {
          title: "Connect with Nature",
          description: "Spending time outdoors can improve mood and wellbeing."
        }
      ]
    };

    return emotionResourceMap[emotion] || emotionResourceMap["Neutral"];
  };

  const flattenedResources = dominantEmotions.flatMap(({ emotion }) => 
    getResourcesForEmotion(emotion).map(resource => ({
      ...resource,
      emotion
    }))
  );

  if (dominantEmotions.length === 0) {
    return (
      <Card className="border border-border shadow-md bg-light-lavender">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-black">
            <Heart className="h-5 w-5 mr-2 text-primary" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">{t("Analysis needed for personalized suggestions")}</p>
          <Button className="mt-4 bg-orange text-white hover:bg-orange/90">
            {t("Start Analysis")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-md bg-light-lavender">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-black">
          <Heart className="h-5 w-5 mr-2 text-primary" />
          Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flattenedResources.slice(0, 4).map((resource, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg bg-white/30 border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <h3 className="font-medium text-black">{resource.title}</h3>
                </div>
                <p className="text-sm text-black">{resource.description}</p>
                {resource.link && (
                  <a 
                    href={resource.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 text-xs flex items-center text-primary hover:underline"
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    Learn more
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" className="text-sm border-orange text-orange hover:bg-orange/10">
              {t("Show More Resources")}
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-sm text-black">
              <p className="mb-2 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                {t("Need professional support?")}
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange text-orange hover:bg-orange/10 w-full justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t("Find a therapist near you")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange text-orange hover:bg-orange/10 w-full justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t("Contact support team")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
