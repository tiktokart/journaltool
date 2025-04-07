
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

// Mock sentiment data
const mockSentimentData = {
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
    { name: "Product", score: 0.85, mentions: 24 },
    { name: "Company", score: 0.72, mentions: 18 },
    { name: "Service", score: 0.65, mentions: 15 },
    { name: "Customer", score: 0.50, mentions: 12 },
    { name: "Market", score: 0.45, mentions: 10 },
    { name: "Team", score: 0.80, mentions: 8 },
  ],
  keyPhrases: [
    { text: "excellent service", sentiment: "positive", count: 5 },
    { text: "user friendly interface", sentiment: "positive", count: 4 },
    { text: "technical issues", sentiment: "negative", count: 3 },
    { text: "customer support", sentiment: "neutral", count: 6 },
    { text: "highly recommended", sentiment: "positive", count: 7 },
    { text: "needs improvement", sentiment: "negative", count: 2 },
  ],
  embeddingPoints: Array.from({ length: 500 }, (_, i) => {
    // Create a sphere of points with different colors based on sentiment
    const radius = 10 * Math.pow(Math.random(), 1/3);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    // Sentiment ranges from 0 (negative) to 1 (positive)
    const sentiment = Math.random();
    
    // Color: red for negative, blue for positive
    const r = sentiment < 0.5 ? 1 : 2 * (1 - sentiment);
    const b = sentiment > 0.5 ? 1 : 2 * sentiment;
    const g = 0.3;
    
    // Generate random text excerpts
    const phrases = [
      "The product exceeds expectations",
      "Customer service was disappointing",
      "Easy to use interface",
      "Issues with technical support",
      "Highly recommended solution",
      "Value for money is excellent",
      "Needs improvement in several areas",
      "Performance is outstanding",
      "Documentation is lacking",
      "Integration was seamless"
    ];
    
    return {
      id: `point-${i}`,
      text: phrases[Math.floor(Math.random() * phrases.length)],
      sentiment: sentiment,
      position: [x, y, z],
      color: [r, g, b],
      relationships: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
        id: `point-${Math.floor(Math.random() * 500)}`,
        strength: Math.random()
      }))
    };
  })
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

  const analyzeSentiment = () => {
    if (!file) {
      toast.error("Please upload a PDF file first");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSentimentData(mockSentimentData);
      setIsAnalyzing(false);
      toast.success("Document analysis completed!");
    }, 2000);
  };

  const handlePointClick = (point: any) => {
    setSelectedPoint(point);
    toast(`Selected: "${point.text.substring(0, 30)}..."`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Upload Section */}
          <Card className="border-0 shadow-md">
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

          {/* Results Section */}
          {sentimentData && (
            <div className="animate-fade-in">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-5 md:w-[750px]">
                  <TabsTrigger value="embedding">3D Embedding</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="entities">Entities</TabsTrigger>
                  <TabsTrigger value="keyphrases">Key Phrases</TabsTrigger>
                </TabsList>
                
                <TabsContent value="embedding" className="mt-6">
                  <Card className="border-0 shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Document Embedding Visualization</span>
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
                    <Card className="mt-4 border-0 shadow-sm">
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
                                  {selectedPoint.relationships.map((rel: any, i: number) => (
                                    <li key={i} className="py-1 border-b border-gray-100 last:border-0">
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
