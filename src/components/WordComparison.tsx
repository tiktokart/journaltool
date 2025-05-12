
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Point, getSentimentLabel } from '@/types/embedding';
import { useState, useEffect } from 'react';

interface WordComparisonProps {
  words: Point[];
  onRemoveWord: (id: string) => void;
  onClearWords: () => void;
  onWordConnectivityCheck?: (word1: Point, word2: Point) => number;
}

const WordComparison = ({ 
  words, 
  onRemoveWord, 
  onClearWords,
  onWordConnectivityCheck 
}: WordComparisonProps) => {
  const [groupedWords, setGroupedWords] = useState<{[key: string]: Point[]}>({});
  const [selectedWord, setSelectedWord] = useState<Point | null>(null);
  const [connections, setConnections] = useState<{[key: string]: number}>({});
  
  // Group words by emotional tone
  useEffect(() => {
    if (words.length === 0) {
      setGroupedWords({});
      return;
    }
    
    const grouped: {[key: string]: Point[]} = {};
    
    words.forEach(word => {
      const emotion = word.emotionalTone || 'Neutral';
      if (!grouped[emotion]) {
        grouped[emotion] = [];
      }
      grouped[emotion].push(word);
    });
    
    setGroupedWords(grouped);
  }, [words]);
  
  // Calculate word connections when a word is selected
  useEffect(() => {
    if (!selectedWord || !onWordConnectivityCheck) {
      setConnections({});
      return;
    }

    const newConnections: {[key: string]: number} = {};
    
    words.forEach(word => {
      if (word.id !== selectedWord.id) {
        const connectivity = onWordConnectivityCheck(selectedWord, word);
        newConnections[word.id] = connectivity;
      }
    });
    
    setConnections(newConnections);
  }, [selectedWord, words, onWordConnectivityCheck]);
  
  const handleWordClick = (word: Point) => {
    if (selectedWord && selectedWord.id === word.id) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };
  
  if (words.length === 0) {
    return null;
  }
  
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Words by Emotion</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearWords}
            className="h-8 px-2 text-muted-foreground"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedWords).length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No words selected for comparison
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedWords).map(([emotion, emotionWords]) => (
              <div key={emotion} className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">{emotion}</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {emotionWords.map((word) => (
                    <div 
                      key={word.id} 
                      className={`border rounded-lg p-3 relative cursor-pointer transition-all
                        ${selectedWord?.id === word.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted'}`}
                      onClick={() => handleWordClick(word)}
                    >
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveWord(word.id);
                          if (selectedWord?.id === word.id) {
                            setSelectedWord(null);
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      
                      <div className="mb-2">
                        <h4 className="font-medium truncate pr-6">{word.word}</h4>
                        <Badge variant="outline" className="mt-1">
                          {word.emotionalTone || 'Neutral'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sentiment:</span>
                          <span className={`font-medium ${
                            (word.sentiment || 0) > 0.55 ? 'text-green-600' :
                            (word.sentiment || 0) < 0.45 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {getSentimentLabel(word.sentiment || 0.5)}
                          </span>
                        </div>
                        
                        {connections[word.id] !== undefined && selectedWord?.id !== word.id && (
                          <div className="flex justify-between mt-1">
                            <span className="text-muted-foreground">Connection:</span>
                            <span className="font-medium">
                              {Math.round(connections[word.id] * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedWord && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Selected:</span> {selectedWord.word}
              <span className="ml-2 text-muted-foreground">Click on other words to see their connection strength</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordComparison;
