
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mic, FileText, Calendar } from "lucide-react";

interface JournalInputProps {
  onJournalEntrySubmit: (text: string) => void;
  onAddToLifePlan?: (category: 'daily' | 'weekly' | 'monthly') => void;
}

export const JournalInput = ({ onJournalEntrySubmit, onAddToLifePlan }: JournalInputProps) => {
  const [journalText, setJournalText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const handleSubmit = () => {
    if (journalText.trim().length < 10) {
      toast.error("Please enter at least 10 characters to analyze");
      return;
    }

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

  const handleAddToLifePlan = (category: 'daily' | 'weekly' | 'monthly') => {
    if (journalText.trim().length < 10) {
      toast.error("Please enter at least 10 characters to add to your life plan");
      return;
    }

    if (onAddToLifePlan) {
      onAddToLifePlan(category);
      toast.success(`Added to your ${category} life plan`);
    }
  };

  return (
    <Card className="border border-border shadow-md mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Journal Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea 
            placeholder="Type your journal entry here... Express your thoughts and feelings freely."
            className="min-h-[150px] resize-y"
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSubmit}
              disabled={journalText.trim().length < 10}
            >
              Submit for Analysis
            </Button>
            
            {!isRecording ? (
              <Button
                variant="outline"
                onClick={startVoiceRecognition}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Record Voice
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={stopVoiceRecognition}
                className="flex items-center gap-2 animate-pulse"
              >
                <Mic className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>
          
          {onAddToLifePlan && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm mb-2 font-medium">Add to Life Plan:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleAddToLifePlan('daily')}
                  disabled={journalText.trim().length < 10}
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Daily
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleAddToLifePlan('weekly')}
                  disabled={journalText.trim().length < 10}
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Weekly
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleAddToLifePlan('monthly')}
                  disabled={journalText.trim().length < 10}
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Monthly
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
