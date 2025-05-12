
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, BarChart, ArrowDownUp, Circle } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<'size' | 'alphabetical'>('size');
  
  // Define emotion categories with proper ordering
  const emotionCategories = [
    'Joy',
    'Love',
    'Surprise',
    'Neutral',
    'Fear',
    'Sadness',
    'Anger',
    'Disgust',
    'Other'
  ];
  
  // Group words by emotional tone
  useEffect(() => {
    if (words.length === 0) {
      setGroupedWords({});
      return;
    }
    
    const grouped: {[key: string]: Point[]} = {};
    
    // Initialize categories
    emotionCategories.forEach(category => {
      grouped[category] = [];
    });
    
    words.forEach(word => {
      // Determine which category this word belongs to
      let emotion = word.emotionalTone || 'Neutral';
      
      // Map similar emotions to main categories
      const emotionLower = emotion.toLowerCase();
      if (emotionLower.includes('joy') || emotionLower.includes('happy') || emotionLower.includes('excite')) {
        emotion = 'Joy';
      } else if (emotionLower.includes('love') || emotionLower.includes('affection')) {
        emotion = 'Love';
      } else if (emotionLower.includes('sad') || emotionLower.includes('depress') || emotionLower.includes('melanch')) {
        emotion = 'Sadness';
      } else if (emotionLower.includes('anger') || emotionLower.includes('rage') || emotionLower.includes('frustrat')) {
        emotion = 'Anger';
      } else if (emotionLower.includes('fear') || emotionLower.includes('anxiety') || emotionLower.includes('worry')) {
        emotion = 'Fear';
      } else if (emotionLower.includes('surprise') || emotionLower.includes('shock') || emotionLower.includes('amaze')) {
        emotion = 'Surprise';
      } else if (emotionLower.includes('disgust')) {
        emotion = 'Disgust';
      } else if (emotionLower.includes('neutral')) {
        emotion = 'Neutral';
      } else {
        emotion = 'Other';
      }
      
      if (!grouped[emotion]) {
        grouped[emotion] = [];
      }
      grouped[emotion].push({...word, emotionalTone: emotion});
    });
    
    // Remove empty categories
    const filteredGroups: {[key: string]: Point[]} = {};
    for (const [key, value] of Object.entries(grouped)) {
      if (value.length > 0) {
        filteredGroups[key] = value;
      }
    }
    
    setGroupedWords(filteredGroups);
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
  
  const getEmotionColor = (emotion: string): string => {
    switch(emotion) {
      case 'Joy':
        return 'bg-yellow-50 border-yellow-200';
      case 'Love':
        return 'bg-pink-50 border-pink-200';
      case 'Sadness':
        return 'bg-blue-50 border-blue-200';
      case 'Anger':
        return 'bg-red-50 border-red-200';
      case 'Fear':
        return 'bg-orange-50 border-orange-200';
      case 'Surprise':
        return 'bg-purple-50 border-purple-200';
      case 'Disgust':
        return 'bg-emerald-50 border-emerald-200';
      case 'Neutral':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-violet-50 border-violet-200';
    }
  };
  
  const getBadgeColor = (emotion: string): string => {
    switch(emotion) {
      case 'Joy': return 'bg-yellow-100 text-yellow-800';
      case 'Love': return 'bg-pink-100 text-pink-800';
      case 'Sadness': return 'bg-blue-100 text-blue-800';
      case 'Anger': return 'bg-red-100 text-red-800';
      case 'Fear': return 'bg-orange-100 text-orange-800';
      case 'Surprise': return 'bg-purple-100 text-purple-800';
      case 'Disgust': return 'bg-emerald-100 text-emerald-800';
      case 'Neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-violet-100 text-violet-800';
    }
  };
  
  const getConnectionStrength = (strength: number): string => {
    if (strength >= 0.7) return "Very Strong";
    if (strength >= 0.5) return "Strong";
    if (strength >= 0.3) return "Moderate";
    return "Weak";
  };
  
  const getConnectionColor = (strength: number): string => {
    if (strength >= 0.7) return "text-green-600 bg-green-50";
    if (strength >= 0.5) return "text-lime-600 bg-lime-50";
    if (strength >= 0.3) return "text-amber-600 bg-amber-50";
    return "text-gray-600 bg-gray-50";
  };
  
  if (words.length === 0) {
    return null;
  }
  
  // Sort emotion categories that exist in our data first
  const sortedEmotions = Object.keys(groupedWords).sort((a, b) => {
    if (sortBy === 'size') {
      return groupedWords[b].length - groupedWords[a].length;
    }
    const indexA = emotionCategories.indexOf(a);
    const indexB = emotionCategories.indexOf(b);
    return indexA - indexB;
  });
  
  // Calculate circle sizes based on word counts
  const maxWordCount = Math.max(...Object.values(groupedWords).map(group => group.length));
  const getCircleSize = (count: number) => {
    const minSize = 100;
    const maxSize = 220;
    const size = minSize + (count / maxWordCount) * (maxSize - minSize);
    return size;
  };
  
  return (
    <Card className="border shadow-md bg-white transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-pacifico">Emotional Word Groups</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortBy(sortBy === 'size' ? 'alphabetical' : 'size')}
              className="h-8 px-2 text-muted-foreground flex items-center"
            >
              <ArrowDownUp className="h-3 w-3 mr-1" />
              {sortBy === 'size' ? 'By Size' : 'ABC'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearWords}
              className="h-8 px-2 text-muted-foreground"
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedWords).length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No words selected for comparison
          </div>
        ) : (
          <>
            {/* Emotion Circles Visualization */}
            <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
              {sortedEmotions.map(emotion => {
                const count = groupedWords[emotion].length;
                const size = getCircleSize(count);
                return (
                  <div 
                    key={`circle-${emotion}`}
                    className={`rounded-full flex flex-col justify-center items-center border ${getEmotionColor(emotion)} shadow-md transition-all hover:scale-105`}
                    style={{ 
                      width: `${size}px`, 
                      height: `${size}px`,
                    }}
                  >
                    <div className="font-semibold">{emotion}</div>
                    <div className="text-sm font-medium">{count} words</div>
                  </div>
                );
              })}
            </div>
            
            {/* Word Lists by Emotion Category */}
            <div className="space-y-5">
              {sortedEmotions.map((emotion) => (
                <div 
                  key={emotion} 
                  className={`border rounded-lg p-3 transition-all ${getEmotionColor(emotion)}`}
                >
                  <h4 className="font-medium mb-3 flex items-center">
                    <Circle className="h-3 w-3 mr-1.5 fill-current" />
                    <span>{emotion}</span>
                    <Badge variant="outline" className="ml-2">{groupedWords[emotion].length}</Badge>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {groupedWords[emotion].map((word) => (
                      <Badge 
                        key={word.id} 
                        variant="secondary"
                        className={`cursor-pointer transition-colors ${getBadgeColor(emotion)}`}
                        onClick={() => handleWordClick(word)}
                      >
                        {word.word}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveWord(word.id);
                            if (selectedWord?.id === word.id) {
                              setSelectedWord(null);
                            }
                          }}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {selectedWord && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm flex items-center">
              <span className="font-medium">Selected:</span> 
              <span className="ml-2 font-semibold">{selectedWord.word}</span>
              <Badge className="ml-2" variant="outline">
                {selectedWord.emotionalTone || "Other"}
              </Badge>
            </p>
            
            {connections && Object.keys(connections).length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">Word connections:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(connections)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([id, strength]) => {
                      const connectedWord = words.find(w => w.id === id);
                      if (!connectedWord) return null;
                      return (
                        <Badge 
                          key={id}
                          className={getConnectionColor(strength)}
                          variant="outline"
                        >
                          {connectedWord.word} 
                          <span className="ml-1 text-xs">
                            ({getConnectionStrength(strength)})
                          </span>
                        </Badge>
                      );
                    })
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordComparison;
