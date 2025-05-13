
// Re-export with proper type declarations
import { analyzeTextWithBert } from './bertIntegration';
import { analyzeSentiment } from './bertSentimentAnalysis';
import { processBertAnalysis } from './bertAnalysisProcessor';

// Import storage functions
import {
  saveBertAnalysisToJournal,
  getJournalEntries,
  saveJournalEntry,
  retrieveJournalEntries
} from './journalStorage';

// Import monthly analysis functions
import {
  generateMonthlyAnalysis,
  saveMonthlyAnalysis,
  getMonthlyAnalysis,
  generateMonthlySummary
} from './monthlyAnalysis';

// Use 'export type' for type re-exports when isolatedModules is enabled
export type { TimelineEntry, BertAnalysisResult, BertAnalysisConfig, KeywordAnalysis } from '../types/bertAnalysis';

// Export functions
export {
  processBertAnalysis,
  analyzeTextWithBert,
  analyzeSentiment,
  saveBertAnalysisToJournal,
  getJournalEntries,
  saveJournalEntry,
  retrieveJournalEntries,
  generateMonthlyAnalysis,
  saveMonthlyAnalysis,
  getMonthlyAnalysis,
  generateMonthlySummary
};
