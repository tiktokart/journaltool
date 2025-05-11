
import { generateSummary } from './summaryGeneration';
import { calculateSentiment } from './sentimentAnalysis';
import { extractEntities } from './entityExtraction';
import { extractKeyPhrases } from './keyPhraseExtraction';
import { generateTimeline } from './timelineGeneration';
import { generateEmbeddingPoints } from './embeddingGeneration';
import { extractTextFromPdf } from './pdfExtraction';
import { analyzeTextWithBert } from './bertIntegration';

// Common prepositions and articles to filter out
const stopWords = [
  'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 
  'about', 'in', 'under', 'over', 'with', 'without', 'during', 'before', 'after', 'of',
  'pdf', 'document', 'file', 'text', 'page', 'content'
];

// Identify common PDF metadata patterns
const pdfMetadataRegex = /from\s+pdf|pdf\s+file|document\s+name|file\s+name|page\s+\d+/gi;

export const analyzePdfContent = async (file: File, pdfText: string) => {
  try {
    console.log("Starting PDF analysis with BERT...");
    
    // Use the text provided directly if available, otherwise extract from PDF
    let text = pdfText;
    
    if (!text && file) {
      // Extract text from PDF if text wasn't provided
      text = await extractTextFromPdf(file);
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from the document");
    }
    
    // Calculate total word count
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    // Clean text by removing PDF metadata patterns
    let cleanedText = text.replace(pdfMetadataRegex, '');
    
    // Enhanced text preprocessing for better context analysis
    // - Replace multiple spaces with single space
    // - Ensure proper sentence boundaries for better context analysis
    // - Maintain original case for better entity detection
    const processedText = cleanedText
      .replace(/\s+/g, ' ')
      .replace(/(\w)\.(\w)/g, '$1. $2') // Add space after periods between words
      .trim();
    
    // Perform BERT analysis first so other analyses can use its results
    console.log("Running BERT analysis on cleaned text...");
    const bertAnalysis = await analyzeTextWithBert(processedText);
    
    // Filter out stop words and common PDF metadata terms from BERT keywords
    if (bertAnalysis.keywords && Array.isArray(bertAnalysis.keywords)) {
      bertAnalysis.keywords = bertAnalysis.keywords.filter(keyword => {
        const word = keyword.word?.toLowerCase();
        return word && word.length > 2 && !stopWords.includes(word) && 
               !word.match(/pdf|document|file|page|content/);
      });
    }
    
    console.log("BERT analysis complete, found keywords:", bertAnalysis.keywords?.length || 0);
    
    // Generate summary with enhanced contextual analysis
    const summary = await generateSummary(processedText);
    
    // Calculate overall sentiment with improved balance
    const { overallSentiment, distribution } = await calculateSentiment(processedText);
    
    // Extract entities with deeper contextual understanding
    const entities = await extractEntities(processedText);
    
    // Extract key phrases with focus on nouns and verbs that have contextual significance
    const keyPhrases = await extractKeyPhrases(processedText);
    
    // Generate timeline with meaningful text markers
    const timeline = await generateTimeline(processedText);
    
    // Generate embedding points with contextual relationships, using BERT keywords if available
    const embeddingPoints = await generateEmbeddingPoints(processedText, bertAnalysis);
    
    console.log("BERT Analysis complete with the following stats:");
    console.log(`- Word count: ${wordCount}`);
    console.log(`- Overall sentiment: ${overallSentiment.label} (${overallSentiment.score.toFixed(2)})`);
    console.log(`- Embedding points: ${embeddingPoints.length}`);
    console.log(`- Key phrases: ${keyPhrases.length}`);
    console.log(`- Entities: ${entities.length}`);
    console.log(`- Timeline entries: ${timeline.length}`);
    console.log(`- BERT keywords: ${bertAnalysis.keywords?.length || 0}`);
    
    // Make the data available on window.documentEmbeddingPoints for other components
    window.documentEmbeddingPoints = embeddingPoints;
    
    // Create a complete analysis object with all the required data for all tabs
    const analysisResults = {
      fileName: file ? file.name : "Text Analysis",
      fileSize: file ? file.size : new TextEncoder().encode(text).length,
      wordCount,
      pdfTextLength: text.length,
      text: processedText, // Use the processed text for visualization
      embeddingPoints,
      summary,
      overallSentiment,
      distribution,
      timeline,
      entities,
      keyPhrases,
      bertAnalysis, // Add the BERT analysis to the results
      sourceDescription: "Analysis with BERT Model",
      // Add timestamps to help with caching/refreshing
      timestamp: new Date().toISOString()
    };
    
    // Store the results in sessionStorage for persistence across tab changes
    try {
      sessionStorage.setItem('lastAnalysisResults', JSON.stringify(analysisResults));
    } catch (storageError) {
      console.warn("Could not save analysis results to sessionStorage:", storageError);
    }
    
    return analysisResults;
  } catch (error) {
    console.error("Error analyzing PDF content:", error);
    throw error;
  }
};
