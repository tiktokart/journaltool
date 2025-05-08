
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentSummaryProps {
  summary: string;
}

export const DocumentSummary = ({ summary }: DocumentSummaryProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="mb-6 border border-border shadow-md bg-lavender">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-orange" />
          <CardTitle className="text-xl text-black">{t("documentSummary")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-black leading-relaxed whitespace-pre-line">
          {summary || t("noSummaryAvailable")}
        </div>
      </CardContent>
    </Card>
  );
};
