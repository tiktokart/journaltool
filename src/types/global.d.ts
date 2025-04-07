
interface DocumentEmbeddingActions {
  focusOnEmotionalGroup?: (tone: string) => void;
}

declare global {
  interface Window {
    documentEmbeddingPoints?: import('./embedding').Point[];
    documentEmbeddingActions?: DocumentEmbeddingActions;
  }
}

export {};
