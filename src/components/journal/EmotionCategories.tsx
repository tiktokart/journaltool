
import React from 'react';
import { Badge } from "../ui/badge";

interface EmotionCategoriesProps {
  emotionCategories: Record<string, string[]>;
  emotionTones: Map<string, number>;
}

const EmotionCategories: React.FC<EmotionCategoriesProps> = ({
  emotionCategories,
  emotionTones
}) => {
  // Check if we have any emotions to display
  const hasEmotions = Object.entries(emotionCategories)
    .some(([_, words]) => words.length > 0) || 
    emotionTones.size > 0;
  
  // If no emotions to display, return null
  if (!hasEmotions) return null;
  
  // Emotion category styling
  const getEmotionBadgeStyles = (emotion: string) => {
    switch(emotion) {
      case "Joy":
      case "Joyful":
        return "bg-amber-100 text-amber-800"; // Amber for joy
      case "Sadness":
      case "Sad":
        return "bg-blue-100 text-blue-800";
      case "Anxiety":
      case "Fear":
        return "bg-amber-100 text-amber-800";
      case "Contentment":
      case "Calm":
        return "bg-green-100 text-green-800";
      case "Confusion":
        return "bg-purple-100 text-purple-800";
      case "Anger":
        return "bg-red-100 text-red-800";
      case "Overwhelm":
        return "bg-orange-100 text-orange-800";
      case "Sleep":
        return "bg-indigo-100 text-indigo-800";
      case "Loneliness":
        return "bg-teal-100 text-teal-800";
      case "Neutral":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-3">
      <div className="flex items-start">
        <div className="w-full">
          <p className="font-medium mb-3">Detected emotions:</p>
          
          {/* Render emotion categories */}
          {Object.entries(emotionCategories)
            .filter(([category, words]) => words.length > 0)
            .map(([category, words]) => (
              <div key={category} className="mb-3">
                <div className="text-gray-600 mb-1">{category}:</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {words.slice(0, 5).map((word, idx) => (
                    <span 
                      key={idx} 
                      className={`inline-block px-2 py-1 rounded-full text-xs ${getEmotionBadgeStyles(category)}`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          
          {/* Emotional tones count display - only show if there are emotions */}
          {emotionTones.size > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">Emotional tones in your text:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(emotionTones.entries())
                  .map(([emotion, count], idx) => (
                    <span 
                      key={idx} 
                      className={`px-3 py-1 rounded-full ${getEmotionBadgeStyles(emotion)}`}
                    >
                      {emotion} <span className="font-semibold ml-1">{count}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionCategories;
