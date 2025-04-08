
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LatentEmotionalAnalysis } from "@/components/LatentEmotionalAnalysis";
import { Point } from "@/types/embedding";
import { generateMockPoints, getEmotionColor } from "@/utils/embeddingUtils";

const sampleJournalText = "Today I experienced another panic attack during our team meeting. My heart started racing suddenly, and I felt that familiar shortness of breath. I tried to use the breathing techniques my therapist taught me, but I still felt overwhelmed. The physical symptoms lasted about 10 minutes, but the anxious feeling stayed with me for hours afterward. I wonder if the recent medication adjustment is causing these more intense episodes. I've also been having trouble sleeping, which probably isn't helping. My therapist suggested more mindfulness practice and identifying specific triggers. My support system at home has been helpful, but I'm still struggling at work. I need to find better coping mechanisms for these situations.";

const sampleData = {
  overallSentiment: {
    score: 0.35,
    label: "Negative"
  },
  distribution: {
    positive: 25,
    neutral: 15,
    negative: 60
  },
  timeline: Array.from({ length: 20 }, (_, i) => ({
    page: i + 1,
    score: 0.3 + (i % 3 === 0 ? 0.1 : i % 2 === 0 ? -0.1 : 0),
    text: "Journal entry excerpt (sample data)"
  })),
  entities: [
    { name: "Anxiety", sentiment: 0.2, mentions: 8, contexts: ["Context: Experienced anxiety during team meeting"] },
    { name: "Heart", sentiment: 0.25, mentions: 5, contexts: ["Context: Heart racing during panic attack"] },
    { name: "Breathing", sentiment: 0.45, mentions: 4, contexts: ["Context: Difficulty breathing while anxious"] },
    { name: "Panic", sentiment: 0.15, mentions: 6, contexts: ["Context: Panic attack symptoms described"] },
    { name: "Therapy", sentiment: 0.65, mentions: 3, contexts: ["Context: Discussion of therapy techniques"] },
    { name: "Sleep", sentiment: 0.35, mentions: 4, contexts: ["Context: Difficulty sleeping due to anxiety"] },
    { name: "Medication", sentiment: 0.55, mentions: 2, contexts: ["Context: Starting new anxiety medication"] },
    { name: "Work", sentiment: 0.25, mentions: 5, contexts: ["Context: Anxiety triggered at work"] },
  ],
  keyPhrases: [
    { phrase: "panic attack", relevance: 0.9, sentiment: 0.2, occurrences: 6 },
    { phrase: "heart racing", relevance: 0.85, sentiment: 0.25, occurrences: 5 },
    { phrase: "shortness of breath", relevance: 0.8, sentiment: 0.3, occurrences: 4 },
    { phrase: "feeling overwhelmed", relevance: 0.75, sentiment: 0.2, occurrences: 5 },
    { phrase: "therapy session", relevance: 0.7, sentiment: 0.65, occurrences: 3 },
    { phrase: "coping mechanisms", relevance: 0.75, sentiment: 0.7, occurrences: 2 },
    { phrase: "deep breathing", relevance: 0.7, sentiment: 0.6, occurrences: 3 },
    { phrase: "medication adjustment", relevance: 0.65, sentiment: 0.55, occurrences: 2 },
    { phrase: "sleep disturbance", relevance: 0.6, sentiment: 0.3, occurrences: 4 },
    { phrase: "support system", relevance: 0.65, sentiment: 0.75, occurrences: 2 },
    { phrase: "trigger identification", relevance: 0.7, sentiment: 0.6, occurrences: 2 },
    { phrase: "mindfulness practice", relevance: 0.75, sentiment: 0.8, occurrences: 2 },
  ],
  clusters: [
    { name: "Anxiety Symptoms", size: 12, sentiment: 0.2 },
    { name: "Treatment", size: 8, sentiment: 0.65 },
    { name: "Daily Life", size: 10, sentiment: 0.4 },
    { name: "Support System", size: 6, sentiment: 0.7 },
    { name: "Coping Strategies", size: 9, sentiment: 0.6 },
  ],
  summary: "Journal Entry 12: The anxiety symptoms were particularly intense today. Experienced a panic attack during the team meeting with racing heart and shortness of breath. Therapy techniques helped somewhat, but still feeling overwhelmed. The new medication adjustment might be contributing to sleep disturbance. Need to practice more mindfulness and breathing exercises.",
  fileName: "Journal Entry 12.pdf",
  fileSize: 1024 * 100, // 100KB mock size
  wordCount: 432, // Mock word count
  sourceDescription: "Journal Entry 12 - Personal anxiety log"
};

