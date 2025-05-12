
import { Point, getSentimentLabel } from '../types/embedding';

/**
 * Get a color based on sentiment
 * @param sentiment - Sentiment score (0-1)
 * @returns RGB color array
 */
export const getColorForSentiment = (sentiment: number): [number, number, number] => {
  // Red (negative) to Green (positive)
  const r = Math.max(0, Math.min(1, 1 - sentiment * 2));
  const g = Math.max(0, Math.min(1, sentiment * 2));
  const b = Math.max(0, Math.min(1, 0.5 - Math.abs(sentiment - 0.5)));
  
  return [r, g, b];
};

/**
 * Get a color for an emotional tone
 * @param tone - Emotional tone
 * @returns Hex color code
 */
export const getEmotionColor = (emotion: string): string => {
  const emotions: Record<string, string> = {
    "Joy": "#FFD700",        // Gold color for Joy
    "Joyful": "#F1C40F",     // Yellow color for Joyful
    "Happy": "#2ECC71",      // Light Green
    "Excited": "#E67E22",    // Orange
    "Peaceful": "#3498DB",   // Blue
    "Calm": "#2980B9",       // Dark Blue
    "Neutral": "#95A5A6",    // Gray
    "Anxious": "#E74C3C",    // Red
    "Angry": "#C0392B",      // Dark Red
    "Sad": "#9B59B6",        // Purple
    "Depressed": "#8E44AD",  // Dark Purple
    "Frustrated": "#D35400", // Burnt Orange
    "Confused": "#F39C12",   // Light Orange
    "Scared": "#7F8C8D",     // Dark Gray
    "Disgusted": "#6C3483",  // Violet
    "Surprised": "#16A085",  // Teal
    "Fearful": "#D35400"     // Burnt Orange (same as Scared)
  };
  
  return emotions[emotion] || "#95A5A6";
};

/**
 * Enrich points with colors and handling for edge cases
 * @param points - Array of points
 * @param isHomepage - Whether this is for the homepage
 * @returns Enriched points
 */
export const enrichPoints = (points: Point[], isHomepage: boolean = false): Point[] => {
  if (!points || !Array.isArray(points) || points.length === 0) {
    return [];
  }
  
  return points.map((point) => {
    // Make sure position is typed correctly as [number, number, number]
    const x = point.x !== undefined ? point.x : (point.position ? point.position[0] : 0);
    const y = point.y !== undefined ? point.y : (point.position ? point.position[1] : 0);
    const z = point.z !== undefined ? point.z : (point.position ? point.position[2] : 0);
    
    // Add sentiment-based color if not present
    let color = point.color;
    
    if (!color) {
      const sentiment = typeof point.sentiment === 'number' ? point.sentiment : Math.random();
      color = getColorForSentiment(sentiment);
    } else if (typeof color === 'string') {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      color = [r, g, b];
    }
    
    // Add emotional tone if not present
    let emotionalTone = point.emotionalTone;
    if (!emotionalTone && point.sentiment) {
      if (point.sentiment > 0.7) emotionalTone = "Joyful";
      else if (point.sentiment > 0.6) emotionalTone = "Happy";
      else if (point.sentiment > 0.5) emotionalTone = "Peaceful";
      else if (point.sentiment > 0.4) emotionalTone = "Neutral";
      else if (point.sentiment > 0.3) emotionalTone = "Confused";
      else if (point.sentiment > 0.2) emotionalTone = "Sad";
      else emotionalTone = "Depressed";
    } else if (!emotionalTone) {
      emotionalTone = "Neutral";
    }
    
    // Add word if not present (for legacy compatibility)
    const word = point.word || point.text || "unknown";
    
    // Add ID if not present
    const id = point.id || `word-${word}-${Math.floor(Math.random() * 10000)}`;
    
    // Return enhanced point
    return {
      ...point,
      id,
      word,
      text: word,
      position: [x, y, z] as [number, number, number], // Explicitly type as tuple
      color,
      emotionalTone,
      sentiment: point.sentiment || 0.5,
      frequency: point.frequency || 1,
    };
  });
};

/**
 * Extract unique emotional groups from points
 * @param points - Array of points
 * @returns Array of unique emotional tones
 */
export const extractEmotionalGroups = (points: Point[]): string[] => {
  if (!points || points.length === 0) return [];
  
  const groups = new Set<string>();
  points.forEach(point => {
    if (point.emotionalTone) {
      groups.add(point.emotionalTone);
    }
  });
  
  return Array.from(groups);
};
