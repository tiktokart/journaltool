
import * as pdfjs from 'pdfjs-dist';

// Ensure the PDF.js worker is loaded
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts text from a PDF file
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    console.log("Extracting text from PDF:", file.name);
    
    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument(uint8Array).promise;
    let text = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      text += pageText + ' ';
    }
    
    console.log(`Extracted ${text.length} characters from PDF`);
    return text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "Error extracting text from PDF. Please try again with a different file.";
  }
};
