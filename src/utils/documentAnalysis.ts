
// Update the KeywordAnalysis interface to support both string and array color formats
export interface KeywordAnalysis {
  word: string;
  sentiment: number;
  weight: number;
  color: string | [number, number, number];
  tone?: string;
  relatedConcepts?: string[];
  frequency?: number;
  pos?: string;
}

// Add the missing analyzePdfContent function that was causing the build error
export const analyzePdfContent = async (pdfText: string) => {
  try {
    console.log("Analyzing PDF content:", pdfText.substring(0, 100) + "...");
    
    // Create a basic analysis result
    return {
      text: pdfText,
      fileName: "document.pdf",
      fileSize: `${Math.round(pdfText.length / 1024)} KB`,
      wordCount: pdfText.split(/\s+/).filter(Boolean).length,
      sourceDescription: `Extracted from PDF`,
      summary: pdfText.substring(0, 200) + "..."
    };
  } catch (error) {
    console.error("Error analyzing PDF content:", error);
    throw error;
  }
};

// Update any other type definitions as needed
