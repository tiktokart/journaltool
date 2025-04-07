import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CircleDot, Search } from "lucide-react";
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
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Point[]>([]);
  const [focusWord, setFocusWord] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([]);

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

  const handlePointClick = (point: Point) => {
    setSelectedPoint(point);
    setFocusWord(point.word);
    toast(`Selected: "${point.word}" (${point.emotionalTone})`);
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
              Visual analysis of anxiety and emotional patterns in a panic attack journal entry
            </p>
            
            <div className="w-full max-w-md mb-6">
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
            
            <div className="w-full max-w-6xl mb-8 relative">
              <div className="absolute top-2 right-4 z-10 text-sm font-normal flex items-center text-muted-foreground">
                <CircleDot className="h-4 w-4 mr-2" />
                <span>Hover or click on words to see emotional groupings</span>
              </div>
              <div className="aspect-[16/9] bg-white border border-border rounded-xl overflow-hidden shadow-lg">
                <DocumentEmbedding 
                  isInteractive={true} 
                  depressedJournalReference={true} 
                  onPointClick={handlePointClick}
                  focusOnWord={focusWord}
                />
              </div>
            </div>
            
            {selectedPoint && (
              <Card className="mb-8 w-full max-w-6xl border border-border shadow-sm bg-card animate-fade-in">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Emotional Grouping</h3>
                      <p className="text-2xl font-bold bg-muted p-3 rounded flex items-center justify-center">
                        {selectedPoint.emotionalTone || "Neutral"}
                      </p>
                      <h3 className="text-sm font-medium mt-3 mb-1">Word</h3>
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
                      
                      {selectedPoint.relationships && selectedPoint.relationships.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mt-3 mb-1 flex items-center gap-1">
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
