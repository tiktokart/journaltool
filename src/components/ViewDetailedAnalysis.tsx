
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

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
    
    const wordCount = displayText.split(/\s+/).filter(w => w.trim().length > 0).length;
    const sentenceCount = displayText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphCount = displayText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    return `This document contains ${wordCount} words, ${sentenceCount} sentences, and approximately ${paragraphCount} paragraphs.`;
  };
  
  // Extract emotional topics from the text
  const extractEmotionalTopics = () => {
    if (!displayText) return [];
    
    // Emotion keywords to look for
    const emotions = {
      "joy": ["happy", "joy", "delighted", "pleased", "excited", "cheerful", "thrilled", "glad"],
      "sadness": ["sad", "unhappy", "depressed", "sorrowful", "gloomy", "miserable", "downhearted", "melancholy"],
      "anger": ["angry", "frustrated", "annoyed", "irritated", "furious", "outraged", "bitter", "resentful"],
      "fear": ["afraid", "fearful", "scared", "terrified", "anxious", "nervous", "worried", "panicked"],
      "surprise": ["surprised", "amazed", "astonished", "shocked", "startled", "stunned", "bewildered"],
      "disgust": ["disgusted", "repulsed", "revolted", "appalled", "horrified", "contemptuous"],
      "trust": ["trust", "confident", "secure", "reliable", "dependable", "faithful", "assured"],
      "anticipation": ["anticipation", "expecting", "looking forward", "hopeful", "excited", "eager"]
    };
    
    const lowerText = displayText.toLowerCase();
    const foundEmotions: Record<string, number> = {};
    
    // Count occurrences of emotional words
    Object.entries(emotions).forEach(([emotion, keywords]) => {
      const count = keywords.reduce((acc, word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);
      
      if (count > 0) {
        foundEmotions[emotion] = count;
      }
    });
    
    // Add some context-based topics if we found very few emotions
    if (Object.keys(foundEmotions).length < 3) {
      // Check for common subjects/themes
      const subjects = {
        "personal": ["I", "me", "my", "mine", "myself"],
        "relationship": ["friend", "family", "parent", "child", "partner", "relationship", "marriage"],
        "work": ["job", "work", "career", "office", "profession", "business", "company"],
        "education": ["school", "university", "college", "learn", "study", "education", "course"],
        "health": ["health", "doctor", "hospital", "sick", "illness", "wellness", "disease"],
        "reflection": ["think", "thought", "reflect", "consider", "contemplate", "ponder", "wonder"]
      };
      
      Object.entries(subjects).forEach(([subject, keywords]) => {
        const count = keywords.reduce((acc, word) => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = lowerText.match(regex);
          return acc + (matches ? matches.length : 0);
        }, 0);
        
        if (count > 0 && !foundEmotions[subject]) {
          foundEmotions[subject] = count;
        }
      });
    }
    
    return Object.entries(foundEmotions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([topic, count]) => ({ topic, count }));
  };
  
  // Extract main subjects from text
  const extractMainSubjects = () => {
    if (!displayText) return [];
    
    // Common subjects to look for
    const subjectCategories = {
      "personal": ["family", "friend", "relationship", "home", "personal", "life"],
      "work": ["job", "work", "career", "business", "company", "project", "task"],
      "education": ["school", "study", "learn", "education", "college", "university", "course"],
      "health": ["health", "wellness", "fitness", "diet", "exercise", "medical", "mental"],
      "finance": ["money", "finance", "budget", "cost", "expense", "investment", "saving"],
      "travel": ["travel", "trip", "vacation", "journey", "visit", "explore", "destination"],
      "technology": ["technology", "computer", "internet", "digital", "software", "app", "device"],
      "art": ["art", "music", "film", "book", "literature", "creative", "culture"]
    };
    
    const lowerText = displayText.toLowerCase();
    const foundSubjects: Record<string, number> = {};
    
    // Count occurrences of subject words
    Object.entries(subjectCategories).forEach(([subject, keywords]) => {
      const count = keywords.reduce((acc, word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);
      
      if (count > 0) {
        foundSubjects[subject] = count;
      }
    });
    
    return Object.entries(foundSubjects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([subject, count]) => ({ subject, count }));
  };
  
  const emotionalTopics = extractEmotionalTopics();
  const mainSubjects = extractMainSubjects();
  
  // Generate badge color based on topic
  const getEmotionColor = (topic: string) => {
    const emotionColors: Record<string, string> = {
      "joy": "bg-green-100 text-green-800",
      "sadness": "bg-blue-100 text-blue-800",
      "anger": "bg-red-100 text-red-800",
      "fear": "bg-purple-100 text-purple-800",
      "surprise": "bg-yellow-100 text-yellow-800",
      "disgust": "bg-orange-100 text-orange-800",
      "trust": "bg-teal-100 text-teal-800",
      "anticipation": "bg-cyan-100 text-cyan-800",
      "personal": "bg-pink-100 text-pink-800",
      "relationship": "bg-rose-100 text-rose-800",
      "work": "bg-slate-100 text-slate-800",
      "education": "bg-indigo-100 text-indigo-800",
      "health": "bg-emerald-100 text-emerald-800",
      "reflection": "bg-violet-100 text-violet-800"
    };
    
    return emotionColors[topic] || "bg-gray-100 text-gray-800";
  };
  
  // Generate badge color based on subject
  const getSubjectColor = (subject: string) => {
    const subjectColors: Record<string, string> = {
      "personal": "bg-pink-100 text-pink-800",
      "work": "bg-blue-100 text-blue-800",
      "education": "bg-purple-100 text-purple-800",
      "health": "bg-green-100 text-green-800",
      "finance": "bg-yellow-100 text-yellow-800",
      "travel": "bg-teal-100 text-teal-800",
      "technology": "bg-slate-100 text-slate-800",
      "art": "bg-rose-100 text-rose-800"
    };
    
    return subjectColors[subject] || "bg-gray-100 text-gray-800";
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
          
          <CollapsibleContent className="space-y-6">
            {displayText && (
              <>
                <Accordion type="single" collapsible className="w-full mt-4">
                  <AccordionItem value="content-overview">
                    <AccordionTrigger className="text-sm font-medium">
                      {t("contentOverview")}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-black leading-relaxed whitespace-pre-line">
                        {generateContentOverview()}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="emotional-topics">
                    <AccordionTrigger className="text-sm font-medium">
                      Emotional Topics
                    </AccordionTrigger>
                    <AccordionContent>
                      {emotionalTopics.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {emotionalTopics.map((item, index) => (
                            <Badge 
                              key={index} 
                              className={`${getEmotionColor(item.topic)} hover:${getEmotionColor(item.topic)} py-1`}
                            >
                              {item.topic}
                              <span className="ml-1 opacity-75">({item.count})</span>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No emotional topics detected</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="main-subjects">
                    <AccordionTrigger className="text-sm font-medium">
                      Main Subjects
                    </AccordionTrigger>
                    <AccordionContent>
                      {mainSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mainSubjects.map((item, index) => (
                            <Badge 
                              key={index} 
                              className={`${getSubjectColor(item.subject)} hover:${getSubjectColor(item.subject)} py-1`}
                            >
                              {item.subject}
                              <span className="ml-1 opacity-75">({item.count})</span>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No main subjects detected</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="full-text">
                    <AccordionTrigger className="text-sm font-medium">
                      {t("fullText")}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-black leading-relaxed whitespace-pre-line max-h-[400px] overflow-y-auto border border-border p-4 rounded-md bg-gray-50">
                        {displayText}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
