
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Flower, Target, Book, BarChart, GitCompareArrows, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { SentimentOverview } from "@/components/SentimentOverview";
import { WordComparisonController } from "@/components/WordComparisonController";
import { generateMockPoints } from "@/utils/embeddingUtils";
import { useState, useEffect } from "react";
import { Point } from "@/types/embedding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart as RecBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DocumentSummary } from "@/components/DocumentSummary";

export default function Index() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [showMHAStats, setShowMHAStats] = useState(true); // Set to true to show MHA stats by default
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  useEffect(() => {
    // Generate mock data for the visualization
    const mockPoints = generateMockPoints(true);
    setPoints(mockPoints);
  }, []);

  // Updated mental health statistics data
  const mentalHealthStatistics = {
    overallSentiment: {
      score: 0.48,
      label: "Neutral",
    },
    distribution: {
      positive: 34,
      neutral: 42,
      negative: 24,
    },
  };

  // More comprehensive mental health data
  const mentalHealthData = [
    { category: "Adults with Mental Illness", value: 21, description: "1 in 5 adults experience mental illness each year" },
    { category: "Youth with Depression", value: 15, description: "15% of youth experienced a major depressive episode in the past year" },
    { category: "Treatment Access", value: 55, description: "Only 55% of adults with mental illness receive treatment" },
    { category: "Serious Mental Illness", value: 5.6, description: "5.6% of adults live with serious mental illness" },
    { category: "Suicide", value: 12.3, description: "Suicide is the 2nd leading cause of death among people aged 10-34" }
  ];

  // Sample panic attack description for the detailed analysis section
  const panicAttackSample = `
    I was sitting in my car waiting for a friend when suddenly my heart started racing. At first, I thought it was just the coffee I had earlier, but then this overwhelming sense of dread washed over me. My hands started tingling and I felt like I couldn't breathe properly. I was convinced I was having a heart attack. The world around me seemed to blur and I felt disconnected from reality. I tried to calm myself down by taking deep breaths, but it felt like I couldn't get enough air. I was terrified that I might pass out or lose control of myself in public. The feeling lasted about 15 minutes, but it felt like forever. Afterward, I was exhausted but also embarrassed, even though logically I know panic attacks aren't something to be ashamed of. I'm worried about when the next one might hit.
  `;

  // Function to calculate relationship between points for demonstration
  const calculateRelationship = (point1: Point, point2: Point) => {
    return {
      spatialSimilarity: Math.random() * 0.6 + 0.2, // Random value between 0.2 and 0.8
      sentimentSimilarity: Math.abs(point1.sentiment - point2.sentiment) > 0.3 ? 0.3 : 0.7,
      sameEmotionalGroup: point1.emotionalTone === point2.emotionalTone,
      sharedKeywords: ['writing', 'analysis'],
    };
  };

  // Sample analysis results
  const sampleAnalysisResults = {
    keyEmotions: ["Anxiety", "Fear", "Panic", "Helplessness", "Embarrassment"],
    dominantThemes: ["Physical symptoms", "Loss of control", "Catastrophizing", "Self-awareness"],
    linguisticMarkers: [
      { term: "suddenly", significance: "Indicates abrupt onset typical of panic attacks" },
      { term: "overwhelming", significance: "Shows intensity of emotional experience" },
      { term: "convinced I was having a heart attack", significance: "Common catastrophic misinterpretation in panic" },
      { term: "disconnected from reality", significance: "Indicates derealization symptoms" },
      { term: "worried about when the next one might hit", significance: "Shows anticipatory anxiety" }
    ],
    sentimentDistribution: {
      negative: 68,
      neutral: 24,
      positive: 8
    }
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
            <Button asChild size="lg" className="bg-orange hover:bg-orange-dark text-black">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Feature highlights with icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-black">
                <Target className="h-5 w-5 mr-2 text-orange" />
                Emotional Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black">
                Gain deep insights into your emotional patterns and understand what drives your feelings.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-black">
                <Book className="h-5 w-5 mr-2 text-orange" />
                Journal Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black">
                Track and analyze your daily thoughts through journaling to identify patterns and trends.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-black">
                <BarChart className="h-5 w-5 mr-2 text-orange" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black">
                Understand the sentiment behind your thoughts and track your emotional well-being over time.
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
          </div>
          
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-black">Mental Health Statistics</CardTitle>
              <p className="text-sm text-black">Key facts about mental health prevalence and impact on daily life</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RecBarChart
                      data={mentalHealthData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis 
                        dataKey="category" 
                        type="category" 
                        width={110}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{ 
                          borderRadius: '0.5rem',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                      <Bar dataKey="value" fill="#a45fbf">
                        {mentalHealthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#f6df60" : "#e7ce57"} />
                        ))}
                      </Bar>
                    </RecBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-xl font-semibold mb-4 text-black">Impact on Daily Life</h3>
                  <ul className="space-y-3">
                    {mentalHealthData.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 rounded-full mt-1.5 mr-2" style={{ backgroundColor: index % 2 === 0 ? "#f6df60" : "#e7ce57" }}></div>
                        <p className="text-sm text-black">{item.description}</p>
                      </li>
                    ))}
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full mt-1.5 mr-2" style={{ backgroundColor: "#f6df60" }}></div>
                      <p className="text-sm text-black">Mental health conditions can reduce life expectancy by 10-20 years</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full mt-1.5 mr-2" style={{ backgroundColor: "#e7ce57" }}></div>
                      <p className="text-sm text-black">Depression is a leading cause of disability worldwide</p>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 text-sm text-center text-black">
                <p>Data from Mental Health America's State and County Dashboard and NIMH</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3D Visualization */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-black">
            Interactive Visualization
          </h2>
          <p className="text-center mb-4 text-black">
            This is a short analysis and visualization of a generated person's recounting of his experience in a panic attack.
          </p>
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[500px] w-full bg-white">
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
          
          {/* Collapsible Detailed Analysis Section */}
          <div className="mt-6">
            <Collapsible
              open={isCollapsibleOpen}
              onOpenChange={setIsCollapsibleOpen}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white"
            >
              <CollapsibleTrigger asChild>
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-orange" />
                    <span className="font-medium text-black">View Detailed Analysis Data</span>
                  </div>
                  {isCollapsibleOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 border-t border-gray-200">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2 text-black">Original Text Sample</h3>
                    <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-line text-black">
                      {panicAttackSample}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 text-black">Key Emotional Patterns</h3>
                      <div className="flex flex-wrap gap-2">
                        {sampleAnalysisResults.keyEmotions.map((emotion, idx) => (
                          <span key={idx} className="bg-yellow/50 text-black px-3 py-1 rounded-full text-sm">
                            {emotion}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-medium mt-4 mb-2 text-black">Dominant Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {sampleAnalysisResults.dominantThemes.map((theme, idx) => (
                          <span key={idx} className="bg-orange/30 text-black px-3 py-1 rounded-full text-sm">
                            {theme}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-medium mt-4 mb-2 text-black">Sentiment Distribution</h3>
                      <div className="flex items-center mt-2">
                        <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="flex h-full">
                            <div 
                              style={{ width: `${sampleAnalysisResults.sentimentDistribution.negative}%` }} 
                              className="bg-orange h-full"
                            ></div>
                            <div 
                              style={{ width: `${sampleAnalysisResults.sentimentDistribution.neutral}%` }} 
                              className="bg-yellow h-full"
                            ></div>
                            <div 
                              style={{ width: `${sampleAnalysisResults.sentimentDistribution.positive}%` }} 
                              className="bg-green-400 h-full"
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Negative ({sampleAnalysisResults.sentimentDistribution.negative}%)</span>
                        <span>Neutral ({sampleAnalysisResults.sentimentDistribution.neutral}%)</span>
                        <span>Positive ({sampleAnalysisResults.sentimentDistribution.positive}%)</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3 text-black">Linguistic Markers</h3>
                      <div className="space-y-3">
                        {sampleAnalysisResults.linguisticMarkers.map((marker, idx) => (
                          <div key={idx} className="border-l-2 border-orange pl-3">
                            <p className="font-medium text-black">"{marker.term}"</p>
                            <p className="text-sm text-gray-600">{marker.significance}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <DocumentSummary 
                      summary="This text describes a classic panic attack experience with typical physical symptoms (racing heart, tingling hands, breathing difficulty) and psychological symptoms (fear, dread, catastrophizing thoughts). The narrative shows how the person rationalized their experience afterward yet still fears future episodes, indicating the development of anticipatory anxiety which is common in panic disorder. The language used demonstrates intense emotional distress and contains several cognitive distortions typical in anxiety disorders."
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Word Comparison */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-black flex items-center justify-center">
            <GitCompareArrows className="h-6 w-6 mr-2 text-orange" />
            Word Comparison
          </h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
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
