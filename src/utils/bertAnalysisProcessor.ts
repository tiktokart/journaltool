
import { BertAnalysisResult } from '../types/bertAnalysis';
import { analyzeTextWithBert } from './bertIntegration';
import { analyzeSentiment } from './bertSentimentAnalysis';
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
      
      summary = `${firstSentences}... ${bertAnalysis.keywords ? "Key topics: " + bertAnalysis.keywords.slice(0, 3).map(k => k.word).join(', ') : ""}`;
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
