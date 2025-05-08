import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Highlighter, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";
import { getEmotionColor } from "@/utils/embeddingUtils";
import { getEmotionColor as getBertEmotionColor } from "@/utils/bertSentimentAnalysis";
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
  const [filteringLevel, setFilteringLevel] = useState<'none' | 'minimal'>('minimal');

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

    console.log("Processing text with emotions, found points:", embeddingPoints.length);
    
    // Log some sample points to check if they have proper emotions and colors
    const samplePoints = embeddingPoints.slice(0, 5);
    console.log("Sample points for highlighting:", samplePoints);

    // Create a map of words to their emotional tones and colors
    const wordEmotionMap = new Map();
    embeddingPoints.forEach(point => {
      if (point.word) {
        // Ensure all points have emotion and color
        const emotion = point.emotionalTone || "Neutral";
        let color;
        
        if (point.color) {
          // If point has a color array, use it
          if (Array.isArray(point.color)) {
            const [r, g, b] = point.color;
            color = `rgb(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)})`;
          } else {
            // If it's already a string, use it directly
            color = point.color;
          }
        } else {
          // Otherwise get color based on emotion - try from both utils to ensure we have a color
          color = getBertEmotionColor(emotion) || getEmotionColor(emotion);
        }
        
        // Only add to map if we successfully identified a color
        if (color) {
          wordEmotionMap.set(point.word.toLowerCase(), {
            emotion,
            color
          });
        }
      }
    });

    console.log("Word emotion map size:", wordEmotionMap.size);

    // Words to filter out - significantly reduced filtering, only the most common/basic words
    const wordsToFilter = filteringLevel === 'minimal' ? [
      // Minimal filtering - only the most common articles and basic pronouns
      'a', 'an', 'the', 'is', 'are', 'was', 'were'
    ] : [];

    // Split text into words while preserving whitespace and punctuation
    const textSegments: { text: string; emotion: string | null; color?: string }[] = [];
    
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
      const emotionData = wordEmotionMap.get(wordLower);
      
      // If it has an emotion, never filter it regardless of its type
      if (emotionData) {
        textSegments.push({ 
          text: word, 
          emotion: emotionData.emotion,
          color: emotionData.color
        });
      } else if (shouldFilter) {
        // Only filter if it's in our filtered list AND has no emotion assigned
        textSegments.push({ text: word, emotion: null });
      } else {
        textSegments.push({ text: word, emotion: null });
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

      // Use the color from the segment if available
      let backgroundColor;
      if (segment.color) {
        if (typeof segment.color === 'string') {
          // Add transparency to the color if it's a hex color
          if (segment.color.startsWith('#')) {
            backgroundColor = segment.color + '4D';  // Add 30% opacity (4D in hex)
          } else {
            // For rgb format, add opacity
            backgroundColor = segment.color.replace('rgb', 'rgba').replace(')', ', 0.3)');
          }
        } else {
          // Fallback to emotion-based color
          backgroundColor = getEmotionColor(segment.emotion) || getBertEmotionColor(segment.emotion);
        }
      } else {
        backgroundColor = getEmotionColor(segment.emotion) || getBertEmotionColor(segment.emotion);
      }
      
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
      <Card className="border border-border shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Highlighter className="h-5 w-5 mr-2 text-primary" />
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
    <Card className="border border-border shadow-md bg-white">
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
                  pressed={filteringLevel === 'none'}
                  onPressedChange={(pressed) => setFilteringLevel(pressed ? 'none' : 'minimal')}
                  size="sm"
                  aria-label="Toggle filtering level"
                  className="self-start"
                >
                  {filteringLevel === 'none' ? "No Filtering" : "Minimal Filtering"}
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
