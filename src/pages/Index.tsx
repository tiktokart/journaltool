
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/FileUploader";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { WordComparisonController } from "@/components/WordComparisonController";

// Generate 20 points with random positions and words
const generateDemoPoints = () => {
  const points = [];
  const emotions = ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Trust", "Anticipation", "Neutral"];
  const words = [
    "happy", "garden", "sunlight", "energized", "roses", "bloom", "joy",
    "difficult", "conversation", "colleague", "anxious", "positive", "tomorrow",
    "book", "read", "air", "fresh", "noticed", "always", "trying"
  ];

  for (let i = 0; i < words.length; i++) {
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    // Assign sentiments based on emotions
    let sentiment = 0.5; // neutral default
    if (emotion === "Joy" || emotion === "Trust" || emotion === "Anticipation") {
      sentiment = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
    } else if (emotion === "Sadness" || emotion === "Anger" || emotion === "Fear") {
      sentiment = Math.random() * 0.4; // 0.0 to 0.4
    } else {
      sentiment = 0.4 + Math.random() * 0.2; // 0.4 to 0.6
    }

    points.push({
      id: i.toString(),
      word: words[i],
      color: [Math.random(), Math.random(), Math.random()],
      position: [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1],
      sentiment,
      emotionalTone: emotion,
      keywords: ["example", "demo"],
    });
  }
  return points;
};

const Index = () => {
  const { t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [demoPoints] = useState(generateDemoPoints());
  const navigate = useNavigate();

  const handleAnalyzeExample = () => {
    setIsAnalyzing(true);
    // Simulate loading for the demo
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate("/dashboard");
      toast.success("Example journal analyzed successfully!");
    }, 1500);
  };

  const calculateDemoRelationship = (point1, point2) => {
    // Simple demo relationship calculation
    const spatialSimilarity = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
    const sentimentSimilarity = 1 - Math.abs(point1.sentiment - point2.sentiment);
    const sameEmotionalGroup = point1.emotionalTone === point2.emotionalTone;
    
    // Generate some random shared keywords
    const allKeywords = ["example", "demo", "emotion", "word", "analysis", "sentiment", "meaning"];
    const sharedCount = Math.floor(Math.random() * 3);
    const sharedKeywords = [];
    for (let i = 0; i < sharedCount; i++) {
      const randomIndex = Math.floor(Math.random() * allKeywords.length);
      if (!sharedKeywords.includes(allKeywords[randomIndex])) {
        sharedKeywords.push(allKeywords[randomIndex]);
      }
    }
    
    return {
      spatialSimilarity,
      sentimentSimilarity,
      sameEmotionalGroup,
      sharedKeywords
    };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight">
              {t("welcomeMessage")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("subTitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{t("uploadTitle")}</CardTitle>
                <CardDescription>
                  {t("uploadDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("journalEntryExample")}</CardTitle>
                <CardDescription>
                  {t("analyzeThisExample")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-md text-sm">
                  {t("journalEntryContent")}
                </div>
                <Button 
                  onClick={handleAnalyzeExample}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>{t("analyzingDocument")}</>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      {t("analyzeThisExample")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <WordComparisonController 
              points={demoPoints}
              selectedPoint={selectedPoint}
              calculateRelationship={calculateDemoRelationship}
              sourceDescription={t("documentWithName") + " " + t("journalEntryExample")}
            />
          </div>

          <div className="flex justify-center mt-10">
            <Button 
              onClick={() => navigate("/dashboard")} 
              size="lg"
              className="gap-2"
            >
              {t("viewDashboard")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
