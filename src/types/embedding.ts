
/**
 * Point type for emotion/sentiment visualization
 */
export interface Point {
  id: string;
  word?: string;
  text?: string;
  position?: [number, number, number];
  x?: number;
  y?: number;
  z?: number;
  sentiment?: number;
  emotionalTone?: string;
  color?: [number, number, number] | string;
  relationships?: Relationship[];
  frequency?: number;
}

/**
 * Relationship between embedding points
 */
export interface Relationship {
  id: string;
  strength: number;
}

/**
 * Props for document embedding components
 */
export interface DocumentEmbeddingProps {
  points?: Point[];
  onPointClick?: (point: Point | null) => void;
  isInteractive?: boolean;
  depressedJournalReference?: boolean;
  focusOnWord?: string | null;
  onComparePoint?: (point1: Point, point2: Point) => void;
  onSearchSelect?: (point: Point) => void;
  sourceDescription?: string;
  onResetView?: () => void;
  visibleClusterCount?: number;
  showAllPoints?: boolean;
  wordCount?: number;
  bertAnalysis?: any;
}

// Type for getSentimentLabel function that might be needed
export type SentimentLabel = "Positive" | "Neutral" | "Negative" | "Very Positive" | "Very Negative";

// Helper function for sentiment labels
export function getSentimentLabel(value: number): SentimentLabel {
  if (value >= 0.7) return "Very Positive";
  if (value >= 0.55) return "Positive";
  if (value <= 0.3) return "Very Negative";
  if (value <= 0.45) return "Negative";
  return "Neutral";
}
