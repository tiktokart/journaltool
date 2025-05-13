
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Calendar } from "lucide-react";
import { analyzeTextWithBert } from "@/utils/bertIntegration";
import { Point } from "@/types/embedding";
import { VoiceRecorder } from './journal/VoiceRecorder';
import { AnalysisDisplay } from './journal/AnalysisDisplay';

interface JournalInputProps {
  onJournalEntrySubmit: (text: string) => void;
  onAddToMonthlyReflection?: (text: string) => void;
}

export const JournalInput = ({ onJournalEntrySubmit, onAddToMonthlyReflection }: JournalInputProps) => {
  const [journalText, setJournalText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
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

  const handleTranscriptUpdate = (transcript: string) => {
    setJournalText(transcript);
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
              
              <VoiceRecorder
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                onTranscriptUpdate={handleTranscriptUpdate}
              />
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

      <AnalysisDisplay 
        analyzedEntry={analyzedEntry} 
        bertAnalysis={bertAnalysis}
        embeddingPoints={embeddingPoints}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
}