const getRGBColorString = (color: number[]): string => {
  return `rgb(${Math.floor(color[0] * 255)}, ${Math.floor(color[1] * 255)}, ${Math.floor(color[2] * 255)})`;
};

const Index = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [uniqueWords, setUniqueWords] = useState<string[]>([]);
  const [emotionalClusters, setEmotionalClusters] = useState<any[]>([]);
  const [clusterColors, setClusterColors] = useState<Record<string, string>>({});
  const [clusterExpanded, setClusterExpanded] = useState<Record<string, boolean>>({});
  const [clusterPoints, setClusterPoints] = useState<Record<string, Point[]>>({});

  useEffect(() => {
    const mockPoints = generateMockPoints(sampleJournalText, sampleData);
    setPoints(mockPoints);
    
    const allWords = sampleJournalText
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^\w\s]|_/g, ""))
      .filter(word => word.length > 2);
    
    const uniqueWordsSet = new Set(allWords);
    const uniqueWordsArray = Array.from(uniqueWordsSet);
    setUniqueWords(uniqueWordsArray);
    
    console.log(`Total unique words found: ${uniqueWordsArray.length}`);
    
    const clusters = sampleData.clusters.map((cluster: any, index: number) => {
      const color = getEmotionColor(cluster.sentiment);
      return {
        ...cluster,
        id: index,
        color: getRGBColorString(color),
      };
    });
    
    setEmotionalClusters(clusters);
    
    const colorMap: Record<string, string> = {};
    clusters.forEach((cluster: any) => {
      colorMap[cluster.name] = cluster.color;
    });
    setClusterColors(colorMap);
    
    const expandedMap: Record<string, boolean> = {};
    clusters.forEach((cluster: any) => {
      expandedMap[cluster.name] = false;
    });
    setClusterExpanded(expandedMap);
    
    const clusterPointsMap: Record<string, Point[]> = {};
    clusters.forEach((cluster: any) => {
      const clusterSize = cluster.size;
      const availablePoints = mockPoints.filter(p => 
        !Object.values(clusterPointsMap).some(assignedPoints => 
          assignedPoints.some(ap => ap.id === p.id)
        )
      );
      
      const shuffled = availablePoints.sort(() => 0.5 - Math.random());
      const assignedPoints = shuffled.slice(0, Math.min(clusterSize, shuffled.length));
      
      clusterPointsMap[cluster.name] = assignedPoints;
    });
    setClusterPoints(clusterPointsMap);
    
    if (typeof window !== 'undefined') {
      window.documentEmbeddingPoints = mockPoints;
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Emotional Intelligence for Journal Analysis</h1>
            <p className="text-xl text-muted-foreground">
              Visualize and understand the emotional patterns in your journal entries
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Upload & Analyze</CardTitle>
                <CardDescription>
                  Upload your journal entries to get deep emotional insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Our AI analyzes your journal entries to identify emotional patterns, themes, and potential insights that can help with your emotional wellbeing.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard" className="w-full">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Visualize Emotions</CardTitle>
                <CardDescription>
                  See the emotional landscape of your writing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Our 3D visualization shows the latent emotional relationships between words and concepts in your writing, revealing patterns you might not otherwise notice.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard" className="w-full">
                  <Button variant="outline" className="w-full">Try it Now</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          <section className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6 text-center">
              Experience the Emotional Landscape
            </h2>
            
            <LatentEmotionalAnalysis 
              points={points}
              uniqueWords={uniqueWords}
              emotionalClusters={emotionalClusters}
              clusterPoints={clusterPoints}
              clusterColors={clusterColors}
              clusterExpanded={clusterExpanded}
              sourceDescription="Sample Journal Entry Analysis"
              className="mt-8"
            />
            
            <div className="text-center mt-12">
              <Link to="/dashboard">
                <Button size="lg">
                  Try with Your Own Journal Entries
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
