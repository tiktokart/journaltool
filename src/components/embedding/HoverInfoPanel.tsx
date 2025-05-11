
import React from 'react';
import { Point } from '@/types/embedding';
import { getSentimentLabel } from '@/utils/embeddingUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface HoverInfoPanelProps {
  point: Point | null;
}

export const HoverInfoPanel: React.FC<HoverInfoPanelProps> = ({ point }) => {
  const { t } = useLanguage();

  if (!point || !point.word) return null;

  // Function to get color based on sentiment
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return 'text-green-600';
    if (sentiment >= 0.55) return 'text-green-500';
    if (sentiment >= 0.45) return 'text-gray-600';
    if (sentiment >= 0.3) return 'text-orange-500';
    return 'text-red-500';
  };

  const sentimentLabel = getSentimentLabel(point.sentiment || 0.5);
  const sentimentColor = getSentimentColor(point.sentiment || 0.5);

  return (
    <div className="absolute bottom-4 left-4 max-w-[250px] bg-white bg-opacity-95 rounded-lg shadow-lg p-3 border border-gray-200 z-50 pointer-events-none">
      <div className="font-semibold text-lg mb-1">{point.word}</div>
      
      {point.emotionalTone && (
        <div className="text-sm mb-1">
          <span className="font-medium text-gray-700">{t("Emotion")}: </span>
          <span>{t(point.emotionalTone)}</span>
        </div>
      )}
      
      {typeof point.sentiment === 'number' && (
        <div className="text-sm mb-1">
          <span className="font-medium text-gray-700">{t("Sentiment")}: </span>
          <span className={sentimentColor}>{sentimentLabel}</span>
        </div>
      )}
      
      {point.frequency && (
        <div className="text-sm mb-1">
          <span className="font-medium text-gray-700">{t("Frequency")}: </span>
          <span>{point.frequency}</span>
        </div>
      )}
      
      {point.relationships && point.relationships.length > 0 && (
        <div className="text-sm">
          <div className="font-medium text-gray-700 mb-1">{t("Related Words")}:</div>
          <div className="flex flex-wrap gap-1">
            {point.relationships.slice(0, 3).map((rel, index) => (
              <span key={index} className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                {rel.word || `Word ${index + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
