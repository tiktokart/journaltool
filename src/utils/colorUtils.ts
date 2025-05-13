
import seedrandom from 'seedrandom';

// Create a deterministic random number generator for consistent colors
const rng = seedrandom('emotion-color-seed-123');

// Updated pastel color palette with more legible yellow for Joy Theme
const homepagePastelColors = [
  '#F2FCE2', // Soft Green
  '#FFC107', // Amber (more legible yellow)
  '#FEC6A1', // Soft Orange
  '#E5DEFF', // Soft Purple
  '#FFDEE2', // Soft Pink
  '#FDE1D3', // Soft Peach
  '#D3E4FD', // Soft Blue
  '#F1F0FB', // Soft Gray
  '#9b87f5', // Primary Purple
  '#7E69AB', // Secondary Purple
  '#6E59A5', // Tertiary Purple
  '#D6BCFA', // Light Purple
  '#0EA5E9', // Ocean Blue
  '#8B5CF6', // Vivid Purple
  '#D946EF', // Magenta Pink
  '#F97316', // Bright Orange
];

// Map to store assigned colors to ensure consistency
const emotionColorMap = new Map<string, string>();

/**
 * Gets a pastel color for an emotional tone specifically for the homepage visualization
 * @param emotionalTone The emotional tone to get a color for
 * @param isHomepage Whether this is for the homepage (true) or dashboard (false)
 * @returns Hex color code
 */
export const getHomepageEmotionColor = (emotionalTone: string, isHomepage: boolean = false): string => {
  // If not homepage or no emotional tone, return empty
  if (!isHomepage || !emotionalTone) {
    return '';
  }
  
  // Special case for Joy to use a more legible color
  if (emotionalTone.toLowerCase().includes('joy')) {
    return '#FFC107'; // Amber color for Joy
  }
  
  // If we've already assigned a color to this emotion, return it
  if (emotionColorMap.has(emotionalTone)) {
    return emotionColorMap.get(emotionalTone)!;
  }
  
  // Otherwise pick a random color from our palette
  const colorIndex = Math.floor(rng() * homepagePastelColors.length);
  const color = homepagePastelColors[colorIndex];
  
  // Store it for consistency
  emotionColorMap.set(emotionalTone, color);
  
  return color;
};
