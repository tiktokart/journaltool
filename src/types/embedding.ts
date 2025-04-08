
export interface Point {
  id: string;
  word: string;           
  sentiment: number;
  position: [number, number, number];
  color: [number, number, number];
  keywords?: string[];
  emotionalTone?: string;
  relationships?: Array<{ id: string; strength: number; word?: string }>;
}

export interface DocumentEmbeddingProps {
  points?: Point[];
  onPointClick?: (point: Point | null) => void;
  isInteractive?: boolean;
  depressedJournalReference?: boolean;  
  focusOnWord?: string | null;         
  onComparePoint?: (point: Point) => void;  // Fixed to take a single point parameter
  onSearchSelect?: (point: Point) => void;  
  sourceDescription?: string;
  onResetView?: () => void;
  visibleClusterCount?: number;  
}
