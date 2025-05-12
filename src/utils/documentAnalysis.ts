
// Update the KeywordAnalysis interface to support both string and array color formats
export interface KeywordAnalysis {
  word: string;
  sentiment: number;
  weight: number;
  color: string | [number, number, number];
  tone?: string;
  relatedConcepts?: string[];
  frequency?: number;
  pos?: string;
}

// Update any other type definitions as needed
