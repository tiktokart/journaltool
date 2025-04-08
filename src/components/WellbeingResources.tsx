
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Wellbeing suggestions data
const wellbeingSuggestions = [
  {
    title: "Practice Mindfulness",
    description: "Spend 5-10 minutes each day focusing on your breath and being present in the moment.",
    category: "Meditation",
    benefit: "Reduces stress and anxiety, improves focus and emotional regulation."
  },
  {
    title: "Connect with Others",
    description: "Reach out to a friend or family member you haven't spoken to in a while.",
    category: "Social Connection",
    benefit: "Strengthens relationships, reduces feelings of isolation."
  },
  {
    title: "Physical Activity",
    description: "Take a 20-minute walk outdoors or do a short home workout.",
    category: "Exercise",
    benefit: "Boosts mood, improves energy levels and overall health."
  },
  {
    title: "Digital Detox",
    description: "Set aside 1-2 hours before bed as screen-free time.",
    category: "Lifestyle",
    benefit: "Improves sleep quality and reduces mental fatigue."
  },
  {
    title: "Gratitude Practice",
    description: "Write down three things you're grateful for before going to sleep.",
    category: "Reflection",
    benefit: "Shifts focus to positive aspects of life, improves outlook."
  }
];

// Mental health resources data
const mentalHealthResources = [
  {
    name: "Crisis Text Line",
    description: "Text HOME to 741741 to connect with a Crisis Counselor",
    category: "Crisis Support",
    contact: "Text 741741",
    website: "crisistextline.org"
  },
  {
    name: "National Suicide Prevention Lifeline",
    description: "24/7, free and confidential support for people in distress",
    category: "Crisis Support",
    contact: "1-800-273-8255",
    website: "suicidepreventionlifeline.org"
  },
  {
    name: "Psychology Today Therapist Finder",
    description: "Find therapists and counselors near you",
    category: "Professional Help",
    website: "psychologytoday.com/us/therapists"
  },
  {
    name: "Headspace",
    description: "Guided meditation and mindfulness app",
    category: "Self-help Apps",
    website: "headspace.com"
  },
  {
    name: "MoodTools",
    description: "Free app designed to help you combat depression and alleviate your negative moods",
    category: "Self-help Apps",
    website: "moodtools.org"
  }
];

export const WellbeingResources = () => {
  const [resourcesTab, setResourcesTab] = useState("wellbeing");
  const { t } = useLanguage();

  return (
    <Card className="border border-border shadow-md bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Heart className="h-5 w-5 mr-2 text-primary" />
          {t("resourcesAndSupport")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={resourcesTab} onValueChange={setResourcesTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="wellbeing">{t("wellbeingSuggestions")}</TabsTrigger>
            <TabsTrigger value="resources">{t("mentalHealthResources")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wellbeing">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {wellbeingSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 bg-card/50"
                >
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {suggestion.category}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-lg">{suggestion.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">{suggestion.description}</p>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <strong>{t("benefit")}:</strong> {suggestion.benefit}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="resources">
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              {mentalHealthResources.map((resource, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 bg-card/50"
                >
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {resource.category}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-lg">{resource.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">{resource.description}</p>
                  {resource.contact && (
                    <p className="text-sm mt-2">
                      <strong>{t("contact")}:</strong> {resource.contact}
                    </p>
                  )}
                  <p className="text-sm mt-2">
                    <strong>{t("website")}:</strong> {resource.website}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-sm text-center text-muted-foreground">
              <div className="flex items-center justify-center">
                <Info className="h-4 w-4 mr-1" />
                {t("resourcesDisclaimer")}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
