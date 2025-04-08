import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/FileUploader";
import { PdfViewer } from "@/components/PdfViewer";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { Header } from "@/components/Header";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { toast } from "sonner";
import { Loader2, CircleDot, Search, FileText, X, GitCompareArrows, ArrowLeftRight, RotateCcw, BookOpen, Info, Settings, Heart, Brain, Bug } from "lucide-react";
import { Point } from "@/types/embedding";
import { generateMockPoints, getEmotionColor } from "@/utils/embeddingUtils";
import { WordComparison } from "@/components/WordComparison";
import { DebugPanel } from "@/components/DebugPanel";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

const getRGBColorString = (color: number[]): string => {
  return `rgb(${Math.floor(color[0] * 255)}, ${Math.floor(color[1] * 255)}, ${Math.floor(color[2] * 255)})`;
};

const analyzePdfContent = async (pdfText: string, fileName: string) => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      const mockData = {
        overallSentiment: {
          score: Math.random() * 0.5 + 0.25,
          label: Math.random() > 0.6 ? "Positive" : Math.random() > 0.3 ? "Neutral" : "Negative"
        },
        distribution: {
          positive: Math.floor(Math.random() * 40 + 30),
          neutral: Math.floor(Math.random() * 30 + 10),
          negative: Math.floor(Math.random() * 30 + 10)
        },
        timeline: Array.from({ length: 20 }, (_, i) => ({
          page: i + 1,
          score: Math.random() * 0.7 + 0.15,
          text: pdfText.substring(i * 100, (i + 1) * 100).trim() || "Sample text segment"
        })),
        entities: Array.from({ length: 8 }, (_, i) => ({
          name: ["Anxiety", "Depression", "Therapy", "Medication", "Doctor", "Family", "Work", "Sleep"][i],
          sentiment: Math.random() * 0.8 + 0.1,
          mentions: Math.floor(Math.random() * 10) + 1,
          contexts: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
            "Context: " + pdfText.substring(Math.floor(Math.random() * Math.max(pdfText.length, 1)), 
            Math.floor(Math.random() * Math.max(pdfText.length, 1)) + 100).trim()
          )
        })),
        keyPhrases: Array.from({ length: 12 }, (_, i) => ({
          phrase: ["panic attack", "heart racing", "shortness of breath", "feeling overwhelmed", 
                  "therapy session", "coping mechanisms", "deep breathing", "medication adjustment",
                  "sleep disturbance", "support system", "trigger identification", "mindfulness practice"][i],
          relevance: Math.random() * 0.5 + 0.5,
          sentiment: Math.random() * 0.8 + 0.1,
          occurrences: Math.floor(Math.random() * 5) + 1
        })),
        clusters: [
          { name: "Anxiety Symptoms", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.4 + 0.1 },
          { name: "Treatment", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.3 + 0.4 },
          { name: "Daily Life", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.3 + 0.3 },
          { name: "Support System", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.3 + 0.5 },
          { name: "Coping Strategies", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.3 + 0.5 },
        ],
        summary: "This document contains various topics and themes that have been analyzed for sentiment and emotional patterns. The analysis identifies key themes, sentiment distribution, and important phrases throughout the text.",
        sourceDescription: `PDF Document Analysis - ${fileName}`
      };
      
      resolve(mockData);
    }, 2000);
  });
};

const wellbeingSuggestions = [
  {
    title: "Practice Deep Breathing",
    description: "Try the 4-7-8 technique: inhale for 4 seconds, hold for 7, exhale for 8.",
    icon: <Heart className="h-5 w-5 text-red-500" />
  },
  {
    title: "Mindfulness Meditation",
    description: "Start with just 5 minutes daily of focused awareness on your breath.",
    icon: <Brain className="h-5 w-5 text-purple-500" />
  },
  {
    title: "Physical Activity",
    description: "Even a 10-minute walk can reduce anxiety and improve mood.",
    icon: <Heart className="h-5 w-5 text-green-500" />
  },
  {
    title: "Journaling",
    description: "Write down your thoughts and feelings to process them more effectively.",
    icon: <BookOpen className="h-5 w-5 text-blue-500" />
  },
  {
    title: "Connect with Others",
    description: "Share your feelings with someone you trust.",
    icon: <Heart className="h-5 w-5 text-pink-500" />
  }
];

