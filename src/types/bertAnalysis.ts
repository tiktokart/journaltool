
import { Point } from './embedding';

/**
 * Interface for BERT analysis results
 */
export interface BertAnalysisResult {
  bertAnalysis: any;
  embeddingPoints: Point[];
  overallSentiment: { score: number; label: string };
  distribution: { positive: number; neutral: number; negative: number };
  summary?: string;
  text: string;
  sourceDescription?: string;
  fileName?: string;
  fileSize?: number;
  wordCount: number;
  timestamp: string;
}

/**
 * Interface for keyword analysis
 */
export interface KeywordAnalysis {
  word: string;
  text?: string;
  sentiment: number;
  tone?: string;
  relatedConcepts?: string[];
  frequency?: number;
  color?: string;
}

/**
 * Interface for timeline entry
 */
export interface TimelineEntry {
  time: string;
  sentiment: number;
  score: number; // Making this required to fix the TypeScript error
  event: string;
  textSnippet: string;
  page?: number;
  index?: number;
}
