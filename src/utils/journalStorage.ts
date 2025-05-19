
import { BertAnalysisResult } from '../types/bertAnalysis';
import { Point } from '../types/embedding';

/**
 * Save BERT analysis to local storage for journal entries
 * @param analysisResult - The analysis result to save
 * @param entryId - Optional ID for the entry
 */
export const saveBertAnalysisToJournal = (
  analysisResult: BertAnalysisResult,
  entryId?: string
): string => {
  const id = entryId || `entry-${new Date().getTime()}`;
  
  try {
    // Get existing entries
    const entriesJson = localStorage.getItem('journalEntries');
    const entries = entriesJson ? JSON.parse(entriesJson) : [];
    
    // Add new entry
    const entry = {
      id,
      ...analysisResult,
      entryDate: new Date().toISOString()
    };
    
    entries.push(entry);
    
    // Save back to localStorage
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    console.log("BERT analysis saved to journal entry:", id);
    
    return id;
  } catch (error) {
    console.error("Error saving BERT analysis to journal:", error);
    throw error;
  }
};

/**
 * Get all journal entries with BERT analysis
 * @returns Array of entries
 */
export const getJournalEntries = (): any[] => {
  try {
    const entriesJson = localStorage.getItem('journalEntries');
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error("Error getting journal entries:", error);
    return [];
  }
};
