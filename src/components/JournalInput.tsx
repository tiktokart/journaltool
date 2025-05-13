
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mic, FileText, Calendar } from "lucide-react";
import MentalHealthSuggestions from "./suggestions/MentalHealthSuggestions";
import { WellbeingResources } from "./WellbeingResources";
import { analyzeTextWithBert } from "@/utils/bertIntegration";
import { Point } from "@/types/embedding";

interface JournalInputProps {
  onJournalEntrySubmit: (text: string) => void;
  onAddToMonthlyReflection?: (text: string) => void;
}

export const JournalInput = ({ onJournalEntrySubmit, onAddToMonthlyReflection }: JournalInputProps) => {
  const [journalText, setJournalText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [analyzedEntry, setAnalyzedEntry] = useState<string | null>(null);
  const [bertAnalysis, setBertAnalysis] = useState<any>(null);
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    // Analyze journal text when it gets submitted
    const analyzeJournalEntry = async () => {
      if (!analyzedEntry) return;
      
      setIsAnalyzing(true);
      try {
        const analysis = await analyzeTextWithBert(analyzedEntry);
        
        // Clean up any Theme suffix from emotion labels
        if (analysis && analysis.keywords) {
          analysis.keywords = analysis.keywords.map((kw: any) => ({
            ...kw,
            tone: kw.tone?.replace(/\s*Theme\s*$/i, '') || kw.tone
          }));
        }
        
        // Create embedding points based on keywords for wellbeing resources
        if (analysis && analysis.keywords) {
          const points: Point[] = analysis.keywords.map((keyword: any, index: number) => ({
            id: `journal-input-keyword-${index}`,
            word: keyword.text,
            emotionalTone: keyword.tone || "Neutral",
            sentiment: keyword.sentiment || 0.5,
            color: keyword.color
          }));
          setEmbeddingPoints(points);
        }
        
        setBertAnalysis(analysis);
      } catch (error) {
        console.error("Error analyzing journal entry:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    analyzeJournalEntry();
  }, [analyzedEntry]);

  const handleSubmit = () => {
    if (journalText.trim().length < 10) {
      toast.error("Please enter at least 10 characters to analyze");
      return;
    }

    // Save the current text for suggestions display
    setAnalyzedEntry(journalText);
    
    // Pass to parent for processing
    onJournalEntrySubmit(journalText);
    toast.success("Journal entry submitted for analysis");
  };

  const startVoiceRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onstart = () => {
        setIsRecording(true);
        toast.info("Voice recording started. Speak clearly.");
      };
      
      recognitionInstance.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setJournalText(transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error("Error recording voice. Please try again.");
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      recognitionInstance.start();
      setRecognition(recognitionInstance);
    } else {
      toast.error("Speech recognition is not supported in your browser");
    }
  };

  const stopVoiceRecognition = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      toast.success("Voice recording stopped");
    }
  };

  const handleAddToMonthlyReflection = () => {
    if (journalText.trim().length < 10) {
      toast.error("Please enter at least 10 characters to add to your monthly reflection");
      return;
    }

    // Save the current text for suggestions display
    setAnalyzedEntry(journalText);
    
    if (onAddToMonthlyReflection) {
      onAddToMonthlyReflection(journalText);
      toast.success("Added to your monthly reflections section");
    }
  };

  const placeholderText = "Type your journal entry here... Express your thoughts and feelings about your day, experiences, or emotions. Include both actions (what you did) and subjects (people, places, things) for better emotional analysis.";

  return (
    <div className="space-y-6">
      <Card className="border border-border shadow-md mb-6 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-black">
            <FileText className="h-5 w-5 mr-2 text-black" />
            Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              placeholder={placeholderText}
              className="min-h-[150px] resize-y text-black bg-white"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            />
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSubmit}
                disabled={journalText.trim().length < 10}
                className="text-black bg-orange text-white"
              >
                Submit for Analysis
              </Button>
              
              {!isRecording ? (
                <Button
                  variant="outline"
                  onClick={startVoiceRecognition}
                  className="flex items-center gap-2 text-black border-orange"
                >
                  <Mic className="h-4 w-4" />
                  Record Voice
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={stopVoiceRecognition}
                  className="flex items-center gap-2 animate-pulse text-black"
                >
                  <Mic className="h-4 w-4" />
                  Stop Recording
                </Button>
              )}
            </div>
            
            {onAddToMonthlyReflection && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-black">
                    Save this entry to the Monthly Reflections section in the dashboard.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleAddToMonthlyReflection}
                    disabled={journalText.trim().length < 10}
                    className="flex items-center gap-1 text-black"
                  >
                    <Calendar className="h-4 w-4" />
                    Add to Monthly Reflections Section
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Only display suggestions if we have analyzed text */}
      {analyzedEntry && (
        <div className="space-y-6">
          <MentalHealthSuggestions 
            journalEntries={[{ text: analyzedEntry }]} 
            bertAnalysis={bertAnalysis}
          />
          
          <WellbeingResources
            embeddingPoints={embeddingPoints}
            sourceDescription="Based on your journal entry"
          />
        </div>
      )}
    </div>
  );
}
