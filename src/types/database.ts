
/**
 * Types for database integration
 */

import { Point } from './embedding';

export interface JournalEntry {
  id: string;
  text: string;
  title?: string;
  entryDate: string;
  created_at: string;
  embeddingPoints: Point[];
  bertAnalysis: any;
  overallSentiment: {
    score: number;
    label: string;
  };
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  summary: string;
  wordCount: number;
  timestamp: string;
}

export interface MonthlyAnalysis {
  month: string; // YYYY-MM format
  entries: string[]; // Journal entry IDs included in this analysis
  bertAnalysis: any;
  embeddingPoints: Point[];
  overallSentiment: {
    score: number;
    label: string;
  };
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  summary: string;
  wordCount: number;
  createdAt: string;
}

export interface AppSettings {
  lastAnalysis?: string;
  visualizationSettings: {
    pointSize: number;
    lineWidth: number;
    connectionOpacity: number;
  };
  preferredLanguage?: string;
  theme?: 'light' | 'dark' | 'system';
}
