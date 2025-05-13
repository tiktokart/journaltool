
// Add additional types related to BERT analysis here

export interface TimelineEntry {
  time: string;
  event: string;
  textSnippet: string;
  sentiment: number;
  score?: number;
  page?: number;
  index: number;
}

export interface BertAnalysisResult {
  sentiment: {
    score: number;
    label: string;
  };
  keywords?: Array<{
    word: string;
    sentiment: number;
    tone?: string;
    color?: string;
    relatedConcepts?: string[];
  }>;
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  timeline?: TimelineEntry[];
  bertAnalysis?: any; // Add this field to match usage in components
  embeddingPoints?: any[]; // Add this field to match usage in components
  overallSentiment?: { score: number; label: string }; // Add this field to match usage in components
  text?: string; // Add this field to match usage in components
  sourceDescription?: string; // Add this field to match usage
  timestamp?: string; // Add this field to match usage
  wordCount?: number; // Add this field to match usage
  fileName?: string; // Add this field to match usage
  fileSize?: number; // Add this field to match usage
  summary?: string; // Add this field to match usage
}

export interface BertAnalysisConfig {
  model: string;
  settings: {
    threshold: number;
    maxKeywords: number;
  };
}
