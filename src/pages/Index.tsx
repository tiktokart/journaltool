import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CircleDot, Search, RotateCcw, GitCompareArrows, X } from "lucide-react";
import { Header } from "@/components/Header";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { Point } from "@/types/embedding";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [comparisonPoint, setComparisonPoint] = useState<Point | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Point[]>([]);
  const [focusWord, setFocusWord] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [firstWordSearchValue, setFirstWordSearchValue] = useState("");
  const [firstWordSearchOpen, setFirstWordSearchOpen] = useState(false);
  const [secondWordSearchValue, setSecondWordSearchValue] = useState("");
  const [secondWordSearchOpen, setSecondWordSearchOpen] = useState(false);
  const [firstWordSearchResults, setFirstWordSearchResults] = useState<Point[]>([]);
  const [secondWordSearchResults, setSecondWordSearchResults] = useState<Point[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const sampleSentimentData = {
    overallSentiment: {
      score: 0.32,
      label: "Negative"
    },
    distribution: {
      positive: 22,
      neutral: 18,
      negative: 60
    },
    fileName: "Journal Entry #12",
    sourceDescription: "Journal Entry About Anxiety"
  };
  
  const sampleTimelineData = [
    { page: 1, score: 0.25, text: "I felt my heart racing as the panic started to set in." },
    { page: 2, score: 0.18, text: "My chest tightened and I couldn't catch my breath." },
    { page: 3, score: 0.22, text: "The world around me started spinning, everything became overwhelming." },
    { page: 4, score: 0.30, text: "I tried the breathing exercises my therapist taught me." },
    { page: 5, score: 0.35, text: "Slowly, I could feel my heart rate beginning to stabilize." },
    { page: 6, score: 0.42, text: "The tightness in my chest started to release, bit by bit." },
    { page: 7, score: 0.48, text: "I reminded myself that this feeling would pass, it always does." },
    { page: 8, score: 0.55, text: "Finally, I felt like I could breathe normally again." }
  ];
  
  const sampleEntityData = [
    { name: "Anxiety", sentiment: 0.22, mentions: 8, contexts: ["Context: I could feel the anxiety creeping up on me like a shadow", "Context: The anxiety made it hard to focus on anything else"] },
    { name: "Panic", sentiment: 0.18, mentions: 6, contexts: ["Context: The panic attack seemed to come out of nowhere", "Context: I recognized the signs of panic setting in"] },
    { name: "Breathing", sentiment: 0.45, mentions: 5, contexts: ["Context: My breathing became shallow and rapid", "Context: Deep breathing helped me calm down eventually"] },
    { name: "Heart", sentiment: 0.28, mentions: 4, contexts: ["Context: My heart was racing so fast I thought it might burst", "Context: I could feel my heartbeat pounding in my ears"] },
    { name: "Therapy", sentiment: 0.62, mentions: 3, contexts: ["Context: The techniques I learned in therapy really helped", "Context: I made a note to discuss this episode with my therapist"] }
  ];
  
  const sampleKeyPhrasesData = [
    { phrase: "panic attack", relevance: 0.95, sentiment: 0.18, occurrences: 5 },
    { phrase: "heart racing", relevance: 0.92, sentiment: 0.22, occurrences: 4 },
    { phrase: "shortness of breath", relevance: 0.90, sentiment: 0.20, occurrences: 4 },
    { phrase: "feeling overwhelmed", relevance: 0.88, sentiment: 0.25, occurrences: 3 },
    { phrase: "deep breathing", relevance: 0.85, sentiment: 0.55, occurrences: 3 },
    { phrase: "coping strategies", relevance: 0.82, sentiment: 0.60, occurrences: 2 },
    { phrase: "therapy techniques", relevance: 0.80, sentiment: 0.65, occurrences: 2 },
    { phrase: "anxiety symptoms", relevance: 0.78, sentiment: 0.30, occurrences: 2 }
  ];

  useEffect(() => {
    const checkForPoints = () => {
      if ((window as any).documentEmbeddingPoints) {
        setPoints((window as any).documentEmbeddingPoints);
      }
    };
    
    checkForPoints();
    
    const intervalId = setInterval(() => {
      if (points.length === 0) {
        checkForPoints();
      } else {
        clearInterval(intervalId);
      }
    }, 500);
    
    return () => clearInterval(intervalId);
  }, [points.length]);

  const handlePointClick = (point: Point | null) => {
    if (!point) {
      setSelectedPoint(null);
      setFocusWord(null);
      toast.info("Point deselected");
      return;
    }
    
    setSelectedPoint(point);
    setFocusWord(point.word);
    toast(`Selected: "${point.word}" (${point.emotionalTone || 'Neutral'})`);
  };
  
  const handlePointCompare = (point: Point) => {
    if (selectedPoint) {
      setComparisonPoint(point);
      toast.info(`Comparing "${selectedPoint.word}" with "${point.word}"`);
    } else {
      setSelectedPoint(point);
      setFocusWord(point.word);
      toast.info(`Selected: "${point.word}"`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    
    if (points.length === 0) {
      const embedPoints = (window as any).documentEmbeddingPoints;
      if (embedPoints && Array.isArray(embedPoints) && embedPoints.length > 0) {
        const results = embedPoints.filter(point => 
          (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase())) ||
          point.word.toLowerCase().includes(value.toLowerCase()) ||
          (point.keywords && point.keywords.some(keyword => 
            keyword.toLowerCase().includes(value.toLowerCase())
          ))
        );
        
        results.sort((a, b) => {
          const aEmotionMatch = a.emotionalTone && a.emotionalTone.toLowerCase().includes(value.toLowerCase());
          const bEmotionMatch = b.emotionalTone && b.emotionalTone.toLowerCase().includes(value.toLowerCase());
          
          if (aEmotionMatch && !bEmotionMatch) return -1;
          if (!aEmotionMatch && bEmotionMatch) return 1;
          return 0;
        });
        
        setSearchResults(results);
        return;
      }
      
      setSearchResults([]);
      return;
    }
    
    const results = points.filter(point => 
      (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase())) ||
      point.word.toLowerCase().includes(value.toLowerCase()) ||
      (point.keywords && point.keywords.some(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      ))
    );
    
    results.sort((a, b) => {
      const aEmotionMatch = a.emotionalTone && a.emotionalTone.toLowerCase().includes(value.toLowerCase());
      const bEmotionMatch = b.emotionalTone && b.emotionalTone.toLowerCase().includes(value.toLowerCase());
      
      if (aEmotionMatch && !bEmotionMatch) return -1;
      if (!aEmotionMatch && bEmotionMatch) return 1;
      return 0;
    });
    
    setSearchResults(results);
  };
  
  const handleFirstWordSearchChange = (value: string) => {
    setFirstWordSearchValue(value);
    
    if (!value.trim()) {
      setFirstWordSearchResults([]);
      return;
    }
    
    const results = points.filter(point => 
      (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase())) ||
      point.word.toLowerCase().includes(value.toLowerCase()) ||
      (point.keywords && point.keywords.some(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      ))
    );
    
    results.sort((a, b) => {
      const aEmotionMatch = a.emotionalTone && a.emotionalTone.toLowerCase().includes(value.toLowerCase());
      const bEmotionMatch = b.emotionalTone && b.emotionalTone.toLowerCase().includes(value.toLowerCase());
      
      if (aEmotionMatch && !bEmotionMatch) return -1;
      if (!aEmotionMatch && bEmotionMatch) return 1;
      return 0;
    });
    
    setFirstWordSearchResults(results);
  };
  
  const handleSecondWordSearchChange = (value: string) => {
    setSecondWordSearchValue(value);
    
    if (!value.trim()) {
      setSecondWordSearchResults([]);
      return;
    }
    
    const results = points.filter(point => 
      (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase())) ||
      point.word.toLowerCase().includes(value.toLowerCase()) ||
      (point.keywords && point.keywords.some(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      ))
    );
    
    results.sort((a, b) => {
      const aEmotionMatch = a.emotionalTone && a.emotionalTone.toLowerCase().includes(value.toLowerCase());
      const bEmotionMatch = b.emotionalTone && b.emotionalTone.toLowerCase().includes(value.toLowerCase());
      
      if (aEmotionMatch && !bEmotionMatch) return -1;
      if (!aEmotionMatch && bEmotionMatch) return 1;
      return 0;
    });
    
    setSecondWordSearchResults(results);
  };

  const handleSearchSelect = (point: Point) => {
    setSelectedPoint(point);
    setFocusWord(point.word);
    setOpen(false);
    toast(`Zooming to: "${point.word}"`);
  };
  
  const handleFirstWordSearchSelect = (point: Point) => {
    setSelectedPoint(point);
    setFocusWord(point.word);
    setFirstWordSearchOpen(false);
    toast(`Selected first word: "${point.word}"`);
  };
  
  const handleSecondWordSearchSelect = (point: Point) => {
    setComparisonPoint(point);
    setSecondWordSearchOpen(false);
    toast(`Selected second word: "${point.word}"`);
  };
  
  const handleClearFirstWord = () => {
    setSelectedPoint(null);
    setFocusWord(null);
    toast.info("First word cleared");
  };
  
  const handleClearSecondWord = () => {
    setComparisonPoint(null);
    toast.info("Second word cleared");
  };

  const handleVisualSearchSelect = (point: Point) => {
    if (!selectedPoint) {
      setSelectedPoint(point);
      setFocusWord(point.word);
      toast(`Selected: "${point.word}"`);
    } else if (!comparisonPoint) {
      setComparisonPoint(point);
      toast(`Comparing with: "${point.word}"`);
    }
  };

  const handleClearSelection = () => {
    setSelectedPoint(null);
    setFocusWord(null);
    setComparisonPoint(null);
    toast.info("Selection cleared");
  };

  const calculateRelationship = (point1: Point, point2: Point) => {
    if (!point1 || !point2) return null;
    
    const distance = Math.sqrt(
      Math.pow(point1.position[0] - point2.position[0], 2) +
      Math.pow(point1.position[1] - point2.position[1], 2) +
      Math.pow(point1.position[2] - point2.position[2], 2)
    );
    
    const normalizedDistance = Math.max(0, 1 - (distance / 40));
    
    const sentimentDiff = Math.abs(point1.sentiment - point2.sentiment);
    const sentimentSimilarity = 1 - sentimentDiff;
    
    const sameEmotionalGroup = 
      (point1.emotionalTone || "Neutral") === (point2.emotionalTone || "Neutral");
    
    const point1Keywords = point1.keywords || [];
    const point2Keywords = point2.keywords || [];
    const sharedKeywords = point1Keywords.filter(k => point2Keywords.includes(k));
    
    return {
      spatialSimilarity: normalizedDistance,
      sentimentSimilarity,
      sameEmotionalGroup,
      sharedKeywords
    };
  };

  const handleResetVisualization = () => {
    setSelectedPoint(null);
    setFocusWord(null);
    setComparisonPoint(null);
    toast.info("Visualization reset");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow flex items-center">
        <div className="container mx-auto max-w-7xl px-4 py-10 md:py-16">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 text-foreground">
              Journal Analysis Tool
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl text-center mb-8">
              A digital tool to understand your dreams and emotions
            </p>
            
            <div className="w-full max-w-2xl mb-6 text-center">
              <Card className="bg-muted/30 border-border">
                <CardContent className="pt-4 pb-4">
                  <h3 className="text-sm font-semibold mb-2 text-primary">Upload PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Step 1: Upload your Journal: Journal Entry #12.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full max-w-6xl mb-8 flex flex-col gap-6">
              <Card className="border border-border shadow-md overflow-hidden bg-card">
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
                          <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Search words..." 
                              className="pl-8 w-full pr-8"
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setOpen(true);
                              }}
                              onFocus={() => setOpen(true)}
                            />
                            {searchTerm && (
                              <button 
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => {
                                  setSearchTerm("");
                                  setSelectedPoint(null);
                                  setFocusWord(null);
                                }}
                              >
                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-full max-w-[300px]" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search words..." 
                              value={searchTerm}
                              onValueChange={setSearchTerm}
                            />
                            <CommandList>
                              <CommandEmpty>No results found</CommandEmpty>
                              <CommandGroup>
                                {points
                                  .filter(point => point.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                  (point.emotionalTone && point.emotionalTone.toLowerCase().includes(searchTerm.toLowerCase())))
                                  .slice(0, 100)
                                  .map((point) => (
                                    <CommandItem 
                                      key={point.id} 
                                      value={point.word}
                                      onSelect={() => handleSearchSelect(point)}
                                    >
                                      <div 
                                        className="w-3 h-3 rounded-full mr-2" 
                                        style={{ 
                                          backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                                        }} 
                                      />
                                      {point.word}
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {point.emotionalTone || "Neutral"}
                                      </span>
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
                      isInteractive={true} 
                      depressedJournalReference={true} 
                      onPointClick={handlePointClick}
                      focusOnWord={focusWord}
                      onComparePoint={handlePointCompare}
                      onSearchSelect={handleVisualSearchSelect}
                      points={points}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="themes">Themes</TabsTrigger>
                  <TabsTrigger value="keyphrases">Key Words</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <SentimentOverview
                    data={sampleSentimentData}
                    sourceDescription={sampleSentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-6">
                  <SentimentTimeline 
                    data={sampleTimelineData}
                    sourceDescription={sampleSentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="themes" className="mt-6">
                  <EntitySentiment 
                    data={sampleEntityData}
                    sourceDescription={sampleSentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="keyphrases" className="mt-6">
                  <KeyPhrases 
                    data={sampleKeyPhrasesData}
                    sourceDescription={sampleSentimentData.sourceDescription}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full flex flex-col gap-4">
                  {selectedPoint ? (
                    <Card className="w-full border border-border shadow-sm bg-card h-full flex-grow">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium">Emotional Grouping</h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={handleClearFirstWord}
                              className="h-6 w-6"
                              title="Clear selection"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-2xl font-bold bg-muted p-3 rounded flex items-center justify-center">
                            {selectedPoint.emotionalTone || "Neutral"}
                          </p>
                          <div>
                            <h3 className="text-sm font-medium mb-1">Word</h3>
                            <p className="text-xl bg-muted p-2 rounded flex items-center justify-center">
                              {selectedPoint.word}
                            </p>
                          </div>
                          <div className="w-full">
                            <Popover open={firstWordSearchOpen} onOpenChange={setFirstWordSearchOpen}>
                              <PopoverTrigger asChild>
                                <div className="relative w-full">
                                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Search by word..." 
                                    value={firstWordSearchValue}
                                    onChange={(e) => {
                                      handleFirstWordSearchChange(e.target.value);
                                      setFirstWordSearchOpen(true);
                                    }}
                                    className="pl-8 text-sm"
                                    onFocus={() => setFirstWordSearchOpen(true)}
                                  />
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 w-[300px]" align="start">
                                <Command>
                                  <CommandInput 
                                    placeholder="Search by word..." 
                                    value={firstWordSearchValue}
                                    onValueChange={handleFirstWordSearchChange}
                                  />
                                  <CommandList>
                                    <CommandEmpty>No results found</CommandEmpty>
                                    <CommandGroup>
                                      {firstWordSearchResults.map((point) => (
                                        <CommandItem
                                          key={point.id}
                                          onSelect={() => handleFirstWordSearchSelect(point)}
                                          value={point.word}
                                          className="flex items-center gap-2"
                                        >
                                          <div 
                                            className="w-3 h-3 rounded-full flex-shrink-0" 
                                            style={{ 
                                              backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                                            }} 
                                          />
                                          <span>{point.word}</span>
                                          <span className="ml-auto text-xs font-medium">
                                            {point.emotionalTone}
                                          </span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
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
                          </div>
                          
                          {selectedPoint.relationships && selectedPoint.relationships.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium mb-1 flex items-center gap-1">
                                Related Words
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <InfoIcon className="h-3 w-3 cursor-help text-muted-foreground" />
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80 text-xs">
                                    Words that are emotionally connected to the selected word. 
                                    Connection strength indicates how closely related they are.
                                  </HoverCardContent>
                                </HoverCard>
                              </h3>
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
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="w-full border border-border shadow-sm bg-muted/50 h-full flex-grow">
                      <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="mb-3 p-3 rounded-full bg-muted/50">
                          <InfoIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">No word selected</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Click on any word in the visualization to see details about it
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <Card className="border border-border shadow-sm bg-card">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <GitCompareArrows className="h-5 w-5 text-orange-500" />
                        Word Comparison
                      </h3>
                      {(selectedPoint || comparisonPoint) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleClearSelection}
                          className="text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Clear All
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-md p-4 bg-background/50">
                        {selectedPoint ? (
                          <>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ 
                                    backgroundColor: `rgb(${selectedPoint.color[0] * 255}, ${selectedPoint.color[1] * 255}, ${selectedPoint.color[2] * 255})` 
                                  }} 
                                />
                                <h4 className="text-xl font-bold">{selectedPoint.word}</h4>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleClearFirstWord}
                                className="h-6 w-6"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="w-full mb-2">
                                <Popover open={firstWordSearchOpen} onOpenChange={setFirstWordSearchOpen}>
                                  <PopoverTrigger asChild>
                                    <div className="relative w-full">
                                      <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="Search by word..." 
                                        value={firstWordSearchValue}
                                        onChange={(e) => {
                                          handleFirstWordSearchChange(e.target.value);
                                          setFirstWordSearchOpen(true);
                                        }}
                                        className="pl-8 text-sm"
                                        onFocus={() => setFirstWordSearchOpen(true)}
                                      />
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-0 w-[300px]" align="start">
                                    <Command>
                                      <CommandInput 
                                        placeholder="Search by word..." 
                                        value={firstWordSearchValue}
                                        onValueChange={handleFirstWordSearchChange}
                                      />
                                      <CommandList>
                                        <CommandEmpty>No results found</CommandEmpty>
                                        <CommandGroup>
                                          {firstWordSearchResults.map((point) => (
                                            <CommandItem
                                              key={point.id}
                                              onSelect={() => handleFirstWordSearchSelect(point)}
                                              value={point.word}
                                              className="flex items-center gap-2"
                                            >
                                              <div 
                                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                                style={{ 
                                                  backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                                                }} 
                                              />
                                              <span>{point.word}</span>
                                              <span className="ml-auto text-xs font-medium">
                                                {point.emotionalTone}
                                              </span>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-1">Emotional Tone</p>
                                <p className="bg-muted p-2 rounded-md text-center">
                                  {selectedPoint.emotionalTone || "Neutral"}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-1">Sentiment Score</p>
                                <p className="bg-muted p-2 rounded-md text-center">
                                  {selectedPoint.sentiment.toFixed(2)}
                                  {selectedPoint.sentiment >= 0.7 ? " (Very Positive)" : 
                                    selectedPoint.sentiment >= 0.5 ? " (Positive)" : 
                                    selectedPoint.sentiment >= 0.4 ? " (Neutral)" : 
                                    selectedPoint.sentiment >= 0.25 ? " (Negative)" : " (Very Negative)"}
                                </p>
                              </div>
                              
                              {selectedPoint.keywords && selectedPoint.keywords.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Related Concepts</p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedPoint.keywords.map((keyword, idx) => (
                                      <span key={idx} className="text-xs bg-muted px-2 py-1 rounded-full">{keyword}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center py-6">
                            <div className="mb-3 p-3 rounded-full bg-muted/50">
                              <InfoIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">Click on a word to select it for comparison</p>
                            <div className="w-full mt-4">
                              <Popover open={firstWordSearchOpen} onOpenChange={setFirstWordSearchOpen}>
                                <PopoverTrigger asChild>
                                  <div className="relative w-full">
                                    <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      placeholder="Search by word..." 
                                      value={firstWordSearchValue}
                                      onChange={(e) => {
                                        handleFirstWordSearchChange(e.target.value);
                                        setFirstWordSearchOpen(true);
                                      }}
                                      className="pl-8 text-sm"
                                      onFocus={() => setFirstWordSearchOpen(true)}
                                    />
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[300px]" align="start">
                                  <Command>
                                    <CommandInput 
                                      placeholder="Search by word..." 
                                      value={firstWordSearchValue}
                                      onValueChange={handleFirstWordSearchChange}
                                    />
                                    <CommandList>
                                      <CommandEmpty>No results found</CommandEmpty>
                                      <CommandGroup>
                                        {firstWordSearchResults.map((point) => (
                                          <CommandItem
                                            key={point.id}
                                            onSelect={() => handleFirstWordSearchSelect(point)}
                                            value={point.word}
                                            className="flex items-center gap-2"
                                          >
                                            <div 
                                              className="w-3 h-3 rounded-full flex-shrink-0" 
                                              style={{ 
                                                backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                                              }} 
                                            />
                                            <span>{point.word}</span>
                                            <span className="ml-auto text-xs font-medium">
                                              {point.emotionalTone}
                                            </span>
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
                      </div>
                      
                      <div className="border rounded-md p-4 bg-background/50">
                        {comparisonPoint ? (
                          <>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ 
                                    backgroundColor: `rgb(${comparisonPoint.color[0] * 255}, ${comparisonPoint.color[1] * 255}, ${comparisonPoint.color[2] * 255})` 
                                  }} 
                                />
                                <h4 className="text-xl font-bold">{comparisonPoint.word}</h4>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleClearSecondWord}
                                className="h-6 w-6"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="w-full mb-2">
                                <Popover open={secondWordSearchOpen} onOpenChange={setSecondWordSearchOpen}>
                                  <PopoverTrigger asChild>
                                    <div className="relative w-full">
                                      <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="Search by word..." 
                                        value={secondWordSearchValue}
                                        onChange={(e) => {
                                          handleSecondWordSearchChange(e.target.value);
                                          setSecondWordSearchOpen(true);
                                        }}
                                        className="pl-8 text-sm"
                                        onFocus={() => setSecondWordSearchOpen(true)}
                                      />
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-0 w-[300px]" align="start">
                                    <Command>
                                      <CommandInput 
                                        placeholder="Search by word..." 
                                        value={secondWordSearchValue}
                                        onValueChange={handleSecondWordSearchChange}
                                      />
                                      <CommandList>
                                        <CommandEmpty>No results found</CommandEmpty>
                                        <CommandGroup>
                                          {secondWordSearchResults.map((point) => (
                                            <CommandItem
                                              key={point.id}
                                              onSelect={() => handleSecondWordSearchSelect(point)}
                                              value={point.word}
                                              className="flex items-center gap-2"
                                            >
                                              <div 
                                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                                style={{ 
                                                  backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                                                }} 
                                              />
                                              <span>{point.word}</span>
                                              <span className="ml-auto text-xs font-medium">
                                                {point.emotionalTone}
                                              </span>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-1">Emotional Tone</p>
                                <p className="bg-muted p-2 rounded-md text-center">
                                  {comparisonPoint.emotionalTone || "Neutral"}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-1">Sentiment Score</p>
                                <p className="bg-muted p-2 rounded-md text-center">
                                  {comparisonPoint.sentiment.toFixed(2)}
                                  {comparisonPoint.sentiment >= 0.7 ? " (Very Positive)" : 
                                    comparisonPoint.sentiment >= 0.5 ? " (Positive)" : 
                                    comparisonPoint.sentiment >= 0.4 ? " (Neutral)" : 
                                    comparisonPoint.sentiment >= 0.25 ? " (Negative)" : " (Very Negative)"}
                                </p>
                              </div>
                              
                              {comparisonPoint.keywords && comparisonPoint.keywords.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Related Concepts</p>
                                  <div className="flex flex-wrap gap-1">
                                    {comparisonPoint.keywords.map((keyword, idx) => (
                                      <span key={idx} className="text-xs bg-muted px-2 py-1 rounded-full">{keyword}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center py-6">
                            <div className="mb-3 p-3 rounded-full bg-muted/50">
                              <InfoIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">Click on a word to select it for comparison</p>
                            <div className="w-full mt-4">
                              <Popover open={secondWordSearchOpen} onOpenChange={setSecondWordSearchOpen}>
                                <PopoverTrigger asChild>
                                  <div className="relative w-full">
                                    <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      placeholder="Search by word..." 
                                      value={secondWordSearchValue}
                                      onChange={(e) => {
                                        handleSecondWordSearchChange(e.target.value);
                                        setSecondWordSearchOpen(true);
                                      }}
                                      className="pl-8 text-sm"
                                      onFocus={() => setSecondWordSearchOpen(true)}
                                    />
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[300px]" align="start">
                                  <Command>
                                    <CommandInput 
                                      placeholder="Search by word..." 
                                      value={secondWordSearchValue}
                                      onValueChange={handleSecondWordSearchChange}
                                    />
                                    <CommandList>
                                      <CommandEmpty>No results found</CommandEmpty>
                                      <CommandGroup>
                                        {secondWordSearchResults.map((point) => (
                                          <CommandItem
                                            key={point.id}
                                            onSelect={() => handleSecondWordSearchSelect(point)}
                                            value={point.word}
                                            className="flex items-center gap-2"
                                          >
                                            <div 
                                              className="w-3 h-3 rounded-full flex-shrink-0" 
                                              style={{ 
                                                backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                                              }} 
                                            />
                                            <span>{point.word}</span>
                                            <span className="ml-auto text-xs font-medium">
                                              {point.emotionalTone}
                                            </span>
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
                      </div>
                    </div>
                    
                    {/* Relationship Analysis Section */}
                    {selectedPoint && comparisonPoint && (
                      <div className="mt-6 border-t pt-4">
                        <h3 className="text-lg font-semibold mb-3">Relationship Analysis</h3>
                        
                        {(() => {
                          const relationship = calculateRelationship(selectedPoint, comparisonPoint);
                          if (!relationship) return null;
                          
                          return (
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Contextual Similarity</p>
                                <div className="bg-muted rounded-md p-3">
                                  <div className="w-full bg-background rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ width: `${relationship.spatialSimilarity * 100}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-sm mt-1 text-center">
                                    {Math.round(relationship.spatialSimilarity * 100)}% similar context
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-1">Emotional Alignment</p>
                                <div className="bg-muted rounded-md p-3">
                                  <div className="w-full bg-background rounded-full h-2">
                                    <div 
                                      className="bg-purple-500 h-2 rounded-full" 
                                      style={{ width: `${relationship.sentimentSimilarity * 100}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-sm mt-1 text-center">
                                    {Math.round(relationship.sentimentSimilarity * 100)}% sentiment alignment
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium mb-1">Emotional Group</p>
                                  <div className="bg-muted rounded-md p-3 text-center">
                                    {relationship.sameEmotionalGroup ? (
                                      <span className="text-green-500 font-medium">Same group</span>
                                    ) : (
                                      <span className="text-orange-500 font-medium">Different groups</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium mb-1">Shared Keywords</p>
                                  <div className="bg-muted rounded-md p-3 text-center min-h-[2.5rem] flex items-center justify-center">
                                    {relationship.sharedKeywords.length > 0 ? (
                                      <span className="text-green-500 font-medium">
                                        {relationship.sharedKeywords.length} shared
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">None</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {relationship.sharedKeywords.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Common Themes</p>
                                  <div className="flex flex-wrap gap-1">
                                    {relationship.sharedKeywords.map((keyword, idx) => (
                                      <span key={idx} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded-full">
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
