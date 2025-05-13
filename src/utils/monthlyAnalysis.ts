
import { BertAnalysisResult } from '../types/bertAnalysis';
import { Point } from '../types/embedding';
import { getJournalEntries } from './journalStorage';

/**
 * Generate monthly analysis from journal entries
 * @param month - Month in YYYY-MM format
 * @returns Aggregated analysis for the month
 */
export const generateMonthlyAnalysis = (month: string): BertAnalysisResult | null => {
  try {
    const entries = getJournalEntries();
    
    // Filter entries for the specified month
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
      return entryMonth === month;
    });
    
    if (monthEntries.length === 0) {
      console.log("No entries found for month:", month);
      return null;
    }
    
    console.log(`Generating monthly analysis for ${month} with ${monthEntries.length} entries`);
    
    // Combine text from all entries
    const combinedText = monthEntries.map(entry => entry.text).join("\n\n");
    
    // Combine embedding points
    const combinedPoints: Point[] = [];
    monthEntries.forEach(entry => {
      if (entry.embeddingPoints && Array.isArray(entry.embeddingPoints)) {
        // Deduplicate points
        const existingWords = combinedPoints.map(p => p.word);
        const newPoints = entry.embeddingPoints.filter(
          (p: Point) => !existingWords.includes(p.word)
        );
        combinedPoints.push(...newPoints);
      }
    });
    
    // Calculate average sentiment
    const totalSentiment = monthEntries.reduce(
      (sum, entry) => sum + entry.overallSentiment.score, 
      0
    );
    const averageSentiment = totalSentiment / monthEntries.length;
    
    // Create a summary
    const summary = `Monthly analysis for ${month} based on ${monthEntries.length} journal entries.`;
    
    // Return aggregated result
    return {
      sentiment: {
        score: averageSentiment,
        label: averageSentiment > 0.6 ? "Positive" : averageSentiment < 0.4 ? "Negative" : "Neutral"
      },
      distribution: {
        positive: Math.round(averageSentiment * 100),
        negative: Math.round((1 - averageSentiment) * 0.7 * 100),
        neutral: 100 - Math.round(averageSentiment * 100) - Math.round((1 - averageSentiment) * 0.7 * 100)
      },
      keywords: monthEntries.flatMap(entry => entry.bertAnalysis?.keywords || []),
      bertAnalysis: {
        keywords: monthEntries.flatMap(entry => entry.bertAnalysis?.keywords || []),
        overallSentiment: averageSentiment,
        overallTone: averageSentiment > 0.6 ? "Positive" : averageSentiment < 0.4 ? "Negative" : "Neutral",
        analysis: summary
      },
      embeddingPoints: combinedPoints,
      overallSentiment: {
        score: averageSentiment,
        label: averageSentiment > 0.6 ? "Positive" : averageSentiment < 0.4 ? "Negative" : "Neutral"
      },
      text: combinedText,
      sourceDescription: `Monthly analysis for ${month}`,
      wordCount: combinedText.split(/\s+/).filter(word => word.trim().length > 0).length,
      timestamp: new Date().toISOString(),
      summary
    };
  } catch (error) {
    console.error("Error generating monthly analysis:", error);
    return null;
  }
};

/**
 * Save monthly analysis to local storage
 * @param month - Month in YYYY-MM format
 * @param analysisResult - The analysis result to save
 */
export const saveMonthlyAnalysis = (
  month: string,
  analysisResult: BertAnalysisResult
): void => {
  try {
    // Get existing monthly analyses
    const analysesJson = localStorage.getItem('monthlyAnalyses');
    const analyses = analysesJson ? JSON.parse(analysesJson) : {};
    
    // Add/update analysis for this month
    analyses[month] = analysisResult;
    
    // Save back to localStorage
    localStorage.setItem('monthlyAnalyses', JSON.stringify(analyses));
    console.log("Monthly analysis saved for:", month);
  } catch (error) {
    console.error("Error saving monthly analysis:", error);
  }
};

/**
 * Get monthly analysis from local storage
 * @param month - Month in YYYY-MM format
 * @returns Analysis for the month
 */
export const getMonthlyAnalysis = (month: string): BertAnalysisResult | null => {
  try {
    const analysesJson = localStorage.getItem('monthlyAnalyses');
    if (!analysesJson) return null;
    
    const analyses = JSON.parse(analysesJson);
    return analyses[month] || null;
  } catch (error) {
    console.error("Error getting monthly analysis:", error);
    return null;
  }
};
