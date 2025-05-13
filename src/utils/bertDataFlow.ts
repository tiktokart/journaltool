
// Re-export with proper type declarations
import { analyzeTextWithBert } from './bertIntegration';
import { analyzeSentiment } from './bertSentimentAnalysis';
import { processBertAnalysis } from './bertAnalysisProcessor';

// Import storage functions
import {
  saveBertAnalysisToJournal,
  getJournalEntries
} from './journalStorage';

// Import monthly analysis functions
import {
  generateMonthlyAnalysis,
  saveMonthlyAnalysis,
  getMonthlyAnalysis
} from './monthlyAnalysis';

// Use 'export type' for type re-exports when isolatedModules is enabled
export type { TimelineEntry, BertAnalysisResult, BertAnalysisConfig } from '../types/bertAnalysis';

// Export functions
export {
  processBertAnalysis,
  analyzeTextWithBert,
  analyzeSentiment,
  saveBertAnalysisToJournal,
  getJournalEntries,
  generateMonthlyAnalysis,
  saveMonthlyAnalysis,
  getMonthlyAnalysis
};
