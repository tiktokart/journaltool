
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  
  // Extract emotional topics from the text - focusing on nouns and actions
  const extractEmotionalTopics = () => {
    if (!displayText) return [];
    
    // Action verbs with emotional connections
    const emotionKeywords = {
      "joy": ["laugh", "celebrate", "smile", "dance", "embrace", "rejoice", "play", "sing", "hug", "enjoy"],
      "sadness": ["cry", "mourn", "sigh", "tears", "grieve", "withdraw", "slouch", "retreat", "weep", "sob"],
      "anger": ["shout", "slam", "stomp", "punch", "argue", "fight", "confront", "storm", "rage", "yell"],
      "fear": ["tremble", "freeze", "hide", "run", "escape", "avoid", "flinch", "panic", "flee", "shiver"],
      "surprise": ["gasp", "jump", "startle", "shock", "revelation", "discovery", "wonder", "astonishment", "amazement", "stun"],
      "trust": ["handshake", "alliance", "partnership", "agreement", "bonding", "connection", "loyalty", "faith", "rely", "depend"],
      "anticipation": ["planning", "preparation", "awaiting", "expectation", "prospect", "future", "hope", "countdown", "anticipate", "expect"]
    };
    
    // Count words in the text
    const words = displayText.toLowerCase().split(/\s+/);
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      if (cleanWord && cleanWord.length > 2) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    const foundEmotions: Record<string, number> = {};
    
    // Count occurrences of emotional action words (minimum 3 mentions)
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(word => {
        const count = wordCounts[word] || 0;
        if (count >= 3) { // Only include if mentioned 3 or more times
          foundEmotions[word] = count;
        }
      });
    });
    
    return Object.entries(foundEmotions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Limit to top 10
      .map(([topic, count]) => ({ topic, count }));
  };
  
  // Extract main subjects from text - focusing only on nouns mentioned 3+ times
  const extractMainSubjects = () => {
    if (!displayText) return [];
    
    // Common noun subjects to look for
    const subjectCategories = {
      "family": ["family", "parent", "child", "sibling", "mother", "father", "daughter", "son", "home", "brother", "sister"],
      "work": ["job", "career", "office", "profession", "business", "company", "project", "task", "boss", "colleague", "meeting", "work"],
      "education": ["school", "university", "learning", "knowledge", "degree", "class", "teacher", "student", "book", "course", "education", "study"],
      "health": ["health", "body", "illness", "wellness", "exercise", "doctor", "medicine", "hospital", "symptom", "disease", "therapy", "treatment"],
      "finance": ["money", "budget", "savings", "investment", "account", "expense", "income", "debt", "wealth", "bank", "cost", "finance"],
      "travel": ["journey", "destination", "vacation", "trip", "adventure", "exploration", "places", "transport", "hotel", "flight", "travel"],
      "technology": ["device", "computer", "software", "internet", "phone", "application", "system", "network", "data", "technology", "digital"],
      "art": ["creation", "music", "painting", "literature", "film", "culture", "expression", "beauty", "design", "art", "artist", "creativity"]
    };
    
    // Count words in the text
    const words = displayText.toLowerCase().split(/\s+/);
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      if (cleanWord && cleanWord.length > 2) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    const foundSubjects: Record<string, number> = {};
    
    // Identify nouns mentioned 3+ times
    Object.entries(subjectCategories).forEach(([category, nouns]) => {
      nouns.forEach(noun => {
        const count = wordCounts[noun] || 0;
        if (count >= 3) { // Only include if mentioned 3 or more times
          foundSubjects[noun] = count;
        }
      });
    });
    
    return Object.entries(foundSubjects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // Limit to top 8
      .map(([subject, count]) => ({ subject, count }));
  };
  
  const emotionalTopics = extractEmotionalTopics();
  const mainSubjects = extractMainSubjects();
  
  // Generate badge color based on emotion
  const getEmotionColor = (topic: string) => {
    const emotionColors: Record<string, string> = {
      "joy": "bg-green-100 text-green-800",
      "sadness": "bg-blue-100 text-blue-800",
      "anger": "bg-red-100 text-red-800",
      "fear": "bg-purple-100 text-purple-800",
      "surprise": "bg-yellow-100 text-yellow-800",
      "trust": "bg-teal-100 text-teal-800",
      "anticipation": "bg-cyan-100 text-cyan-800",
    };
    
    for (const [emotion, keywords] of Object.entries({
      "joy": ["laugh", "celebrate", "smile", "dance", "embrace", "rejoice", "play", "sing", "hug", "enjoy"],
      "sadness": ["cry", "mourn", "sigh", "tears", "grieve", "withdraw", "slouch", "retreat", "weep", "sob"],
      "anger": ["shout", "slam", "stomp", "punch", "argue", "fight", "confront", "storm", "rage", "yell"],
      "fear": ["tremble", "freeze", "hide", "run", "escape", "avoid", "flinch", "panic", "flee", "shiver"],
      "surprise": ["gasp", "jump", "startle", "shock", "revelation", "discovery", "wonder", "astonishment"],
      "trust": ["handshake", "alliance", "partnership", "agreement", "bonding", "connection", "loyalty", "faith"],
      "anticipation": ["planning", "preparation", "awaiting", "expectation", "prospect", "future", "hope", "countdown"],
    })) {
      if (keywords.includes(topic)) {
        return emotionColors[emotion];
      }
    }
    
    return "bg-gray-100 text-gray-800";
  };
  
  // Generate badge color based on subject
  const getSubjectColor = (subject: string) => {
    const subjectColors: Record<string, string> = {
      "family": "bg-pink-100 text-pink-800",
      "work": "bg-blue-100 text-blue-800",
      "education": "bg-purple-100 text-purple-800",
      "health": "bg-green-100 text-green-800",
      "finance": "bg-yellow-100 text-yellow-800",
      "travel": "bg-teal-100 text-teal-800",
      "technology": "bg-slate-100 text-slate-800",
      "art": "bg-rose-100 text-rose-800"
    };
    
    for (const [category, nouns] of Object.entries({
      "family": ["family", "parent", "child", "sibling", "mother", "father", "daughter", "son", "home", "brother", "sister"],
      "work": ["job", "career", "office", "profession", "business", "company", "project", "task", "boss", "colleague"],
      "education": ["school", "university", "learning", "knowledge", "degree", "class", "teacher", "student", "book"],
      "health": ["health", "body", "illness", "wellness", "exercise", "doctor", "medicine", "hospital", "symptom"],
      "finance": ["money", "budget", "savings", "investment", "account", "expense", "income", "debt", "wealth"],
      "travel": ["journey", "destination", "vacation", "trip", "adventure", "exploration", "places", "transport"],
      "technology": ["device", "computer", "software", "internet", "phone", "application", "system", "network"],
      "art": ["creation", "music", "painting", "literature", "film", "culture", "expression", "beauty", "design"]
    })) {
      if (nouns.includes(subject)) {
        return subjectColors[category];
      }
    }
    
    return "bg-gray-100 text-gray-800";
  };
  
  // Generate icon sizes based on count for visual representation
  const getIconSize = (count: number, max: number) => {
    const minSize = 40;
    const maxSize = 100;
    const ratio = count / Math.max(max, 1); // Prevent division by zero
    
    return Math.floor(minSize + (maxSize - minSize) * ratio);
  };
  
  // Get max counts for scaling
  const maxEmotionCount = emotionalTopics.length > 0 
    ? Math.max(...emotionalTopics.map(t => t.count)) 
    : 1;
  
  const maxSubjectCount = mainSubjects.length > 0 
    ? Math.max(...mainSubjects.map(t => t.count)) 
    : 1;
  
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
          
          <CollapsibleContent className="mt-6">
            {displayText && (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Content Overview - Left Side */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="font-medium mb-4 text-black text-center">Content Overview</h3>
                    <div className="text-sm text-black leading-relaxed">
                      <div className="flex flex-col space-y-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="font-medium mb-1 text-black">Document Statistics</div>
                          <div className="text-sm">{generateContentOverview()}</div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="font-medium mb-1 text-black">Document Structure</div>
                          <div className="flex justify-between">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-orange">
                                {displayText.split(/\s+/).filter(w => w.trim().length > 0).length}
                              </div>
                              <div className="text-xs">Words</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-purple-500">
                                {displayText.split(/[.!?]+/).filter(s => s.trim().length > 0).length}
                              </div>
                              <div className="text-xs">Sentences</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-500">
                                {displayText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length}
                              </div>
                              <div className="text-xs">Paragraphs</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Emotional Topics - Right Side */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="font-medium mb-4 text-black text-center">Emotional Actions & Topics</h3>
                    {emotionalTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-4 justify-center">
                        {emotionalTopics.map((item, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className={`rounded-full flex items-center justify-center ${getEmotionColor(item.topic).split(' ')[0]} border-2 border-white shadow-md`}
                              style={{
                                width: `${getIconSize(item.count, maxEmotionCount)}px`,
                                height: `${getIconSize(item.count, maxEmotionCount)}px`,
                              }}
                            >
                              <span className="font-bold text-center">
                                {item.topic}
                              </span>
                            </div>
                            <span className="mt-1 text-xs opacity-75">({item.count} times)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        No emotional actions mentioned 3+ times
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Main Subjects - Below */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                  <h3 className="font-medium mb-4 text-black text-center">Main Subjects (3+ mentions)</h3>
                  {mainSubjects.length > 0 ? (
                    <div className="flex justify-center gap-6 flex-wrap">
                      {mainSubjects.map((item, index) => (
                        <div key={index} className="text-center">
                          <div 
                            className={`mx-auto ${getSubjectColor(item.subject).split(' ')[0]} rounded-xl p-4 shadow-sm border border-white`}
                            style={{
                              width: `${getIconSize(item.count, maxSubjectCount) * 1.2}px`,
                              height: `${getIconSize(item.count, maxSubjectCount) * 0.8}px`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column'
                            }}
                          >
                            <div className="font-semibold mb-1">{item.subject}</div>
                            <div className="text-xs opacity-75">{item.count} mentions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      No nouns mentioned 3+ times
                    </p>
                  )}
                </div>
                
                {/* Full Text Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium mb-2 text-black">{t("fullText")}</h3>
                  <div className="text-sm text-black leading-relaxed whitespace-pre-line max-h-[400px] overflow-y-auto border border-border p-4 rounded-md bg-white">
                    {displayText}
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
