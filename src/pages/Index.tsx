
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
import { BarChart as RecBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

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

  // MHA mental health statistics data for the bar chart
  const mentalHealthData = [
    { state: "Hawaii", rank: 1, accessRank: 15, prevalenceRank: 1, value: 85.7 },
    { state: "Massachusetts", rank: 2, accessRank: 1, prevalenceRank: 9, value: 83.8 },
    { state: "Minnesota", rank: 3, accessRank: 4, prevalenceRank: 4, value: 82.3 },
    { state: "Utah", rank: 4, accessRank: 7, prevalenceRank: 6, value: 81.4 },
    { state: "New York", rank: 5, accessRank: 2, prevalenceRank: 16, value: 80.1 },
    { state: "Washington", rank: 6, accessRank: 14, prevalenceRank: 2, value: 79.8 },
    { state: "District of Columbia", rank: 7, accessRank: 3, prevalenceRank: 28, value: 79.2 },
    { state: "Maryland", rank: 8, accessRank: 5, prevalenceRank: 21, value: 78.9 },
    { state: "New Jersey", rank: 9, accessRank: 10, prevalenceRank: 12, value: 78.5 },
    { state: "Illinois", rank: 10, accessRank: 9, prevalenceRank: 18, value: 77.8 }
  ];

  // Color function for the states
  const getStateColor = (index: number) => {
    const colors = [
      "#27AE60", // Green for top ranks
      "#3498DB", // Blue for middle ranks
      "#E74C3C"  // Red for bottom ranks
    ];
    
    if (index < 3) return colors[0];
    if (index < 7) return colors[1];
    return colors[2];
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
          <Card className="border-0 shadow-md" style={{ backgroundColor: "#DFC5FE" }}>
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
          
          <Card className="border-0 shadow-md" style={{ backgroundColor: "#DFC5FE" }}>
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
          
          <Card className="border-0 shadow-md" style={{ backgroundColor: "#DFC5FE" }}>
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
            <Card className="border-0 shadow-md" style={{ backgroundColor: "#DFC5FE" }}>
              <CardHeader>
                <CardTitle className="text-black">Mental Health America's State Rankings 2023</CardTitle>
                <p className="text-sm text-black">Top 10 states with best mental health outcomes and access to care</p>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RecBarChart
                      data={mentalHealthData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="state" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        label={{ value: 'Overall Mental Health Score', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `Score: ${value}`,
                          `Rank: ${props.payload.rank}`
                        ]}
                        labelFormatter={(label) => `State: ${label}`}
                        contentStyle={{ 
                          borderRadius: '0.5rem',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        content={() => (
                          <div className="flex justify-center mt-2 text-xs">
                            <div className="flex items-center mx-2">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                              <span>Top Tier (1-3)</span>
                            </div>
                            <div className="flex items-center mx-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                              <span>Mid Tier (4-7)</span>
                            </div>
                            <div className="flex items-center mx-2">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                              <span>Lower Tier (8-10)</span>
                            </div>
                          </div>
                        )}
                      />
                      <Bar dataKey="value" name="Mental Health Score">
                        {mentalHealthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStateColor(index)} />
                        ))}
                      </Bar>
                    </RecBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-center text-black">
                  <p>Data from Mental Health America's State and County Dashboard 2023</p>
                  <p className="mt-2">This data represents overall mental health rankings which combine measures of prevalence and access to care.</p>
                </div>
              </CardContent>
            </Card>
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
              <div className="h-[500px] w-full" style={{ backgroundColor: "#DFC5FE" }}>
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
          <div className="bg-light-lavender p-4 rounded-lg">
            <WordComparisonController 
              points={points}
              selectedPoint={selectedPoint}
              calculateRelationship={calculateRelationship}
              sourceDescription="Demo comparison using sample data"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
