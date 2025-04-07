
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/FileUploader";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { Header } from "@/components/Header";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { toast } from "sonner";
import { Loader2, CircleDot } from "lucide-react";

// Enhanced PDF analysis utility function
const analyzePdfContent = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    // In a real app, this would send the file to a backend API for processing
    // Here we'll simulate analysis with a timeout and enhanced mock data

    setTimeout(() => {
      // Generate more realistic text excerpts for sentiment analysis
      const journalExcerpts = [
        "Today I felt a profound sense of accomplishment after completing my project. The feedback was overwhelmingly positive.",
        "The meeting didn't go as planned. I felt frustrated by the lack of progress and clear direction from management.",
        "I'm anxious about the upcoming presentation, but trying to channel that energy into thorough preparation.",
        "Spending time with family today brought me genuine joy. These moments remind me what truly matters in life.",
        "The criticism was difficult to hear, but I recognize it as an opportunity for growth and improvement.",
        "I'm feeling conflicted about the decision I need to make. There are compelling reasons for both options.",
        "Today's setback was disappointing, but I'm determined not to let it derail the overall progress.",
        "The conversation with my friend was deeply meaningful. I felt truly understood and supported.",
        "I'm excited about the new opportunity but also uncertain about whether I'm ready for the challenge.",
        "Reflecting on the past year brings mixed emotions - pride in achievements, regret for missed opportunities."
      ];

      // Generate more meaningful entity relationships
      const entityWords = [
        "work", "family", "future", "relationship", "health", "goals", 
        "anxiety", "happiness", "stress", "achievements", "challenges",
        "growth", "self-reflection", "change", "opportunity", "balance"
      ];

      // Create more realistic emotional tones
      const emotionalTones = [
        "Joy", "Sadness", "Anxiety", "Contentment", "Frustration", 
        "Hope", "Fear", "Gratitude", "Regret", "Pride"
      ];

      // Generate 3D visualization data points that represent emotional clusters
      const embeddingPoints = Array.from({ length: 500 }, (_, i) => {
        // Create clusters around certain emotional states
        let cluster = Math.floor(Math.random() * 5);
        let radius = 5 + (Math.random() * 5);
        
        // Base positions for different emotional clusters
        const clusterCenters = [
          [8, 8, 8],    // Joy/Positive cluster
          [-8, -8, -8],  // Sadness/Negative cluster
          [8, -8, 0],    // Anxiety/Fear cluster
          [-8, 8, 0],    // Contentment cluster
          [0, 0, 10]     // Neutral/Mixed emotions
        ];
        
        // Add random variation around the cluster center
        const variance = 3;
        const x = clusterCenters[cluster][0] + (Math.random() * variance * 2 - variance);
        const y = clusterCenters[cluster][1] + (Math.random() * variance * 2 - variance);
        const z = clusterCenters[cluster][2] + (Math.random() * variance * 2 - variance);
        
        // Determine sentiment based on position
        // Clusters 0 and 3 are more positive, 1 and 2 more negative, 4 is neutral
        let sentiment;
        if (cluster === 0) sentiment = 0.7 + (Math.random() * 0.3); // Very positive
        else if (cluster === 1) sentiment = Math.random() * 0.3; // Very negative
        else if (cluster === 2) sentiment = 0.2 + (Math.random() * 0.2); // Negative
        else if (cluster === 3) sentiment = 0.5 + (Math.random() * 0.2); // Positive
        else sentiment = 0.4 + (Math.random() * 0.2); // Neutral
        
        // Color based on sentiment (red to blue gradient)
        const r = sentiment < 0.5 ? 1 : 2 * (1 - sentiment);
        const b = sentiment > 0.5 ? 1 : 2 * sentiment;
        const g = 0.3;
        
        // Select text based on sentiment range
        let textIndex;
        if (sentiment > 0.7) textIndex = 0; // Very positive
        else if (sentiment > 0.5) textIndex = 3; // Positive
        else if (sentiment > 0.4) textIndex = 5; // Neutral
        else if (sentiment > 0.25) textIndex = 2; // Negative
        else textIndex = 1; // Very negative
        
        // Select random text with some randomization
        const randomOffset = Math.floor(Math.random() * 5);
        textIndex = (textIndex + randomOffset) % journalExcerpts.length;
        
        // Generate keywords for this point
        const keywordCount = 2 + Math.floor(Math.random() * 3);
        const keywords = [];
        const usedIndices = new Set();
        
        for (let k = 0; k < keywordCount; k++) {
          let wordIndex;
          do {
            wordIndex = Math.floor(Math.random() * entityWords.length);
          } while (usedIndices.has(wordIndex));
          
          usedIndices.add(wordIndex);
          keywords.push(entityWords[wordIndex]);
        }
        
        // Select emotional tone based on sentiment
        let toneIndex;
        if (sentiment > 0.7) toneIndex = 0; // Joy
        else if (sentiment > 0.6) toneIndex = 9; // Pride
        else if (sentiment > 0.5) toneIndex = 7; // Gratitude
        else if (sentiment > 0.45) toneIndex = 3; // Contentment
        else if (sentiment > 0.4) toneIndex = 5; // Hope
        else if (sentiment > 0.35) toneIndex = 2; // Anxiety
        else if (sentiment > 0.3) toneIndex = 4; // Frustration
        else if (sentiment > 0.2) toneIndex = 6; // Fear
        else toneIndex = 1; // Sadness
        
        return {
          id: `point-${i}`,
          text: journalExcerpts[textIndex],
          sentiment,
          position: [x, y, z],
          color: [r, g, b],
          keywords,
          emotionalTone: emotionalTones[toneIndex],
          relationships: []
        };
      });
      
      // Add meaningful relationships between points
      embeddingPoints.forEach((point, index) => {
        // Create 2-4 relationships for each point
        const relationshipCount = 2 + Math.floor(Math.random() * 3);
        const relationships = [];
        
        // Find points with similar sentiment or in nearby clusters
        for (let j = 0; j < relationshipCount; j++) {
          let targetIndex;
          do {
            // Bias toward points with similar sentiment
            const similarPoints = embeddingPoints.filter((p, idx) => 
              idx !== index && 
              Math.abs(p.sentiment - point.sentiment) < 0.2
            );
            
            if (similarPoints.length > 0) {
              targetIndex = embeddingPoints.indexOf(
                similarPoints[Math.floor(Math.random() * similarPoints.length)]
              );
            } else {
              do {
                targetIndex = Math.floor(Math.random() * embeddingPoints.length);
              } while (targetIndex === index);
            }
          } while (relationships.some(r => r.id === embeddingPoints[targetIndex].id));
          
          // Use a keyword from the target point as the connecting word
          const targetPoint = embeddingPoints[targetIndex];
          const word = targetPoint.keywords && targetPoint.keywords.length > 0
            ? targetPoint.keywords[Math.floor(Math.random() * targetPoint.keywords.length)]
            : entityWords[Math.floor(Math.random() * entityWords.length)];
          
          relationships.push({
            id: targetPoint.id,
            strength: 0.5 + Math.random() * 0.5, // Stronger connections
            word
          });
        }
        
        point.relationships = relationships;
      });

      // Create complete analysis results
      const analysisResults = {
        overallSentiment: {
          score: 0.68,
          label: "Positive"
        },
        distribution: {
          positive: 68,
          neutral: 20,
          negative: 12
        },
        timeline: [
          { page: 1, score: 0.45 },
          { page: 2, score: 0.58 },
          { page: 3, score: 0.72 },
          { page: 4, score: 0.65 },
          { page: 5, score: 0.81 },
          { page: 6, score: 0.75 },
          { page: 7, score: 0.62 },
          { page: 8, score: 0.70 },
        ],
        entities: [
          { name: "Work", score: 0.65, mentions: 24 },
          { name: "Family", score: 0.85, mentions: 18 },
          { name: "Health", score: 0.72, mentions: 15 },
          { name: "Relationships", score: 0.50, mentions: 12 },
          { name: "Future", score: 0.45, mentions: 10 },
          { name: "Goals", score: 0.80, mentions: 8 },
        ],
        keyPhrases: [
          { text: "personal growth", sentiment: "positive", count: 7 },
          { text: "quality time", sentiment: "positive", count: 5 },
          { text: "difficult conversation", sentiment: "negative", count: 3 },
          { text: "mixed feelings", sentiment: "neutral", count: 6 },
          { text: "feeling accomplished", sentiment: "positive", count: 4 },
          { text: "lost opportunity", sentiment: "negative", count: 2 },
        ],
        embeddingPoints
      };

      resolve(analysisResults);
    }, 2000);
  });
};

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("embedding");
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const handleFileUpload = (files: File[]) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      toast.success(`File "${files[0].name}" uploaded successfully`);
    }
  };

  const analyzeSentiment = async () => {
    if (!file) {
      toast.error("Please upload a PDF file first");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const results = await analyzePdfContent(file);
      setSentimentData(results);
      toast.success("Document analysis completed!");
    } catch (error) {
      toast.error("Error analyzing document");
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePointClick = (point: any) => {
    setSelectedPoint(point);
    toast(`Selected: "${point.text.substring(0, 30)}..."`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8">
          <Card className="border border-border shadow-md bg-card">
            <CardHeader>
              <CardTitle>Document Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FileUploader onFilesAdded={handleFileUpload} />
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Selected File</h3>
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : "No file selected"}
                    </p>
                    {file && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={analyzeSentiment} 
                    disabled={!file || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : "Analyze Document"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {sentimentData && (
            <div className="animate-fade-in">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-5 md:w-[750px]">
                  <TabsTrigger value="embedding">Latent Emotional Analysis</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="entities">Entities</TabsTrigger>
                  <TabsTrigger value="keyphrases">Key Phrases</TabsTrigger>
                </TabsList>
                
                <TabsContent value="embedding" className="mt-6">
                  <Card className="border border-border shadow-md overflow-hidden bg-card">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Latent Emotional Analysis</span>
                        <div className="text-sm font-normal flex items-center text-muted-foreground">
                          <CircleDot className="h-4 w-4 mr-2" />
                          <span>Hover over points to see details</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="w-full aspect-[16/9]">
                        <DocumentEmbedding 
                          points={sentimentData.embeddingPoints}
                          onPointClick={handlePointClick}
                          isInteractive={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {selectedPoint && (
                    <Card className="mt-4 border border-border shadow-sm bg-card">
                      <CardHeader className="py-3">
                        <CardTitle className="text-lg">Selected Point Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">Text Excerpt</h3>
                            <p className="text-sm bg-muted p-3 rounded">{selectedPoint.text}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium mb-1">Sentiment Analysis</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ 
                                  backgroundColor: `rgb(${selectedPoint.color[0] * 255}, ${selectedPoint.color[1] * 255}, ${selectedPoint.color[2] * 255})` 
                                }} 
                              />
                              <span className="text-sm">
                                Score: {selectedPoint.sentiment.toFixed(2)}
                                {selectedPoint.sentiment >= 0.7 ? " (Very Positive)" : 
                                  selectedPoint.sentiment >= 0.5 ? " (Positive)" : 
                                  selectedPoint.sentiment >= 0.4 ? " (Neutral)" : 
                                  selectedPoint.sentiment >= 0.25 ? " (Negative)" : " (Very Negative)"}
                              </span>
                            </div>
                            
                            {selectedPoint.relationships && selectedPoint.relationships.length > 0 && (
                              <div>
                                <h3 className="text-sm font-medium mt-3 mb-1">Related Concepts</h3>
                                <ul className="text-xs">
                                  {selectedPoint.relationships.map((rel, i) => (
                                    <li key={i} className="py-1 border-b border-gray-700 last:border-0">
                                      {rel.word && <span className="font-medium">{rel.word}: </span>}
                                      Connection strength: {(rel.strength * 100).toFixed(0)}%
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="overview" className="mt-6">
                  <SentimentOverview data={sentimentData} />
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-6">
                  <SentimentTimeline data={sentimentData.timeline} />
                </TabsContent>
                
                <TabsContent value="entities" className="mt-6">
                  <EntitySentiment data={sentimentData.entities} />
                </TabsContent>
                
                <TabsContent value="keyphrases" className="mt-6">
                  <KeyPhrases data={sentimentData.keyPhrases} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
