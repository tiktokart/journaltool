
export interface Point {
  word?: string;
  label?: string;
  cluster?: number;
  group?: string;
  x?: number;
  y?: number;
  z?: number;
  position: number[]; // Made required to fix type error
  size?: number;
  color?: string | number[] | [number, number, number]; // Updated to handle all color formats
  emotionalTone?: string; // The emotional tone associated with the point
  sentiment?: number; // Numeric sentiment score
  intensity?: number; // How strongly the emotion is expressed
  selected?: boolean; // Whether the point is currently selected
  hidden?: boolean; // Whether the point should be hidden
  distance?: number; // Distance from selected point (for comparison)
  id?: string | number; // Unique identifier for the point
  relationships?: { id: string | number; strength: number; word?: string }[]; // Added word property
  keywords?: string[]; // Added for BERT integration
  text?: string; // For compatibility
  frequency?: number; // For word frequency
  [key: string]: any; // Allow for additional properties
}

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
  // Add missing props
  selectedPoint?: Point | null;
  selectedWord?: string | null;
  filteredPoints?: Point[];
  bertData?: any;
}
