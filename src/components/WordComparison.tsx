
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart, BarChart, Frown, PencilRuler, Star } from 'lucide-react';
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
  
  const getEmotionIcon = (emotion: string) => {
    switch(emotion.toLowerCase()) {
      case 'joy':
      case 'happy':
      case 'happiness': 
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'sadness':
      case 'sad':
      case 'melancholy':
        return <Frown className="h-4 w-4 text-blue-500" />;
      case 'anger':
      case 'angry':
      case 'frustrated':
        return <BarChart className="h-4 w-4 text-red-500" />; 
      case 'fear':
      case 'anxiety':
      case 'nervous':
        return <PencilRuler className="h-4 w-4 text-orange-500" />;
      default:
        return <Star className="h-4 w-4 text-purple-500" />;
    }
  };
  
  const getEmotionColor = (emotion: string): string => {
    switch(emotion.toLowerCase()) {
      case 'joy':
      case 'happy':
      case 'happiness': 
        return 'bg-pink-50 border-pink-200';
      case 'sadness':
      case 'sad':
      case 'melancholy':
        return 'bg-blue-50 border-blue-200';
      case 'anger':
      case 'angry':
      case 'frustrated':
        return 'bg-red-50 border-red-200';
      case 'fear':
      case 'anxiety':
      case 'nervous':
        return 'bg-orange-50 border-orange-200';
      case 'surprise':
      case 'shocked':
        return 'bg-amber-50 border-amber-200';
      case 'disgust':
        return 'bg-emerald-50 border-emerald-200';
      case 'neutral':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };
  
  const getConnectionStrength = (strength: number): string => {
    if (strength >= 0.7) return "Very Strong";
    if (strength >= 0.5) return "Strong";
    if (strength >= 0.3) return "Moderate";
    return "Weak";
  };
  
  if (words.length === 0) {
    return null;
  }
  
  return (
    <Card className="border shadow-md bg-white transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-pacifico">Words by Emotion</CardTitle>
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
              <div 
                key={emotion} 
                className={`border rounded-lg p-3 transition-all ${getEmotionColor(emotion)}`}
              >
                <h4 className="font-medium mb-2 flex items-center">
                  {getEmotionIcon(emotion)}
                  <span className="ml-2">{emotion}</span>
                  <Badge variant="outline" className="ml-2">{emotionWords.length}</Badge>
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {emotionWords.map((word) => (
                    <div 
                      key={word.id} 
                      className={`border rounded-lg p-3 relative cursor-pointer transition-all
                        ${selectedWord?.id === word.id ? 'ring-2 ring-primary bg-white' : 'bg-white hover:bg-muted/20'}`}
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
                        <Badge 
                          variant="outline" 
                          className={`mt-1 ${
                            word.emotionalTone?.toLowerCase().includes('joy') ? 'bg-pink-100' :
                            word.emotionalTone?.toLowerCase().includes('sad') ? 'bg-blue-100' :
                            word.emotionalTone?.toLowerCase().includes('anger') ? 'bg-red-100' :
                            word.emotionalTone?.toLowerCase().includes('fear') ? 'bg-orange-100' :
                            'bg-purple-100'
                          }`}
                        >
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
                          <div className="flex justify-between mt-1 bg-muted/20 p-1 rounded">
                            <span className="text-muted-foreground">Connection:</span>
                            <span className={`font-medium ${
                              connections[word.id] > 0.6 ? 'text-green-600' :
                              connections[word.id] < 0.3 ? 'text-red-600' :
                              'text-amber-600'
                            }`}>
                              {getConnectionStrength(connections[word.id])}
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
          <div className="mt-4 p-3 bg-muted rounded-lg border border-muted-foreground/20">
            <p className="text-sm flex items-center">
              <span className="font-medium">Selected:</span> 
              <span className="ml-2 font-semibold">{selectedWord.word}</span>
              <Badge className="ml-2" variant="outline">{selectedWord.emotionalTone || "Neutral"}</Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click on other words to see their connection strength
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordComparison;
