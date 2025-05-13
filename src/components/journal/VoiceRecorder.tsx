
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  onTranscriptUpdate: (text: string) => void;
}

export const VoiceRecorder = ({ 
  isRecording, 
  setIsRecording, 
  onTranscriptUpdate 
}: VoiceRecorderProps) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onTranscriptUpdate(transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error("Error recording voice. Please try again.");
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startVoiceRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      if (recognition) {
        recognition.start();
        setIsRecording(true);
        toast.info("Voice recording started. Speak clearly.");
      }
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

  return (
    <Button
      variant="outline"
      onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
      className={`flex items-center gap-2 ${isRecording ? 'text-black animate-pulse' : 'text-black border-orange'}`}
    >
      <Mic className="h-4 w-4" />
      {isRecording ? 'Stop Recording' : 'Record Voice'}
    </Button>
  );
};
