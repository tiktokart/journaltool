
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart, BarChart, Frown, PencilRuler, Star, AlertTriangle, Sparkles, Eye } from 'lucide-react';
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
  
  const getEmotionIcon = (emotion: string) => {
    switch(emotion) {
      case 'Joy':
        return <Sparkles className="h-4 w-4 text-yellow-500" />;
      case 'Love':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'Sadness':
        return <Frown className="h-4 w-4 text-blue-500" />;
      case 'Anger':
        return <BarChart className="h-4 w-4 text-red-500" />; 
      case 'Fear':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'Surprise':
        return <Eye className="h-4 w-4 text-purple-500" />;
      case 'Disgust':
        return <PencilRuler className="h-4 w-4 text-green-600" />;
      case 'Neutral':
        return <Star className="h-4 w-4 text-gray-500" />;
      default:
        return <Star className="h-4 w-4 text-violet-500" />;
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
          <>
            {/* Emotion Circles Visualization */}
            <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
              {sortedEmotions.map(emotion => {
                const count = groupedWords[emotion].length;
                const size = getCircleSize(count);
                return (
                  <div 
                    key={`circle-${emotion}`}
                    className={`rounded-full flex flex-col justify-center items-center border ${getEmotionColor(emotion)} shadow-md transition-all hover:scale-105 cursor-pointer`}
                    style={{ 
                      width: `${size}px`, 
                      height: `${size}px`,
                      position: 'relative'
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {getEmotionIcon(emotion)}
                      <span className="font-semibold">{emotion}</span>
                    </div>
                    <div className="text-sm font-medium">{count} words</div>
                    <div className="text-xs text-muted-foreground mt-1">Click to explore</div>
                  </div>
                );
              })}
            </div>
            
            {/* Word Groups Details */}
            <div className="space-y-5">
              {sortedEmotions.map((emotion) => (
                <div 
                  key={emotion} 
                  className={`border rounded-lg p-3 transition-all ${getEmotionColor(emotion)}`}
                >
                  <h4 className="font-medium mb-3 flex items-center">
                    {getEmotionIcon(emotion)}
                    <span className="ml-2">{emotion}</span>
                    <Badge variant="outline" className="ml-2">{groupedWords[emotion].length}</Badge>
                  </h4>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedWords[emotion].map((word) => (
                      <div 
                        key={word.id} 
                        className={`border rounded-lg p-3 relative cursor-pointer transition-all
                          ${selectedWord?.id === word.id ? 
                            'ring-2 ring-primary bg-white scale-105' : 
                            'bg-white hover:bg-muted/20 hover:scale-[1.02]'
                          } shadow-sm hover:shadow-md`}
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
                              emotion === 'Joy' ? 'bg-yellow-100 text-yellow-800' :
                              emotion === 'Love' ? 'bg-pink-100 text-pink-800' :
                              emotion === 'Sadness' ? 'bg-blue-100 text-blue-800' :
                              emotion === 'Anger' ? 'bg-red-100 text-red-800' :
                              emotion === 'Fear' ? 'bg-orange-100 text-orange-800' :
                              emotion === 'Surprise' ? 'bg-purple-100 text-purple-800' :
                              emotion === 'Disgust' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {emotion}
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
                            <div className={`flex justify-between mt-1 p-1 rounded ${getConnectionColor(connections[word.id])}`}>
                              <span className="text-muted-foreground">Connection:</span>
                              <span className="font-medium">
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
          </>
        )}
        
        {selectedWord && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm flex items-center">
              <span className="font-medium">Selected:</span> 
              <span className="ml-2 font-semibold">{selectedWord.word}</span>
              <Badge className="ml-2" variant="outline">
                {getEmotionIcon(selectedWord.emotionalTone || "Other")}
                <span className="ml-1">{selectedWord.emotionalTone || "Other"}</span>
              </Badge>
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
