
import React from 'react';
import { Point, getSentimentLabel } from '@/types/embedding';
import { Badge } from '@/components/ui/badge';

interface HoverInfoPanelProps {
  point: Point;
}

export const HoverInfoPanel = ({ point }: HoverInfoPanelProps) => {
  if (!point) return null;

  const sentimentLabel = getSentimentLabel(point.sentiment || 0.5);

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white/90 border border-border p-3 rounded-lg shadow-lg">
      <div className="font-medium">{point.word}</div>
      <div className="mt-1 space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Emotion:</span>
          <Badge variant="outline">{point.emotionalTone}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Sentiment:</span>
          <span className={
            sentimentLabel === "Very Positive" || sentimentLabel === "Positive" ? "text-green-600" :
            sentimentLabel === "Very Negative" || sentimentLabel === "Negative" ? "text-red-600" :
            "text-gray-600"
          }>
            {sentimentLabel} ({Math.round((point.sentiment || 0) * 100)}%)
          </span>
        </div>
        {point.frequency !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Frequency:</span>
            <span>{point.frequency}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoverInfoPanel;
