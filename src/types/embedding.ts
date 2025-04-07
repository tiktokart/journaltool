
export interface Point {
  id: string;
  text: string;
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
}
