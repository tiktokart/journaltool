import { generateSummary } from './summaryGeneration';
import { calculateSentiment } from './sentimentAnalysis';
import { extractEntities } from './entityExtraction';
import { extractKeyPhrases } from './keyPhraseExtraction';
import { generateTimeline } from './timelineGeneration';
import { generateEmbeddingPoints } from './embeddingGeneration';
import { extractTextFromPdf } from './pdfExtraction';

export const analyzePdfContent = async (file: File, pdfText: string) => {
  try {
    console.log("Starting PDF analysis...");
    
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
    
    // Generate summary
    const summary = await generateSummary(text);
    
    // Calculate overall sentiment
    const { overallSentiment, distribution } = await calculateSentiment(text);
    
    // Extract entities
    const entities = await extractEntities(text);
    
    // Extract key phrases
    const keyPhrases = await extractKeyPhrases(text);
    
    // Generate timeline
    const timeline = await generateTimeline(text);
    
    // Generate embedding points
    const embeddingPoints = await generateEmbeddingPoints(text);
    
    // Make sure to include the entire text in the result
    return {
      fileName: file ? file.name : "Text Analysis",
      fileSize: file ? file.size : new TextEncoder().encode(text).length,
      wordCount,
      pdfTextLength: text.length,
      text,  // Include the full text for visualization
      embeddingPoints,
      summary,
      overallSentiment,
      distribution,
      timeline,
      entities,
      keyPhrases,
      sourceDescription: "Analysis with BERT Model"
    };
  } catch (error) {
    console.error("Error analyzing PDF content:", error);
    throw error;
  }
};

async function generateMockEmbeddingPoints(text: string) {
  console.log("Generating mock embedding points...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateMockEmbeddingPoints(text);
}
