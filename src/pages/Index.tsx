
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
      setIsComparing(false);
      setComparisonPoint(null);
      toast.info("Point deselected");
      return;
    }
    
    setSelectedPoint(point);
    setFocusWord(point.word);
    toast(`Selected: "${point.word}" (${point.emotionalTone || 'Neutral'})`);
  };
  
  const handlePointCompare = (point1: Point, point2: Point) => {
    setIsComparing(true);
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
          point.word.toLowerCase().includes(value.toLowerCase()) ||
          (point.keywords && point.keywords.some(keyword => 
            keyword.toLowerCase().includes(value.toLowerCase())
          )) ||
          (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase()))
        );
        
        setSearchResults(results);
        return;
      }
      
      setSearchResults([]);
      return;
    }
    
    const results = points.filter(point => 
      point.word.toLowerCase().includes(value.toLowerCase()) ||
      (point.keywords && point.keywords.some(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      )) ||
      (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase()))
    );
    
    setSearchResults(results);
  };

  const handleSearchSelect = (point: Point) => {
    setSelectedPoint(point);
    setFocusWord(point.word);
    setOpen(false);
    toast(`Zooming to: "${point.word}"`);
  };
  
  const handleClearComparison = () => {
    setIsComparing(false);
    setComparisonPoint(null);
    toast.info("Comparison cleared");
  };

  const handleVisualSearchSelect = (point: Point) => {
    setSelectedPoint(point);
    setFocusWord(point.word);
    toast(`Zooming to: "${point.word}"`);
  };

  const toggleCompareMode = () => {
    if (selectedPoint) {
      setIsComparing(!isComparing);
      if (!isComparing) {
        setComparisonPoint(null);
      }
      toast.info(isComparing ? "Comparison mode disabled" : "Select a word to compare");
    }
  };

  const handleClearSelection = () => {
    setSelectedPoint(null);
    setFocusWord(null);
    setIsComparing(false);
    setComparisonPoint(null);
    toast.info("Selection cleared");
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
            
            <div className="w-full max-w-6xl mb-8 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/3 relative">
                <div className="absolute top-2 left-4 z-10 text-sm font-normal flex items-center text-muted-foreground">
                  <CircleDot className="h-4 w-4 mr-2" />
                  <span>Hover or click on words to see emotional groupings.</span>
                </div>
                <div className="aspect-[16/9] bg-white border border-border rounded-xl overflow-hidden shadow-lg">
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
              </div>
              
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="w-full">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative w-full">
                        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search for a word or emotion..." 
                          value={searchValue}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-8"
                          onClick={() => {
                            setOpen(true);
                            if (searchValue.trim()) {
                              handleSearchChange(searchValue);
                            }
                          }}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px]" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Search words or emotions..." 
                          value={searchValue}
                          onValueChange={handleSearchChange}
                        />
                        <CommandList>
                          <CommandEmpty>No results found</CommandEmpty>
                          <CommandGroup>
                            {searchResults.map((point) => (
                              <CommandItem
                                key={point.id}
                                onSelect={() => handleSearchSelect(point)}
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
                                <span className="ml-auto text-xs text-muted-foreground">
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
                
                {selectedPoint ? (
                  <Card className="w-full border border-border shadow-sm bg-card">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium">Emotional Grouping</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleClearSelection}
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
                        
                        {!isComparing && (
                          <Button
                            onClick={toggleCompareMode}
                            className="w-full"
                          >
                            Compare with another word
                          </Button>
                        )}
                        
                        {isComparing && (
                          <Button 
                            variant="outline" 
                            onClick={handleClearComparison}
                            className="w-full"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Cancel comparison
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="w-full border border-border shadow-sm bg-muted/50">
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
            </div>
            
            {isComparing && selectedPoint && comparisonPoint && (
              <Card className="mb-8 w-full max-w-6xl border border-border shadow-sm bg-card animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GitCompareArrows className="h-5 w-5 text-orange-500" />
                      Word Comparison
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClearComparison}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear Comparison
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-md p-4 bg-background/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ 
                            backgroundColor: `rgb(${selectedPoint.color[0] * 255}, ${selectedPoint.color[1] * 255}, ${selectedPoint.color[2] * 255})` 
                          }} 
                        />
                        <h4 className="text-xl font-bold">{selectedPoint.word}</h4>
                      </div>
                      
                      <div className="space-y-3">
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
                    </div>
                    
                    <div className="border rounded-md p-4 bg-background/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ 
                            backgroundColor: `rgb(${comparisonPoint.color[0] * 255}, ${comparisonPoint.color[1] * 255}, ${comparisonPoint.color[2] * 255})` 
                          }} 
                        />
                        <h4 className="text-xl font-bold">{comparisonPoint.word}</h4>
                      </div>
                      
                      <div className="space-y-3">
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
                    </div>
                    
                    <div className="md:col-span-2 border border-dashed border-orange-300 rounded-md p-4 bg-orange-50 dark:bg-orange-950/20">
                      <h4 className="text-sm font-medium mb-2 text-orange-700 dark:text-orange-400">Relationship Analysis</h4>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium mb-1 text-foreground">Sentiment Difference</p>
                          <div className="flex items-center justify-between gap-2 bg-white dark:bg-black/20 p-2 rounded-md">
                            <span className="text-sm text-foreground">{selectedPoint.word}: {selectedPoint.sentiment.toFixed(2)}</span>
                            <span className="text-sm font-bold text-foreground">
                              {Math.abs(selectedPoint.sentiment - comparisonPoint.sentiment).toFixed(2)} 
                              <span className="text-xs ml-1 font-normal text-muted-foreground">difference</span>
                            </span>
                            <span className="text-sm text-foreground">{comparisonPoint.word}: {comparisonPoint.sentiment.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium mb-1 text-foreground">Emotional Connection</p>
                          <div className="bg-white dark:bg-black/20 p-2 rounded-md">
                            <p className="text-sm text-center text-foreground">
                              {selectedPoint.emotionalTone === comparisonPoint.emotionalTone ? 
                                `Both words share the same emotional tone: ${selectedPoint.emotionalTone || "Neutral"}` : 
                                `Different emotional tones: "${selectedPoint.word}" is ${selectedPoint.emotionalTone || "Neutral"} while "${comparisonPoint.word}" is ${comparisonPoint.emotionalTone || "Neutral"}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {selectedPoint.keywords && comparisonPoint.keywords && (
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-1 text-foreground">Concept Overlap</p>
                          <div className="bg-white dark:bg-black/20 p-2 rounded-md">
                            {(() => {
                              const sharedKeywords = selectedPoint.keywords?.filter(k => 
                                comparisonPoint.keywords?.includes(k)
                              );
                              
                              if (sharedKeywords && sharedKeywords.length > 0) {
                                return (
                                  <div>
                                    <p className="text-sm mb-1 text-foreground">These words share {sharedKeywords.length} concept{sharedKeywords.length > 1 ? 's' : ''}:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {sharedKeywords.map((keyword, idx) => (
                                        <span key={idx} className="text-xs bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full text-foreground">{keyword}</span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                return <p className="text-sm text-foreground">No shared concepts found between these words.</p>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button asChild size="lg" className="rounded-md mt-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                Analyze Documents <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
