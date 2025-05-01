
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Text, HighlightTextIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";
import { getEmotionColor } from "@/utils/embeddingUtils";

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

  useEffect(() => {
    if (!pdfText || pdfText.length === 0 || embeddingPoints.length === 0) {
      setHighlightedText([pdfText]);
      return;
    }

    // Process text with emotion highlighting
    processTextWithEmotions();
  }, [pdfText, embeddingPoints, showHighlights]);

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

    // Split text into words while preserving whitespace and punctuation
    const textSegments: { text: string; emotion: string | null }[] = [];
    let currentText = "";
    let currentSegmentType: "word" | "nonword" = "nonword";

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
      const emotion = wordEmotionMap.get(word.toLowerCase()) || null;
      textSegments.push({ text: word, emotion });

      lastIndex = match.index + word.length;
    }

    // Add any remaining text
    if (lastIndex < pdfText.length) {
      textSegments.push({ text: pdfText.substring(lastIndex), emotion: null });
    }

    // Convert segments to React nodes with appropriate styling
    const nodes = textSegments.map((segment, index) => {
      if (!segment.emotion) {
        return segment.text;
      }

      const backgroundColor = getEmotionColor(segment.emotion, 0.3);
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
      <Card className="border border-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Text className="h-5 w-5 mr-2 text-primary" />
            {t("documentTextVisualization")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground">{t("noTextAvailableFromPdf")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="flex items-center text-xl">
            <HighlightTextIcon className="h-5 w-5 mr-2 text-primary" />
            {t("documentTextVisualization")}
          </CardTitle>
          <Button
            variant={showHighlights ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHighlights(!showHighlights)}
            className="self-start"
          >
            {showHighlights ? t("hideEmotionalHighlights") : t("showEmotionalHighlights")}
          </Button>
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
