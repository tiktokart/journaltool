import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/FileUploader";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { Header } from "@/components/Header";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { toast } from "sonner";
import { Loader2, CircleDot, Search, FileText, X, GitCompareArrows, ArrowLeftRight, RotateCcw, BookOpen, Info, Settings, Heart, Brain } from "lucide-react";
import { Point } from "@/types/embedding";
import { generateMockPoints, getEmotionColor } from "@/utils/embeddingUtils";
import { WordComparison } from "@/components/WordComparison";
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

const analyzePdfContent = async (pdfText: string, fileName: string) => {
  return new Promise((resolve) => {
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
          segment: i + 1,
          sentiment: Math.random() * 0.7 + 0.15,
          text: pdfText.substring(i * 100, (i + 1) * 100).trim() || "Sample text segment"
        })),
        entities: Array.from({ length: 8 }, (_, i) => ({
          name: ["Anxiety", "Depression", "Therapy", "Medication", "Doctor", "Family", "Work", "Sleep"][i],
          sentiment: Math.random() * 0.8 + 0.1,
          mentions: Math.floor(Math.random() * 10) + 1,
          contexts: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
            "Context: " + pdfText.substring(Math.floor(Math.random() * pdfText.length), 
            Math.floor(Math.random() * pdfText.length) + 100).trim()
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
      
      if (comparisonSearchRef.current && !comparisonSearchRef.current.contains(event.target as Node)) {
        setComparisonSearchOpen(false);
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
        .split(/\s+/)
        .filter(word => word.length > 2)
        .map(word => word.replace(/[^\w\s]|_/g, "").toLowerCase())
        .filter(Boolean);
      
      const uniqueWordsSet = [...new Set(allWords)];
      setUniqueWords(uniqueWordsSet);
      
      console.log(`Total unique words found: ${uniqueWordsSet.length}`);
      
      const clusters = sentimentData.clusters.map((cluster: any, index: number) => {
        const color = getEmotionColor(cluster.sentiment);
        return {
          ...cluster,
          id: index,
          color: `rgb(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255})`,
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
        const assignedPoints = mockPoints
          .filter(p => !Object.values(clusterPointsMap).flat().some(cp => cp.id === p.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, clusterSize);
        
        clusterPointsMap[cluster.name] = assignedPoints;
      });
      setClusterPoints(clusterPointsMap);
    }
  }, [sentimentData, pdfText]);

  const handleFileUpload = (files: File[], extractedText?: string) => {
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
      
      if (extractedText && extractedText.length > 0) {
        setPdfText(extractedText);
        const wordCount = extractedText.split(/\s+/).length;
        toast.info(`Extracted ${wordCount} words from PDF for analysis`);
      } else {
        const mockText = `This is a simulated text extraction from ${file.name}. In a real application, we would extract the actual content of the PDF file.`;
        setPdfText(mockText);
        toast.warning("Could not extract text properly, using sample text instead");
      }
    }
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
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <div className="flex items-center">
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
                    <CardTitle className="flex items-center">
                      <span>Latent Emotional Analysis</span>
                    </CardTitle>
                    
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
                      
                      <div className="relative w-full md:w-64">
                        <div className="relative w-full">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search words or emotions..." 
                            className="pl-8 w-full pr-8"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                            }}
                            onFocus={() => {
                              if (uniqueWords.length > 0) {
                                setOpen(true);
                              }
                            }}
                          />
                          {searchTerm && (
                            <button 
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={handleClearSearch}
                            >
                              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                          )}
                        </div>
                        {uniqueWords.length > 0 && open && (
                          <div 
                            ref={searchDropdownRef}
                            className="absolute w-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 max-h-[300px] overflow-y-auto"
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
                          </div>
                        )}
                      </div>
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
                      focusOnWord={selectedWord || null}
                      sourceDescription={sentimentData.sourceDescription}
                      onResetView={handleResetVisualization}
                      visibleClusterCount={visibleClusterCount}
                    />
                  </div>
                </CardContent>
              </Card>
              
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="border border-border shadow-md bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary" />
                        Emotional Clusters
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Clusters: {visibleClusterCount}</span>
                        <Slider 
                          value={[visibleClusterCount]} 
                          min={1} 
                          max={10} 
                          step={1} 
                          className="w-24"
                          onValueChange={(value) => setVisibleClusterCount(value[0])}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {emotionalClusters.map((cluster) => (
                        <div 
                          key={cluster.id}
                          className={`border rounded-md overflow-hidden transition-all ${
                            selectedCluster === cluster.name ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <div 
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleClusterExpanded(cluster.name)}
                          >
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: cluster.color }}
                              />
                              <span className="font-medium">{cluster.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {cluster.size} words
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCluster(cluster);
                                }}
                              >
                                {selectedCluster === cluster.name ? 'Clear' : 'Focus'}
                              </Button>
                              <span className="text-xs">
                                {clusterExpanded[cluster.name] ? '▼' : '▶'}
                              </span>
                            </div>
                          </div>
                          
                          {clusterExpanded[cluster.name] && (
                            <div className="p-3 border-t bg-muted/30">
                              <div className="mb-2">
                                <span className="text-sm font-medium">Sentiment: </span>
                                <span className="text-sm">
                                  {cluster.sentiment >= 0.7 ? "Very Positive" : 
                                    cluster.sentiment >= 0.5 ? "Positive" : 
                                    cluster.sentiment >= 0.4 ? "Neutral" : 
                                    cluster.sentiment >= 0.25 ? "Negative" : "Very Negative"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(clusterPoints[cluster.name] || []).slice(0, 10).map((point, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => handlePointClick(point)}
                                  >
                                    {point.word}
                                  </Badge>
                                ))}
                                {(clusterPoints[cluster.name] || []).length > 10 && (
                                  <Badge variant="outline">
                                    +{(clusterPoints[cluster.name] || []).length - 10} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-border shadow-md bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <GitCompareArrows className="h-5 w-5 mr-2 text-primary" />
                        Word Comparison
                      </CardTitle>
                      {selectedPoint && !comparisonPoint && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCompareWord}
                          className="h-8"
                        >
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Compare
                        </Button>
                      )}
                      {(selectedPoint || comparisonPoint) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleClearComparison}
                          className="h-8"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedPoint ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-md p-3 bg-muted/30">
                            <div className="flex items-center space-x-2 mb-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ 
                                  backgroundColor: `rgb(${selectedPoint.color[0] * 255}, ${selectedPoint.color[1] * 255}, ${selectedPoint.color[2] * 255})` 
                                }} 
                              />
                              <span className="font-medium">{selectedPoint.word}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Emotion: </span>
                                <span>{selectedPoint.emotionalTone || "Neutral"}</span>
                              </div>
                              <div>
                                <span className="font-medium">Sentiment: </span>
                                <span>
                                  {selectedPoint.sentiment.toFixed(2)}
                                  {selectedPoint.sentiment >= 0.7 ? " (Very Positive)" : 
                                    selectedPoint.sentiment >= 0.5 ? " (Positive)" : 
                                    selectedPoint.sentiment >= 0.4 ? " (Neutral)" : 
                                    selectedPoint.sentiment >= 0.25 ? " (Negative)" : " (Very Negative)"}
                                </span>
                              </div>
                              {selectedPoint.keywords && selectedPoint.keywords.length > 0 && (
                                <div>
                                  <span className="font-medium">Related concepts: </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedPoint.keywords.map((keyword, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {comparisonPoint ? (
                            <div className="border rounded-md p-3 bg-muted/30">
                              <div className="flex items-center space-x-2 mb-3">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ 
                                    backgroundColor: `rgb(${comparisonPoint.color[0] * 255}, ${comparisonPoint.color[1] * 255}, ${comparisonPoint.color[2] * 255})` 
                                  }} 
                                />
                                <span className="font-medium">{comparisonPoint.word}</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Emotion: </span>
                                  <span>{comparisonPoint.emotionalTone || "Neutral"}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Sentiment: </span>
                                  <span>
                                    {comparisonPoint.sentiment.toFixed(2)}
                                    {comparisonPoint.sentiment >= 0.7 ? " (Very Positive)" : 
                                      comparisonPoint.sentiment >= 0.5 ? " (Positive)" : 
                                      comparisonPoint.sentiment >= 0.4 ? " (Neutral)" : 
                                      comparisonPoint.sentiment >= 0.25 ? " (Negative)" : " (Very Negative)"}
                                  </span>
                                </div>
                                {comparisonPoint.keywords && comparisonPoint.keywords.length > 0 && (
                                  <div>
                                    <span className="font-medium">Related concepts: </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {comparisonPoint.keywords.map((keyword, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {keyword}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : showComparison ? (
                            <div className="border rounded-md p-3 bg-muted/30">
                              <div className="text-sm text-muted-foreground mb-3">
                                Select a word to compare with "{selectedPoint.word}"
                              </div>
                              <div className="relative">
                                <div className="relative w-full">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Search for a word..." 
                                    className="pl-8 w-full pr-8"
                                    value={comparisonSearchTerm}
                                    onChange={(e) => {
                                      setComparisonSearchTerm(e.target.value);
                                    }}
                                    onFocus={() => {
                                      if (uniqueWords.length > 0) {
                                        setComparisonSearchOpen(true);
                                      }
                                    }}
                                  />
                                </div>
                                {uniqueWords.length > 0 && comparisonSearchOpen && (
                                  <div 
                                    ref={comparisonSearchRef}
                                    className="absolute w-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 max-h-[200px] overflow-y-auto"
                                  >
                                    <Command>
                                      <CommandInput 
                                        placeholder="Search words..." 
                                        value={comparisonSearchTerm}
                                        onValueChange={setComparisonSearchTerm}
                                      />
                                      <CommandList>
                                        <CommandEmpty>No results found</CommandEmpty>
                                        <CommandGroup>
                                          {uniqueWords
                                            .filter(word => 
                                              word.toLowerCase().includes(comparisonSearchTerm.toLowerCase()) && 
                                              word !== selectedPoint.word
                                            )
                                            .slice(0, 100)
                                            .map((word) => (
                                              <CommandItem 
                                                key={word} 
                                                value={word}
                                                onSelect={handleSelectComparisonWord}
                                              >
                                                {word}
                                              </CommandItem>
                                            ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="border rounded-md p-3 bg-muted/30 flex items-center justify-center">
                              <div className="text-center">
                                <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  Click "Compare" to select another word and see the relationship
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {selectedPoint && comparisonPoint && (
                          <div className="mt-4 border-t pt-4">
                            <h3 className="text-sm font-medium mb-3">Relationship Analysis</h3>
                            
                            {(() => {
                              const relationship = calculateRelationship(selectedPoint, comparisonPoint);
                              if (!relationship) return null;
                              
                              return (
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs font-medium mb-1">Contextual Similarity</p>
                                    <div className="bg-muted rounded-md p-2">
                                      <div className="w-full bg-background rounded-full h-2">
                                        <div 
                                          className="bg-blue-500 h-2 rounded-full" 
                                          style={{ width: `${relationship.spatialSimilarity * 100}%` }}
                                        ></div>
                                      </div>
                                      <p className="text-xs mt-1 text-center">
                                        {Math.round(relationship.spatialSimilarity * 100)}% similar context
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs font-medium mb-1">Emotional Alignment</p>
                                    <div className="bg-muted rounded-md p-2">
                                      <div className="w-full bg-background rounded-full h-2">
                                        <div 
                                          className="bg-purple-500 h-2 rounded-full" 
                                          style={{ width: `${relationship.sentimentSimilarity * 100}%` }}
                                        ></div>
                                      </div>
                                      <p className="text-xs mt-1 text-center">
                                        {Math.round(relationship.sentimentSimilarity * 100)}% sentiment alignment
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-xs font-medium mb-1">Emotional Group</p>
                                      <div className="bg-muted rounded-md p-2 text-center">
                                        {relationship.sameEmotionalGroup ? (
                                          <span className="text-green-500 text-xs font-medium">Same group</span>
                                        ) : (
                                          <span className="text-orange-500 text-xs font-medium">Different groups</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <p className="text-xs font-medium mb-1">Shared Keywords</p>
                                      <div className="bg-muted rounded-md p-2 text-center min-h-[1.5rem] flex items-center justify-center">
                                        {relationship.sharedKeywords.length > 0 ? (
                                          <span className="text-green-500 text-xs font-medium">
                                            {relationship.sharedKeywords.length} shared
                                          </span>
                                        ) : (
                                          <span className="text-xs text-muted-foreground">None</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {relationship.sharedKeywords.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium mb-1">Common Themes</p>
                                      <div className="flex flex-wrap gap-1">
                                        {relationship.sharedKeywords.map((keyword, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            {keyword}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Info className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-center">
                          Select a word from the visualization to see details and compare with other words
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {showWellbeingSuggestions && (
                <Card className="border border-border shadow-md bg-card mt-8">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-red-500" />
                        Resources & Support
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowWellbeingSuggestions(false)}
                        className="h-8"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Hide
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-3">Wellbeing Suggestions</h3>
                        <div className="space-y-3">
                          {wellbeingSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-md">
                              <div className="mt-0.5">
                                {suggestion.icon}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">{suggestion.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {suggestion.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Mental Health Resources</h3>
                        <div className="space-y-3">
                          {mentalHealthResources.map((resource, idx) => (
                            <div key={idx} className="p-3 bg-muted/30 rounded-md">
                              <h4 className="text-sm font-medium">{resource.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {resource.description}
                              </p>
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline mt-1 inline-block"
                              >
                                Visit Website
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
