
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/FileUploader";
import { Loader2 } from "lucide-react";

interface DocumentAnalysisPanelProps {
  file: File | null;
  pdfText: string;
  isAnalyzing: boolean;
  onFileUpload: (files: File[], extractedText?: string) => void;
  onAnalyzeClick: () => void;
}

const DocumentAnalysisPanel = ({
  file,
  pdfText,
  isAnalyzing,
  onFileUpload,
  onAnalyzeClick
}: DocumentAnalysisPanelProps) => {
  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-black">Document Analysis with BERT Model</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <FileUploader onFilesAdded={onFileUpload} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-yellow/30 rounded-lg">
              <h3 className="font-medium mb-2 text-black">Selected File</h3>
              <p className="text-sm text-black">
                {file ? file.name : "No file selected"}
              </p>
              {file && (
                <p className="text-xs text-black mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
              {pdfText && pdfText.length > 0 && (
                <p className="text-xs text-black mt-1">
                  {pdfText.split(/\s+/).length} words extracted
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={onAnalyzeClick} 
                disabled={(!file && !pdfText) || isAnalyzing}
                className="w-full bg-orange hover:bg-orange/90 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with BERT...
                  </>
                ) : "Analyze with BERT"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentAnalysisPanel;
