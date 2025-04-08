import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CircleDot, Search, RotateCcw, GitCompareArrows, X } from "lucide-react";
import { Header } from "@/components/Header";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { Point } from "@/types/embedding";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  
  const handlePointCompare = (point1: Point, point2: Point) => {
    setComparisonPoint(point2);
    toast.info(`Comparing "${point1.word}" with "${point2.word}"`);
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
                  <h3 className="text-sm font-semibold mb-2 text-primary">Journal Entry Example</h3>
                  <p className="text-sm text-muted-foreground">
                    This visualization maps the emotional landscape of a personal journal entry about experiencing a panic attack.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full max-w-6xl mb-8 flex flex-col gap-6">
              <div className="w-full relative">
                <div className="aspect-[21/9] bg-white border border-border rounded-xl overflow-hidden shadow-lg">
                  <DocumentEmbedding 
                    isInteractive={true} 
                    depressedJournalReference={true} 
                    onPointClick={handlePointClick}
                    focusOnWord={focusWord}
                    onComparePoint={handlePointCompare}
                    onSearchSelect={handleVisualSearchSelect}
                    points={points}
                    wordCount={points.length}
                    showAllPoints={true}
                    sourceDescription="Visualization of panic attack journal entry"
                  />
                </div>
              </div>
              
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
                                    placeholder="Search by emotion..." 
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
                                    placeholder="Search by emotion..." 
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
                                        placeholder="Search by emotion..." 
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
                                        placeholder="Search by emotion..." 
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
                                      placeholder="Search by emotion..." 
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
                                      placeholder="Search by emotion..." 
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
                                        placeholder="Search by emotion..." 
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
                                        placeholder="Search by emotion..." 
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
                                      placeholder="Search by emotion..." 
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
                                      placeholder="Search by emotion..." 
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
