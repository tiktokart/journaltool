
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, BookOpen, Sparkles, UserRound, Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ResourceItem {
  title: string;
  description: string;
  category: string;
  benefit: string;
  source: string;
  forEmotions: string[];
}

interface WellbeingResourcesProps {
  embeddingPoints?: Point[];
}

export const WellbeingResources = ({ embeddingPoints = [] }: WellbeingResourcesProps) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [dominantEmotions, setDominantEmotions] = useState<{name: string, percentage: number}[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!embeddingPoints || embeddingPoints.length === 0) {
      setFilteredResources(resources);
      setDominantEmotions([]);
      return;
    }

    // Analyze dominant emotions in the document
    const emotionCounts: Record<string, number> = {};
    let totalEmotions = 0;

    embeddingPoints.forEach(point => {
      if (point.emotionalTone && point.emotionalTone !== "Neutral") {
        emotionCounts[point.emotionalTone] = (emotionCounts[point.emotionalTone] || 0) + 1;
        totalEmotions++;
      }
    });

    // Convert counts to percentages and sort by frequency
    const emotionPercentages = Object.entries(emotionCounts)
      .map(([name, count]) => ({
        name,
        percentage: (count / totalEmotions) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Get significant negative emotions (over 15%)
    const significantNegativeEmotions = emotionPercentages
      .filter(emotion => 
        ["Sadness", "Fear", "Anger", "Disgust"].includes(emotion.name) && 
        emotion.percentage > 15
      )
      .map(emotion => emotion.name);

    // Log insights
    console.info("Document emotion percentages:", 
      Object.fromEntries(emotionPercentages.map(e => [e.name, e.percentage]))
    );
    console.info("Significant negative emotions:", significantNegativeEmotions);

    // Show top emotions
    setDominantEmotions(emotionPercentages.slice(0, 3));

    // Filter resources based on dominant emotions
    let emotionBasedResources = resources;
    
    if (significantNegativeEmotions.length > 0) {
      emotionBasedResources = resources.filter(resource => 
        resource.forEmotions.some(emotion => significantNegativeEmotions.includes(emotion))
      );
    }

    // Apply category filter if not "all"
    if (activeCategory !== "all") {
      emotionBasedResources = emotionBasedResources.filter(
        resource => resource.category === activeCategory
      );
    }

    setFilteredResources(emotionBasedResources);
  }, [embeddingPoints, activeCategory]);

  // Only show the component if there are embedding points available for analysis
  if (!embeddingPoints || embeddingPoints.length === 0) {
    return null;
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <HeartPulse className="h-5 w-5 mr-2 text-primary" />
            {t("resourcesAndSupport")}
          </CardTitle>
          <button 
            onClick={toggleExpand} 
            className="p-1 rounded-full hover:bg-muted"
            aria-label={isExpanded ? "Collapse resources" : "Expand resources"}
          >
            {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {dominantEmotions.map(emotion => (
            <Badge key={emotion.name} variant="outline" className="bg-muted">
              {emotion.name}: {Math.round(emotion.percentage)}%
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {t("wellbeingSuggestions")}
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-4 w-full flex justify-start overflow-x-auto">
              <TabsTrigger value="all">{t("allCategories")}</TabsTrigger>
              <TabsTrigger value="mental">{t("mentalWellbeing")}</TabsTrigger>
              <TabsTrigger value="physical">{t("physicalHealth")}</TabsTrigger>
              <TabsTrigger value="social">{t("socialConnection")}</TabsTrigger>
              <TabsTrigger value="professional">{t("professionalDevelopment")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              <div className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  {filteredResources.map((resource, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center">
                          <ResourceIcon category={resource.category} className="mr-2 h-4 w-4 text-primary" />
                          <span className="font-medium">{resource.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-2 space-y-3">
                          <p className="text-sm">{resource.description}</p>
                          
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">{t("benefit")}:</span> {resource.benefit}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resource.forEmotions.map(emotion => (
                              <Badge key={emotion} variant="outline" className="text-xs">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                          
                          <Separator className="my-2" />
                          
                          <div className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">{t("source")}:</span> {resource.source}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};

const ResourceIcon = ({ category, className }: { category: string; className?: string }) => {
  switch (category) {
    case "mental":
      return <Sparkles className={className} />;
    case "physical":
      return <HeartPulse className={className} />;
    case "social":
      return <UserRound className={className} />;
    case "professional":
      return <BookOpen className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

// Resources database
const resources: ResourceItem[] = [
  {
    title: "Mindfulness Meditation",
    description: "Practice focusing your attention on the present moment, acknowledging and accepting your feelings, thoughts, and bodily sensations without judgment.",
    category: "mental",
    benefit: "Reduces stress, anxiety, and emotional reactivity while improving focus and emotional regulation.",
    source: "American Psychological Association",
    forEmotions: ["Anxiety", "Stress", "Fear", "Sadness"]
  },
  {
    title: "Physical Exercise Routine",
    description: "Engage in regular physical activity, such as walking, running, swimming, or cycling, for at least 30 minutes most days of the week.",
    category: "physical",
    benefit: "Releases endorphins that boost mood, reduces stress hormones, and improves overall mental health.",
    source: "World Health Organization",
    forEmotions: ["Depression", "Sadness", "Lethargy", "Anger"]
  },
  {
    title: "Social Connection Practices",
    description: "Schedule regular check-ins with friends and family, join community groups, or volunteer for causes that matter to you.",
    category: "social",
    benefit: "Strengthens sense of belonging, provides emotional support, and reduces feelings of isolation.",
    source: "Harvard Study of Adult Development",
    forEmotions: ["Loneliness", "Sadness", "Anxiety", "Fear"]
  },
  {
    title: "Cognitive Behavioral Techniques",
    description: "Learn to identify negative thought patterns and replace them with more balanced, realistic perspectives.",
    category: "mental",
    benefit: "Helps manage depression, anxiety, and negative emotions by changing harmful thought patterns.",
    source: "National Institute of Mental Health",
    forEmotions: ["Depression", "Anxiety", "Sadness", "Fear"]
  },
  {
    title: "Journaling Practice",
    description: "Spend 15-20 minutes each day writing about your thoughts, feelings, and experiences in a private journal.",
    category: "mental",
    benefit: "Provides emotional release, improves self-awareness, and helps process complex feelings.",
    source: "University of Rochester Medical Center",
    forEmotions: ["Confusion", "Sadness", "Anger", "Anxiety"]
  },
  {
    title: "Sleep Hygiene Improvement",
    description: "Establish a consistent sleep schedule, create a restful environment, and avoid screens before bedtime.",
    category: "physical",
    benefit: "Improves mood regulation, cognitive function, and emotional resilience.",
    source: "National Sleep Foundation",
    forEmotions: ["Irritability", "Anxiety", "Stress", "Fatigue"]
  },
  {
    title: "Gratitude Practice",
    description: "Daily reflection on three things you're grateful for, writing thank you notes, or keeping a gratitude journal.",
    category: "mental",
    benefit: "Shifts focus from negative to positive aspects of life, improving overall mood and outlook.",
    source: "Positive Psychology Research",
    forEmotions: ["Sadness", "Pessimism", "Dissatisfaction"]
  },
  {
    title: "Nature Exposure",
    description: "Spend time in natural settings like parks, forests, or beaches for at least 2 hours per week.",
    category: "physical",
    benefit: "Reduces stress, improves mood, and restores mental energy.",
    source: "Environmental Psychology Studies",
    forEmotions: ["Stress", "Anxiety", "Depression", "Fatigue"]
  },
  {
    title: "Professional Development Goals",
    description: "Set specific, achievable goals for skill development, learning, or career advancement.",
    category: "professional",
    benefit: "Provides sense of purpose, achievement, and growth mindset.",
    source: "Career Development Research",
    forEmotions: ["Stagnation", "Dissatisfaction", "Uncertainty"]
  },
  {
    title: "Creative Expression",
    description: "Engage in artistic pursuits like drawing, painting, music, dance, or writing without focusing on the end result.",
    category: "mental",
    benefit: "Provides emotional outlet, improves self-expression, and reduces stress.",
    source: "Art Therapy Association",
    forEmotions: ["Frustration", "Sadness", "Anger", "Confusion"]
  },
  {
    title: "Nutrition Improvement",
    description: "Include more whole foods, fruits, vegetables, and omega-3 fatty acids in your diet while reducing processed foods and sugar.",
    category: "physical",
    benefit: "Supports brain health, stabilizes mood, and improves energy levels.",
    source: "Nutritional Psychiatry Research",
    forEmotions: ["Mood Swings", "Irritability", "Fatigue"]
  },
  {
    title: "Limiting Social Media Use",
    description: "Set specific times for checking social media and use apps or settings to limit screen time.",
    category: "social",
    benefit: "Reduces comparison thinking, FOMO, and improves present-moment attention.",
    source: "Digital Wellness Studies",
    forEmotions: ["Anxiety", "Inadequacy", "Distraction"]
  },
  {
    title: "Progressive Muscle Relaxation",
    description: "Systematically tense and then release different muscle groups throughout the body to reduce physical tension.",
    category: "physical",
    benefit: "Alleviates physical symptoms of stress and anxiety while promoting bodily awareness.",
    source: "Anxiety and Depression Association",
    forEmotions: ["Tension", "Anxiety", "Stress", "Fear"]
  },
  {
    title: "Volunteer Work",
    description: "Regularly contribute time to causes that align with your values and interests.",
    category: "social",
    benefit: "Creates sense of purpose, perspective, and community connection.",
    source: "Community Psychology Research",
    forEmotions: ["Isolation", "Meaninglessness", "Sadness"]
  },
  {
    title: "Work-Life Boundaries",
    description: "Establish clear separation between work and personal time, including digital boundaries.",
    category: "professional",
    benefit: "Prevents burnout, improves recovery, and enhances presence in non-work activities.",
    source: "Organizational Psychology Studies",
    forEmotions: ["Stress", "Exhaustion", "Resentment"]
  }
];
