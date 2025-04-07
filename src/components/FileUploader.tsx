
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
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export const FileUploader = ({ onFilesAdded, fileInputRef }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const internalFileInputRef = useRef<HTMLInputElement>(null);

  // Use the provided ref or fall back to the internal one
  const actualFileInputRef = fileInputRef || internalFileInputRef;

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast.error('Failed to extract text from PDF');
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
      const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');
    
      if (pdfFiles.length === 0) {
        toast.error('Please upload a PDF file');
        setIsProcessing(false);
        return;
      }
    
      const firstPdf = pdfFiles[0];
      const extractedText = await extractTextFromPdf(firstPdf);
    
      onFilesAdded(pdfFiles, extractedText);
      toast.success('PDF processed successfully');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error handling files:', error);
      toast.error('Error processing files');
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
    if (actualFileInputRef.current) {
      actualFileInputRef.current.click();
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
              <p className="text-lg font-medium mb-2">Drag and drop your PDF file</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Your document will be processed to extract emotional patterns and sentiment analysis.
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Supported format: PDF</span>
              </div>
              <Button className="mt-6" onClick={(e) => {
                e.stopPropagation();
                if (actualFileInputRef.current) {
                  actualFileInputRef.current.click();
                }
              }}>
                Select File
              </Button>
            </>
          )}
        </div>
        <input 
          type="file"
          ref={actualFileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileInputChange}
        />
      </CardContent>
    </Card>
  );
};
