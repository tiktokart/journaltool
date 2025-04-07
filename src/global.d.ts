
interface Window {
  documentEmbeddingActions?: {
    focusOnEmotionalGroup?: (tone: string) => void;
    resetEmotionalGroupFilter?: () => void;
    resetView?: () => void;
  };
  documentEmbeddingPoints?: import('./types/embedding').Point[]; // Use import instead of direct reference
}

// Add interface for String prototype extension if we decide to use it
// This is commented out because we're not using this approach
/*
interface String {
  toNumber(): number;
}
*/
