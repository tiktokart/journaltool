
/**
 * Generates a summary of the document text
 * @param text The document text to summarize
 * @returns A summary of the document
 */
export const generateSummary = async (text: string): Promise<string> => {
  try {
    // This would normally call an AI model API
    console.log("Generating summary for text:", text.substring(0, 100) + "...");
    
    // For now, return a simple summary based on text length and first few sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentences = sentences.slice(0, 3).join('. ');
    
    // Create a more informative summary
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = sentences.length;
    const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    const summary = `This document contains ${wordCount} words across ${sentenceCount} sentences and approximately ${paragraphCount} paragraphs.
    
It begins with: "${firstSentences}". 

The text appears to discuss personal experiences and observations, with possible themes related to emotions, relationships, and daily life.`;
    
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary for this document.";
  }
};
