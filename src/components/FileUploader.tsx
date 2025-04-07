
import { ChangeEvent, useState } from "react";
import { FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FileUploaderProps {
  onFilesAdded: (files: File[], pdfText?: string) => void;
}

export const FileUploader = ({ onFilesAdded }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      setIsExtracting(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      // Extract text from each page with improved extraction
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent({
          // Fixed: Remove normalizeWhitespace as it's not in the type definition
          disableCombineTextItems: false
        });
        
        // Process text items with more detail and whitespace preservation
        const pageText = textContent.items
          .map((item: any) => {
            // Only process text items (not drawings or other elements)
            if (!item.str || typeof item.str !== 'string') return '';
            
            // Add appropriate spacing based on item positions if available
            if (item.hasEOL) {
              return item.str + " ";
            }
            return item.str;
          })
          .join(' ');
        
        fullText += pageText + " ";
      }
      
      // Clean up the text while preserving meaningful content
      fullText = fullText
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/(\r\n|\n|\r)/gm, " ")  // Replace line breaks with spaces
        .trim();
      
      // Enhanced logging for debugging
      console.log("Extracted PDF text length:", fullText.length);
      console.log("First 200 characters:", fullText.substring(0, 200));
      console.log("Total words extracted:", fullText.split(/\s+/).length);
      
      return fullText;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      toast.error("Failed to extract text from PDF");
      return "";
    } finally {
      setIsExtracting(false);
    }
  };

  const processPdfFile = async (file: File) => {
    try {
      toast.info("Extracting text from PDF...");
      const pdfText = await extractTextFromPdf(file);
      
      if (!pdfText || pdfText.trim().length === 0) {
        toast.warning("No readable text found in the PDF");
        onFilesAdded([file], "");
      } else {
        const wordCount = pdfText.split(/\s+/).filter(w => w.length > 0).length;
        toast.success(`Extracted ${wordCount} words from PDF`);
        
        // More detailed logging for better debugging
        console.log("PDF text sample:", pdfText.substring(0, 200));
        console.log("PDF text length:", pdfText.length);
        console.log("Words in PDF:", wordCount);
        
        // Pass the extracted text to the parent component for analysis
        onFilesAdded([file], pdfText);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Error processing PDF file");
      onFilesAdded([file], "");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        toast.error("Only PDF files are supported");
        return;
      }
      
      processPdfFile(pdfFiles[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        toast.error("Only PDF files are supported");
        return;
      }
      
      processPdfFile(pdfFiles[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      } transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <FileUp className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-lg">Upload your PDF document</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop your file here, or click to browse
          </p>
        </div>
        <div className="mt-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>Extracting text...</>
            ) : (
              <>Choose File</>
            )}
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={isExtracting}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Maximum file size: 10MB
        </p>
      </div>
    </div>
  );
};
