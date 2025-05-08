
import { Point } from '@/types/embedding';
import { getEmotionColor } from '@/utils/embeddingUtils';
import { getEmotionColor as getBertEmotionColor } from '@/utils/bertSentimentAnalysis';
import { getHomepageEmotionColor } from '@/utils/colorUtils';

// Helper function to convert hex color string to [r,g,b] tuple
export const hexToRgbTuple = (hex: string): [number, number, number] => {
  // Remove # if present
  const cleanHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;
  
  // Parse the hex values
  const bigint = parseInt(cleanHex, 16);
  
  // Convert to r, g, b values between 0 and 1
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  
  return [r, g, b];
};

// Unified color function for emotional tones - ensuring consistency across the app
export const getUnifiedEmotionColor = (emotion: string, isHomepage: boolean = false): string => {
  // For homepage, use our special random pastel colors
  if (isHomepage) {
    const homepageColor = getHomepageEmotionColor(emotion, true);
    if (homepageColor) {
      return homepageColor;
    }
  }
  
  // For dashboard or fallback, use the standard colors
  const bertColor = getBertEmotionColor(emotion);
  if (bertColor !== "#95A5A6") { // Not the default gray
    return bertColor;
  }
  
  // Fall back to embedding utils color if BERT doesn't have a specific color
  return getEmotionColor(emotion);
};

export const enrichPoints = (points: Point[], isHomepage: boolean = false): Point[] => {
  if (!points || points.length === 0) return [];
  
  return points.map(point => {
    if (typeof point.color === 'string') {
      // Convert string color to RGB tuple
      return {
        ...point,
        color: hexToRgbTuple(point.color as unknown as string)
      } as Point;
    } else if (point.emotionalTone && (!point.color || (Array.isArray(point.color) && point.color.every(c => c === 0)))) {
      // If there's an emotional tone but no color or zeroed color
      return {
        ...point,
        color: hexToRgbTuple(getUnifiedEmotionColor(point.emotionalTone, isHomepage))
      } as Point;
    }
    return point;
  });
};

export const extractEmotionalGroups = (points: Point[]): string[] => {
  if (!points || points.length === 0) return [];
  
  const uniqueGroups = new Set<string>();
  
  points.forEach(point => {
    if (point.emotionalTone) {
      uniqueGroups.add(point.emotionalTone);
    } else {
      uniqueGroups.add("Neutral");
    }
  });
  
  return Array.from(uniqueGroups).sort();
};
