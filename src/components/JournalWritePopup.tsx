
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Mic, MicOff, Upload, FilePdf } from "lucide-react";
import { toast } from "sonner";
import { extractTextFromPdf } from "@/utils/pdfExtraction";

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
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
    setUploadedFile(null);
    onClose();
  };
  
  // Handle PDF upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadedFile(file);
      
      // Extract text from PDF
      const extractedText = await extractTextFromPdf(file);
      
      // Append or set the extracted text to the journal text
      if (journalText.trim().length > 0) {
        setJournalText(prev => `${prev}\n\nFrom PDF "${file.name}":\n${extractedText}`);
      } else {
        setJournalText(`From PDF "${file.name}":\n${extractedText}`);
      }
      
      toast.success("PDF text extracted successfully");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to extract text from PDF");
    } finally {
      setIsUploading(false);
    }
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
          
          <div className="flex flex-wrap items-center mt-4 gap-4">
            <div className="flex items-center">
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
            
            {/* Add PDF upload functionality */}
            <div className="flex-1">
              <label htmlFor="pdf-upload" className="flex items-center justify-center">
                <Button 
                  variant="outline" 
                  className="border-dashed border-green-300 flex gap-2"
                  disabled={isUploading}
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                >
                  {isUploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <FilePdf className="h-4 w-4" /> 
                      {uploadedFile ? uploadedFile.name : "Upload PDF"}
                    </>
                  )}
                </Button>
                <input 
                  type="file" 
                  id="pdf-upload" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  onClick={(e) => (e.currentTarget.value = '')} // Reset input value on click
                />
              </label>
            </div>
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
