
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Mic, MicOff, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { extractTextFromPdf } from "@/utils/pdfExtraction";

interface JournalWritePopupProps {
  onJournalCreated?: (journalText: string) => void;
  isDisabled?: boolean;
}

const JournalWritePopup = ({ onJournalCreated, isDisabled = false }: JournalWritePopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Create speech recognition instance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use the appropriate Speech Recognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Only update if there's new text to add
          if (finalTranscript) {
            setJournalText(prev => prev + finalTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setRecordingError(`Error: ${event.error}`);
          stopRecording();
        };
      } else {
        setRecordingError("Speech recognition not supported in this browser");
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start audio recording
  const startRecording = async () => {
    setJournalText("");
    setRecordingError(null);
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success("Recording started");
      } else {
        setRecordingError("Speech recognition not supported");
        toast.error("Speech recognition not supported in this browser");
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingError(`Could not access microphone. Please check permissions.`);
      toast.error("Could not access microphone");
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
  };

  // Save journal entry
  const saveJournalEntry = () => {
    if (!journalText.trim()) {
      toast.error("Cannot save empty journal entry");
      return;
    }
    
    try {
      // Create new journal entry
      const newEntry = {
        id: uuidv4(),
        text: journalText.trim(),
        date: new Date().toISOString()
      };
      
      // Get existing entries or initialize empty array
      const existingEntriesJSON = localStorage.getItem('journalEntries');
      const existingEntries = existingEntriesJSON 
        ? JSON.parse(existingEntriesJSON) 
        : [];
      
      // Add new entry to beginning
      const updatedEntries = [newEntry, ...existingEntries];
      
      // Save to localStorage
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      
      // Trigger event for other components to refresh
      window.dispatchEvent(new Event('storage'));
      
      // Callback if provided
      if (onJournalCreated) {
        onJournalCreated(journalText);
      }
      
      // Reset and close
      setJournalText("");
      setIsOpen(false);
      
      toast.success("Journal entry saved");
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error("Failed to save journal entry");
    }
  };

  // Handle PDF upload
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      toast.info("Processing PDF...");
      const text = await extractTextFromPdf(file);
      
      if (text) {
        // Append PDF text to existing journal text
        setJournalText(prev => {
          const newText = prev ? `${prev}\n\nExtracted from PDF "${file.name}":\n${text}` : `Extracted from PDF "${file.name}":\n${text}`;
          return newText;
        });
        toast.success("PDF text extracted");
      } else {
        toast.error("Could not extract text from PDF");
      }
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast.error("Failed to process PDF");
    }
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="w-full max-w-md"
          disabled={isDisabled}
        >
          Write in your journal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Write in your journal</span>
            <div className="flex space-x-2">
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 hover:bg-green-200">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <input 
                  id="pdf-upload" 
                  type="file" 
                  accept=".pdf" 
                  className="sr-only"
                  onChange={handlePdfUpload}
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                className={`rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-gray-100 text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {recordingError && (
          <div className="mb-4 p-3 text-sm bg-red-50 border border-red-100 rounded-md text-red-600">
            {recordingError}
          </div>
        )}
        
        <div className="py-4">
          <Textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="How are you feeling today?"
            className="min-h-[200px] p-4"
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={saveJournalEntry}
            disabled={!journalText.trim()}
          >
            Save Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JournalWritePopup;
