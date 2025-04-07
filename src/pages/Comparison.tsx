
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { GitCompareArrows, ArrowLeftRight, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Point } from "@/types/embedding";
import { WordComparison } from "@/components/WordComparison";
import { toast } from "sonner";
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

const Comparison = () => {
  const [compareWords, setCompareWords] = useState<Point[]>([]);
  const [compareSearchOpen, setCompareSearchOpen] = useState(false);
  const [compareSearchTerm, setCompareSearchTerm] = useState("");
  const [compareSearchResults, setCompareSearchResults] = useState<Point[]>([]);
  const [sentimentData, setSentimentData] = useState<any>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("sentimentData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setSentimentData(parsedData);
      } catch (error) {
        console.error("Error parsing saved sentiment data:", error);
      }
    }
  }, []);

  const handleCompareSearchChange = (value: string) => {
    setCompareSearchTerm(value);
    
    if (!value.trim()) {
      setCompareSearchResults([]);
      return;
    }
    
    if (!sentimentData) {
      toast.error("No document analysis data available. Please analyze a document first.");
      return;
    }
    
    const results = sentimentData.embeddingPoints.filter((point: Point) => 
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
    
    setCompareSearchResults(results);
  };

  const handleAddToComparison = (point: Point) => {
    if (compareWords.length >= 4) {
      toast.error("You can only compare up to 4 words");
      return;
    }
    
    if (compareWords.some(p => p.id === point.id)) {
      toast.info(`"${point.word}" is already in your comparison`);
      return;
    }
    
    setCompareWords([...compareWords, point]);
    setCompareSearchOpen(false);
    toast.success(`Added "${point.word}" to comparison`);
  };

  const handleRemoveFromComparison = (point: Point) => {
    setCompareWords(compareWords.filter(p => p.id !== point.id));
    toast.info(`Removed "${point.word}" from comparison`);
  };

  const handleClearComparison = () => {
    setCompareWords([]);
    toast.info("Cleared all comparison words");
  };

  const calculateRelationship = (point1: Point, point2: Point) => {
    if (!point1 || !point2) return null;
    
    const distance = Math.sqrt(
      Math.pow(point1.position[0] - point2.position[0], 2) +
      Math.pow(point1.position[1] - point2.position[1], 2) +
      Math.pow(point1.position[2] - point2.position[2], 2)
    );
    
    const spatialSimilarity = Math.max(0, 1 - (distance / 40));
    
    const sentimentDiff = Math.abs(point1.sentiment - point2.sentiment);
    const sentimentSimilarity = 1 - sentimentDiff;
    
    const sameEmotionalGroup = 
      (point1.emotionalTone || "Neutral") === (point2.emotionalTone || "Neutral");
    
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
          <Card className="border border-border shadow-md overflow-hidden bg-card">
            <CardHeader className="z-10">
              <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
                <CardTitle className="flex items-center">
                  <GitCompareArrows className="h-5 w-5 mr-2 text-primary" />
                  <span>Word Comparison & Relationship Analysis</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Popover open={compareSearchOpen} onOpenChange={setCompareSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Search className="h-4 w-4 mr-2" />
                        Add Word
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px]" align="end">
                      <Command>
                        <CommandInput 
                          placeholder="Search words..." 
                          value={compareSearchTerm}
                          onValueChange={handleCompareSearchChange}
                        />
                        <CommandList>
                          <CommandEmpty>No results found</CommandEmpty>
                          <CommandGroup>
                            {compareSearchResults.map((point) => (
                              <CommandItem
                                key={point.id}
                                onSelect={() => handleAddToComparison(point)}
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
                                  {point.emotionalTone || "Neutral"}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {compareWords.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClearComparison}
                      className="h-8"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-sm font-normal flex items-center text-muted-foreground">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                <span>Add up to 4 words to compare their relationships</span>
              </div>
            </CardHeader>
            <CardContent>
              {!sentimentData ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Please analyze a document first to enable word comparison.
                  </p>
                </div>
              ) : (
                <WordComparison 
                  words={compareWords} 
                  onRemoveWord={handleRemoveFromComparison}
                  calculateRelationship={calculateRelationship}
                  onAddWordClick={() => setCompareSearchOpen(true)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Comparison;
