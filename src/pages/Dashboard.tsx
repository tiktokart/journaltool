import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { Point } from "@/types/embedding";
import { generateMockPoints } from "@/utils/embeddingUtils";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ArrowRight, 
  Upload, 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Share2, 
  BookOpen, 
  BarChart2, 
  Lightbulb, 
  RefreshCw,
  Loader2
} from "lucide-react";

const exampleJournalData = {
  overallSentiment: {
    score: 0.35,
    label: "Negative"
  },
  distribution: {
    positive: 20,
    neutral: 35,
    negative: 45
  },
  timeline: Array.from({ length: 10 }, (_, i) => ({
    page: i + 1,
    score: 0.2 + (i * 0.05),
    text: [
      "Today was particularly challenging. My anxiety felt overwhelming from the moment I woke up.",
      "I struggled to get out of bed, feeling like a heavy weight was pressing down on my chest.",
      "During breakfast, I had trouble focusing on simple tasks. My mind kept racing with worries.",
      "My therapist suggested trying deep breathing exercises when I feel overwhelmed.",
      "I tried the breathing technique during lunch when I started feeling anxious again.",
      "It helped a bit, but I still felt on edge for most of the afternoon.",
      "By evening, I was exhausted from fighting my anxiety all day.",
      "I managed to do some light reading before bed, which was a small accomplishment.",
      "Tomorrow, I'll try to incorporate more grounding techniques my therapist suggested.",
      "Despite today's difficulties, I'm trying to remember that not every day will be this hard."
    ][i]
  })),
  entities: [
    {
      name: "Anxiety",
      sentiment: 0.15,
      mentions: 8,
      contexts: ["My anxiety felt overwhelming", "fighting my anxiety all day"]
    },
    {
      name: "Therapist",
      sentiment: 0.65,
      mentions: 3,
      contexts: ["My therapist suggested", "techniques my therapist suggested"]
    },
    {
      name: "Breathing",
      sentiment: 0.55,
      mentions: 2,
      contexts: ["deep breathing exercises", "the breathing technique"]
    },
    {
      name: "Sleep",
      sentiment: 0.3,
      mentions: 2,
      contexts: ["struggled to get out of bed", "reading before bed"]
    }
  ],
  keyPhrases: [
    {
      phrase: "anxiety",
      relevance: 0.95,
      sentiment: 0.15,
      occurrences: 3
    },
    {
      phrase: "overwhelming",
      relevance: 0.85,
      sentiment: 0.10,
      occurrences: 2
    },
    {
      phrase: "deep breathing",
      relevance: 0.80,
      sentiment: 0.60,
      occurrences: 2
    },
    {
      phrase: "therapist",
      relevance: 0.75,
      sentiment: 0.65,
      occurrences: 2
    },
    {
      phrase: "grounding techniques",
      relevance: 0.70,
      sentiment: 0.65,
      occurrences: 1
    },
    {
      phrase: "struggled",
      relevance: 0.65,
      sentiment: 0.25,
      occurrences: 1
    }
  ],
  sourceDescription: "Example Journal Entry"
};

