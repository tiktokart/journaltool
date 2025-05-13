
import { BertAnalysisResult } from '../types/bertAnalysis';
import { analyzeTextWithBert } from './bertIntegration';

/**
 * Generate monthly analysis by combining journal entries
 * @param journalEntries The entries to analyze
 * @returns Monthly BERT analysis
 */
export const generateMonthlyAnalysis = async (journalEntries: any[]): Promise<BertAnalysisResult> => {
  try {
    // Combine all journal entry texts with separator
    const combinedText = journalEntries
      .map(entry => entry.text || '')
      .filter(text => text.length > 0)
      .join('\n\n');
      
    if (!combinedText || combinedText.length < 10) {
      throw new Error('Not enough text content to analyze');
    }
    
    // Analyze the combined text
    const analysis = await analyzeTextWithBert(combinedText);
    
    // Get sentiment data and other statistics
    let positiveWordCount = 0;
    let negativeWordCount = 0;
    let neutralWordCount = 0;
    
    // Count sentiment distributions from keywords
    if (analysis.keywords) {
      analysis.keywords.forEach(keyword => {
        const sentiment = keyword.sentiment || 0.5;
        if (sentiment > 0.6) positiveWordCount++;
        else if (sentiment < 0.4) negativeWordCount++;
        else neutralWordCount++;
      });
    }
    
    // Create distribution data
    const totalWordCount = positiveWordCount + negativeWordCount + neutralWordCount || 1;
    const sentimentDistribution = {
      positive: Math.round((positiveWordCount / totalWordCount) * 100),
      negative: Math.round((negativeWordCount / totalWordCount) * 100),
      neutral: Math.round((neutralWordCount / totalWordCount) * 100)
    };
    
    // Ensure distribution adds up to 100%
    const sumPercentages = sentimentDistribution.positive + 
                          sentimentDistribution.negative + 
                          sentimentDistribution.neutral;
                          
    if (sumPercentages !== 100) {
      // Adjust neutral to make total 100%
      sentimentDistribution.neutral += (100 - sumPercentages);
    }
    
    // Return BertAnalysisResult format with relevant fields
    return {
      sentiment: analysis.sentiment,
      keywords: analysis.keywords,
      distribution: sentimentDistribution,
      bertAnalysis: analysis,
      overallSentiment: {
        score: analysis.sentiment.score,
        label: analysis.sentiment.label
      },
      text: combinedText,
      timestamp: new Date().toISOString(),
      sourceDescription: "Monthly Journal Analysis",
      wordCount: combinedText.split(/\s+/).filter(word => word.trim().length > 0).length
    };
  } catch (error) {
    console.error('Error generating monthly analysis:', error);
    // Return minimal valid object on error
    return {
      sentiment: { score: 0.5, label: "Neutral" },
      distribution: { positive: 33, neutral: 34, negative: 33 },
      keywords: []
    };
  }
};

/**
 * Save monthly analysis to localStorage
 * @param analysis The analysis to save
 * @param month Month identifier (e.g., "2023-05")
 */
export const saveMonthlyAnalysis = (analysis: BertAnalysisResult, month: string): void => {
  try {
    const storageKey = `monthlyAnalysis-${month}`;
    localStorage.setItem(storageKey, JSON.stringify(analysis));
  } catch (error) {
    console.error('Error saving monthly analysis:', error);
  }
};

/**
 * Get monthly analysis from localStorage
 * @param month Month identifier (e.g., "2023-05")
 * @returns The saved monthly analysis or null
 */
export const getMonthlyAnalysis = (month: string): BertAnalysisResult | null => {
  try {
    const storageKey = `monthlyAnalysis-${month}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting monthly analysis:', error);
    return null;
  }
};

/**
 * Generate a text summary of monthly journal sentiment
 * @param journalEntries Array of journal entries
 * @returns Summary text and sentiment trends
 */
export const generateMonthlySummary = (journalEntries: any[]): { 
  summary: string;
  averageSentiment: number;
  trendDescription: string;
} => {
  // Default values
  if (!journalEntries || journalEntries.length === 0) {
    return {
      summary: "No journal entries to analyze",
      averageSentiment: 0.5,
      trendDescription: "Neutral - no entries detected"
    };
  }
  
  try {
    // Calculate average sentiment
    let totalSentiment = 0;
    let validEntries = 0;
    
    journalEntries.forEach(entry => {
      if (entry.sentiment?.score !== undefined) {
        totalSentiment += entry.sentiment.score;
        validEntries++;
      } else if (entry.overallSentiment?.score !== undefined) {
        totalSentiment += entry.overallSentiment.score;
        validEntries++;
      }
    });
    
    const averageSentiment = validEntries > 0 ? totalSentiment / validEntries : 0.5;
    
    // Look for trends over time
    let trendDescription = "Your emotional state has been relatively steady this month.";
    if (journalEntries.length >= 3) {
      // Compare earlier and later entries
      const firstHalf = journalEntries.slice(0, Math.floor(journalEntries.length / 2));
      const secondHalf = journalEntries.slice(Math.floor(journalEntries.length / 2));
      
      let firstHalfSentiment = 0;
      let secondHalfSentiment = 0;
      
      firstHalf.forEach(entry => {
        firstHalfSentiment += entry.sentiment?.score || entry.overallSentiment?.score || 0.5;
      });
      
      secondHalf.forEach(entry => {
        secondHalfSentiment += entry.sentiment?.score || entry.overallSentiment?.score || 0.5;
      });
      
      const firstAvg = firstHalf.length > 0 ? firstHalfSentiment / firstHalf.length : 0.5;
      const secondAvg = secondHalf.length > 0 ? secondHalfSentiment / secondHalf.length : 0.5;
      const difference = secondAvg - firstAvg;
      
      if (difference > 0.15) {
        trendDescription = "Your emotional state shows significant improvement over the month.";
      } else if (difference > 0.05) {
        trendDescription = "Your emotional state has been slightly improving this month.";
      } else if (difference < -0.15) {
        trendDescription = "Your emotional state shows a significant decline over the month.";
      } else if (difference < -0.05) {
        trendDescription = "Your emotional state has been slightly declining this month.";
      }
    }
    
    // Generate basic summary
    let sentiment = "neutral";
    if (averageSentiment > 0.6) sentiment = "positive";
    else if (averageSentiment < 0.4) sentiment = "negative";
    
    const summary = `This month's journals show a generally ${sentiment} tone. ${trendDescription}`;
    
    return {
      summary,
      averageSentiment,
      trendDescription
    };
  } catch (error) {
    console.error("Error generating monthly summary:", error);
    return {
      summary: "Unable to analyze journal entries",
      averageSentiment: 0.5,
      trendDescription: "Error analyzing trend"
    };
  }
};
