
// Re-export with proper type declarations
import {
  processAnalysisResults,
  processBertTimeline,
  groupEmotionsByType,
  extractMainSubjects,
  createThemeCategories
} from './bertAnalysisProcessor';

import { generateMonthlySummary } from './monthlyAnalysis';

import {
  saveJournalEntry,
  retrieveJournalEntries,
  saveMonthlyReflection,
  retrieveMonthlyReflections
} from './journalStorage';

// Use 'export type' for type re-exports when isolatedModules is enabled
export type { TimelineEntry, BertAnalysisResult, BertAnalysisConfig } from '../types/bertAnalysis';

// Export functions
export {
  processAnalysisResults,
  processBertTimeline,
  groupEmotionsByType,
  extractMainSubjects,
  createThemeCategories,
  generateMonthlySummary,
  saveJournalEntry,
  retrieveJournalEntries,
  saveMonthlyReflection,
  retrieveMonthlyReflections
};
