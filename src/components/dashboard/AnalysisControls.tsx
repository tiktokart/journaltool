
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DocumentAnalysisPanel from "@/components/dashboard/DocumentAnalysisPanel";

interface AnalysisControlsProps {
  file: File | null;
  pdfText: string;
  isAnalyzing: boolean;
  onFileUpload: (files: File[], extractedText?: string) => void;
  onAnalyzeClick: () => void;
}

const AnalysisControls = ({
  file,
  pdfText,
  isAnalyzing,
  onFileUpload,
  onAnalyzeClick
}: AnalysisControlsProps) => {
  return (
    <DocumentAnalysisPanel 
      file={file}
      pdfText={pdfText}
      isAnalyzing={isAnalyzing}
      onFileUpload={onFileUpload}
      onAnalyzeClick={onAnalyzeClick}
    />
  );
};

export default AnalysisControls;
