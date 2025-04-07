
import { Point } from "../../types/embedding";
import { getEmotionColor, getSentimentLabel } from "../../utils/embeddingUtils";

interface HoverInfoPanelProps {
  point: Point;
}

export const HoverInfoPanel = ({ point }: HoverInfoPanelProps) => {
  if (!point) return null;
  
  return (
    <div className="absolute bottom-4 left-4 bg-card p-3 rounded-lg shadow-md max-w-xs z-10">
      <div className="flex items-center mb-2">
        <div 
          className="w-3 h-3 rounded-full mr-2" 
          style={{ 
            backgroundColor: getEmotionColor(point.emotionalTone || "")
          }} 
        />
        <span className="font-medium">Text Excerpt</span>
      </div>
      <p className="text-sm mb-2">{point.text}</p>
      
      {point.keywords && (
        <div className="mb-2">
          <span className="text-xs font-medium block mb-1">Keywords:</span>
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
          <span>Emotional Tone: {point.emotionalTone}</span>
        )}
      </div>
      
      {point.relationships && point.relationships.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium block mb-1">Connected words:</span>
          <div className="grid grid-cols-2 gap-1">
            {point.relationships.map((rel, idx) => (
              <div key={idx} className="text-xs flex items-center">
                <div className="w-1 h-1 rounded-full bg-primary mr-1"></div>
                <span>{rel.word || `Connection ${idx + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
