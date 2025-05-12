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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { analyzeTextWithBert } from "@/utils/bertIntegration";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { shouldFilterWord } from "@/utils/documentAnalysis";

interface TextEmotionViewerProps {
  pdfText: string;
  embeddingPoints?: Point[];
  sourceDescription?: string;
  bertAnalysis?: any;
}

export const TextEmotionViewer = ({ 
  pdfText, 
  embeddingPoints = [],
  sourceDescription,
  bertAnalysis
}: TextEmotionViewerProps) => {
  const { t } = useLanguage();
  const [highlightedText, setHighlightedText] = useState<React.ReactNode[]>([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [hideNonHighlighted, setHideNonHighlighted] = useState(false);
  const [filteringLevel, setFilteringLevel] = useState<'none' | 'minimal'>('minimal');
  const [localBertAnalysis, setLocalBertAnalysis] = useState<any>(bertAnalysis);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Default to open

  // Unified color function for emotional tones - ensuring consistency across the app
  const getUnifiedEmotionColor = (emotion: string): string => {
    // Prioritize BERT emotional colors for consistency
    const bertColor = getBertEmotionColor(emotion);
    if (bertColor !== "#95A5A6") { // Not the default gray
      return bertColor;
    }
    
    // Fall back to embedding utils color if BERT doesn't have a specific color
    return getEmotionColor(emotion);
  };

  // Run BERT analysis when pdfText changes
  useEffect(() => {
    const runAnalysis = async () => {
      if (!pdfText || pdfText.trim().length === 0) return;
      
      // If bertAnalysis was provided as a prop, use it instead of running new analysis
      if (bertAnalysis) {
        console.log("Using provided BERT analysis with", bertAnalysis.keywords?.length || 0, "keywords");
        setLocalBertAnalysis(bertAnalysis);
        return;
      }
      
      setIsProcessing(true);
      try {
        // Analyze text with BERT
        const analysis = await analyzeTextWithBert(pdfText);
        setLocalBertAnalysis(analysis);
        console.log("Completed BERT analysis with", analysis.keywords?.length || 0, "keywords");
        setIsProcessing(false);
      } catch (error) {
        console.error("Error running BERT analysis:", error);
        setIsProcessing(false);
      }
    };
    
    runAnalysis();
  }, [pdfText, bertAnalysis]);

  useEffect(() => {
    // Use either provided embedding points or ones exposed on window by DocumentEmbedding
    let points = embeddingPoints?.length > 0 
      ? embeddingPoints 
      : window.documentEmbeddingPoints || [];
      
    // Also include BERT keywords for highlighting if available
    if (localBertAnalysis?.keywords?.length > 0) {
      console.log("Adding BERT keywords to embedding points for highlighting");
      const bertPoints = localBertAnalysis.keywords.map((kw: any) => ({
        word: kw.word,
        emotionalTone: kw.tone,
        color: kw.color,
        sentiment: kw.sentiment
      }));
      
      // Combine BERT points with embedding points, avoiding duplicates
      const existingWords = points.map((p: Point) => p.word?.toLowerCase());
      const filteredBertPoints = bertPoints.filter((p: any) => 
        p.word && !existingWords.includes(p.word?.toLowerCase())
      );
      
      points = [...points, ...filteredBertPoints];
    }
      
    console.log(`TextEmotionViewer: Using ${points.length} points for highlighting`);
    
    if (!pdfText || pdfText.length === 0) {
      setHighlightedText([pdfText || ""]);
      return;
    }

    if (points.length === 0) {
      setHighlightedText([pdfText]);
      return;
    }

    // Process text with emotion highlighting
    if (showHighlights) {
      processTextWithEmotions(points);
    } else {
      setHighlightedText([pdfText]);
    }
  }, [pdfText, embeddingPoints, showHighlights, hideNonHighlighted, filteringLevel, localBertAnalysis]);

  const processTextWithEmotions = (points: Point[]) => {
    if (!showHighlights) {
      setHighlightedText([pdfText]);
      return;
    }

    console.log("Processing text with emotions, found points:", points.length);
    
    // Log some sample points to check if they have proper emotions and colors
    const samplePoints = points.slice(0, 5);
    console.log("Sample points for highlighting:", samplePoints);

    // Create a map of words to their emotional tones and colors
    const wordEmotionMap = new Map();
    points.forEach(point => {
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
          // Otherwise get color based on emotion using the unified function
          color = getUnifiedEmotionColor(emotion);
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

    // Filter words using the utility function
    const wordsToFilter = filteringLevel === 'minimal' 
      ? Array.from(wordEmotionMap.keys()).filter(shouldFilterWord)
      : [];

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
          // Fallback to emotion-based color using the unified function
          backgroundColor = getUnifiedEmotionColor(segment.emotion);
        }
      } else {
        backgroundColor = getUnifiedEmotionColor(segment.emotion);
      }
      
      const color = "inherit";

      return (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <span 
              style={{ backgroundColor, color }}
              className="rounded px-0.5 transition-colors hover:opacity-80 cursor-help"
            >
              {segment.text}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-georgia">
              <strong>Emotion:</strong> {segment.emotion}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    });

    setHighlightedText(nodes);
  };

  if (!pdfText || pdfText.trim().length === 0) {
    return (
      <Card className="border border-border shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-pacifico">
            <Highlighter className="h-5 w-5 mr-2 text-primary" />
            {t("Document Text Analysis")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 font-georgia">
          <p className="text-muted-foreground">{t("No text available from document")}</p>
        </CardContent>
      </Card>
    );
  }

  if (isProcessing) {
    return (
      <Card className="border border-border shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-pacifico">
            <Highlighter className="h-5 w-5 mr-2 text-primary" />
            {t("Document Text Analysis")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 font-georgia">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-muted-foreground font-georgia">Analyzing text with BERT...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="border border-border shadow-md bg-white">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-xl font-pacifico">
              <Highlighter className="h-5 w-5 mr-2 text-primary" />
              {t("Document Text Analysis")}
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          {sourceDescription && (
            <p className="text-sm text-muted-foreground mt-1 font-georgia">{sourceDescription}</p>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardHeader className="pt-2 pb-3">
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                variant={showHighlights ? "default" : "outline"}
                size="sm"
                onClick={() => setShowHighlights(!showHighlights)}
                className="self-start bg-purple-600 hover:bg-purple-700 text-white font-georgia"
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
                    className="self-start font-georgia"
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
                    className="self-start font-georgia"
                  >
                    {filteringLevel === 'none' ? "No Filtering" : "Minimal Filtering"}
                  </Toggle>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] rounded border border-border p-4">
              <div className="text-sm whitespace-pre-wrap font-georgia">
                {highlightedText}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
