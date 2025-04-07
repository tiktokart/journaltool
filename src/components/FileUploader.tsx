
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Set the worker path for PDF.js
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FileUploaderProps {
  onFilesAdded: (files: File[], extractedText?: string) => void;
}

export const FileUploader = ({ onFilesAdded }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample texts that will be used as fallbacks if extraction fails
  const sampleTexts = [
    `Journal entry about anxiety: I woke up feeling anxious today. My heart was racing, and I felt a tightness in my chest. 
    I tried some deep breathing exercises that my therapist recommended. They helped a little bit, but the feeling of 
    dread stayed with me for most of the morning. I had trouble focusing at work, and small tasks seemed overwhelming.
    After lunch, I went for a walk outside which helped clear my head. The fresh air and change of scenery gave me some 
    perspective. I'm going to try to practice more mindfulness and maybe do some light exercise before bed.`,
    
    `Today was challenging. I experienced a panic attack in the grocery store. It started with shortness of breath, 
    then my heart began racing. I felt dizzy and had to leave my cart and exit the store. I sat in my car for 
    20 minutes doing breathing exercises until I felt calm enough to drive home. I called my therapist afterward 
    and we scheduled an extra session for tomorrow. I'm trying to identify what might have triggered this episode.`
  ];

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      console.log("Starting PDF extraction process");
      const arrayBuffer = await file.arrayBuffer();
      console.log("PDF loaded as ArrayBuffer, size:", arrayBuffer.byteLength);
      
      if (arrayBuffer.byteLength === 0) {
        console.error("Empty PDF file");
        return '';
      }
      
      // Load the PDF document using PDF.js
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      console.log("PDF document loaded, pages:", pdf.numPages);
      
      // If the PDF has no pages, return empty string
      if (pdf.numPages === 0) {
        console.warn("PDF has no pages");
        return '';
      }
      
      let fullText = '';

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i} of ${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        if (!textContent || !textContent.items || textContent.items.length === 0) {
          console.warn(`No text content in page ${i}`);
          continue;
        }
        
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
          
        fullText += pageText + '\n\n';
      }

      console.log(`Text extraction complete. Extracted ${fullText.length} characters`);
      
      // If we got no text at all, return empty string
      if (fullText.trim().length === 0) {
        console.warn("No text extracted from PDF");
        return '';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) {
      toast.error('No files selected');
      return;
    }

    try {
      setIsProcessing(true);
      const fileArray = Array.from(files);
      
      // Filter for PDF files
      const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        toast.error('Please upload a PDF file');
        setIsProcessing(false);
        return;
      }
      
      const firstPdf = pdfFiles[0];
      console.log("Processing PDF file:", firstPdf.name, "Size:", firstPdf.size);
      
      // Try to extract text
      let extractedText = await extractTextFromPdf(firstPdf);
      
      // If extraction failed or returned empty text, use sample text
      if (!extractedText || extractedText.trim().length === 0) {
        console.warn("No text was extracted from the PDF, using sample text");
        toast.warning("Could not extract text from PDF. Using sample text instead.");
        
        // Select a random sample text
        const randomIndex = Math.floor(Math.random() * sampleTexts.length);
        extractedText = sampleTexts[randomIndex];
      } else {
        console.log("Successfully extracted text, length:", extractedText.length);
        toast.success("PDF text extracted successfully");
      }
    
      // Call the callback with files and text
      onFilesAdded(pdfFiles, extractedText);
    } catch (error) {
      console.error('Error handling files:', error);
      toast.error('Error processing files. Using sample text instead.');
      
      // Create fallback data to ensure the app continues to function
      const mockPdf = new File([new Blob()], "sample.pdf", { type: "application/pdf" });
      
      // Use the first sample text as fallback
      onFilesAdded([mockPdf], sampleTexts[0]);
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesAdded]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <Card className={`border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}>
      <CardContent className="p-0">
        <div 
          className="flex flex-col items-center justify-center py-10 px-4 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {isProcessing ? (
            <div className="animate-pulse">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Processing PDF...</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Please wait while we extract text from your document...
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Upload PDF</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Upload your journal entry or any PDF document to analyze emotional patterns
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Supported format: PDF</span>
              </div>
              <Button className="mt-6" onClick={(e) => e.stopPropagation()}>
                Select File
              </Button>
            </>
          )}
        </div>
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileInputChange}
        />
      </CardContent>
    </Card>
  );
};
