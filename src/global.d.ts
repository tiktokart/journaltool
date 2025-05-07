
interface Window {
  documentEmbeddingActions?: {
    resetView?: () => void;
  };
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
