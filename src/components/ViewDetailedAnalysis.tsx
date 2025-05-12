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

// Define consistent types for our data structures
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
  
  // More comprehensive extraction of emotional actions/verbs from the text
  const extractEmotionalTopics = (): EmotionalTopic[] => {
    if (!displayText) return [];
    
    const sentences = displayText.toLowerCase().split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = displayText.toLowerCase().split(/\s+/).map(w => w.replace(/[^\w]/g, ''));
    
    // Action verbs with emotional connections
    const emotionKeywords: Record<string, string[]> = {
      "joy": ["laugh", "celebrate", "smile", "dance", "embrace", "rejoice", "play", "sing", "hug", "enjoy", "happy", "excited", "delighted"],
      "sadness": ["cry", "mourn", "sigh", "tears", "grieve", "withdraw", "slouch", "retreat", "weep", "sob", "sad", "depressed", "melancholy"],
      "anger": ["shout", "slam", "stomp", "punch", "argue", "fight", "confront", "storm", "rage", "yell", "angry", "furious", "outraged"],
      "fear": ["tremble", "freeze", "hide", "run", "escape", "avoid", "flinch", "panic", "flee", "shiver", "afraid", "scared", "terrified"],
      "surprise": ["gasp", "jump", "startle", "shock", "revelation", "discovery", "wonder", "astonishment", "amazement", "stun", "surprised", "astonished"],
      "trust": ["handshake", "alliance", "partnership", "agreement", "bonding", "connection", "loyalty", "faith", "rely", "depend", "trusted", "reliable"],
      "anticipation": ["planning", "preparation", "awaiting", "expectation", "prospect", "future", "hope", "countdown", "anticipate", "expect", "eager", "ready"]
    };
    
    // Common words to exclude (helping verbs, to be verbs, prepositions, conjunctions, articles, etc.)
    const wordsToExclude = [
      // Articles
      "the", "a", "an",
      
      // Common prepositions
      "in", "on", "at", "by", "for", "with", "about", "against", "between", "into", 
      "through", "during", "before", "after", "above", "below", "from", "up", "down",
      "over", "under", "again", "further", "then", "once", "here", "there", "when", 
      "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other",
      
      // Common conjunctions
      "and", "but", "or", "nor", "yet", "so", "because", "although", "since", "unless",
      "while", "where", "if", "than",
      
      // Helping verbs and to be verbs
      "is", "are", "am", "was", "were", "be", "being", "been", 
      "have", "has", "had", "do", "does", "did",
      "can", "could", "shall", "should", "will", "would", "may", "might", "must",
      "get", "got", "getting", "goes", "going", "come", "comes", "coming",
      
      // Common verbs that are unlikely to be subjects
      "say", "said", "says", "saying", "tell", "told", "tells", "telling",
      "go", "went", "gone", "make", "made", "makes", "making",
      "take", "took", "taken", "taking", "see", "saw", "seen", "seeing",
      "know", "knew", "known", "knowing", "think", "thought", "thinking",
      "use", "used", "using", "find", "found", "finding", "give", "gave", "given", "giving",
      
      // Other common words with little semantic value
      "very", "too", "also", "just", "only", "even", "such", "well", "that", "this",
      "these", "those", "whom", "whose", "which", "what", "who", "its", "out", "off", 
      "their", "them", "they", "thing", "things", "some", "something", "one", "two", 
      "three", "four", "five", "not"
    ];
    
    // Count actual instances of action verbs
    const actionVerbCounts: Record<string, number> = {};
    
    // First, parse through whole text to identify action verbs and count instances
    words.forEach(word => {
      if (word.length < 3) return; // Skip short words
      if (wordsToExclude.includes(word)) return; // Skip excluded words
      
      // Check if this word is in our emotion keywords lists
      for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.includes(word)) {
          actionVerbCounts[word] = (actionVerbCounts[word] || 0) + 1;
          break;
        }
      }
    });
    
    // Count all words in the text (even those not in our predefined lists)
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      if (word.length >= 3 && !wordsToExclude.includes(word)) { // Skip short words and excluded words
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // Analyze context for each sentence
    const sentenceContext: Record<string, number> = {};
    sentences.forEach(sentence => {
      for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        keywords.forEach(keyword => {
          if (sentence.includes(keyword)) {
            // When we find a keyword in context, boost its count
            if (actionVerbCounts[keyword]) {
              sentenceContext[keyword] = (sentenceContext[keyword] || 0) + 1;
            }
          }
        });
      }
    });
    
    // Combine direct counts with contextual understanding
    const combinedCounts: Record<string, number> = { ...actionVerbCounts };
    for (const [word, contextCount] of Object.entries(sentenceContext)) {
      combinedCounts[word] = (combinedCounts[word] || 0) + Math.floor(contextCount * 0.5); // Weight context slightly less than direct mentions
    }
    
    // Add frequent verbs from the text that aren't in our predefined lists
    for (const [word, count] of Object.entries(wordFrequency)) {
      if (count >= 2 && !combinedCounts[word] && !wordsToExclude.includes(word)) {
        // Check if the word looks like a verb (common verb endings)
        if (word.endsWith("ing") || word.endsWith("ed") || word.endsWith("ize") || 
            word.endsWith("ise") || word.endsWith("ate") || word.endsWith("ify") || 
            word.endsWith("en")) {
          combinedCounts[word] = count;
        }
      }
    }
    
    // Get all action verbs that occur at least twice
    return Object.entries(combinedCounts)
      .filter(([word, count]) => count >= 2 && !wordsToExclude.includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Limit to top 10
      .map(([topic, count]) => ({ topic, count: count as number }));
  };
  
  // Improved extraction of main subjects/nouns from text
  const extractMainSubjects = (): MainSubject[] => {
    if (!displayText) return [];
    
    // Parse sentences for better contextual analysis
    const sentences = displayText.toLowerCase().split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Common words to exclude (helping verbs, to be verbs, prepositions, conjunctions, articles, etc.)
    const wordsToExclude = [
      // Articles
      "the", "a", "an",
      
      // Common prepositions
      "in", "on", "at", "by", "for", "with", "about", "against", "between", "into", 
      "through", "during", "before", "after", "above", "below", "from", "up", "down",
      "over", "under", "again", "further", "then", "once", "here", "there", "when", 
      "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other",
      
      // Common conjunctions
      "and", "but", "or", "nor", "yet", "so", "because", "although", "since", "unless",
      "while", "where", "if", "than",
      
      // Helping verbs and to be verbs
      "is", "are", "am", "was", "were", "be", "being", "been", 
      "have", "has", "had", "do", "does", "did",
      "can", "could", "shall", "should", "will", "would", "may", "might", "must",
      "get", "got", "getting", "goes", "going", "come", "comes", "coming",
      
      // Common verbs that are unlikely to be subjects
      "say", "said", "says", "saying", "tell", "told", "tells", "telling",
      "go", "went", "gone", "make", "made", "makes", "making",
      "take", "took", "taken", "taking", "see", "saw", "seen", "seeing",
      "know", "knew", "known", "knowing", "think", "thought", "thinking",
      "use", "used", "using", "find", "found", "finding", "give", "gave", "given", "giving",
      
      // Other common words with little semantic value
      "very", "too", "also", "just", "only", "even", "such", "well", "that", "this",
      "these", "those", "whom", "whose", "which", "what", "who", "its", "out", "off", 
      "their", "them", "they", "thing", "things", "some", "something", "one", "two", 
      "three", "four", "five", "not"
    ];
    
    // Common noun subjects to look for
    const subjectCategories: Record<string, string[]> = {
      "family": ["family", "parent", "child", "sibling", "mother", "father", "daughter", "son", "home", "brother", "sister"],
      "work": ["job", "career", "office", "profession", "business", "company", "project", "task", "boss", "colleague", "meeting", "work"],
      "education": ["school", "college", "university", "education", "knowledge", "degree", "class", "teacher", "student", "book", "course"],
      "health": ["health", "body", "illness", "wellness", "exercise", "doctor", "medicine", "hospital", "symptom", "disease", "therapy", "treatment"],
      "finance": ["money", "budget", "savings", "investment", "account", "expense", "income", "debt", "wealth", "bank", "cost", "finance"],
      "travel": ["journey", "destination", "vacation", "trip", "adventure", "exploration", "places", "transport", "hotel", "flight", "travel"],
      "technology": ["device", "computer", "software", "internet", "phone", "application", "system", "network", "data", "technology", "digital"],
      "art": ["creation", "music", "painting", "literature", "film", "culture", "expression", "beauty", "design", "art", "artist", "creativity"],
      "animals": ["cat", "dog", "bird", "animal", "pet", "wildlife", "creature", "species", "fish", "mammal", "reptile"]
    };
    
    // Track noun frequency and context
    const nounCounts: Record<string, number> = {};
    const nounContext: Record<string, number> = {};
    
    // Process every word in the text
    const words = displayText.toLowerCase().split(/\s+/).map(w => w.replace(/[^\w]/g, ''));
    
    // Count all words in the text (even those not in our predefined lists)
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      if (word.length >= 3 && !wordsToExclude.includes(word)) { // Skip short words and excluded words
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // First check for words in our categorized lists
    words.forEach(word => {
      if (word.length < 3) return; // Skip short words
      if (wordsToExclude.includes(word)) return; // Skip excluded words
      
      // Check if this word is a known subject/noun
      for (const [category, nouns] of Object.entries(subjectCategories)) {
        if (nouns.includes(word)) {
          nounCounts[word] = (nounCounts[word] || 0) + 1;
          break;
        }
      }
    });
    
    // Track pronouns to identify important subjects
    const pronouns = ["he", "she", "they", "it", "him", "her", "them", "his", "hers", "its", "their"];
    
    // Find what nouns the pronouns are referring to (basic coreference resolution)
    for (let i = 0; i < sentences.length; i++) {
      const currentSentence = sentences[i];
      const previousSentence = i > 0 ? sentences[i-1] : "";
      
      // Check for pronouns in this sentence
      for (const pronoun of pronouns) {
        if (currentSentence.includes(` ${pronoun} `)) {
          // Find potential noun referents from current and previous sentences
          const potentialReferents = Object.keys(nounCounts).filter(noun => 
            previousSentence.includes(noun) || 
            currentSentence.substring(0, currentSentence.indexOf(pronoun)).includes(noun)
          );
          
          // If we found likely referents, strengthen their contextual importance
          if (potentialReferents.length > 0) {
            potentialReferents.forEach(noun => {
              nounContext[noun] = (nounContext[noun] || 0) + 1;
            });
          }
        }
      }
      
      // Check for subject-verb pairs to enhance contextual understanding
      for (const noun of Object.keys(nounCounts)) {
        if (currentSentence.includes(noun)) {
          // If a noun appears as a subject (followed by a verb), strengthen its importance
          const nounPosition = currentSentence.indexOf(noun);
          const afterNoun = currentSentence.substring(nounPosition + noun.length);
          if (/\s+(is|are|was|were|has|had|do|does|did|will|would|can|could|should)\s+/.test(afterNoun)) {
            nounContext[noun] = (nounContext[noun] || 0) + 2; // Subject position is strong indicator
          }
        }
      }
    }
    
    // Combine direct counts with contextual understanding
    const combinedCounts: Record<string, number> = { ...nounCounts };
    for (const [noun, contextScore] of Object.entries(nounContext)) {
      combinedCounts[noun] = (combinedCounts[noun] || 0) + Math.floor(contextScore * 0.5);
    }
    
    // Add frequent words from the text that aren't in our predefined lists, aren't excluded, and look like nouns
    for (const [word, count] of Object.entries(wordFrequency)) {
      if (count >= 2 && !combinedCounts[word] && !wordsToExclude.includes(word)) {
        // Check if the word looks like a noun (not ending with common verb endings)
        if (!word.endsWith("ing") && !word.endsWith("ed") && !word.endsWith("ize") && 
            !word.endsWith("ise") && !word.endsWith("ate") && !word.endsWith("ify") && 
            !word.endsWith("en")) {
          combinedCounts[word] = count;
        }
      }
    }
    
    return Object.entries(combinedCounts)
      .filter(([word, count]) => count >= 2 && !wordsToExclude.includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // Limit to top 8
      .map(([subject, count]) => ({ subject, count: count as number }));
  };
  
  const emotionalTopics: EmotionalTopic[] = extractEmotionalTopics();
  const mainSubjects: MainSubject[] = extractMainSubjects();
  
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
      "art": "bg-rose-100 text-rose-800",
      "animals": "bg-sky-100 text-sky-800"
    };
    
    for (const [category, nouns] of Object.entries({
      "family": ["family", "parent", "child", "sibling", "mother", "father", "daughter", "son", "home", "brother", "sister"],
      "work": ["job", "career", "office", "profession", "business", "company", "project", "task", "boss", "colleague"],
      "education": ["school", "university", "learning", "knowledge", "degree", "class", "teacher", "student", "book"],
      "health": ["health", "body", "illness", "wellness", "exercise", "doctor", "medicine", "hospital", "symptom"],
      "finance": ["money", "budget", "savings", "investment", "account", "expense", "income", "debt", "wealth"],
      "travel": ["journey", "destination", "vacation", "trip", "adventure", "exploration", "places", "transport"],
      "technology": ["device", "computer", "software", "internet", "phone", "application", "system", "network"],
      "art": ["creation", "music", "painting", "literature", "film", "culture", "expression", "beauty", "design"],
      "animals": ["cat", "dog", "bird", "animal", "pet", "wildlife", "creature", "species", "fish", "mammal", "reptile"]
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
                  {t("viewDetails")}
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
                  
                  {/* Emotional Actions - Right Side */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="font-medium mb-4 text-black text-center">Emotional Actions</h3>
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        No significant emotional actions detected
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Main Subjects - Below */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                  <h3 className="font-medium mb-4 text-black text-center">Main Subjects</h3>
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
                            <div className="font-semibold">{item.subject}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      No significant subjects detected
                    </p>
                  )}
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
