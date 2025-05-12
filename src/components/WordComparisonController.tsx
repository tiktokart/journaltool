import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GitCompareArrows, Search, X, Info } from "lucide-react";
import { Point } from "@/types/embedding";
import { WordComparison } from "@/components/WordComparison";
import { toast } from "sonner";
import { getEmotionColor } from "@/utils/embeddingUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { getHomepageEmotionColor } from "@/utils/colorUtils";

interface WordComparisonControllerProps {
  points: Point[];
  selectedPoint: Point | null;
  sourceDescription?: string;
  calculateRelationship: (point1: Point, point2: Point) => any;
  bertKeywords?: any[]; // Add bertKeywords property
}

export const WordComparisonController = ({
  points,
  selectedPoint,
  sourceDescription,
  calculateRelationship,
  bertKeywords
}: WordComparisonControllerProps) => {
  const { t, language } = useLanguage();
  const [compareWords, setCompareWords] = useState<Point[]>([]);
  const [compareSearchOpen, setCompareSearchOpen] = useState(false);
  const [compareSearchTerm, setCompareSearchTerm] = useState("");
  const [compareSearchResults, setCompareSearchResults] = useState<Point[]>([]);
  const [availableEmotions, setAvailableEmotions] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  // Automatically add selected point to comparison
  useEffect(() => {
    if (selectedPoint && !compareWords.some(word => word.id === selectedPoint.id)) {
      if (compareWords.length < 4) {
        setCompareWords(prev => [...prev, selectedPoint]);
      } else {
        // Replace the last word
        setCompareWords(prev => [...prev.slice(0, 3), selectedPoint]);
        toast.info(`Replaced a word with "${selectedPoint.word}" in comparison`);
      }
    }
  }, [selectedPoint]);

  // Get the correct color for a point based on the current page
  const getPointColor = (point: Point): string => {
    // For homepage, use our special random pastel colors
    if (isHomepage && point.emotionalTone) {
      const homepageColor = getHomepageEmotionColor(point.emotionalTone, true);
      if (homepageColor) {
        return homepageColor;
      }
    }
    
    // For other pages or fallback, use the standard colors
    if (point.emotionalTone) {
      return getEmotionColor(point.emotionalTone);
    }
    
    // If no emotional tone or color in RGB format, convert to hex
    if (point.color && Array.isArray(point.color)) {
      return `rgb(${Math.round(point.color[0] * 255)}, ${Math.round(point.color[1] * 255)}, ${Math.round(point.color[2] * 255)})`;
    }
    
    return '#95A5A6'; // Default gray if no color information is available
  };

  // Memoize common words to suggest when no search term
  const commonEmotionalWords = useMemo(() => {
    if (!points || points.length === 0) return [];
    
    // Count occurrence of each emotional tone
    const emotionCount: Record<string, number> = {};
    points.forEach(point => {
      if (point.emotionalTone) {
        emotionCount[point.emotionalTone] = (emotionCount[point.emotionalTone] || 0) + 1;
      }
    });
    
    // Get the most common emotional tones
    const topEmotions = Object.entries(emotionCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([emotion]) => emotion);
      
    // Get one representative word for each top emotion
    return topEmotions.flatMap(emotion => {
      const words = points.filter(p => p.emotionalTone === emotion);
      return words.length > 0 ? [words[0]] : [];
    });
  }, [points]);

  // Update search results and extract available emotions when points change
  useEffect(() => {
    if (points && points.length > 0) {
      // Default to showing common emotional words or just the first few entries
      const initialResults = commonEmotionalWords.length > 0 
        ? commonEmotionalWords 
        : points.slice(0, 15);
        
      setCompareSearchResults(initialResults);
      
      // Extract unique emotions
      const emotions = new Set<string>();
      points.forEach(point => {
        if (point.emotionalTone) {
          emotions.add(point.emotionalTone);
        }
      });
      setAvailableEmotions(Array.from(emotions).sort());
    }
  }, [points, commonEmotionalWords]);

  // Force re-render when language changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
    
    if (compareSearchTerm) {
      const currentTerm = compareSearchTerm;
      setCompareSearchTerm("");
      setTimeout(() => setCompareSearchTerm(currentTerm), 0);
    }
  }, [language]);

  const handleCompareSearchChange = (value: string) => {
    setCompareSearchTerm(value);
    
    if (!value.trim()) {
      // Show default suggestions when search is cleared
      setCompareSearchResults(commonEmotionalWords.length > 0 
        ? commonEmotionalWords 
        : points.slice(0, 15));
      return;
    }
    
    if (!points.length) return;
    
    const results = points.filter((point: Point) => 
      (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase())) ||
      point.word.toLowerCase().includes(value.toLowerCase()) ||
      (point.keywords && point.keywords.some(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      ))
    );
    
    results.sort((a: Point, b: Point) => {
      const aEmotionMatch = a.emotionalTone && a.emotionalTone.toLowerCase().includes(value.toLowerCase());
      const bEmotionMatch = b.emotionalTone && b.emotionalTone.toLowerCase().includes(value.toLowerCase());
      
      if (aEmotionMatch && !bEmotionMatch) return -1;
      if (!aEmotionMatch && bEmotionMatch) return 1;
      
      // If exact word match, prioritize those
      const aExactMatch = a.word.toLowerCase() === value.toLowerCase();
      const bExactMatch = b.word.toLowerCase() === value.toLowerCase();
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      return 0;
    });
    
    setCompareSearchResults(results);
  };

  const handleAddToComparison = (point: Point) => {
    if (compareWords.length >= 4) {
      toast.error(t("maxComparisonWordsError"));
      return;
    }
    
    if (compareWords.some(p => p.id === point.id)) {
      toast.info(`"${point.word}" ${t("alreadyInComparison")}`);
      return;
    }
    
    setCompareWords([...compareWords, point]);
    setCompareSearchOpen(false);
    toast.success(`${t("addedToComparison")} "${point.word}" ${t("toComparison")}`);
  };

  const handleRemoveFromComparison = (point: Point) => {
    setCompareWords(compareWords.filter(p => p.id !== point.id));
    toast.info(`${t("removedFromComparison")} "${point.word}" ${t("fromComparison")}`);
  };

  const handleClearComparison = () => {
    setCompareWords([]);
    toast.info(t("clearedAllComparisonWords"));
  };

  const handleEmotionFilter = (emotion: string) => {
    // Filter points by the selected emotion and add up to 4 to comparison
    const emotionPoints = points
      .filter(point => point.emotionalTone === emotion)
      .slice(0, 4);
    
    if (emotionPoints.length === 0) {
      toast.info(`No words with emotion "${emotion}" found`);
      return;
    }
    
    setCompareWords(emotionPoints);
    toast.success(`Added ${emotionPoints.length} words with "${emotion}" emotion to comparison`);
  };

  // Add suggestion buttons for available emotions
  const renderEmotionFilters = () => {
    if (availableEmotions.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground">{t("quickAdd")}:</p>
        <div className="flex flex-wrap gap-2">
          {availableEmotions.slice(0, 5).map(emotion => (
            <Badge
              key={emotion}
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => handleEmotionFilter(emotion)}
              style={{
                backgroundColor: `${getEmotionColor(emotion)}20`,
                borderColor: getEmotionColor(emotion)
              }}
            >
              {emotion}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="flex items-center text-xl">
            <GitCompareArrows className="h-5 w-5 mr-2 icon-dance" />
            {t("wordComparison")}
          </CardTitle>
          
          <div className="flex gap-2">
            <Popover 
              open={compareSearchOpen} 
              onOpenChange={setCompareSearchOpen}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Search className="h-4 w-4 mr-2" />
                  Add Word
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="end">
                <Command>
                  <CommandInput 
                    placeholder={t("searchWords")} 
                    value={compareSearchTerm}
                    onValueChange={handleCompareSearchChange}
                  />
                  <CommandList>
                    <CommandEmpty>{t("noMatchingWords")}</CommandEmpty>
                    <CommandGroup>
                      {compareSearchResults.map((point) => (
                        <CommandItem 
                          key={`${point.id}-${language}-${forceUpdate}`} 
                          onSelect={() => handleAddToComparison(point)}
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: getPointColor(point) }} 
                            />
                            <span>{point.word}</span>
                          </div>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {point.emotionalTone ? t(point.emotionalTone.toLowerCase()) || point.emotionalTone : t("neutral")}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    
                    {renderEmotionFilters()}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {compareWords.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9"
                onClick={handleClearComparison}
              >
                <X className="h-4 w-4 mr-2" />
                {t("clearAll")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <WordComparison 
          words={compareWords}
          onRemoveWord={handleRemoveFromComparison}
          calculateRelationship={calculateRelationship}
          onAddWordClick={() => setCompareSearchOpen(true)}
          sourceDescription={sourceDescription}
        />
      </CardContent>
    </Card>
  );
};
