import { ChangeEvent, useState, useEffect } from "react";
import { FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import { useLanguage } from "@/contexts/LanguageContext";

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FileUploaderProps {
  onFilesAdded: (files: File[], pdfText?: string) => void;
}

export const FileUploader = ({ onFilesAdded }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [analysisMethod, setAnalysisMethod] = useState<"bert" | "gemma3">("bert");
  const { t } = useLanguage();

  // Load the saved analysis method on component mount
  useEffect(() => {
    const savedMethod = localStorage.getItem("analysisMethod");
    if (savedMethod === "bert" || savedMethod === "gemma3") {
      setAnalysisMethod(savedMethod as "bert" | "gemma3");
    }
  }, []);

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
        const textContent = await page.getTextContent();
        
        // More thorough text extraction - get every text item with position information
        const pageItems = textContent.items.map((item: any) => {
          if (!item.str || typeof item.str !== 'string') return '';
          return item.str;
        }).filter(Boolean);
        
        // Join all text items with space
        const pageText = pageItems.join(' ');
        fullText += pageText + " ";
      }
      
      // Clean up the text - careful not to lose content
      fullText = fullText
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/(\r\n|\n|\r)/gm, " ")  // Replace line breaks with spaces
        .trim();
      
      // Enhanced logging for debugging
      console.log("Extracted PDF text length:", fullText.length);
      console.log("First 100 characters:", fullText.substring(0, 100));
      console.log("Total words extracted:", fullText.split(/\s+/).length);
      
      return fullText;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      toast.error(t("extractionError") || "Failed to extract text from PDF");
      return "";
    } finally {
      setIsExtracting(false);
    }
  };

  const processPdfFile = async (file: File) => {
    try {
      toast.info(t("extractingText") || "Extracting text from PDF...");
      const pdfText = await extractTextFromPdf(file);
      
      if (!pdfText || pdfText.trim().length === 0) {
        toast.warning(t("noTextFound") || "No readable text found in the PDF");
        onFilesAdded([file], "");
      } else {
        const wordCount = pdfText.split(/\s+/).filter(w => w.length > 0).length;
        toast.success(`${t("extracted") || "Extracted"} ${wordCount} ${t("words") || "words"} ${t("fromPDF") || "from PDF"}`);
        
        // More detailed logging for better debugging
        console.log("PDF text sample:", pdfText.substring(0, 200));
        console.log("PDF text length:", pdfText.length);
        console.log("Words in PDF:", wordCount);
        console.log("Using analysis method:", analysisMethod);
        
        // Store the analysis method in localStorage for other components to use
        localStorage.setItem("analysisMethod", analysisMethod);
        
        // Pass the extracted text to the parent component for analysis
        onFilesAdded([file], pdfText);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error(t("processingError") || "Error processing PDF file");
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
        toast.error(t("onlyPDFSupported") || "Only PDF files are supported");
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
        toast.error(t("onlyPDFSupported") || "Only PDF files are supported");
        return;
      }
      
      processPdfFile(pdfFiles[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
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
            <h3 className="font-medium text-lg">{t("uploadTitle") || "Upload your PDF document"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("uploadDescription") || "Drag and drop your file here, or click to browse"}
            </p>
          </div>
          
          <div className="mt-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isExtracting}
              className="font-medium"
            >
              {isExtracting ? (
                <>{t("analyzingDocument") || "Extracting text..."}</>
              ) : (
                <>{t("chooseFile") || "Choose File"}</>
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
            {t("maxFileSize") || "Maximum file size: 10MB"}
          </p>
        </div>
      </div>
    </div>
  );
};
