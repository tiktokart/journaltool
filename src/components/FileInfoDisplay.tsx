
import { FileText } from "lucide-react";

interface FileInfoDisplayProps {
  fileName: string;
  fileSize: number;
  wordCount?: number;
}

export const FileInfoDisplay = ({ fileName, fileSize, wordCount }: FileInfoDisplayProps) => {
  return (
    <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border flex items-center">
      <FileText className="h-5 w-5 mr-2 text-primary" />
      <span className="text-sm">
        <span className="font-medium">Currently analyzing:</span> {fileName} ({(fileSize / 1024 / 1024).toFixed(2)} MB)
        {wordCount && wordCount > 0 && (
          <> • <span className="font-medium">{wordCount}</span> unique words extracted</>
        )}
      </span>
    </div>
  );
};
