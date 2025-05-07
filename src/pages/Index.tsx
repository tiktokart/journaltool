
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Flower, Target, Book, BarChart, GitCompareArrows } from "lucide-react";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { SentimentOverview } from "@/components/SentimentOverview";
import { WordComparisonController } from "@/components/WordComparisonController";
import { generateMockPoints } from "@/utils/embeddingUtils";
import { useState, useEffect } from "react";
import { Point } from "@/types/embedding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Index() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [showMHAStats, setShowMHAStats] = useState(false);

  useEffect(() => {
    // Generate mock data for the visualization
    const mockPoints = generateMockPoints(true);
    setPoints(mockPoints);
  }, []);

  // Mock data for sentiment overview
  const mockSentimentData = {
    overallSentiment: {
      score: 0.72,
      label: "Positive",
    },
    distribution: {
      positive: 65,
      neutral: 25,
      negative: 10,
    },
  };
  
  // Mock data for Mental Health America statistics
  const mhaStatisticsData = {
    overallSentiment: {
      score: 0.48,
      label: "Neutral",
    },
    distribution: {
      positive: 34, // Access to care data
      neutral: 42, // Adults with mental illness data
      negative: 24, // Youth with severe depression data
    },
  };

  // Function to calculate relationship between points for demonstration
  const calculateRelationship = (point1: Point, point2: Point) => {
    return {
      spatialSimilarity: Math.random() * 0.6 + 0.2, // Random value between 0.2 and 0.8
      sentimentSimilarity: Math.abs(point1.sentiment - point2.sentiment) > 0.3 ? 0.3 : 0.7,
      sameEmotionalGroup: point1.emotionalTone === point2.emotionalTone,
      sharedKeywords: ['writing', 'analysis'],
    };
  };

  return (
    <div className="min-h-screen bg-yellow">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-6 text-black">Welcome to Your Life Planner</h1>
          <p className="text-xl mb-8 text-black">
            Plan your perfect life, analyze your thoughts, and track your emotional well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-purple hover:bg-purple-dark text-black">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Feature highlights with icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-md bg-light-lavender">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-black">
                <Target className="h-5 w-5 mr-2 text-purple" />
                {t("emotionalInsights")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black">
                {t("emotionalInsightsDescription")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-light-lavender">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-black">
                <Book className="h-5 w-5 mr-2 text-purple" />
                {t("journalTracker")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black">
                {t("journalTrackerDescription")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-light-lavender">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-black">
                <BarChart className="h-5 w-5 mr-2 text-purple" />
                {t("sentimentAnalysis")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black">
                {t("sentimentAnalysisDescription")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mental Health Statistics */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-black">
              Mental Health Insights
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setShowMHAStats(!showMHAStats)}
              className="bg-light-lavender text-orange border-orange"
            >
              {showMHAStats ? "Show Demo Data" : "Show MHA Statistics"}
            </Button>
          </div>
          
          {showMHAStats ? (
            <SentimentOverview 
              data={mhaStatisticsData} 
              sourceDescription="Data from Mental Health America's State and County Dashboard" 
            />
          ) : (
            <SentimentOverview 
              data={mockSentimentData} 
              sourceDescription="Demo data for illustration purposes" 
            />
          )}
        </div>

        {/* 3D Visualization */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-black">
            Interactive Visualization
          </h2>
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[500px] w-full bg-light-lavender">
                <DocumentEmbedding 
                  points={points}
                  onPointClick={setSelectedPoint}
                  isInteractive={true}
                  depressedJournalReference={false}
                  sourceDescription="Demo visualization using sample data"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Word Comparison */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-black flex items-center justify-center">
            <GitCompareArrows className="h-6 w-6 mr-2 text-purple" />
            Word Comparison
          </h2>
          <WordComparisonController 
            points={points}
            selectedPoint={selectedPoint}
            calculateRelationship={calculateRelationship}
            sourceDescription="Demo comparison using sample data"
          />
        </div>
      </div>
    </div>
  );
}
