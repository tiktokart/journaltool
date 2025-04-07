
import React from 'react';
import { Point } from '@/types/embedding';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight } from 'lucide-react';

interface WordComparisonProps {
  word1: Point;
  word2: Point;
}

export const WordComparison: React.FC<WordComparisonProps> = ({ word1, word2 }) => {
  const calculateRelationship = () => {
    // Calculate spatial distance
    const distance = Math.sqrt(
      Math.pow(word1.position[0] - word2.position[0], 2) +
      Math.pow(word1.position[1] - word2.position[1], 2) +
      Math.pow(word1.position[2] - word2.position[2], 2)
    );
    
    // Lower distance = higher similarity (normalize between 0-1)
    const spatialSimilarity = Math.max(0, 1 - (distance / 40));
    
    // Calculate sentiment similarity
    const sentimentDiff = Math.abs(word1.sentiment - word2.sentiment);
    const sentimentSimilarity = 1 - sentimentDiff;
    
    // Check if they belong to the same emotional group
    const sameEmotionalGroup = 
      (word1.emotionalTone || "Neutral") === (word2.emotionalTone || "Neutral");
    
    // Find shared keywords
    const word1Keywords = word1.keywords || [];
    const word2Keywords = word2.keywords || [];
    const sharedKeywords = word1Keywords.filter(k => word2Keywords.includes(k));
    
    const overallSimilarity = (
      spatialSimilarity * 0.4 + 
      sentimentSimilarity * 0.4 + 
      (sameEmotionalGroup ? 0.2 : 0)
    );
    
    return {
      spatialSimilarity,
      sentimentSimilarity,
      sameEmotionalGroup,
      sharedKeywords,
      overallSimilarity
    };
  };

  const {
    spatialSimilarity,
    sentimentSimilarity,
    sameEmotionalGroup,
    sharedKeywords,
    overallSimilarity
  } = calculateRelationship();

  return (
    <Card className="border rounded-md overflow-hidden">
      <CardContent className="p-4">
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
          
          {sharedKeywords.length > 0 && (
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
      </CardContent>
    </Card>
  );
};
