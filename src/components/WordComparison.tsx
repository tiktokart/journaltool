
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

interface WordComparisonProps {
  words: Point[];
  onRemoveWord: (id: string) => void;
  onClearWords: () => void;
}

const WordComparison = ({ words, onRemoveWord, onClearWords }: WordComparisonProps) => {
  if (words.length === 0) {
    return null;
  }
  
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Comparison</CardTitle>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {words.map((word) => (
            <div 
              key={word.id} 
              className="border rounded-lg p-3 relative"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onRemoveWord(word.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <div className="mb-3">
                <h4 className="font-medium truncate pr-6">{word.word}</h4>
                <Badge variant="outline" className="mt-1">
                  {word.emotionalTone || 'Neutral'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
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
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score:</span>
                  <span>{Math.round((word.sentiment || 0.5) * 100)}%</span>
                </div>
                
                {word.frequency !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span>{word.frequency}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WordComparison;
