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
      // Process the actual text from the PDF for analysis
      console.log(`Analyzing PDF text of length: ${pdfText.length} from file: ${fileName}`);
      
      // Extract real words from the PDF text
      const words = pdfText
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.replace(/[^\w\s]|_/g, ""))
        .filter(word => word.length > 2);
      
      // Count word frequencies
      const wordFrequency: Record<string, number> = {};
      words.forEach(word => {
        if (wordFrequency[word]) {
          wordFrequency[word]++;
        } else {
          wordFrequency[word] = 1;
        }
      });
      
      // Get top words for key phrases
      const topWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([word, count]) => ({
          phrase: word,
          relevance: Math.random() * 0.3 + 0.7,
          sentiment: Math.random() * 0.8 + 0.1,
          occurrences: count
        }));
      
      // Generate entities from the actual text
      const potentialEntities = [
        "Anxiety", "Depression", "Therapy", "Medication", 
        "Doctor", "Family", "Work", "Sleep",
        "Stress", "Fear", "Breathing", "Heart"
      ];
      
      const entities = potentialEntities.map(entity => {
        const regex = new RegExp(entity.toLowerCase(), 'gi');
        const matches = pdfText.match(regex);
        const mentions = matches ? matches.length : 0;
        
        // Only include entities that actually appear in the text
        if (mentions > 0) {
          return {
            name: entity,
            sentiment: Math.random() * 0.8 + 0.1,
            mentions: mentions,
            contexts: Array.from({ length: Math.min(3, mentions) }, () => {
              const index = pdfText.toLowerCase().indexOf(entity.toLowerCase());
              const start = Math.max(0, index - 50);
              const end = Math.min(pdfText.length, index + 50);
              return `Context: ${pdfText.substring(start, end).trim()}`;
            })
          };
        }
        return null;
      }).filter(Boolean) as Array<any>;
      
      // Calculate an actual sentiment score based on word presence
      const positiveWords = ["good", "better", "improve", "happy", "calm", "relax", "hope", "positive", "therapy", "help"];
      const negativeWords = ["anxiety", "panic", "fear", "nervous", "worried", "stress", "bad", "trouble", "difficult", "overwhelm"];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
      });
      
      const totalSentimentWords = Math.max(1, positiveCount + negativeCount);
      const sentimentScore = positiveCount / totalSentimentWords;
      
      let sentimentLabel = "Neutral";
      if (sentimentScore >= 0.6) sentimentLabel = "Positive";
      else if (sentimentScore < 0.4) sentimentLabel = "Negative";
      
      // Create actual distribution based on word counts
      const positivePercentage = Math.round((positiveCount / totalSentimentWords) * 100);
      const negativePercentage = Math.round((negativeCount / totalSentimentWords) * 100);
      const neutralPercentage = Math.max(0, 100 - positivePercentage - negativePercentage);
      
      const mockData = {
        overallSentiment: {
          score: sentimentScore,
          label: sentimentLabel
        },
        distribution: {
          positive: positivePercentage,
          neutral: neutralPercentage,
          negative: negativePercentage
        },
        timeline: Array.from({ length: 20 }, (_, i) => {
          const sectionStart = Math.floor(i * pdfText.length / 20);
          const sectionEnd = Math.floor((i + 1) * pdfText.length / 20);
          const section = pdfText.substring(sectionStart, sectionEnd);
          
          // Calculate local sentiment for this section
          let localPositive = 0;
          let localNegative = 0;
          section.toLowerCase().split(/\s+/).forEach(word => {
            if (positiveWords.includes(word)) localPositive++;
            if (negativeWords.includes(word)) localNegative++;
          });
          
          const localTotal = Math.max(1, localPositive + localNegative);
          const localScore = localPositive / localTotal;
          
          return {
            page: i + 1,
            score: localScore,
            text: section.trim() || "Sample text segment"
          };
        }),
        entities: entities.length > 0 ? entities : [
          { name: "Anxiety", sentiment: 0.2, mentions: 3, contexts: ["Context: Sample context for anxiety"] },
          { name: "Therapy", sentiment: 0.7, mentions: 2, contexts: ["Context: Sample context for therapy"] }
        ],
        keyPhrases: topWords.length > 0 ? topWords : [
          { phrase: "sample phrase", relevance: 0.8, sentiment: 0.5, occurrences: 2 }
        ],
        clusters: [
          { name: "Anxiety Symptoms", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.4 + 0.1 },
          { name: "Treatment", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.3 + 0.4 },
          { name: "Daily Life", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.3 + 0.3 },
          { name: "Support System", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.3 + 0.5 },
          { name: "Coping Strategies", size: Math.floor(Math.random() * 10) + 5, sentiment: Math.random() * 0.3 + 0.5 },
        ],
        summary: `Analysis of "${fileName}": ${pdfText.substring(0, 200)}...`,
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
    { name: "Sleep", sentiment: 0.35, mentions: 4, contexts: [["Context: Difficulty sleeping due to anxiety"]] },
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
        console.log(`PDF text extracted with ${wordCount} words. Beginning analysis...`);
        
        // Pass the actual file and extracted text for analysis
        analyzeSentiment(file, extractedText);
      } else {
        toast.warning("Could not extract text properly, using sample text instead");
        console.warn("PDF text extraction failed, using fallback text");
        
        // Fallback to sample text in case of extraction failure
        const fallbackText = sampleJournalText;
        setPdfText(fallbackText);
        
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
      console.log(`Starting sentiment analysis for file: ${file.name}`);
      const results = await analyzePdfContent(text, file.name);
      
      // Store analysis results
      setSentimentData({
        ...results,
        fileName: file.name,
        fileSize: file.size,
        wordCount: text.split(/\s+/).length
      });
      
      toast.success("Analysis complete!");
      console.log(`Analysis complete for: ${file.name}`);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      toast.error("Failed to analyze document");
      
      // Provide fallback data
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
        summary: `Fallback analysis for "${file.name}". The analysis shows patterns of anxiety and stress with some coping mechanisms mentioned.`,
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
                        <
