
import React, { useEffect, useState } from 'react';
import { Point } from '@/types/embedding';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, X, Search, GitCompareArrows, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEmotionColor, getSentimentLabel } from '@/utils/embeddingUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface WordComparisonProps {
  words: Point[];
  onRemoveWord: (point: Point) => void;
  calculateRelationship: (point1: Point, point2: Point) => {
    spatialSimilarity: number;
    sentimentSimilarity: number;
    sameEmotionalGroup: boolean;
    sharedKeywords: string[];
  } | null;
  onAddWordClick: () => void;
  sourceDescription?: string; // Add this to show where words came from
}

export const WordComparison: React.FC<WordComparisonProps> = ({ 
  words, 
  onRemoveWord, 
  calculateRelationship,
  onAddWordClick,
  sourceDescription
}) => {
  const { t, language } = useLanguage();
  const [forceUpdate, setForceUpdate] = useState<number>(0);

  // Force re-render on language change
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [language]);

  // Handle document clicks to close any open dropdowns
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

  // Translate sentiment label
  const getTranslatedSentiment = (sentiment: string): string => {
    const key = sentiment.toLowerCase().replace(/\s+/g, '');
    if (t(key)) {
      return t(key);
    }
    return sentiment;
  };

  // Translate emotional tone
  const getTranslatedEmotion = (emotion: string): string => {
    const lowerCaseEmotion = emotion?.toLowerCase();
    if (lowerCaseEmotion && t(lowerCaseEmotion)) {
      return t(lowerCaseEmotion);
    }
    return emotion || t("neutral");
  };

  if (words.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="mb-3 p-4 rounded-full bg-muted/50">
          <GitCompareArrows className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No Words Selected</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {sourceDescription ? (
            <>
              {t("addWordsFromDocument")}
            </>
          ) : (
            <>
              {t("addWordsToCompare")}
            </>
          )}
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onAddWordClick}
        >
          <Search className="h-4 w-4 mr-2" />
          {t("searchWords")}
        </Button>
        
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
          <div key={`${word.id}-${forceUpdate}`} className="border rounded-md p-4 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => onRemoveWord(word)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ 
                  backgroundColor: word.emotionalTone 
                    ? getEmotionColor(word.emotionalTone)
                    : `rgb(${word.color[0] * 255}, ${word.color[1] * 255}, ${word.color[2] * 255})` 
                }} 
              />
              <h3 className="font-bold truncate">{word.word}</h3>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("emotionalTones")}</p>
              <p className="text-sm font-medium">{getTranslatedEmotion(word.emotionalTone)}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">{t("sentiment")}</p>
              <p className="text-sm font-medium">
                {word.sentiment.toFixed(2)}{" "}
                {getTranslatedSentiment(
                  word.sentiment >= 0.7 ? "veryPositive" : 
                  word.sentiment >= 0.5 ? "positive" : 
                  word.sentiment >= 0.4 ? "neutral" : 
                  word.sentiment >= 0.25 ? "negative" : "veryNegative"
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {words.length > 1 && (
        <div>
          <h3 className="text-lg font-medium mb-4">{t("relationshipAnalysis")}</h3>
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
                    key={`${word1.id}-${word2.id}-${forceUpdate}`} 
                    className="border rounded-md p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: word1.emotionalTone 
                              ? getEmotionColor(word1.emotionalTone)
                              : `rgb(${word1.color[0] * 255}, ${word1.color[1] * 255}, ${word1.color[2] * 255})` 
                          }} 
                        />
                        <span className="font-bold">{word1.word}</span>
                      </div>
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground mx-2" />
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: word2.emotionalTone 
                              ? getEmotionColor(word2.emotionalTone)
                              : `rgb(${word2.color[0] * 255}, ${word2.color[1] * 255}, ${word2.color[2] * 255})` 
                          }} 
                        />
                        <span className="font-bold">{word2.word}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t("overallRelationship")}</p>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${overallSimilarity * 100}%` }}
                          />
                        </div>
                        <p className="text-sm mt-1">
                          {t(
                            overallSimilarity >= 0.8 ? "stronglyRelated" :
                            overallSimilarity >= 0.6 ? "related" :
                            overallSimilarity >= 0.4 ? "moderatelyRelated" :
                            overallSimilarity >= 0.2 ? "weaklyRelated" : "barelyRelated"
                          )}
                          {" "}
                          ({Math.round(overallSimilarity * 100)}%)
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t("contextualSimilarity")}</p>
                          <p className="text-sm font-medium">{Math.round(spatialSimilarity * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t("emotionalAlignment")}</p>
                          <p className="text-sm font-medium">{Math.round(sentimentSimilarity * 100)}%</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t("emotionalGroupType")}</p>
                        <p className="text-sm font-medium">
                          {sameEmotionalGroup 
                            ? `${t("bothIn")} "${getTranslatedEmotion(word1.emotionalTone)}" ${t("group")}` 
                            : `${t("differentGroups")} (${getTranslatedEmotion(word1.emotionalTone)} ${t("vs")} ${getTranslatedEmotion(word2.emotionalTone)})`}
                        </p>
                      </div>
                      
                      {sharedKeywords && sharedKeywords.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t("sharedConcepts")}</p>
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
