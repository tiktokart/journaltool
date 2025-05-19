
/**
 * Centralized data flow handler for BERT analysis
 * This ensures data consistency across all components and journal entries
 */
import { BertAnalysisResult } from '../types/bertAnalysis';
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

// Re-export all functions
export {
  BertAnalysisResult,
  processBertAnalysis,
  saveBertAnalysisToJournal,
  getJournalEntries,
  generateMonthlyAnalysis,
  saveMonthlyAnalysis,
  getMonthlyAnalysis
};
