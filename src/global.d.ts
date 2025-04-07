
interface Window {
  documentEmbeddingActions?: {
    focusOnEmotionalGroup?: (tone: string) => void;
    resetEmotionalGroupFilter?: () => void;
    resetView?: () => void;
  };
  documentEmbeddingPoints?: any[];
}
