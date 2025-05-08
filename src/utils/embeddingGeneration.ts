import { Point } from '../types/embedding';

interface EmbeddingPoint {
  position: [number, number, number];
  word: string;
  sentiment: number;
  emotionalTone: string;
}

// Common words to exclude from analysis (expanded list)
const commonWordsToExclude = [
  // Articles
  "the", "a", "an",
  
  // Common prepositions
  "in", "on", "at", "by", "for", "with", "about", "against", "between", "into", 
  "through", "during", "before", "after", "above", "below", "from", "up", "down",
  "over", "under", "again", "further", "then", "once", "here", "there", "when", 
  "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other",
  
  // Common conjunctions
  "and", "but", "or", "nor", "yet", "so", "because", "although", "since", "unless",
  "while", "where", "if", "than",
  
  // Helping verbs and to be verbs
  "is", "are", "am", "was", "were", "be", "being", "been", 
  "have", "has", "had", "do", "does", "did",
  "can", "could", "shall", "should", "will", "would", "may", "might", "must",
  "get", "got", "getting", "goes", "going", "come", "comes", "coming",
  
  // Other common words with little semantic value
  "very", "too", "also", "just", "only", "even", "such", "well", "that", "this",
  "these", "those", "whom", "whose", "which", "what", "who", "its", "out", "off", 
  "their", "them", "they", "thing", "things", "some", "something", "one", "two", 
  "three", "four", "five", "not"
];

/**
 * Generates embedding points for visualization
 * @param text The document text to visualize
 * @returns Array of points with semantic information
 */
export const generateEmbeddingPoints = async (text: string): Promise<Point[]> => {
  try {
    console.log("Generating embedding points for text:", text.substring(0, 100) + "...");
    
    // This is a placeholder for an actual embedding API call
    // In a real implementation, this would use a language model to generate embeddings
    const words = extractSignificantWords(text, 100);
    
    const points: Point[] = [];
    
    // Simple emotional tones to assign to different words
    const emotionalTones = [
      "Joyful", "Sad", "Angry", "Fearful", "Surprised", 
      "Disgusted", "Neutral", "Anxious", "Excited", "Calm"
    ];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      
      // Generate a point in a sphere
      const radius = 10 + Math.random() * 10;
      const x = Math.cos(angle1) * Math.sin(angle2) * radius;
      const y = Math.sin(angle1) * Math.sin(angle2) * radius;
      const z = Math.cos(angle2) * radius;
      
      // Assign a random sentiment score
      const sentiment = Math.random();
      
      // Assign a random emotional tone
      const emotionalTone = emotionalTones[Math.floor(Math.random() * emotionalTones.length)];
      
      // Generate a color based on sentiment (from red to green)
      const r = Math.floor(255 * (1 - sentiment));
      const g = Math.floor(255 * sentiment);
      const b = Math.floor(255 * 0.5); // Add some blue to avoid pure red/green
      
      // Create a point with the generated values
      const point: Point = {
        id: `word-${i}`,
        position: [x, y, z],
        word,
        sentiment,
        emotionalTone,
        color: [r/255, g/255, b/255],
        relationships: generateRelationships(i, words.length)
      };
      
      points.push(point);
    }
    
    return points;
  } catch (error) {
    console.error("Error generating embedding points:", error);
    return [];
  }
};

// Helper function to extract significant words from the text
function extractSignificantWords(text: string, limit: number): string[] {
  // Split the text into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => {
      // Filter out short words and common words
      return word.length > 3 && !commonWordsToExclude.includes(word);
    });
  
  // Count word frequencies
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    if (wordFrequency[word]) {
      wordFrequency[word]++;
    } else {
      wordFrequency[word] = 1;
    }
  });
  
  // Sort words by frequency
  const sortedWords = Object.keys(wordFrequency).sort(
    (a, b) => wordFrequency[b] - wordFrequency[a]
  );
  
  // Return the top N words, but at most the limit
  return sortedWords.slice(0, Math.min(sortedWords.length, limit));
}

// Helper function to generate relationships between points
function generateRelationships(index: number, totalPoints: number) {
  const relationships = [];
  const relationshipCount = Math.floor(Math.random() * 5) + 1; // 1-5 relationships
  
  for (let i = 0; i < relationshipCount; i++) {
    let relatedIndex;
    do {
      relatedIndex = Math.floor(Math.random() * totalPoints);
    } while (relatedIndex === index);
    
    relationships.push({
      id: `word-${relatedIndex}`,
      strength: Math.random() * 0.8 + 0.2 // Between 0.2 and 1.0
    });
  }
  
  return relationships;
}
