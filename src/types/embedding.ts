
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
  points: Point[]; // Make points required to match DocumentEmbeddingWrapperProps
  onPointClick?: (point: Point | null) => void;
  isInteractive?: boolean;
  depressedJournalReference?: boolean;  
  focusOnWord?: string | null;         
  onComparePoint?: (point1: Point, point2: Point) => void;  
  onSearchSelect?: (point: Point) => void;  
  sourceDescription?: string;
  onResetView?: () => void;
  visibleClusterCount?: number;
}
