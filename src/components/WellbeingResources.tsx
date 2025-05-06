
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, BookOpen, Sparkles, UserRound, Plus, Minus, ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ResourceItem {
  title: string;
  description: string;
  category: string;
  benefit: string;
  source: string;
  forEmotions: string[];
  steps?: string[];
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
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

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

  const toggleSteps = (resourceTitle: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [resourceTitle]: !prev[resourceTitle]
    }));
  };

  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <HeartPulse className="h-5 w-5 mr-2 text-primary" />
            {t("Resources and Support")}
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
          {t("Wellbeing Suggestions")}
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-4 w-full flex justify-start overflow-x-auto">
              <TabsTrigger value="all">{t("All Categories")}</TabsTrigger>
              <TabsTrigger value="mental">{t("Mental Wellbeing")}</TabsTrigger>
              <TabsTrigger value="physical">{t("Physical Health")}</TabsTrigger>
              <TabsTrigger value="social">{t("Social Connection")}</TabsTrigger>
              <TabsTrigger value="professional">{t("Professional Development")}</TabsTrigger>
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
                            <span className="font-medium">{t("Benefit")}:</span> {resource.benefit}
                          </div>
                          
                          {resource.steps && resource.steps.length > 0 && (
                            <Collapsible 
                              open={expandedSteps[resource.title]} 
                              onOpenChange={() => toggleSteps(resource.title)}
                              className="border rounded-md p-2 mt-2"
                            >
                              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                                <span>Implementation Steps</span>
                                {expandedSteps[resource.title] ? 
                                  <ChevronDown className="h-4 w-4" /> : 
                                  <ChevronRight className="h-4 w-4" />
                                }
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pt-2">
                                <ol className="list-decimal pl-5 text-xs space-y-1">
                                  {resource.steps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ol>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs font-medium mr-1">Recommended for:</span>
                            {resource.forEmotions.map(emotion => (
                              <Badge key={emotion} variant="outline" className="text-xs">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                          
                          <Separator className="my-2" />
                          
                          <div className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">{t("Source")}:</span> {resource.source}
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
    forEmotions: ["Anxiety", "Stress", "Fear", "Sadness"],
    steps: [
      "Find a quiet place where you won't be disturbed for 10-15 minutes.",
      "Sit comfortably with your back straight and eyes closed or with a soft gaze.",
      "Focus your attention on your breath, noticing the sensation of inhaling and exhaling.",
      "When your mind wanders (which is natural), gently bring your attention back to your breath.",
      "Practice regularly, starting with 5 minutes and gradually increasing to 20 minutes per day."
    ]
  },
  {
    title: "Physical Exercise Routine",
    description: "Engage in regular physical activity, such as walking, running, swimming, or cycling, for at least 30 minutes most days of the week.",
    category: "physical",
    benefit: "Releases endorphins that boost mood, reduces stress hormones, and improves overall mental health.",
    source: "World Health Organization",
    forEmotions: ["Depression", "Sadness", "Lethargy", "Anger"],
    steps: [
      "Choose activities you enjoy to increase likelihood of consistency.",
      "Start with 10-15 minutes daily if you're new to exercise.",
      "Gradually increase duration and intensity over several weeks.",
      "Include a mix of cardio, strength training, and flexibility exercises.",
      "Schedule workouts at the same time each day to build a habit."
    ]
  },
  {
    title: "Social Connection Practices",
    description: "Schedule regular check-ins with friends and family, join community groups, or volunteer for causes that matter to you.",
    category: "social",
    benefit: "Strengthens sense of belonging, provides emotional support, and reduces feelings of isolation.",
    source: "Harvard Study of Adult Development",
    forEmotions: ["Loneliness", "Sadness", "Anxiety", "Fear"],
    steps: [
      "Identify 3-5 people you feel comfortable connecting with regularly.",
      "Schedule weekly or biweekly check-ins via call, text, or in-person meetups.",
      "Join a club, class, or group based on your interests or hobbies.",
      "Practice active listening in conversations (focus fully, ask questions).",
      "Consider volunteering for a cause you care about to meet like-minded people."
    ]
  },
  {
    title: "Cognitive Behavioral Techniques",
    description: "Learn to identify negative thought patterns and replace them with more balanced, realistic perspectives.",
    category: "mental",
    benefit: "Helps manage depression, anxiety, and negative emotions by changing harmful thought patterns.",
    source: "National Institute of Mental Health",
    forEmotions: ["Depression", "Anxiety", "Sadness", "Fear"],
    steps: [
      "Identify negative or distorted thoughts when they occur.",
      "Question the evidence for these thoughts: 'What facts support or contradict this thought?'",
      "Consider alternative explanations or perspectives for the situation.",
      "Develop more balanced, realistic thoughts based on evidence.",
      "Practice this process regularly, perhaps using a thought journal."
    ]
  },
  {
    title: "Journaling Practice",
    description: "Spend 15-20 minutes each day writing about your thoughts, feelings, and experiences in a private journal.",
    category: "mental",
    benefit: "Provides emotional release, improves self-awareness, and helps process complex feelings.",
    source: "University of Rochester Medical Center",
    forEmotions: ["Confusion", "Sadness", "Anger", "Anxiety"],
    steps: [
      "Set aside 15-20 minutes daily, preferably at the same time each day.",
      "Write freely without worrying about grammar, spelling, or structure.",
      "Try specific prompts like 'How am I feeling today?' or 'What's been on my mind?'",
      "Notice patterns in your thoughts and feelings over time.",
      "Review entries periodically to gain insights about yourself."
    ]
  },
  {
    title: "Sleep Hygiene Improvement",
    description: "Establish a consistent sleep schedule, create a restful environment, and avoid screens before bedtime.",
    category: "physical",
    benefit: "Improves mood regulation, cognitive function, and emotional resilience.",
    source: "National Sleep Foundation",
    forEmotions: ["Irritability", "Anxiety", "Stress", "Fatigue"],
    steps: [
      "Go to bed and wake up at the same time every day, even on weekends.",
      "Create a cool, dark, quiet sleeping environment.",
      "Avoid screens (phones, tablets, TV) for at least 1 hour before bedtime.",
      "Establish a relaxing pre-sleep routine (reading, gentle stretching, bath).",
      "Limit caffeine and alcohol, especially in the hours before bedtime."
    ]
  },
  {
    title: "Gratitude Practice",
    description: "Daily reflection on three things you're grateful for, writing thank you notes, or keeping a gratitude journal.",
    category: "mental",
    benefit: "Shifts focus from negative to positive aspects of life, improving overall mood and outlook.",
    source: "Positive Psychology Research",
    forEmotions: ["Sadness", "Pessimism", "Dissatisfaction"],
    steps: [
      "Each evening, write down three specific things you're grateful for that day.",
      "Include details about why these things matter to you.",
      "Occasionally write thank-you notes to people who've positively impacted you.",
      "Notice small daily pleasures or 'micro-moments' of joy.",
      "When facing challenges, try to identify any positive aspects or growth opportunities."
    ]
  },
  {
    title: "Nature Exposure",
    description: "Spend time in natural settings like parks, forests, or beaches for at least 2 hours per week.",
    category: "physical",
    benefit: "Reduces stress, improves mood, and restores mental energy.",
    source: "Environmental Psychology Studies",
    forEmotions: ["Stress", "Anxiety", "Depression", "Fatigue"],
    steps: [
      "Identify accessible natural spaces near your home or workplace.",
      "Schedule at least 2-3 short nature visits each week.",
      "Practice mindful awareness during these visits (notice sounds, smells, textures).",
      "Consider 'forest bathing' - slow, mindful walks in wooded areas.",
      "Bring elements of nature indoors with plants, natural materials, or nature sounds."
    ]
  },
  {
    title: "Professional Development Goals",
    description: "Set specific, achievable goals for skill development, learning, or career advancement.",
    category: "professional",
    benefit: "Provides sense of purpose, achievement, and growth mindset.",
    source: "Career Development Research",
    forEmotions: ["Stagnation", "Dissatisfaction", "Uncertainty"],
    steps: [
      "Identify 1-3 specific skills or knowledge areas to develop.",
      "Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).",
      "Break larger goals into small, manageable steps with deadlines.",
      "Seek resources like courses, mentors, or books to support learning.",
      "Schedule regular time for skill development and track your progress."
    ]
  },
  {
    title: "Creative Expression",
    description: "Engage in artistic pursuits like drawing, painting, music, dance, or writing without focusing on the end result.",
    category: "mental",
    benefit: "Provides emotional outlet, improves self-expression, and reduces stress.",
    source: "Art Therapy Association",
    forEmotions: ["Frustration", "Sadness", "Anger", "Confusion"],
    steps: [
      "Experiment with different creative activities to find what appeals to you.",
      "Focus on the process rather than the result - creativity is for you, not critics.",
      "Schedule regular time for creative expression, even just 15-30 minutes.",
      "Consider guided activities (like adult coloring books) if facing creative blocks.",
      "Join a community class or online group to stay motivated and inspired."
    ]
  },
  {
    title: "Nutrition Improvement",
    description: "Include more whole foods, fruits, vegetables, and omega-3 fatty acids in your diet while reducing processed foods and sugar.",
    category: "physical",
    benefit: "Supports brain health, stabilizes mood, and improves energy levels.",
    source: "Nutritional Psychiatry Research",
    forEmotions: ["Mood Swings", "Irritability", "Fatigue"],
    steps: [
      "Gradually increase consumption of fruits, vegetables, whole grains, and lean proteins.",
      "Include foods rich in omega-3s (fatty fish, walnuts, flaxseeds) regularly.",
      "Prepare more meals at home to control ingredients and processing.",
      "Stay hydrated by drinking water throughout the day.",
      "Practice mindful eating by paying attention to hunger cues and eating slowly."
    ]
  },
  {
    title: "Limiting Social Media Use",
    description: "Set specific times for checking social media and use apps or settings to limit screen time.",
    category: "social",
    benefit: "Reduces comparison thinking, FOMO, and improves present-moment attention.",
    source: "Digital Wellness Studies",
    forEmotions: ["Anxiety", "Inadequacy", "Distraction"],
    steps: [
      "Track your current social media usage with screen time apps.",
      "Set specific times for checking platforms (e.g., 15 minutes in morning and evening).",
      "Remove social media apps from your phone home screen.",
      "Use app blockers or built-in time limit features.",
      "Create phone-free zones or times, especially during meals and before bed."
    ]
  },
  {
    title: "Progressive Muscle Relaxation",
    description: "Systematically tense and then release different muscle groups throughout the body to reduce physical tension.",
    category: "physical",
    benefit: "Alleviates physical symptoms of stress and anxiety while promoting bodily awareness.",
    source: "Anxiety and Depression Association",
    forEmotions: ["Tension", "Anxiety", "Stress", "Fear"],
    steps: [
      "Find a quiet place and sit or lie down comfortably.",
      "Starting with your feet, tense each muscle group for 5-10 seconds.",
      "Release the tension suddenly, and notice the feeling of relaxation for 10-20 seconds.",
      "Progress upward through the body: legs, abdomen, chest, arms, shoulders, neck, face.",
      "Practice daily for at least 10 minutes, especially before stressful events."
    ]
  },
  {
    title: "Volunteer Work",
    description: "Regularly contribute time to causes that align with your values and interests.",
    category: "social",
    benefit: "Creates sense of purpose, perspective, and community connection.",
    source: "Community Psychology Research",
    forEmotions: ["Isolation", "Meaninglessness", "Sadness"],
    steps: [
      "Identify causes or issues you feel passionate about.",
      "Research local organizations that address these issues.",
      "Start with a small commitment (2-4 hours monthly) and increase as desired.",
      "Consider skills-based volunteering that uses your professional expertise.",
      "Reflect on your volunteer experiences to reinforce the meaning and connection."
    ]
  },
  {
    title: "Work-Life Boundaries",
    description: "Establish clear separation between work and personal time, including digital boundaries.",
    category: "professional",
    benefit: "Prevents burnout, improves recovery, and enhances presence in non-work activities.",
    source: "Organizational Psychology Studies",
    forEmotions: ["Stress", "Exhaustion", "Resentment"],
    steps: [
      "Set clear working hours and communicate them to colleagues.",
      "Create physical separation between work and relaxation spaces at home.",
      "Establish rituals to transition between work and personal time.",
      "Turn off notifications for work communications during non-work hours.",
      "Schedule personal activities and treat them with the same importance as work meetings."
    ]
  }
];
