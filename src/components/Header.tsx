
import { Link, useLocation } from "react-router-dom";
import { Pencil, Flower } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import JournalWritePopup from "./JournalWritePopup";
import { toast } from "sonner";

export const Header = () => {
  const [isJournalWriteOpen, setIsJournalWriteOpen] = useState(false);
  const location = useLocation();

  // Handle journal submission from the popup
  const handleJournalSubmit = (text: string, addToMonthlyReflection: boolean) => {
    try {
      // Create journal entry
      const entry = {
        id: crypto.randomUUID(),
        text: text,
        date: new Date().toISOString()
      };
      
      // Save to localStorage
      const storedEntries = localStorage.getItem('journalEntries');
      const entries = storedEntries ? JSON.parse(storedEntries) : [];
      entries.push(entry);
      localStorage.setItem('journalEntries', JSON.stringify(entries));
      
      // Add to monthly reflections if selected
      if (addToMonthlyReflection) {
        const reflection = {
          id: crypto.randomUUID(),
          text: text,
          date: new Date().toISOString()
        };
        
        const storedReflections = localStorage.getItem('monthlyReflections');
        const reflections = storedReflections ? JSON.parse(storedReflections) : [];
        reflections.push(reflection);
        localStorage.setItem('monthlyReflections', JSON.stringify(reflections));
      }
      
      // Dispatch storage events for components to detect changes
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'journalEntries',
        newValue: JSON.stringify(entries)
      }));
      
      if (addToMonthlyReflection) {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'monthlyReflections',
          newValue: JSON.stringify([])
        }));
      }
      
      toast.success("Journal entry saved successfully");
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error("Failed to save journal entry");
    }
  };

  // For onboarding page, show simplified header without tabs
  if (location.pathname === "/") {
    return (
      <header className="border-b border-border bg-green backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Flower className="h-6 w-6 text-green-800" />
              <span className="font-bold text-xl text-black">Journal Analysis</span>
            </Link>
            
            {/* Get Started button removed */}
          </div>
        </div>
      </header>
    );
  }

  // Main dashboard header with tabs
  return (
    <header className="border-b border-border bg-green backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Flower className="h-6 w-6 text-green-800" />
            <span className="font-bold text-xl text-black">Journal Analysis</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <nav className="flex items-center">
              <Link 
                to="/dashboard" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/dashboard" && !location.hash.includes("entries") 
                    ? "bg-green-600/10 text-green-800" 
                    : "text-black hover:bg-green-600/5"
                )}
              >
                Monthly
              </Link>
              <Link 
                to="/dashboard#entries" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.hash.includes("entries") 
                    ? "bg-green-600/10 text-green-800" 
                    : "text-black hover:bg-green-600/5"
                )}
              >
                Entries
              </Link>
            </nav>
          </div>
          
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            onClick={() => setIsJournalWriteOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            <span>Journal</span>
          </Button>
        </div>
      </div>
      
      <JournalWritePopup 
        isOpen={isJournalWriteOpen}
        onClose={() => setIsJournalWriteOpen(false)}
        onSubmitJournal={handleJournalSubmit}
      />
    </header>
  );
};

export default Header;
