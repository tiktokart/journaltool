import React, { useEffect } from 'react';
import { Point } from '@/types/embedding';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, X, Search, GitCompareArrows, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WordComparisonProps {
  words: Point[];
  onSelectWord?: (point: Point) => void;
  onRemoveWord?: (point: Point) => void;
  calculateRelationship?: (point1: Point, point2: Point) => {
    spatialSimilarity: number;
    sentimentSimilarity: number;
    sameEmotionalGroup: boolean;
    sharedKeywords: string[];
  } | null;
  onAddWordClick?: () => void;
  sourceDescription?: string;
}

interface LegacyWordComparisonProps {
  word1?: string;
  word2?: string;
  point1?: Point;
  point2?: Point;
  relationship?: {
    spatialSimilarity: number;
    sentimentSimilarity: number;
    sameEmotionalGroup: boolean;
    sharedKeywords: string[];
  } | null;
}

export const WordComparison: React.FC<WordComparisonProps | LegacyWordComparisonProps> = (props) => {
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // This component doesn't have any dropdowns of its own,
      // but we're adding this for future-proofing
      // and consistency with the overall click-outside behavior
    };
    
    document.addEventListener('mousedown', handleDocumentClick);
    
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  if ('word1' in props && 'word2' in props && props.point1 && props.point2 && props.relationship) {
    const words = [props.point1, props.point2];
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                backgroundColor: `rgb(${props.point1.color[0] * 255}, ${props.point1.color[1] * 255}, ${props.point1.color[2] * 255})` 
              }} 
            />
            <span className="font-bold">{props.word1}</span>
          </div>
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground mx-2" />
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                backgroundColor: `rgb(${props.point2.color[0] * 255}, ${props.point2.color[1] * 255}, ${props.point2.color[2] * 255})` 
              }} 
            />
            <span className="font-bold">{props.word2}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Overall Relationship</p>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${props.relationship.spatialSimilarity * 100}%` }}
              />
            </div>
            <p className="text-sm mt-1">
              {props.relationship.spatialSimilarity >= 0.8 ? "Strongly Related" :
                props.relationship.spatialSimilarity >= 0.6 ? "Related" :
                props.relationship.spatialSimilarity >= 0.4 ? "Moderately Related" :
                props.relationship.spatialSimilarity >= 0.2 ? "Weakly Related" : "Barely Related"}
              {" "}
              ({Math.round(props.relationship.spatialSimilarity * 100)}%)
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Contextual Similarity</p>
              <p className="text-sm font-medium">{Math.round(props.relationship.spatialSimilarity * 100)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Emotional Alignment</p>
              <p className="text-sm font-medium">{Math.round(props.relationship.sentimentSimilarity * 100)}%</p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Emotional Group</p>
            <p className="text-sm font-medium">
              {props.relationship.sameEmotionalGroup 
                ? `Both in "${props.point1.emotionalTone || 'Neutral'}" group` 
                : `Different groups (${props.point1.emotionalTone || 'Neutral'} vs ${props.point2.emotionalTone || 'Neutral'})`}
            </p>
          </div>
          
          {props.relationship.sharedKeywords && props.relationship.sharedKeywords.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Shared Concepts</p>
              <div className="flex flex-wrap gap-1">
                {props.relationship.sharedKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { words = [], onRemoveWord, calculateRelationship, onAddWordClick, sourceDescription, onSelectWord } = props as WordComparisonProps;

  if (words.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="mb-3 p-4 rounded-full bg-muted/50">
          <GitCompareArrows className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No words selected</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {sourceDescription ? (
            <>
              Add words from your document to see how they relate to each other. You can add up to 4 words to compare.
            </>
          ) : (
            <>
              Add words to see how they relate to each other. You can add up to 4 words to compare.
            </>
          )}
        </p>
        {onAddWordClick && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onAddWordClick}
          >
            <Search className="h-4 w-4 mr-2" />
            Search Words
          </Button>
        )}
        
        {sourceDescription && (
          <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            {sourceDescription}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {words.map((word) => (
          <div key={word.id} className="border rounded-md p-4 relative">
            {onRemoveWord && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => onRemoveWord(word)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div 
              className="flex items-center gap-2 mb-3 cursor-pointer" 
              onClick={() => onSelectWord && onSelectWord(word)}
            >
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ 
                  backgroundColor: `rgb(${word.color[0] * 255}, ${word.color[1] * 255}, ${word.color[2] * 255})` 
                }} 
              />
              <h3 className="font-bold truncate">{word.word}</h3>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Emotional Tone</p>
              <p className="text-sm font-medium">{word.emotionalTone || "Neutral"}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
              <p className="text-sm font-medium">
                {word.sentiment.toFixed(2)}
                {word.sentiment >= 0.7 ? " (Very Positive)" : 
                  word.sentiment >= 0.5 ? " (Positive)" : 
                  word.sentiment >= 0.4 ? " (Neutral)" : 
                  word.sentiment >= 0.25 ? " (Negative)" : " (Very Negative)"}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {words.length > 1 && calculateRelationship && (
        <div>
          <h3 className="text-lg font-medium mb-4">Relationship Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {words.flatMap((word1, i) => 
              words.slice(i+1).map((word2, j) => {
                const relationship = calculateRelationship(word1, word2);
                if (!relationship) return null;
                
                const {
                  spatialSimilarity,
                  sentimentSimilarity,
                  sameEmotionalGroup,
                  sharedKeywords
                } = relationship;
                
                const overallSimilarity = (
                  spatialSimilarity * 0.4 + 
                  sentimentSimilarity * 0.4 + 
                  (sameEmotionalGroup ? 0.2 : 0)
                );
                
                return (
                  <div 
                    key={`${word1.id}-${word2.id}`} 
                    className="border rounded-md p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: `rgb(${word1.color[0] * 255}, ${word1.color[1] * 255}, ${word1.color[2] * 255})` 
                          }} 
                        />
                        <span className="font-bold">{word1.word}</span>
                      </div>
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground mx-2" />
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: `rgb(${word2.color[0] * 255}, ${word2.color[1] * 255}, ${word2.color[2] * 255})` 
                          }} 
                        />
                        <span className="font-bold">{word2.word}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Overall Relationship</p>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${overallSimilarity * 100}%` }}
                          />
                        </div>
                        <p className="text-sm mt-1">
                          {overallSimilarity >= 0.8 ? "Strongly Related" :
                            overallSimilarity >= 0.6 ? "Related" :
                            overallSimilarity >= 0.4 ? "Moderately Related" :
                            overallSimilarity >= 0.2 ? "Weakly Related" : "Barely Related"}
                          {" "}
                          ({Math.round(overallSimilarity * 100)}%)
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Contextual Similarity</p>
                          <p className="text-sm font-medium">{Math.round(spatialSimilarity * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Emotional Alignment</p>
                          <p className="text-sm font-medium">{Math.round(sentimentSimilarity * 100)}%</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Emotional Group</p>
                        <p className="text-sm font-medium">
                          {sameEmotionalGroup 
                            ? `Both in "${word1.emotionalTone || 'Neutral'}" group` 
                            : `Different groups (${word1.emotionalTone || 'Neutral'} vs ${word2.emotionalTone || 'Neutral'})`}
                        </p>
                      </div>
                      
                      {sharedKeywords && sharedKeywords.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Shared Concepts</p>
                          <div className="flex flex-wrap gap-1">
                            {sharedKeywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      
      {sourceDescription && words.length > 0 && (
        <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-1" />
          {sourceDescription}
        </div>
      )}
    </div>
  );
};
