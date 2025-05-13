
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
}

export interface BertAnalysisConfig {
  model: string;
  settings: {
    threshold: number;
    maxKeywords: number;
  };
}
