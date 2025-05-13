
/**
 * Centralized data flow handler for BERT analysis
 * This ensures data consistency across all components and journal entries
 */
import { processBertAnalysis } from './bertAnalysisProcessor';
import { 
  saveBertAnalysisToJournal, 
  getJournalEntries 
} from './journalStorage';
import { 
  generateMonthlyAnalysis, 
  saveMonthlyAnalysis, 
  getMonthlyAnalysis 
} from './monthlyAnalysis';

// Export types separately
export type { BertAnalysisResult, KeywordAnalysis, TimelineEntry } from '../types/bertAnalysis';

// Re-export all functions
export {
  processBertAnalysis,
  saveBertAnalysisToJournal,
  getJournalEntries,
  generateMonthlyAnalysis,
  saveMonthlyAnalysis,
  getMonthlyAnalysis
};