const mentalHealthResources = [
  {
    name: "Crisis Text Line",
    description: "Text HOME to 741741 to connect with a Crisis Counselor",
    url: "https://www.crisistextline.org/"
  },
  {
    name: "National Suicide Prevention Lifeline",
    description: "1-800-273-8255 - Available 24/7",
    url: "https://suicidepreventionlifeline.org/"
  },
  {
    name: "SAMHSA's National Helpline",
    description: "1-800-662-4357 - Treatment referral and information service",
    url: "https://www.samhsa.gov/find-help/national-helpline"
  },
  {
    name: "Psychology Today Therapist Finder",
    description: "Search for therapists in your area",
    url: "https://www.psychologytoday.com/us/therapists"
  }
];

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [comparisonWord, setComparisonWord] = useState<string | null>(null);
  const [comparisonPoint, setComparisonPoint] = useState<Point | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [uniqueWords, setUniqueWords] = useState<string[]>([]);
  const [visibleClusterCount, setVisibleClusterCount] = useState(5);
  const searchDropdownRef = useRef<HTMLDivElement | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [emotionalClusters, setEmotionalClusters] = useState<any[]>([]);
  const [clusterColors, setClusterColors] = useState<Record<string, string>>({});
  const [clusterExpanded, setClusterExpanded] = useState<Record<string, boolean>>({});
  const [clusterPoints, setClusterPoints] = useState<Record<string, Point[]>>({});
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [comparisonSearchTerm, setComparisonSearchTerm] = useState("");
  const [comparisonSearchOpen, setComparisonSearchOpen] = useState(false);
  const comparisonSearchRef = useRef<HTMLDivElement | null>(null);
  const [showWellbeingSuggestions, setShowWellbeingSuggestions] = useState(true);
  const [wordsForComparison, setWordsForComparison] = useState<Point[]>([]);
  const [wordSearchTerm, setWordSearchTerm] = useState("");
  const [wordSearchOpen, setWordSearchOpen] = useState(false);
  const wordSearchRef = useRef<HTMLDivElement | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const consoleMessages = useState<{ level: string; message: string; timestamp: string }[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
      
      if (comparisonSearchRef.current && !comparisonSearchRef.current.contains(event.target as Node)) {
        setComparisonSearchOpen(false);
      }
      
      if (wordSearchRef.current && !wordSearchRef.current.contains(event.target as Node)) {
        setWordSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (sentimentData) {
      const mockPoints = generateMockPoints(pdfText, sentimentData);
      setPoints(mockPoints);
      setFilteredPoints(mockPoints);
      
      const allWords = pdfText
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.replace(/[^\w\s]|_/g, ""))
        .filter(word => word.length > 2);
      
      const uniqueWordsSet = new Set(allWords);
      const uniqueWordsArray = Array.from(uniqueWordsSet);
      setUniqueWords(uniqueWordsArray);
      
      console.log(`Total unique words found: ${uniqueWordsArray.length}`);
      
      const clusters = sentimentData.clusters.map((cluster: any, index: number) => {
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
      
      if (typeof window !== 'undefined' && window.documentEmbeddingPoints !== undefined) {
        window.documentEmbeddingPoints = mockPoints;
      }
    }
  }, [sentimentData, pdfText]);

  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    const interceptConsole = (
      originalFn: any, 
      level: string
    ) => (...args: any[]) => {
      originalFn(...args);
      
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      
      setConsoleMessages(prev => [
        { level, message, timestamp },
        ...prev.slice(0, 99) // Keep last 100 messages
      ]);
    };

    console.log = interceptConsole(originalConsoleLog, 'log');
    console.error = interceptConsole(originalConsoleError, 'error');
    console.warn = interceptConsole(originalConsoleWarn, 'warn');
    console.info = interceptConsole(originalConsoleInfo, 'info');

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
    };
  }, []);

  const handleFileUpload = (files: File[], extractedText?: string, embedUrl?: string) => {
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
      
      if (embedUrl) {
        setPdfUrl(embedUrl);
        setShowPdfViewer(true);
      }
      
      if (extractedText && extractedText.length > 0) {
        setPdfText(extractedText);
        const wordCount = extractedText.split(/\s+/).length;
        toast.info(`Extracted ${wordCount} words from PDF for analysis`);
      } else {
        const fallbackTexts = [
          `This is a simulated text extraction from ${file.name}. In a real application, we would extract the actual content of the PDF file.`,
          `Sample content from ${file.name}: Today I felt anxious at work. My heart was racing during the morning meeting. I used deep breathing to calm down.`
        ];
        
        const randomIndex = Math.floor(Math.random() * fallbackTexts.length);
        setPdfText(fallbackTexts[randomIndex]);
        toast.warning("Could not extract text properly, using sample text instead");
      }
    }
  };

  const togglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer);
  };

  const analyzeSentiment = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    try {
      const results = await analyzePdfContent(pdfText, file.name);
      setSentimentData({
        ...results,
        fileName: file.name,
        fileSize: file.size,
        wordCount: pdfText.split(/\s+/).length
      });
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      toast.error("Failed to analyze document");
      
      const mockData = {
        overallSentiment: {
          score: 0.3,
          label: "Negative"
        },
        distribution: {
          positive: 20,
          neutral: 30,
          negative: 50
        },
        timeline: Array.from({ length: 10 }, (_, i) => ({
          page: i + 1,
          score: 0.3 + (Math.random() * 0.3),
          text: pdfText.substring(i * 100, (i + 1) * 100).trim() || "Sample text segment"
        })),
        entities: [
          { name: "Anxiety", sentiment: 0.2, mentions: 5, contexts: ["Context: Feeling anxious in meetings"] },
          { name: "Sleep", sentiment: 0.4, mentions: 3, contexts: ["Context: Trouble sleeping at night"] },
        ],
        keyPhrases: [
          { phrase: "panic attack", relevance: 0.8, sentiment: 0.2, occurrences: 3 },
          { phrase: "deep breathing", relevance: 0.7, sentiment: 0.6, occurrences: 2 },
        ],
        clusters: [
          { name: "Anxiety Symptoms", size: 8, sentiment: 0.2 },
          { name: "Coping Strategies", size: 6, sentiment: 0.6 },
        ],
        summary: "This is a sample analysis of the document. The analysis shows patterns of anxiety and stress with some coping mechanisms mentioned.",
        fileName: file.name,
        fileSize: file.size,
        wordCount: pdfText.split(/\s+/).length,
        sourceDescription: `PDF Document Analysis - ${file.name}`
      };
      
      setSentimentData(mockData);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePointClick = (point: Point | null) => {
    if (point) {
      setSelectedWord(point.word);
      setSelectedPoint(point);
      toast.info(`Selected: ${point.word}`);
    } else {
      setSelectedWord(null);
      setSelectedPoint(null);
    }
  };

  const handleSelectWord = (word: string) => {
    const point = points.find(p => p.word === word);
    if (point) {
      setSelectedWord(word);
      setSelectedPoint(point);
      setOpen(false);
      toast.info(`Selected: ${word}`);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setOpen(false);
  };

  const handleResetVisualization = () => {
    setSelectedWord(null);
    setSelectedPoint(null);
    setComparisonWord(null);
    setComparisonPoint(null);
    setSelectedCluster(null);
    setFilteredPoints(points);
    toast.info("Visualization reset");
  };

  const handleCompareWord = () => {
    setShowComparison(true);
  };

  const handleSelectComparisonWord = (word: string) => {
    const point = points.find(p => p.word === word);
    if (point) {
      setComparisonWord(word);
      setComparisonPoint(point);
      setComparisonSearchOpen(false);
      toast.info(`Comparing with: ${word}`);
    }
  };

  const handleClearComparison = () => {
    setComparisonWord(null);
    setComparisonPoint(null);
    setComparisonSearchTerm("");
    setShowComparison(false);
  };

  const toggleClusterExpanded = (clusterName: string) => {
    setClusterExpanded(prev => ({
      ...prev,
      [clusterName]: !prev[clusterName]
    }));
  };

  const handleSelectCluster = (cluster: any) => {
    if (selectedCluster === cluster.name) {
      setSelectedCluster(null);
      setFilteredPoints(points);
      toast.info(`Showing all words`);
    } else {
      setSelectedCluster(cluster.name);
      const clusterWords = clusterPoints[cluster.name] || [];
      setFilteredPoints(clusterWords);
      toast.info(`Filtered to cluster: ${cluster.name}`);
    }
  };

  const calculateRelationship = (point1: Point, point2: Point) => {
    if (!point1 || !point2) return null;
    
    const distance = Math.sqrt(
      Math.pow(point1.position[0] - point2.position[0], 2) +
      Math.pow(point1.position[1] - point2.position[1], 2) +
      Math.pow(point1.position[2] - point2.position[2], 2)
    );
    
    const spatialSimilarity = Math.max(0, 1 - (distance / 2));
    
    const sentimentDiff = Math.abs(point1.sentiment - point2.sentiment);
    const sentimentSimilarity = 1 - sentimentDiff;
    
    const sameEmotionalGroup = point1.emotionalTone === point2.emotionalTone;
    
    const point1Keywords = point1.keywords || [];
    const point2Keywords = point2.keywords || [];
    const sharedKeywords = point1Keywords.filter(k => point2Keywords.includes(k));
    
    return {
      spatialSimilarity,
      sentimentSimilarity,
      sameEmotionalGroup,
      sharedKeywords
    };
  };

  const handleAddWordToComparison = () => {
    setWordSearchOpen(true);
  };

  const handleSelectWordForComparison = (word: string) => {
    const point = points.find(p => p.word === word);
    if (point && wordsForComparison.length < 4) {
      if (!wordsForComparison.some(p => p.id === point.id)) {
        setWordsForComparison(prev => [...prev, point]);
        setWordSearchTerm("");
        setWordSearchOpen(false);
        toast.info(`Added ${word} to comparison`);
      } else {
        toast.info(`${word} is already in comparison`);
      }
    } else if (wordsForComparison.length >= 4) {
      toast.error("Maximum of 4 words can be compared at once");
    }
  };

  const handleRemoveWordFromComparison = (point: Point) => {
    setWordsForComparison(prev => prev.filter(p => p.id !== point.id));
    toast.info(`Removed ${point.word} from comparison`);
  };

  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
    if (!showDebugPanel) {
      toast.info("Debug panel opened");
    }
  };

  const debugState = {
    file: file ? { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    } : null,
    pdfInfo: {
      hasUrl: Boolean(pdfUrl),
      textLength: pdfText.length,
      wordCount: pdfText.split(/\s+/).length
    },
    visualizationState: {
      pointsCount: points.length,
      filteredCount: filteredPoints.length,
      selectedWord,
      selectedCluster,
      visibleClusterCount
    },
    analysisStatus: {
      isAnalyzing,
      hasData: Boolean(sentimentData)
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Document Analysis</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleDebugPanel}
              className="flex items-center"
            >
              <Bug className="h-4 w-4 mr-2 text-red-500" />
              Debug
            </Button>
          </div>
          
          {/* File Upload Card */}
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
                    {pdfText && pdfText.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {pdfText.split(/\s+/).length} words extracted
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
                  {pdfUrl && (
                    <Button 
                      variant="outline" 
                      onClick={togglePdfViewer}
                      className="w-full"
                    >
                      {showPdfViewer ? "Hide PDF" : "View PDF"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PDF Viewer */}
          {pdfUrl && showPdfViewer && (
            <PdfViewer 
              pdfUrl={pdfUrl} 
              className="mb-6 animate-fade-in"
            />
          )}

          {/* Analysis Results */}
          {sentimentData && (
            <div className="animate-fade-in">
              <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <span className="text-sm">
                  <span className="font-medium">Currently analyzing:</span> {sentimentData.fileName} ({(sentimentData.fileSize / 1024 / 1024).toFixed(2)} MB)
                  {sentimentData.wordCount > 0 && (
                    <> • <span className="font-medium">{sentimentData.wordCount}</span> unique words extracted</>
                  )}
                </span>
              </div>
              
              {/* Document Summary */}
              <Card className="mb-6 border border-border shadow-md bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-xl">Document Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {sentimentData.summary || "No summary available for this document."}
                  </div>
                </CardContent>
              </Card>
              
              {/* Latent Emotional Analysis */}
              <Card className="border border-border shadow-md overflow-hidden bg-card mb-8">
                <CardHeader className="z-10">
                  <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <span>Latent Emotional Analysis</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        This is data analyzed from a made up experience of a Panic Attack
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleResetVisualization}
                        className="h-9"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset View
                      </Button>
                    
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 w-full md:w-64">
                            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {searchTerm || "Search words or emotions..."}
                            </span>
                            {searchTerm && (
                              <X 
                                className="h-4 w-4 ml-2 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearSearch();
                                }}
                              />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="p-0 w-full md:w-64 max-h-[300px] overflow-y-auto"
                          ref={searchDropdownRef}
                        >
                          <Command>
                            <CommandInput 
                              placeholder="Search words..." 
                              value={searchTerm}
                              onValueChange={setSearchTerm}
                            />
                            <CommandList>
                              <CommandEmpty>No results found</CommandEmpty>
                              <CommandGroup>
                                {uniqueWords
                                  .filter(word => word.toLowerCase().includes(searchTerm.toLowerCase()))
                                  .slice(0, 100)
                                  .map((word) => (
                                    <CommandItem 
                                      key={word} 
                                      value={word}
                                      onSelect={handleSelectWord}
                                    >
                                      {word}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="text-sm font-normal flex items-center text-muted-foreground">
                    <CircleDot className="h-4 w-4 mr-2" />
                    <span>
                      Hover or click on words to see emotional relationships. Use the Reset View button when needed.
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] relative">
                    <DocumentEmbedding 
                      points={filteredPoints}
                      onPointClick={handlePointClick}
                      isInteractive={true}
                      depressedJournalReference={false}
                      focusOnWord={selectedWord}
                      sourceDescription={sentimentData.sourceDescription}
                      onResetView={handleResetVisualization}
                      visibleClusterCount={visibleClusterCount}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Sentiment Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <div className="overflow-x-auto">
                  <TabsList className="inline-flex w-full justify-start space-x-1 overflow-x-auto">
                    <TabsTrigger value="overview" className="min-w-max">Overview</TabsTrigger>
                    <TabsTrigger value="timeline" className="min-w-max">Timeline</TabsTrigger>
                    <TabsTrigger value="themes" className="min-w-max">Themes</TabsTrigger>
                    <TabsTrigger value="keyphrases" className="min-w-max">Key Words</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="overview" className="mt-6">
                  <SentimentOverview 
                    data={{
                      overallSentiment: sentimentData.overallSentiment,
                      distribution: sentimentData.distribution,
                      fileName: sentimentData.fileName
                    }}
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-6">
                  <SentimentTimeline 
                    data={sentimentData.timeline}
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="themes" className="mt-6">
                  <EntitySentiment 
                    data={sentimentData.entities}
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="keyphrases" className="mt-6">
                  <KeyPhrases 
                    data={sentimentData.keyPhrases}
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
              </Tabs>
              
              {/* Emotional Clusters and Word Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Emotional Clusters */}
                <Card className="border border-border shadow-md bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary" />
                        Emotional Clusters
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Slider 
                          value={[visibleClusterCount]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(values) => setVisibleClusterCount(values[0])}
                          className="w-32"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          Show: {visibleClusterCount}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {emotionalClusters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No emotional clusters detected</p>
                      ) : (
                        emotionalClusters.map((cluster) => (
                          <div key={cluster.id} className="border border-border rounded-lg overflow-hidden">
                            <div 
                              className={`flex items-center justify-between p-3 cursor-pointer ${
                                selectedCluster === cluster.name ? 'bg-accent' : 'bg-card'
                              }`}
                              onClick={() => handleSelectCluster(cluster)}
                            >
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-3"
                                  style={{ backgroundColor: cluster.color }}
                                />
                                <span className="font-medium">{cluster.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {cluster.size} words
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleClusterExpanded(cluster.name);
                                  }}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {clusterExpanded[cluster.name] && (
                              <div className="p-3 bg-muted/30 text-sm">
                                <p className="text-muted-foreground mb-2">
                                  Sentiment: {(cluster.sentiment * 100).toFixed(0)}%
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {(clusterPoints[cluster.name] || []).slice(0, 5).map((point) => (
                                    <Badge 
                                      key={point.id} 
                                      className="bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                      {point.word}
                                    </Badge>
                                  ))}
                                  {(clusterPoints[cluster.name] || []).length > 5 && (
                                    <Badge variant="outline">
                                      +{(clusterPoints[cluster.name] || []).length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Word Comparison */}
                <Card className="border border-border shadow-md bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <GitCompareArrows className="h-5 w-5 mr-2 text-primary" />
                        Word Comparison
                      </CardTitle>
                      <div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddWordToComparison}
                          disabled={wordsForComparison.length >= 4}
                        >
                          Add Word
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {wordsForComparison.length === 0 ? (
                      <div className="text-center p-6">
                        <p className="text-sm text-muted-foreground">
                          Add words to compare emotional and semantic relationships
                        </p>
                        <Popover open={wordSearchOpen} onOpenChange={setWordSearchOpen}>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={handleAddWordToComparison}
                            >
                              Add First Word
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="p-0 w-full md:w-64 max-h-[300px] overflow-y-auto"
                            ref={wordSearchRef}
                          >
                            <Command>
                              <CommandInput 
                                placeholder="Search words..." 
                                value={wordSearchTerm}
                                onValueChange={setWordSearchTerm}
                              />
                              <CommandList>
                                <CommandEmpty>No results found</CommandEmpty>
                                <CommandGroup>
                                  {uniqueWords
                                    .filter(word => word.toLowerCase().includes(wordSearchTerm.toLowerCase()))
                                    .slice(0, 50)
                                    .map((word) => (
                                      <CommandItem 
                                        key={word} 
                                        value={word}
                                        onSelect={handleSelectWordForComparison}
                                      >
                                        {word}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : (
                      <WordComparison 
                        words={wordsForComparison}
                        onRemoveWord={handleRemoveWordFromComparison}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Wellbeing Suggestions */}
              {showWellbeingSuggestions && (
                <Card className="mt-8 border border-border shadow-md bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-red-500" />
                        Wellbeing Suggestions
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowWellbeingSuggestions(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wellbeingSuggestions.map((suggestion, index) => (
                        <div 
                          key={index} 
                          className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center mb-2">
                            {suggestion.icon}
                            <h3 className="font-medium ml-2">{suggestion.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        These are general wellbeing suggestions based on common practices.
                        <br />Always consult with a healthcare professional for personalized advice.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Mental Health Resources */}
              <Card className="mt-8 mb-8 border border-border shadow-md bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    Mental Health Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentalHealthResources.map((resource, index) => (
                      <a 
                        key={index} 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <h3 className="font-medium mb-1">{resource.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </a>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      If you're experiencing a mental health crisis, please reach out to a professional immediately.
                      <br />These resources are available to help.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      {/* Debug Panel */}
      {showDebugPanel && (
        <DebugPanel 
          debugState={debugState}
          onClose={() => setShowDebugPanel(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
