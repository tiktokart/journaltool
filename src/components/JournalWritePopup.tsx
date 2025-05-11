
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface JournalWritePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitJournal: (text: string, addToMonthlyReflection: boolean) => void;
}

const JournalWritePopup = ({
  isOpen,
  onClose,
  onSubmitJournal
}: JournalWritePopupProps) => {
  const [journalText, setJournalText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [addToMonthly, setAddToMonthly] = useState(false);
  
  // Speech recognition setup
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }
    
    try {
      // @ts-ignore - WebkitSpeechRecognition is not in TypeScript's lib
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setJournalText(prevText => prevText + " " + transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsRecording(false);
        toast.error("Error with speech recognition. Please try again.");
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
      setIsRecording(true);
      
      // Store recognition instance to stop it later
      window.currentRecognition = recognition;
    } catch (error) {
      console.error("Speech recognition error:", error);
      toast.error("Could not start speech recognition");
    }
  };
  
  const stopRecording = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      setIsRecording(false);
    }
  };
  
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const handleSubmit = () => {
    if (journalText.trim() === "") {
      toast.error("Please write something in your journal");
      return;
    }
    
    onSubmitJournal(journalText, addToMonthly);
    setJournalText("");
    setAddToMonthly(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (isRecording) stopRecording();
      onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] journal-popup p-0 overflow-hidden max-h-[85vh]">
        <DialogHeader className="bg-green-50 p-4 border-b border-green-100">
          <DialogTitle className="text-xl font-semibold text-green-800 flex items-center justify-between">
            <span>New Journal Entry</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <h3 className="text-lg font-medium text-green-700 mb-2">What's on your mind?</h3>
          <div className="relative">
            <Textarea 
              placeholder="Write your journal entry here..."
              className="min-h-[250px] p-4 text-base"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            />
            <Button
              variant="outline"
              size="icon"
              className={`absolute bottom-4 right-4 rounded-full ${isRecording ? 'bg-red-100 text-red-500' : ''}`}
              onClick={handleToggleRecording}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex items-center mt-4">
            <input 
              type="checkbox" 
              id="add-to-monthly" 
              className="mr-2"
              checked={addToMonthly}
              onChange={() => setAddToMonthly(!addToMonthly)}
            />
            <label htmlFor="add-to-monthly" className="text-sm text-gray-700">
              Add to Monthly Reflections
            </label>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" className="mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Necessary for TypeScript with Window object extension
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    currentRecognition: any;
  }
}

export default JournalWritePopup;
