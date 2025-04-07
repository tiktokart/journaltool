
import { useState, useEffect } from "react";
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
import { Point } from "@/types/embedding";
import { generateMockPoints } from "@/utils/embeddingUtils";

const analyzePdfContent = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a unique seed based on file name for consistency
      const fileName = file.name.toLowerCase();
      const seed = fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Use the seed to influence the generated data
      const randomMultiplier = ((seed % 100) / 100) * 0.4 + 0.8; // Between 0.8 and 1.2
      
      // Generate emotional tone distribution based on filename
      let emotionalDistribution = {
        Joy: 0.15,
        Sadness: 0.25,
        Anger: 0.1,
        Fear: 0.2,
        Surprise: 0.05,
        Disgust: 0.05,
        Trust: 0.1,
        Anticipation: 0.1
      };
      
      // Adjust based on keywords in filename
      if (fileName.includes('happy') || fileName.includes('joy')) {
        emotionalDistribution.Joy = 0.4;
        emotionalDistribution.Sadness = 0.05;
      } else if (fileName.includes('sad') || fileName.includes('depress')) {
        emotionalDistribution.Sadness = 0.5;
        emotionalDistribution.Joy = 0.05;
      } else if (fileName.includes('anger') || fileName.includes('mad')) {
        emotionalDistribution.Anger = 0.4;
        emotionalDistribution.Trust = 0.05;
      } else if (fileName.includes('fear') || fileName.includes('anxiety')) {
        emotionalDistribution.Fear = 0.4;
        emotionalDistribution.Trust = 0.05;
      }
      
      // Calculate overall sentiment based on emotional distribution
      const overallSentiment = 
        (emotionalDistribution.Joy * 0.9) + 
        (emotionalDistribution.Trust * 0.8) + 
        (emotionalDistribution.Anticipation * 0.6) + 
        (emotionalDistribution.Surprise * 0.5) - 
        (emotionalDistribution.Sadness * 0.3) - 
        (emotionalDistribution.Fear * 0.3) - 
        (emotionalDistribution.Anger * 0.3) - 
        (emotionalDistribution.Disgust * 0.3);
      
      const normalizedSentiment = Math.min(1, Math.max(0, (overallSentiment + 1) / 2));
      
      // Create embedding points with the custom distribution
      const embeddingPoints = generateMockPoints(false, emotionalDistribution);

      // Generate sentiment distribution based on overall sentiment
      const positivePercentage = Math.round(normalizedSentiment * 100);
      const negativePercentage = Math.round((1 - normalizedSentiment) * 0.5 * 100);
      const neutralPercentage = 100 - positivePercentage - negativePercentage;

      // Generate timeline data
      const pageCount = 5 + Math.floor((seed % 10)); // Between 5 and 14 pages
      const timeline = [];
      let prevScore = normalizedSentiment * 0.8; // Start close to the overall sentiment
      
      for (let i = 1; i <= pageCount; i++) {
        // Random walk with trend toward overall sentiment
        const volatility = 0.15; // How much it can change per step
        const trend = (normalizedSentiment - prevScore) * 0.3; // Pull toward overall sentiment
        const randomChange = (Math.random() * 2 - 1) * volatility;
        let newScore = prevScore + randomChange + trend;
        newScore = Math.min(1, Math.max(0, newScore)); // Keep within 0-1
        
        timeline.push({ page: i, score: newScore });
        prevScore = newScore;
      }

      // Generate entity data
      const entityNames = [
        "Work", "Family", "Health", "Relationships", 
        "Future", "Goals", "Education", "Friends",
        "Hobbies", "Travel", "Home", "Money"
      ];
      
      const entities = [];
      const usedEntities = new Set();
      const entityCount = 4 + Math.floor(Math.random() * 4); // 4-7 entities
      
      for (let i = 0; i < entityCount; i++) {
        let entityIndex;
        do {
          entityIndex = Math.floor(Math.random() * entityNames.length);
        } while (usedEntities.has(entityIndex));
        
        usedEntities.add(entityIndex);
        
        // Calculate entity sentiment as a variation of the overall sentiment
        const variation = Math.random() * 0.4 - 0.2; // -0.2 to 0.2
        const entitySentiment = Math.min(1, Math.max(0, normalizedSentiment + variation));
        
        entities.push({
          name: entityNames[entityIndex],
          score: entitySentiment,
          mentions: 5 + Math.floor(Math.random() * 20)
        });
      }

      // Generate key phrases
      const positiveWords = ["growth", "healing", "success", "happiness", "love", "accomplishment", "strength", "peace", "joy", "progress"];
      const neutralWords = ["change", "balance", "reflection", "awareness", "routine", "planning", "thoughts", "consideration", "evaluation", "observation"];
      const negativeWords = ["struggle", "difficulty", "challenge", "pain", "fear", "stress", "anxiety", "exhaustion", "disappointment", "conflict"];
      
      const keyPhrases = [];
      
      // Add positive phrases proportional to positive sentiment
      const positiveCount = Math.round(1 + (positivePercentage / 100) * 4);
      for (let i = 0; i < positiveCount; i++) {
        const wordIndex = Math.floor(Math.random() * positiveWords.length);
        const secondWordIndex = (wordIndex + 1 + Math.floor(Math.random() * (positiveWords.length - 1))) % positiveWords.length;
        keyPhrases.push({
          text: `${positiveWords[wordIndex]} ${positiveWords[secondWordIndex]}`,
          sentiment: "positive",
          count: 1 + Math.floor(Math.random() * 7)
        });
      }
      
      // Add neutral phrases
      const neutralCount = Math.round(1 + (neutralPercentage / 100) * 4);
      for (let i = 0; i < neutralCount; i++) {
        const wordIndex = Math.floor(Math.random() * neutralWords.length);
        const secondWordIndex = (wordIndex + 1 + Math.floor(Math.random() * (neutralWords.length - 1))) % neutralWords.length;
        keyPhrases.push({
          text: `${neutralWords[wordIndex]} ${neutralWords[secondWordIndex]}`,
          sentiment: "neutral",
          count: 1 + Math.floor(Math.random() * 7)
        });
      }
      
      // Add negative phrases
      const negativeCount = Math.round(1 + (negativePercentage / 100) * 4);
      for (let i = 0; i < negativeCount; i++) {
        const wordIndex = Math.floor(Math.random() * negativeWords.length);
        const secondWordIndex = (wordIndex + 1 + Math.floor(Math.random() * (negativeWords.length - 1))) % negativeWords.length;
        keyPhrases.push({
          text: `${negativeWords[wordIndex]} ${negativeWords[secondWordIndex]}`,
          sentiment: "negative",
          count: 1 + Math.floor(Math.random() * 7)
        });
      }

      const analysisResults = {
        overallSentiment: {
          score: normalizedSentiment,
          label: normalizedSentiment >= 0.6 ? "Positive" : normalizedSentiment >= 0.4 ? "Neutral" : "Negative"
        },
        distribution: {
          positive: positivePercentage,
          neutral: neutralPercentage,
          negative: negativePercentage
        },
        timeline: timeline,
        entities: entities,
        keyPhrases: keyPhrases,
        embeddingPoints: embeddingPoints
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
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  const handleFileUpload = (files: File[]) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      toast.success(`File "${files[0].name}" uploaded successfully`);
      // Reset sentiment data when a new file is uploaded
      if (sentimentData) {
        setSentimentData(null);
        setSelectedPoint(null);
      }
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

  const handlePointClick = (point: Point) => {
    setSelectedPoint(point);
    toast(`Selected: "${point.word}" (${point.emotionalTone})`);
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
                    <CardHeader className="z-10">
                      <CardTitle className="flex justify-between items-center">
                        <span>Latent Emotional Analysis</span>
                        <div className="text-sm font-normal flex items-center text-muted-foreground">
                          <CircleDot className="h-4 w-4 mr-2" />
                          <span>Hover or click on words to see emotional groupings</span>
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
                      <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">Emotional Grouping</h3>
                            <p className="text-2xl font-bold bg-muted p-3 rounded flex items-center justify-center">
                              {selectedPoint.emotionalTone || "Neutral"}
                            </p>
                            <h3 className="text-sm font-medium mt-3 mb-1">Word</h3>
                            <p className="text-xl bg-muted p-2 rounded flex items-center justify-center">
                              {selectedPoint.word}
                            </p>
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
                                <h3 className="text-sm font-medium mt-3 mb-1">Related Words</h3>
                                <ul className="text-sm">
                                  {selectedPoint.relationships.map((rel, i) => (
                                    <li key={i} className="py-1 border-b border-border last:border-0">
                                      <div className="flex justify-between">
                                        <span className="font-medium">{rel.word}</span>
                                        <span className="text-muted-foreground">Connection: {(rel.strength * 100).toFixed(0)}%</span>
                                      </div>
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
