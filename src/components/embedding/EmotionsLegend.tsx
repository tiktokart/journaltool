
import { getEmotionColor } from "../../utils/embeddingUtils";

export const EmotionsLegend = () => {
  const emotions = [
    "Joy", "Sadness", "Anger", "Fear", 
    "Surprise", "Disgust", "Trust", "Anticipation"
  ];

  return (
    <div className="absolute top-4 left-4 bg-card p-2 rounded-lg shadow-md text-xs z-10">
      <div className="font-medium mb-1">Emotional Tones:</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {emotions.map((emotion) => (
          <div key={emotion} className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-1" 
              style={{ backgroundColor: getEmotionColor(emotion) }}
            />
            <span>{emotion}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
