
import { useState, useEffect } from "react";
import { Point } from "@/types/embedding";
import { Badge } from "@/components/ui/badge";
import { getEmotionColor } from "@/utils/embeddingUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface HoverInfoPanelProps {
  point: Point | null;
  position?: { x: number; y: number } | null;
}

export const HoverInfoPanel = ({ point, position }: HoverInfoPanelProps) => {
  const { t } = useLanguage();
  const [relatedWords, setRelatedWords] = useState<{ word: string; strength: number }[]>([]);
  
  useEffect(() => {
    if (point && point.relationships) {
      const related = point.relationships
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3)
        .map(rel => {
          const allPoints = window.documentEmbeddingPoints || [];
          const relatedPoint = allPoints.find(p => p.id === rel.id);
          return {
            word: relatedPoint?.word || "unknown",
            strength: rel.strength
          };
        });
      setRelatedWords(related);
    } else {
      setRelatedWords([]);
    }
  }, [point]);
  
  if (!point) return null;
  
  const emotionColor = getEmotionColor(point.emotionalTone || "Neutral");
  
  const panelStyle = {
    position: "absolute" as const,
    top: position ? `${position.y}px` : '10px',
    left: position ? `${position.x}px` : '10px',
    transform: "translate(-50%, -100%)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "1rem",
    zIndex: 50,
    maxWidth: "300px",
    border: "1px solid #f6df60",
    pointerEvents: "none" as const
  };
  
  const sentimentBgClass = 
    point.sentiment > 0.6 ? "bg-sentiment-positive" : 
    point.sentiment < 0.4 ? "bg-sentiment-negative" : 
    "bg-sentiment-neutral";

  return (
    <div style={panelStyle}>
      <div className="flex flex-col gap-2 text-black">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{point.word}</h3>
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: emotionColor }}
          ></div>
        </div>
        
        <div>
          <span className="text-sm font-semibold">{t("emotionalTone")}:</span>
          <span className="ml-2 text-sm">{point.emotionalTone || t("neutral")}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{t("sentiment")}:</span>
          <div className={`h-2 flex-1 rounded-full ${sentimentBgClass}`}></div>
          <span className="text-xs">{Math.round(point.sentiment * 100)}%</span>
        </div>
        
        {relatedWords.length > 0 && (
          <div>
            <span className="text-sm font-semibold block mb-1">{t("relatedWords")}:</span>
            <div className="flex flex-wrap gap-1">
              {relatedWords.map((rel, i) => (
                <Badge 
                  key={i} 
                  className="bg-yellow text-black"
                >
                  {rel.word}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
