
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ViewDetailedAnalysisProps {
  summary?: string;
  text?: string;
  wordCount?: number;
  sourceDescription?: string;
}

export const ViewDetailedAnalysis = ({ 
  summary, 
  text, 
  wordCount,
  sourceDescription
}: ViewDetailedAnalysisProps) => {
  const { t } = useLanguage();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  
  // If there's no text or summary, show a placeholder
  const displaySummary = summary || t("noSummaryAvailable");
  const displayText = text || "";
  
  // Get a preview of the text for the collapsed state
  const textPreview = displayText 
    ? displayText.substring(0, 150) + (displayText.length > 150 ? "..." : "") 
    : "";
  
  // Generate a brief content overview based on the text
  const generateContentOverview = () => {
    if (!displayText) return t("noContentAvailable");
    
    const wordCount = displayText.split(/\s+/).length;
    const sentenceCount = displayText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphCount = displayText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    return t("contentOverview")
      .replace("{wordCount}", wordCount.toString())
      .replace("{sentenceCount}", sentenceCount.toString())
      .replace("{paragraphCount}", paragraphCount.toString());
  };
  
  return (
    <Card className="mb-6 border border-border shadow-md bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-orange icon-dance" />
          <CardTitle className="text-xl text-black">{t("viewDetailedAnalysisData")}</CardTitle>
        </div>
        {sourceDescription && (
          <p className="text-sm text-muted-foreground">{sourceDescription}</p>
        )}
        {wordCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            {t("analyzedWords")}: {wordCount}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Collapsible 
          open={isCollapsibleOpen} 
          onOpenChange={setIsCollapsibleOpen}
          className="space-y-2"
        >
          {displaySummary && (
            <div className="text-sm text-black leading-relaxed whitespace-pre-line mb-2">
              <span className="font-medium">{t("summary")}:</span> 
              {!isCollapsibleOpen ? displaySummary.substring(0, 200) + (displaySummary.length > 200 ? "..." : "") : displaySummary}
            </div>
          )}
          
          {displayText && !isCollapsibleOpen && (
            <div className="text-sm text-black leading-relaxed whitespace-pre-line">
              <span className="font-medium">{t("textSample")}:</span> {textPreview}
            </div>
          )}
          
          <CollapsibleTrigger asChild>
            <button 
              className="flex items-center text-orange hover:text-orange/80 text-sm font-medium"
            >
              {isCollapsibleOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1 icon-dance" />
                  {t("showLess")}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1 icon-dance" />
                  {t("viewFullText")}
                </>
              )}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2">
            {displayText && (
              <>
                <div className="text-sm text-black font-medium mb-1">{t("contentOverview")}:</div>
                <div className="text-sm text-black leading-relaxed whitespace-pre-line mb-4">
                  {generateContentOverview()}
                </div>
                
                <div className="text-sm text-black font-medium mb-1">{t("fullText")}:</div>
                <div className="text-sm text-black leading-relaxed whitespace-pre-line max-h-[400px] overflow-y-auto border border-border p-4 rounded-md bg-gray-50">
                  {displayText}
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
