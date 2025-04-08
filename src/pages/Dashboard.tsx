
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

const sampleJournalText = "Today I experienced another panic attack during our team meeting. My heart started racing suddenly, and I felt that familiar shortness of breath. I tried to use the breathing techniques my therapist taught me, but I still felt overwhelmed. The physical symptoms lasted about 10 minutes, but the anxious feeling stayed with me for hours afterward. I wonder if the recent medication adjustment is causing these more intense episodes. I've also been having trouble sleeping, which probably isn't helping. My therapist suggested more mindfulness practice and identifying specific triggers. My support system at home has been helpful, but I'm still struggling at work. I need to find better coping mechanisms for these situations.";

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
  const [pdfText, setPdfText] = useState(sampleJournalText);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentData, setSentimentData] = useState<any>(sampleData);
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
  const [consoleMessages, setConsoleMessages] = useState<{ level: string; message: string; timestamp: string }[]>([]);

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
      
      if (typeof window !== 'undefined') {
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
        ...prev.slice(0, 99)
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
        
        analyzeSentiment(file, extractedText);
      } else {
        const fallbackTexts = [
          `This is a simulated text extraction from ${file.name}. In a real application, we would extract the actual content of the PDF file.`,
          `Sample content from ${file.name}: Today I felt anxious at work. My heart was racing during the morning meeting. I used deep breathing to calm down.`
        ];
        
        const randomIndex = Math.floor(Math.random() * fallbackTexts.length);
        const fallbackText = fallbackTexts[randomIndex];
        setPdfText(fallbackText);
        toast.warning("Could not extract text properly, using sample text instead");
        
        analyzeSentiment(file, fallbackText);
      }
    }
  };

  const togglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer);
  };

  const analyzeSentiment = async (file: File, text: string) => {
    setIsAnalyzing(true);
    try {
      const results = await analyzePdfContent(text, file.name);
      setSentimentData({
        ...results,
        fileName: file.name,
        fileSize: file.size,
        wordCount: text.split(/\s+/).length
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
          text: text.substring(i * 100, (i + 1) * 100).trim() || "Sample text segment"
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
        wordCount: text.split(/\s+/).length,
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleDebugPanel}
              className="flex items-center ml-auto"
            >
              <Bug className="h-4 w-4 mr-2 text-red-500" />
              Debug
            </Button>
          </div>
          
          <Card className="border border-border shadow-md bg-card">
            <CardContent className="pt-6 pb-6">
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
                    onClick={() => file && analyzeSentiment(file, pdfText)} 
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

          {pdfUrl && showPdfViewer && (
            <PdfViewer 
              key={`pdf-viewer-${pdfUrl}`}
              pdfUrl={pdfUrl} 
              className="mb-6 animate-fade-in"
            />
          )}

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
                          <Button variant="outline" size="sm" className="h-9">
                            <Search className="h-4 w-4 mr-2" />
                            Search Words
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" sideOffset={10} align="end" ref={searchDropdownRef}>
                          <Command>
                            <CommandInput 
                              placeholder="Search for a word..."
                              value={searchTerm}
                              onValueChange={setSearchTerm}
                            />
                            {searchTerm && (
                              <div className="absolute right-3 top-3">
                                <X 
                                  className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                  onClick={handleClearSearch}
                                />
                              </div>
                            )}
                            <CommandList>
                              <CommandEmpty>No words found.</CommandEmpty>
                              <CommandGroup>
                                {uniqueWords
                                  .filter(word => word.toLowerCase().includes(searchTerm.toLowerCase()))
                                  .slice(0, 5)
                                  .map((word, i) => (
                                    <CommandItem
                                      key={i}
                                      onSelect={() => handleSelectWord(word)}
                                    >
                                      <CircleDot className="h-4 w-4 mr-2" />
                                      {word}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {selectedWord && !comparisonWord && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCompareWord}
                          className="h-9"
                        >
                          <GitCompareArrows className="h-4 w-4 mr-2" />
                          Compare
                        </Button>
                      )}
                      
                      {comparisonWord && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearComparison}
                          className="h-9"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear Comparison
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {showComparison && !comparisonWord && (
                    <div className="mb-4 p-4 bg-muted/50 rounded-lg flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">
                          Select a word to compare with "{selectedWord}"
                        </p>
                        <Popover 
                          open={comparisonSearchOpen} 
                          onOpenChange={setComparisonSearchOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <Search className="h-4 w-4 mr-2" />
                              {comparisonSearchTerm || "Search words..."}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0" sideOffset={10} ref={comparisonSearchRef}>
                            <Command>
                              <CommandInput 
                                placeholder="Type to search..."
                                value={comparisonSearchTerm}
                                onValueChange={setComparisonSearchTerm}
                              />
                              <CommandList>
                                <CommandEmpty>No words found.</CommandEmpty>
                                <CommandGroup>
                                  {uniqueWords
                                    .filter(word => word.toLowerCase().includes(comparisonSearchTerm.toLowerCase()))
                                    .filter(word => word !== selectedWord)
                                    .slice(0, 5)
                                    .map((word, i) => (
                                      <CommandItem
                                        key={i}
                                        onSelect={() => handleSelectComparisonWord(word)}
                                      >
                                        <CircleDot className="h-4 w-4 mr-2" />
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
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="h-[500px] border rounded-lg overflow-hidden bg-muted/30 relative">
                        <DocumentEmbedding 
                          points={filteredPoints}
                          onPointClick={handlePointClick}
                          focusOnWord={selectedWord}
                          comparisonWord={comparisonWord}
                          visibleClusterCount={visibleClusterCount}
                          onResetView={() => {}} // Placeholder
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedWord && selectedPoint && (
                        <Card className="border-0 shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl">Word Info</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg">{selectedWord}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Sentiment Score: {selectedPoint.sentiment.toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Emotional tone: {selectedPoint.emotionalTone}
                                </p>
                              </div>
                              
                              {selectedPoint.keywords && selectedPoint.keywords.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Related Keywords</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedPoint.keywords.map((keyword, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {selectedCluster && (
                                <div className="text-sm">
                                  <span className="font-medium">Cluster:</span> {selectedCluster}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {comparisonWord && comparisonPoint && selectedPoint && (
                        <Card className="border-0 shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl">Word Comparison</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <WordComparison 
                              word1={selectedWord || ''} 
                              word2={comparisonWord}
                              point1={selectedPoint}
                              point2={comparisonPoint}
                              relationship={calculateRelationship(selectedPoint, comparisonPoint)}
                            />
                          </CardContent>
                        </Card>
                      )}
                      
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Emotional Clusters</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {emotionalClusters.slice(0, visibleClusterCount).map((cluster, idx) => (
                              <div 
                                key={idx}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                  selectedCluster === cluster.name 
                                    ? 'bg-primary/10 border-l-4' 
                                    : 'bg-muted/50 hover:bg-muted/80'
                                }`}
                                style={{ 
                                  borderLeftColor: selectedCluster === cluster.name ? cluster.color : 'transparent',
                                  borderLeftWidth: selectedCluster === cluster.name ? '4px' : '0'
                                }}
                                onClick={() => handleSelectCluster(cluster)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div 
                                      className="h-3 w-3 rounded-full mr-2"
                                      style={{ backgroundColor: cluster.color }}
                                    ></div>
                                    <span className="font-medium text-sm">{cluster.name}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {clusterPoints[cluster.name]?.length || 0} words
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {emotionalClusters.length > 5 && (
                              <div className="pt-2">
                                <Slider
                                  value={[visibleClusterCount]}
                                  min={1}
                                  max={Math.min(emotionalClusters.length, 10)}
                                  step={1}
                                  onValueChange={(value) => setVisibleClusterCount(value[0])}
                                  className="py-4"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>Show fewer</span>
                                  <span>{visibleClusterCount} of {emotionalClusters.length}</span>
                                  <span>Show more</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="entities">Entities</TabsTrigger>
                  <TabsTrigger value="keyphrases">Key Phrases</TabsTrigger>
                  <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <SentimentOverview data={sentimentData} />
                </TabsContent>
                
                <TabsContent value="timeline">
                  <SentimentTimeline data={sentimentData.timeline} />
                </TabsContent>
                
                <TabsContent value="entities">
                  <EntitySentiment 
                    data={sentimentData.entities} 
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="keyphrases">
                  <KeyPhrases 
                    data={sentimentData.keyPhrases} 
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="wellbeing">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>Wellbeing Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {wellbeingSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                              <div className="mt-0.5">{suggestion.icon}</div>
                              <div>
                                <h3 className="font-medium mb-1">{suggestion.title}</h3>
                                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>Mental Health Resources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {mentalHealthResources.map((resource, idx) => (
                            <div key={idx} className="p-3 rounded-lg border bg-card">
                              <h3 className="font-medium mb-1">{resource.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline inline-flex items-center"
                              >
                                <Info className="h-3 w-3 mr-1" />
                                Learn more
                              </a>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      
      {showDebugPanel && (
        <DebugPanel 
          isOpen={showDebugPanel}
          onClose={() => setShowDebugPanel(false)}
          debugState={debugState}
          consoleMessages={consoleMessages}
        />
      )}
    </div>
  );
};

export default Dashboard;
