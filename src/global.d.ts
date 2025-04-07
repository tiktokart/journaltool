
interface Window {
  documentEmbeddingActions?: {
    focusOnEmotionalGroup?: (tone: string) => void;
    resetEmotionalGroupFilter?: () => void;
    resetView?: () => void;
  };
  documentEmbeddingPoints?: Point[]; // Updated to use Point[] instead of any[]
}

// Add interface for String prototype extension if we decide to use it
// This is commented out because we're not using this approach
/*
interface String {
  toNumber(): number;
}
*/
