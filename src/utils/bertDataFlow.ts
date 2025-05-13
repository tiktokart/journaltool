/**
 * Centralized data flow handler for BERT analysis
 * This ensures data consistency across all components and journal entries
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

import { analyzeTextWithBert } from './bertIntegration';
import { analyzeSentiment, batchAnalyzeSentiment } from './bertSentimentAnalysis';
import { generateEmbeddingPoints } from './embeddingGeneration';
import { Point } from '../types/embedding';

/**
 * Process text through BERT analysis
 * @param text - The text to analyze
 * @param fileName - Optional filename
 * @param fileSize - Optional file size in bytes
 * @param sourceDescription - Optional description of source
 * @returns Comprehensive analysis results
 */
export const processBertAnalysis = async (
  text: string,
  fileName?: string,
  fileSize?: number,
  sourceDescription?: string
): Promise<BertAnalysisResult> => {
  console.log("Running comprehensive BERT analysis on text:", text.substring(0, 100) + "...");
  
  try {
    // Run BERT analysis
    const bertAnalysis = await analyzeTextWithBert(text);
    console.log("BERT analysis complete with", bertAnalysis.keywords?.length || 0, "keywords");
    
    // Generate embedding points
    const embeddingPoints = await generateEmbeddingPoints(text);
    console.log("Generated", embeddingPoints.length, "embedding points");
    
    // Analyze overall sentiment
    const sentimentResult = await analyzeSentiment(text);
    console.log("Sentiment analysis complete:", sentimentResult.label, sentimentResult.normalizedScore);
    
    // Calculate word count
    const wordCount = text.split(/\s+/).filter(word => word.trim().length > 0).length;
    
    // Generate distribution based on BERT sentiment
    const distribution = {
      positive: Math.round(sentimentResult.normalizedScore * 100),
      negative: Math.round((1 - sentimentResult.normalizedScore) * 0.7 * 100),
      neutral: 100 - Math.round(sentimentResult.normalizedScore * 100) - Math.round((1 - sentimentResult.normalizedScore) * 0.7 * 100)
    };
    
    // Generate summary if text is long enough
    let summary = "";
    if (text.length > 200) {
      const firstSentences = text
        .split(/[.!?]+/)
        .filter(s => s.trim().length > 0)
        .slice(0, 2)
        .join(". ");
      
      summary = `${firstSentences}... ${bertAnalysis.analysis || ""}`;
    } else {
      summary = text;
    }
    
    // Create timestamp
    const timestamp = new Date().toISOString();
    
    return {
      bertAnalysis,
      embeddingPoints,
      overallSentiment: {
        score: sentimentResult.normalizedScore,
        label: sentimentResult.label
      },
      distribution,
      summary,
      text,
      sourceDescription: sourceDescription || `Analysis of ${fileName || "text"}`,
      fileName,
      fileSize,
      wordCount,
      timestamp
    };
  } catch (error) {
    console.error("Error in BERT data flow processing:", error);
    throw error;
  }
};

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
      distribution: {
        positive: Math.round(averageSentiment * 100),
        negative: Math.round((1 - averageSentiment) * 0.7 * 100),
        neutral: 100 - Math.round(averageSentiment * 100) - Math.round((1 - averageSentiment) * 0.7 * 100)
      },
      summary,
      text: combinedText,
      sourceDescription: `Monthly analysis for ${month}`,
      wordCount: combinedText.split(/\s+/).filter(word => word.trim().length > 0).length,
      timestamp: new Date().toISOString()
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
