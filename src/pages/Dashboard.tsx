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
import { Point } from "@/types/embedding";

const analyzePdfContent = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const journalWords = [
        "anxious", "calm", "worried", "happy", "sad", 
        "stressed", "relieved", "angry", "grateful", "overwhelmed",
        "lonely", "loved", "frustrated", "inspired", "tired",
        "excited", "afraid", "hopeful", "confused", "confident",
        "disappointed", "proud", "numb", "peaceful", "annoyed",
        "content", "exhausted", "motivated", "hurt", "joyful"
      ];

      const emotionalClusters = {
        Joy: ["happy", "grateful", "excited", "proud", "joyful", "content", "inspired", "peaceful", "motivated", "confident", "relieved"],
        Sadness: ["sad", "disappointed", "lonely", "hurt", "exhausted", "tired", "numb"],
        Anger: ["angry", "frustrated", "annoyed"],
        Fear: ["anxious", "worried", "afraid", "overwhelmed", "stressed"],
        Surprise: ["shocked", "amazed", "startled", "stunned", "astonished"],
        Disgust: ["disgusted", "repulsed", "revolted"],
        Trust: ["trust", "calm", "hopeful"],
        Anticipation: ["anticipation", "excited", "looking", "forward"]
      };

      const embeddingPoints: Point[] = [];
      
      journalWords.forEach((word, i) => {
        let emotionalTone = "Neutral";
        for (const [emotion, words] of Object.entries(emotionalClusters)) {
          if (words.includes(word)) {
            emotionalTone = emotion;
            break;
          }
        }
        
        const clusterCenters: { [key: string]: [number, number, number] } = {
          Joy: [8, 8, 8],
          Sadness: [-8, -8, -5],
          Anger: [8, -8, 0],
          Fear: [-8, 8, 0],
          Surprise: [0, 10, 0],
          Disgust: [0, -10, 0],
          Trust: [10, 0, 5],
          Anticipation: [-10, 0, 5],
          Neutral: [0, 0, 0]
        };
        
        const variance = 3;
        const clusterCenter = clusterCenters[emotionalTone] || [0, 0, 0];
        const x = clusterCenter[0] + (Math.random() * variance * 2 - variance);
        const y = clusterCenter[1] + (Math.random() * variance * 2 - variance);
        const z = clusterCenter[2] + (Math.random() * variance * 2 - variance);
        
        let sentiment;
        if (emotionalTone === "Joy" || emotionalTone === "Trust") sentiment = 0.6 + (Math.random() * 0.4);
        else if (emotionalTone === "Anticipation" || emotionalTone === "Surprise") sentiment = 0.4 + (Math.random() * 0.4);
        else if (emotionalTone === "Disgust" || emotionalTone === "Anger") sentiment = 0.1 + (Math.random() * 0.3);
        else if (emotionalTone === "Sadness" || emotionalTone === "Fear") sentiment = Math.random() * 0.3;
        else sentiment = 0.4 + (Math.random() * 0.2);
        
        let r = 0.7, g = 0.7, b = 0.7;
        if (emotionalTone === "Joy") {
          r = 1.0; g = 0.9; b = 0.0;
        } else if (emotionalTone === "Sadness") {
          r = 0.0; g = 0.5; b = 0.9;
        } else if (emotionalTone === "Anger") {
          r = 0.9; g = 0.1; b = 0.1;
        } else if (emotionalTone === "Fear") {
          r = 0.6; g = 0.0; b = 0.8;
        } else if (emotionalTone === "Surprise") {
          r = 1.0; g = 0.5; b = 0.0;
        } else if (emotionalTone === "Disgust") {
          r = 0.2; g = 0.8; b = 0.2;
        } else if (emotionalTone === "Trust") {
          r = 0.0; g = 0.8; b = 0.6;
        } else if (emotionalTone === "Anticipation") {
          r = 0.9; g = 0.5; b = 0.7;
        }
        
        const keywordCount = 1 + Math.floor(Math.random() * 2);
        const keywords = [];
        for (let k = 0; k < keywordCount; k++) {
          const sameEmotionWords = emotionalClusters[emotionalTone as keyof typeof emotionalClusters] || journalWords;
          let relatedWord;
          do {
            relatedWord = sameEmotionWords[Math.floor(Math.random() * sameEmotionWords.length)];
          } while (relatedWord === word || keywords.includes(relatedWord));
          
          keywords.push(relatedWord);
        }
        
        embeddingPoints.push({
          id: `word-${i}`,
          word,
          sentiment,
          position: [x, y, z],
          color: [r, g, b],
          keywords,
          emotionalTone,
          relationships: []
        });
      });
      
      embeddingPoints.forEach((point, index) => {
        const relationshipCount = 1 + Math.floor(Math.random() * 3);
        const relationships = [];
        
        const similarTonePoints = embeddingPoints.filter(p => 
          p.id !== point.id && p.emotionalTone === point.emotionalTone
        );
        
        if (similarTonePoints.length > 0) {
          const sampleSize = Math.min(relationshipCount, similarTonePoints.length);
          const sample = [];
          const usedIndices = new Set();
          
          while (sample.length < sampleSize) {
            const randomIndex = Math.floor(Math.random() * similarTonePoints.length);
            if (!usedIndices.has(randomIndex)) {
              usedIndices.add(randomIndex);
              sample.push(similarTonePoints[randomIndex]);
            }
          }
          
          for (const targetPoint of sample) {
            relationships.push({
              id: targetPoint.id,
              strength: 0.5 + Math.random() * 0.5,
              word: targetPoint.word
            });
          }
        }
        
        const remainingRelationships = relationshipCount - relationships.length;
        if (remainingRelationships > 0) {
          const otherPoints = embeddingPoints.filter(p => 
            p.id !== point.id && !relationships.some(r => r.id === p.id)
          );
          
          if (otherPoints.length > 0) {
            for (let i = 0; i < remainingRelationships && i < otherPoints.length; i++) {
              const randomIndex = Math.floor(Math.random() * otherPoints.length);
              const targetPoint = otherPoints[randomIndex];
              
              relationships.push({
                id: targetPoint.id,
                strength: 0.3 + Math.random() * 0.3,
                word: targetPoint.word
              });
              
              otherPoints.splice(randomIndex, 1);
            }
          }
        }
        
        point.relationships = relationships;
      });

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
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

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

  const handlePointClick = (point: Point) => {
    setSelectedPoint(point);
    toast(`Selected word: "${point.word}"`);
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
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex justify-between items-center">
                        <span>Latent Emotional Analysis</span>
                        <div className="text-sm font-normal flex items-center text-muted-foreground">
                          <CircleDot className="h-4 w-4 mr-2" />
                          <span>Hover or click on words to see details</span>
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
                        <CardTitle className="text-lg">Selected Word</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">Word</h3>
                            <p className="text-2xl font-bold bg-muted p-3 rounded flex items-center justify-center">{selectedPoint.word}</p>
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
