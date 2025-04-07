
export interface Point {
  id: string;
  word: string;           // Changed from text to word
  sentiment: number;
  position: [number, number, number];
  color: [number, number, number];
  keywords?: string[];
  emotionalTone?: string;
  relationships?: Array<{ id: string; strength: number; word?: string }>;
}

export interface DocumentEmbeddingProps {
  points?: Point[];
  onPointClick?: (point: Point) => void;
  isInteractive?: boolean;
  depressedJournalReference?: boolean;  // New prop for home page
  focusOnWord?: string | null;         // Adding this prop to fix the type error
}
