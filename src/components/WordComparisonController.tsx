
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import WordComparison from './WordComparison';
import { Point } from '@/types/embedding';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, ListOrdered } from 'lucide-react';

interface WordComparisonControllerProps {
  points: Point[];
  bertAnalysis?: any;
}

const WordComparisonController = ({ points, bertAnalysis }: WordComparisonControllerProps) => {
  const [selectedWords, setSelectedWords] = useState<Point[]>([]);
  const [availablePoints, setAvailablePoints] = useState<Point[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [emotionCategories, setEmotionCategories] = useState<string[]>([]);
  
  // Set up available points when the component mounts
  useEffect(() => {
    if (points && points.length) {
      setAvailablePoints(points);
      
      // Extract emotion categories
      const emotions = new Set<string>();
      points.forEach(point => {
        if (point.emotionalTone) {
          emotions.add(point.emotionalTone);
        }
      });
      setEmotionCategories(Array.from(emotions));
    }
  }, [points]);

  // Filter points based on search term
  const filteredPoints = searchTerm === '' 
    ? availablePoints
    : availablePoints.filter(point => 
        point.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        point.emotionalTone?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Add a word to comparison
  const handleAddWord = (point: Point) => {
    // Don't add duplicates
    if (selectedWords.some(w => w.id === point.id)) {
      return;
    }
    
    // We'll remove the limit and allow more words for better comparison
    setSelectedWords([...selectedWords, point]);
    setDialogOpen(false);
  };

  // Remove a word from comparison
  const handleRemoveWord = (id: string) => {
    setSelectedWords(selectedWords.filter(word => word.id !== id));
  };

  // Clear all selected words
  const handleClearWords = () => {
    setSelectedWords([]);
  };

  // Find most emotional words for suggestions
  const findEmotionalWords = (): Point[] => {
    if (!points || points.length === 0) return [];
    
    // Sort by sentiment difference from neutral (0.5)
    return [...points]
      .filter(p => p.sentiment !== undefined && p.word)
      .sort((a, b) => 
        Math.abs((b.sentiment || 0.5) - 0.5) - Math.abs((a.sentiment || 0.5) - 0.5)
      )
      .slice(0, 6);
  };

  // Get keyword-based suggestions from BERT analysis
  const getKeywordSuggestions = (): Point[] => {
    if (!bertAnalysis || !points || points.length === 0) return [];
    
    // Get BERT keywords if available
    const keywordsList = bertAnalysis.keywords || [];
    
    if (keywordsList.length === 0) return [];
    
    // Match keywords to points
    const suggestedPoints: Point[] = [];
    
    keywordsList.slice(0, 6).forEach((keywordItem: any) => {
      if (keywordItem && keywordItem.word) {
        // Find matching point
        const matchedPoint = points.find(p => 
          p.word && p.word.toLowerCase() === keywordItem.word.toLowerCase()
        );
        
        if (matchedPoint) {
          suggestedPoints.push(matchedPoint);
        }
      }
    });
    
    return suggestedPoints;
  };

  // Calculate connectivity between two words based on semantic and emotion similarity
  const calculateWordConnectivity = (word1: Point, word2: Point): number => {
    if (!word1 || !word2) return 0;
    
    // Base connectivity on shared emotional tone
    let connectivity = 0;
    
    // Check for emotional similarity (30% weight)
    if (word1.emotionalTone === word2.emotionalTone) {
      connectivity += 0.3;
    }
    
    // Check for sentiment similarity (40% weight)
    const sentimentDiff = Math.abs((word1.sentiment || 0.5) - (word2.sentiment || 0.5));
    connectivity += (1 - sentimentDiff) * 0.4;
    
    // Check for word proximity in document (30% weight)
    // This is a simulated value since we don't have actual document positions
    // In a real implementation, you would use word positions from the text
    const randomProximity = Math.random() * 0.3;
    connectivity += randomProximity;
    
    return Math.min(1, connectivity);
  };

  const emotionalWords = findEmotionalWords();
  const keywordSuggestions = getKeywordSuggestions();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <ListOrdered className="h-5 w-5 mr-2" />
          Word Connection Analysis
        </h3>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Words
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Words to Compare</DialogTitle>
              <DialogDescription>
                Choose words to analyze their emotional connections
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Label className="mb-2 block">Search words</Label>
              <Command className="rounded-lg border shadow-md">
                <CommandInput 
                  placeholder="Search by word or emotion..." 
                  className="h-9" 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                
                <CommandEmpty>No words found.</CommandEmpty>
                
                <CommandGroup heading="Results" className="max-h-64 overflow-auto">
                  {filteredPoints.slice(0, 50).map((point) => (
                    <CommandItem
                      key={point.id}
                      value={point.word}
                      onSelect={() => handleAddWord(point)}
                    >
                      <div className="flex justify-between w-full">
                        <span>{point.word}</span>
                        <span className="text-muted-foreground">{point.emotionalTone}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                
                {emotionCategories.length > 0 && (
                  <CommandGroup heading="Browse by Emotion" className="border-t">
                    {emotionCategories.map((emotion) => (
                      <CommandItem
                        key={emotion}
                        value={emotion}
                        onSelect={() => setSearchTerm(emotion)}
                      >
                        <span>{emotion}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {keywordSuggestions.length > 0 && (
                  <CommandGroup heading="Key Words" className="border-t">
                    {keywordSuggestions.map((point) => (
                      <CommandItem
                        key={point.id}
                        value={point.word}
                        onSelect={() => handleAddWord(point)}
                      >
                        <div className="flex justify-between w-full">
                          <span>{point.word}</span>
                          <span className="text-muted-foreground">{point.emotionalTone}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {emotionalWords.length > 0 && (
                  <CommandGroup heading="Most Emotional Words" className="border-t">
                    {emotionalWords.map((point) => (
                      <CommandItem
                        key={point.id}
                        value={point.word}
                        onSelect={() => handleAddWord(point)}
                      >
                        <div className="flex justify-between w-full">
                          <span>{point.word}</span>
                          <span className="text-muted-foreground">{point.emotionalTone}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </Command>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <WordComparison 
        words={selectedWords} 
        onRemoveWord={handleRemoveWord} 
        onClearWords={handleClearWords}
        onWordConnectivityCheck={calculateWordConnectivity}
      />
      
      {selectedWords.length === 0 && (
        <div className="text-center p-6 text-muted-foreground bg-muted/30 rounded-md">
          <p>Add words to analyze their emotional connections within the text</p>
        </div>
      )}
    </div>
  );
};

export default WordComparisonController;