const exampleJournalText = `
Today was particularly challenging. My anxiety felt overwhelming from the moment I woke up. I struggled to get out of bed, feeling like a heavy weight was pressing down on my chest. During breakfast, I had trouble focusing on simple tasks. My mind kept racing with worries.

My therapist suggested trying deep breathing exercises when I feel overwhelmed. I tried the breathing technique during lunch when I started feeling anxious again. It helped a bit, but I still felt on edge for most of the afternoon.

By evening, I was exhausted from fighting my anxiety all day. I managed to do some light reading before bed, which was a small accomplishment. Tomorrow, I'll try to incorporate more grounding techniques my therapist suggested. Despite today's difficulties, I'm trying to remember that not every day will be this hard.
`;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [journalText, setJournalText] = useState(exampleJournalText);
  const [journalData, setJournalData] = useState(exampleJournalData);
  const [points, setPoints] = useState<Point[]>([]);
  const [focusWord, setFocusWord] = useState<string | null>(null);
  const [isUsingExample, setIsUsingExample] = useState(true);

  useEffect(() => {
    // Generate visualization points when journal data changes
    const newPoints = generateMockPoints(journalText, journalData);
    setPoints(newPoints);
  }, [journalText, journalData]);

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setIsUsingExample(false);
      
      // Simulate file processing
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        toast.success(`File "${files[0].name}" analyzed successfully!`);
      }, 2500);
    }
  };

  const handleTextAnalysis = () => {
    if (journalText.trim().length < 50) {
      toast.error("Please enter at least 50 characters for meaningful analysis.");
      return;
    }
    
    setIsAnalyzing(true);
    setIsUsingExample(false);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success("Journal text analyzed successfully!");
    }, 2000);
  };

  const handleSearchKeywords = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const searchWord = searchQuery.toLowerCase().trim();
    const foundPoint = points.find(p => p.word.toLowerCase() === searchWord);
    
    if (foundPoint) {
      setFocusWord(foundPoint.word);
      toast.success(`Found "${foundPoint.word}" in the visualization.`);
    } else {
      toast.error(`"${searchQuery}" not found in the document.`);
    }
  };

  const handleClearAnalysis = () => {
    setSelectedFile(null);
    setJournalText("");
    setFocusWord(null);
    setIsUsingExample(false);
    toast.info("Analysis cleared. Upload a new file or enter text to analyze.");
  };

  const handleUseExample = () => {
    setJournalText(exampleJournalText);
    setJournalData(exampleJournalData);
    setIsUsingExample(true);
    setSelectedFile(null);
    toast.info("Using example journal entry for demonstration.");
  };

  const handlePointClick = (point: Point | null) => {
    if (point) {
      setFocusWord(point.word);
    } else {
      setFocusWord(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Document Analysis Dashboard</h1>
            <p className="text-muted-foreground">
              Upload your journal entries, therapy notes, or personal narratives to gain insights into emotional patterns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Upload & Input */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Document
                  </CardTitle>
                  <CardDescription>
                    Upload a PDF, Word document, or text file for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUploader 
                    onFilesAdded={handleFileUpload}
                    className="h-32"
                  />
                  
                  {selectedFile && (
                    <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {selectedFile.name}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Journal Text
                  </CardTitle>
                  <CardDescription>
                    Enter or paste your journal entry for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="Enter your journal text here..."
                    className="min-h-[200px] resize-none"
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                  />
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleTextAnalysis}
                      disabled={isAnalyzing || journalText.trim().length < 50}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart2 className="h-4 w-4 mr-2" />
                          Analyze Text
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleClearAnalysis}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleUseExample}
                        className="flex-1"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Use Example
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearchKeywords} className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search for a word..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button type="submit">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {focusWord && (
                      <div className="flex items-center justify-between bg-primary/10 p-2 rounded-md">
                        <span className="text-sm">
                          Focused on: <strong>{focusWord}</strong>
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFocusWord(null)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content - Visualization */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle>Emotional Landscape Visualization</CardTitle>
                  <CardDescription>
                    3D visualization of emotional patterns in your document
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[500px] rounded-md overflow-hidden border">
                    <DocumentEmbedding 
                      points={points}
                      onPointClick={handlePointClick}
                      isInteractive={true}
                      focusOnWord={focusWord}
                      sourceDescription={isUsingExample ? "Example Journal Entry" : selectedFile?.name}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle>Detailed Analysis</CardTitle>
                  <CardDescription>
                    Explore different aspects of your document analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="overflow-x-auto w-full justify-start">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="themes">Themes</TabsTrigger>
                      <TabsTrigger value="keyphrases">Key Words</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6">
                      <SentimentOverview 
                        data={{
                          overallSentiment: journalData.overallSentiment,
                          distribution: journalData.distribution,
                          fileName: isUsingExample ? "Example Journal Entry" : selectedFile?.name || "Journal Text"
                        }}
                        sourceDescription={isUsingExample ? "Example Journal Entry" : selectedFile?.name}
                      />
                    </TabsContent>
                    
                    <TabsContent value="timeline" className="mt-6">
                      <SentimentTimeline 
                        data={journalData.timeline}
                        sourceDescription={isUsingExample ? "Example Journal Entry" : selectedFile?.name}
                      />
                    </TabsContent>
                    
                    <TabsContent value="themes" className="mt-6">
                      <EntitySentiment 
                        data={journalData.entities}
                        sourceDescription={isUsingExample ? "Example Journal Entry" : selectedFile?.name}
                      />
                    </TabsContent>
                    
                    <TabsContent value="keyphrases" className="mt-6">
                      <KeyPhrases 
                        data={journalData.keyPhrases}
                        sourceDescription={isUsingExample ? "Example Journal Entry" : selectedFile?.name}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Insights
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
