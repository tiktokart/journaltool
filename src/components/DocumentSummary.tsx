
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DocumentSummaryProps {
  summary: string;
}

export const DocumentSummary = ({ summary }: DocumentSummaryProps) => {
  const { t } = useLanguage();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  
  return (
    <Card className="mb-6 border border-border shadow-md bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-orange icon-dance" />
          <CardTitle className="text-xl text-black">{t("documentSummary")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible 
          open={isCollapsibleOpen} 
          onOpenChange={setIsCollapsibleOpen}
          className="space-y-2"
        >
          <div className="text-sm text-black leading-relaxed whitespace-pre-line line-clamp-3">
            {!isCollapsibleOpen && summary ? summary.substring(0, 200) + (summary.length > 200 ? "..." : "") : null}
          </div>
          
          <CollapsibleTrigger asChild>
            <button 
              className="flex items-center text-orange hover:text-orange/80 text-sm font-medium"
            >
              {isCollapsibleOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  {t("showLess")}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {t("readMore")}
                </>
              )}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2">
            <div className="text-sm text-black leading-relaxed whitespace-pre-line">
              {summary || t("noSummaryAvailable")}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
