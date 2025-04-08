
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface DocumentSummaryProps {
  summary: string;
}

export const DocumentSummary = ({ summary }: DocumentSummaryProps) => {
  return (
    <Card className="mb-6 border border-border shadow-md bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          <CardTitle className="text-xl">Document Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {summary || "No summary available for this document."}
        </div>
      </CardContent>
    </Card>
  );
};
