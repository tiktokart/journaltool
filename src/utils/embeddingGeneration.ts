
import { Point } from "@/types/embedding";
import seedrandom from "seedrandom";

/**
 * Generates embedding points for visualization based on the document text
 * @param text The document text to analyze
 * @returns Array of 3D points representing the document's semantic space
 */
export const generateEmbeddingPoints = async (text: string): Promise<Point[]> => {
  try {
    console.log("Generating embedding points for text:", text.substring(0, 100) + "...");
    
    // Extract significant words from the text
    const significantWords = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter((word, i, arr) => arr.indexOf(word) === i);
    
    // Use text as seed for random number generation to ensure consistency
    const seed = text.length.toString();
    const rng = seedrandom(seed);
    
    // Simple emotion categories
    const emotions = [
      "Joy", "Sadness", "Anger", "Fear", "Surprise", 
      "Anticipation", "Trust", "Disgust", "Neutral"
    ];
    
    // Generate 3D points for visualization
    const points: Point[] = [];
    
    // Limit the number of points to avoid overwhelming the visualization
    const maxPoints = Math.min(500, significantWords.length);
    
    for (let i = 0; i < maxPoints; i++) {
      // Get a word from our significant words list
      // If we run out, just use the index as a string
      const word = i < significantWords.length ? significantWords[i] : `word_${i}`;
      
      // Generate a 3D position
      const position: [number, number, number] = [
        (rng() * 2 - 1) * 15, // x: -15 to 15
        (rng() * 2 - 1) * 15, // y: -15 to 15
        (rng() * 2 - 1) * 15  // z: -15 to 15
      ];
      
      // Generate a sentiment score (0 to 1)
      const sentiment = rng() * 0.6 + 0.2; // 0.2 to 0.8
      
      // Assign an emotional tone
      const emotionalTone = emotions[Math.floor(rng() * emotions.length)];
      
      // Generate RGB color based on emotional tone
      const r = rng() * 0.8 + 0.2; // 0.2 to 1.0
      const g = rng() * 0.8 + 0.2; // 0.2 to 1.0
      const b = rng() * 0.8 + 0.2; // 0.2 to 1.0
      const color: [number, number, number] = [r, g, b];
      
      // Create point with a unique ID
      const point: Point = {
        id: `p${i}`,
        position,
        word,
        sentiment,
        emotionalTone,
        color // Adding the required color property
      };
      
      // Add relationships with other points (between 3-7 relationships)
      const relationshipsCount = Math.floor(rng() * 4) + 3;
      const relationships = [];
      
      for (let j = 0; j < relationshipsCount; j++) {
        const targetIndex = Math.floor(rng() * maxPoints);
        if (targetIndex !== i) {
          relationships.push({
            id: `p${targetIndex}`,
            strength: rng() * 0.7 + 0.3 // 0.3 to 1.0
          });
        }
      }
      
      point.relationships = relationships;
      points.push(point);
    }
    
    return points;
  } catch (error) {
    console.error("Error generating embedding points:", error);
    return [];
  }
};
