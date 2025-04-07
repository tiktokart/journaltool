
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  ]
};

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

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
                <TabsList className="grid grid-cols-4 md:w-[600px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="entities">Entities</TabsTrigger>
                  <TabsTrigger value="keyphrases">Key Phrases</TabsTrigger>
                </TabsList>
                
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
