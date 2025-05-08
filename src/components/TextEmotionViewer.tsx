
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Text, Highlighter, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";
import { getEmotionColor } from "@/utils/embeddingUtils";
import { Toggle } from "@/components/ui/toggle";

interface TextEmotionViewerProps {
  pdfText: string;
  embeddingPoints?: Point[];
  sourceDescription?: string;
}

export const TextEmotionViewer = ({ 
  pdfText, 
  embeddingPoints = [],
  sourceDescription
}: TextEmotionViewerProps) => {
  const { t } = useLanguage();
  const [highlightedText, setHighlightedText] = useState<React.ReactNode[]>([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [hideNonHighlighted, setHideNonHighlighted] = useState(false);
  const [filteringLevel, setFilteringLevel] = useState<'strict' | 'minimal'>('minimal');

  useEffect(() => {
    if (!pdfText || pdfText.length === 0) {
      setHighlightedText([pdfText || ""]);
      return;
    }

    if (embeddingPoints.length === 0) {
      setHighlightedText([pdfText]);
      return;
    }

    // Process text with emotion highlighting
    processTextWithEmotions();
  }, [pdfText, embeddingPoints, showHighlights, hideNonHighlighted, filteringLevel]);

  const processTextWithEmotions = () => {
    if (!showHighlights) {
      setHighlightedText([pdfText]);
      return;
    }

    // Create a map of words to their emotional tones
    const wordEmotionMap = new Map();
    embeddingPoints.forEach(point => {
      if (point.word && point.emotionalTone) {
        wordEmotionMap.set(point.word.toLowerCase(), point.emotionalTone);
      }
    });

    // Words to filter out - only essential filtering now (minimal list)
    const wordsToFilter = filteringLevel === 'strict' ? [
      // Prepositions
      'at', 'by', 'for', 'from', 'in', 'of', 'on', 'to', 'with',
      'about', 'above', 'across', 'after', 'against', 'along', 'among',
      'around', 'before', 'behind', 'below', 'beneath', 'beside',
      'between', 'beyond', 'during', 'except', 'inside', 'into',
      'like', 'near', 'off', 'over', 'since', 'through',
      'throughout', 'under', 'until', 'up', 'upon',
      
      // Articles
      'a', 'an', 'the',
      
      // Question words
      'when', 'where', 'why', 'how', 'which', 'what', 'who', 'whom', 'whose',
      
      // Pronouns
      'i', 'me', 'my', 'mine', 'myself',
      'you', 'your', 'yours', 'yourself', 'yourselves',
      'he', 'him', 'his', 'himself',
      'she', 'her', 'hers', 'herself',
      'it', 'its', 'itself',
      'we', 'us', 'our', 'ours', 'ourselves',
      'they', 'them', 'their', 'theirs', 'themselves',
      'this', 'that', 'these', 'those'
    ] : [
      // Minimal filtering - only the most common articles and pronouns
      'a', 'an', 'the', 'i', 'me', 'my', 'you', 'your', 'we', 'us', 'our', 'they', 'them', 'their'
    ];

    // Split text into words while preserving whitespace and punctuation
    const textSegments: { text: string; emotion: string | null }[] = [];
    
    // Regular expression that matches words
    const wordRegex = /[a-zA-Z0-9']+/g;
    let match;
    let lastIndex = 0;

    while ((match = wordRegex.exec(pdfText)) !== null) {
      // Add non-word segment before this word
      const nonWordText = pdfText.substring(lastIndex, match.index);
      if (nonWordText) {
        textSegments.push({ text: nonWordText, emotion: null });
      }

      // Add word segment
      const word = match[0];
      const wordLower = word.toLowerCase();
      const shouldFilter = wordsToFilter.includes(wordLower);
      const emotion = wordEmotionMap.get(wordLower) || null;
      
      // Only filter if it's in our filtered list AND has no emotion assigned
      if (shouldFilter && !emotion) {
        textSegments.push({ text: word, emotion: null });
      } else {
        textSegments.push({ text: word, emotion });
      }

      lastIndex = match.index + word.length;
    }

    // Add any remaining text
    if (lastIndex < pdfText.length) {
      textSegments.push({ text: pdfText.substring(lastIndex), emotion: null });
    }

    // Convert segments to React nodes with appropriate styling
    const nodes = textSegments.map((segment, index) => {
      // If hideNonHighlighted is true, only show segments with emotions
      if (hideNonHighlighted && !segment.emotion) {
        // Use a space to maintain some word separation
        return segment.text.match(/\s+/) ? " " : "";
      }

      if (!segment.emotion) {
        return segment.text;
      }

      // Get color for emotion
      const backgroundColor = getEmotionColor(segment.emotion);
      const color = "inherit";

      return (
        <span 
          key={index} 
          style={{ backgroundColor, color }}
          title={segment.emotion}
          className="rounded px-0.5 transition-colors"
        >
          {segment.text}
        </span>
      );
    });

    setHighlightedText(nodes);
  };

  if (!pdfText || pdfText.trim().length === 0) {
    return (
      <Card className="border border-border shadow-md bg-light-lavender">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Text className="h-5 w-5 mr-2 text-primary" />
            {t("Document Text Visualization")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground">{t("No text available from document")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-md bg-light-lavender">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="flex items-center text-xl">
            <Highlighter className="h-5 w-5 mr-2 text-primary" />
            {t("Document Text Visualization")}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showHighlights ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHighlights(!showHighlights)}
              className="self-start"
            >
              {showHighlights ? t("Hide Emotional Highlights") : t("Show Emotional Highlights")}
            </Button>
            {showHighlights && (
              <>
                <Toggle
                  pressed={hideNonHighlighted}
                  onPressedChange={setHideNonHighlighted}
                  size="sm"
                  aria-label="Toggle non-highlighted words visibility"
                  className="self-start"
                >
                  {hideNonHighlighted ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {hideNonHighlighted ? t("Show All Text") : t("Hide Non-Highlighted")}
                </Toggle>
                <Toggle
                  pressed={filteringLevel === 'strict'}
                  onPressedChange={(pressed) => setFilteringLevel(pressed ? 'strict' : 'minimal')}
                  size="sm"
                  aria-label="Toggle filtering level"
                  className="self-start"
                >
                  {filteringLevel === 'strict' ? "Strict Filtering" : "Minimal Filtering"}
                </Toggle>
              </>
            )}
          </div>
        </div>
        {sourceDescription && (
          <p className="text-sm text-muted-foreground mt-1">{sourceDescription}</p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] rounded border border-border p-4">
          <div className="text-sm whitespace-pre-wrap">
            {highlightedText}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
