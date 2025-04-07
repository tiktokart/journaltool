
import { Point } from "../../types/embedding";
import { getEmotionColor, getSentimentLabel } from "../../utils/embeddingUtils";

interface HoverInfoPanelProps {
  point: Point;
}

export const HoverInfoPanel = ({ point }: HoverInfoPanelProps) => {
  if (!point) return null;
  
  // Use gray color for neutral words
  const emotionColor = point.emotionalTone === "Neutral" 
    ? "rgb(128, 128, 128)" 
    : getEmotionColor(point.emotionalTone || "");
  
  return (
    <div className="absolute bottom-4 left-4 bg-card p-3 rounded-lg shadow-md max-w-xs z-10 border border-border">
      <div className="flex items-center mb-2">
        <div 
          className="w-3 h-3 rounded-full mr-2" 
          style={{ backgroundColor: emotionColor }} 
        />
        <span className="font-medium">{point.emotionalTone || "Neutral"}</span>
      </div>
      <p className="text-lg font-bold mb-2">{point.word}</p>
      
      {point.keywords && (
        <div className="mb-2">
          <span className="text-xs font-medium block mb-1">Related Concepts:</span>
          <div className="flex flex-wrap gap-1">
            {point.keywords.map((keyword, idx) => (
              <span key={idx} className="text-xs bg-accent px-1.5 py-0.5 rounded-full">{keyword}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs flex justify-between mb-2">
        <span>Sentiment: {getSentimentLabel(point.sentiment)}</span>
        {point.emotionalTone && (
          <span>Emotional Group: {point.emotionalTone}</span>
        )}
      </div>
      
      {point.relationships && point.relationships.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium block mb-1">Connected words:</span>
          <div className="grid grid-cols-2 gap-1">
            {point.relationships.map((rel, idx) => (
              <li key={idx} className="text-xs flex items-center">
                <div className="w-1 h-1 rounded-full bg-primary mr-1"></div>
                <span>{rel.word || `Connection ${idx + 1}`}</span>
              </li>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
