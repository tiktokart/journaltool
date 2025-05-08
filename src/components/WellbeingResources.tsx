
// This is a new file that will override the read-only file's implementation

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
}

export const WellbeingResources = ({ embeddingPoints }: WellbeingResourcesProps) => {
  const { t } = useLanguage();
  const [resources, setResources] = useState<{ title: string; description: string; link: string }[]>([]);
  
  useEffect(() => {
    if (!embeddingPoints || embeddingPoints.length === 0) {
      // Default resources when no data is available
      setResources([
        {
          title: "Mindfulness Meditation",
          description: "Regular mindfulness practice can help reduce stress and anxiety",
          link: "https://www.mindful.org/meditation/mindfulness-getting-started/"
        },
        {
          title: "Positive Psychology Exercises",
          description: "Activities that promote positive emotions and wellbeing",
          link: "https://positivepsychology.com/positive-psychology-exercises/"
        },
        {
          title: "Stress Management Techniques",
          description: "Learn effective ways to manage daily stress",
          link: "https://www.helpguide.org/articles/stress/stress-management.htm"
        }
      ]);
      return;
    }
    
    // Analyze the embedding points for emotional content to suggest targeted resources
    const emotionalGroups = embeddingPoints.reduce((acc: {[key: string]: number}, point: Point) => {
      const emotion = point.emotionalTone || "Neutral";
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    
    // Sort by most prevalent emotions
    const sortedEmotions = Object.entries(emotionalGroups)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion);
    
    const selectedResources: { title: string; description: string; link: string }[] = [];
    
    // Add specific resources based on prevalent emotions
    if (sortedEmotions.includes("Sadness") || sortedEmotions.includes("Fear") || sortedEmotions.includes("Anger")) {
      selectedResources.push({
        title: "Coping with Difficult Emotions",
        description: "Strategies for managing sadness, fear, and anger",
        link: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/emotions/"
      });
    }
    
    if (sortedEmotions.includes("Anxiety") || sortedEmotions.includes("Fear")) {
      selectedResources.push({
        title: "Anxiety Self-Help Guide",
        description: "Practical tools for reducing anxiety and worry",
        link: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/depression-anxiety-self-assessment-quiz/"
      });
    }
    
    // Add mindfulness as a universally helpful resource
    selectedResources.push({
      title: "Mindfulness Techniques",
      description: "Simple practices to stay grounded in the present moment",
      link: "https://www.mindful.org/meditation/mindfulness-getting-started/"
    });
    
    // Add positive psychology resource
    selectedResources.push({
      title: "Positive Journal Prompts",
      description: "Journal prompts to cultivate gratitude and positive emotions",
      link: "https://positivepsychology.com/gratitude-journal/"
    });
    
    // Ensure we always show at least 3 resources
    if (selectedResources.length < 3) {
      selectedResources.push({
        title: "General Wellbeing Resources",
        description: "Tools and techniques for improving your overall wellbeing",
        link: "https://www.helpguide.org/articles/mental-health/building-better-mental-health.htm"
      });
    }
    
    setResources(selectedResources);
  }, [embeddingPoints]);
  
  return (
    <Card className="border border-border shadow-md bg-light-lavender">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-orange">
          <LifeBuoy className="h-5 w-5 mr-2 text-orange" />
          Resources and Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-black mb-4">
          {t("basedOnYourWriting")}
        </p>
        
        <div className="grid gap-4 md:grid-cols-3">
          {resources.map((resource, index) => (
            <Card key={index} className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-black">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-black mb-2">{resource.description}</p>
                <a 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange hover:text-orange/80 text-sm font-medium"
                >
                  {t("learnMore")} →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
