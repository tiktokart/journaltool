
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ViewDetailedAnalysisProps {
  summary?: string;
  text?: string;
  wordCount?: number;
  sourceDescription?: string;
}

interface EmotionalTopic {
  topic: string;
  count: number;
}

interface MainSubject {
  subject: string;
  count: number;
}

export const ViewDetailedAnalysis = ({ 
  summary, 
  text, 
  wordCount,
  sourceDescription
}: ViewDetailedAnalysisProps) => {
  const { t } = useLanguage();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  
  const displaySummary = summary || t("noSummaryAvailable");
  const displayText = text || "";
  
  const textPreview = displayText 
    ? displayText.substring(0, 150) + (displayText.length > 150 ? "..." : "") 
    : "";
  
  // Generate content overview
  const generateContentOverview = () => {
    if (!displayText) return t("noContentAvailable");
    
    const wordCount = displayText.split(/\s+/).filter(w => w.trim().length > 0).length;
    const sentenceCount = displayText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphCount = displayText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    return `This document contains ${wordCount} words, ${sentenceCount} sentences, and approximately ${paragraphCount} paragraphs.`;
  };
  
  // Extract emotional topics
  const extractEmotionalTopics = (): EmotionalTopic[] => {
    // This is a simplified version - in real implementation, this would analyze the text
    return [
      { topic: "realized", count: 5 },
      { topic: "asked", count: 3 },
      { topic: "existed", count: 2 }
    ];
  };
  
  // Extract main subjects
  const extractMainSubjects = (): MainSubject[] => {
    // This is a simplified version - in real implementation, this would analyze the text
    return [
      { subject: "still", count: 6 },
      { subject: "people", count: 5 },
      { subject: "person", count: 4 },
      { subject: "today", count: 4 },
      { subject: "normal", count: 3 },
      { subject: "ive", count: 3 },
      { subject: "world", count: 2 },
      { subject: "notion", count: 2 }
    ];
  };
  
  const emotionalTopics = extractEmotionalTopics();
  const mainSubjects = extractMainSubjects();
  
  return (
    <Card className="mb-6 border shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-orange-500" />
          <CardTitle className="text-xl">{t("viewDetailedAnalysisData")}</CardTitle>
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
            <div className="text-sm leading-relaxed mb-2">
              <span className="font-medium">{t("summary")}:</span> 
              {!isCollapsibleOpen ? displaySummary.substring(0, 200) + (displaySummary.length > 200 ? "..." : "") : displaySummary}
            </div>
          )}
          
          {displayText && !isCollapsibleOpen && (
            <div className="text-sm leading-relaxed">
              <span className="font-medium">{t("textSample")}:</span> {textPreview}
            </div>
          )}
          
          <CollapsibleTrigger asChild>
            <button 
              className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              {isCollapsibleOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  {t("showLess")}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {t("viewDetails")}
                </>
              )}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            {displayText && (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Content Overview Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4 text-center">Content Overview</h3>
                    
                    <div className="bg-white p-3 rounded-md shadow-sm mb-4">
                      <div className="font-medium mb-2">Document Statistics</div>
                      <div className="text-sm">
                        {generateContentOverview()}
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="font-medium mb-2">Document Structure</div>
                      <div className="flex justify-between text-center">
                        <div>
                          <div className="text-3xl font-bold text-orange-500">
                            {displayText.split(/\s+/).filter(w => w.trim().length > 0).length}
                          </div>
                          <div className="text-xs">Words</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-purple-500">
                            {displayText.split(/[.!?]+/).filter(s => s.trim().length > 0).length}
                          </div>
                          <div className="text-xs">Sentences</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-blue-500">
                            {displayText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length}
                          </div>
                          <div className="text-xs">Paragraphs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Emotional Actions Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4 text-center">Emotional Actions</h3>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {emotionalTopics.map((item, index) => (
                        <div key={index} className="bg-white rounded-full h-24 w-24 flex items-center justify-center shadow-sm">
                          <span className="text-center">{item.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Main Subjects Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4 text-center">Main Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {mainSubjects.map((item, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-100 px-4 py-2 rounded-lg text-center"
                      >
                        {item.subject}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
