import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import EntriesView from "@/components/EntriesView";
import VectorDecorations from "@/components/VectorDecorations";
import { format, isSameDay } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Lightbulb } from "lucide-react";
import { analyzePdfContent } from "@/utils/documentAnalysis";
import { initBertModel } from "@/utils/bertSentimentAnalysis";
import JournalWritePopup from "@/components/JournalWritePopup";
import { analyzeTextWithBert } from "@/utils/bertIntegration";
import HappinessInfographic from "@/components/HappinessInfographic";
import FloatingBubbles from "@/components/journal/FloatingBubbles";
import ResolvedEntries from "@/components/journal/ResolvedEntries";

// Import MonthlyReflections and JournalAnalysisSection
import { MonthlyReflections } from "@/components/MonthlyReflections";
import JournalAnalysisSection from "@/components/reflections/JournalAnalysisSection";
import { DeleteEntryConfirm } from "@/components/DeleteEntryConfirm";

// Rename PerfectLifePlan to Goals
const Goals = () => {
  const [dailyGoals, setDailyGoals] = useState<string>("");
  const [weeklyGoals, setWeeklyGoals] = useState<string>("");
  const [monthlyGoals, setMonthlyGoals] = useState<string>("");

  // Load goals from local storage on component mount
  useEffect(() => {
    try {
      const storedDailyGoals = localStorage.getItem('perfectLifeDailyPlan');
      const storedWeeklyGoals = localStorage.getItem('perfectLifeWeeklyPlan');
      const storedMonthlyGoals = localStorage.getItem('perfectLifeMonthlyPlan');
      if (storedDailyGoals) setDailyGoals(storedDailyGoals);
      if (storedWeeklyGoals) setWeeklyGoals(storedWeeklyGoals);
      if (storedMonthlyGoals) setMonthlyGoals(storedMonthlyGoals);
    } catch (error) {
      console.error('Error loading goals from storage:', error);
    }
  }, []);

  // Save goals to local storage
  const handleSaveGoals = () => {
    try {
      localStorage.setItem('perfectLifeDailyPlan', dailyGoals);
      localStorage.setItem('perfectLifeWeeklyPlan', weeklyGoals);
      localStorage.setItem('perfectLifeMonthlyPlan', monthlyGoals);
      toast.success("Goals saved successfully");
    } catch (error) {
      console.error('Error saving goals to storage:', error);
      toast.error("Failed to save goals");
    }
  };
  return <Card className="rounded-xl overflow-hidden shadow-sm bg-white border border-purple-100">
      <div className="p-4 bg-purple-50 border-b border-purple-100">
        <h2 className="text-xl font-semibold text-purple-900">Goals</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-purple-900">Daily</label>
            <textarea className="w-full p-3 border border-purple-200 rounded-md min-h-[60px]" placeholder="What are your goals for today?" value={dailyGoals} onChange={e => setDailyGoals(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-purple-900">Weekly</label>
            <textarea className="w-full p-3 border border-purple-200 rounded-md min-h-[60px]" placeholder="What do you want to accomplish this week?" value={weeklyGoals} onChange={e => setWeeklyGoals(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-purple-900">Monthly</label>
            <textarea className="w-full p-3 border border-purple-200 rounded-md min-h-[60px]" placeholder="What are your goals for this month?" value={monthlyGoals} onChange={e => setMonthlyGoals(e.target.value)} />
          </div>
          
          <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors" onClick={handleSaveGoals}>
            Save Goals
          </button>
        </div>
      </div>
    </Card>;
};

// Science of Happiness component
const ScienceOfHappiness = () => {
  return <div className="p-4">
      <h2 className="text-2xl font-pacifico text-purple-900 mb-4">The Science of Happiness</h2>
      
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">What is Happiness?</h3>
          <p className="text-gray-700">
            Happiness is both a state of mind and a set of behaviors. Research shows that about 40% of our happiness is under our direct control through daily choices and activities.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Key Practices for Well-being:</h3>
          <ul className="space-y-4">
            <li className="bg-green-50 p-3 rounded-lg flex">
              <span className="font-bold mr-2">1.</span>
              <div>
                <p className="font-medium">Gratitude Practice</p>
                <p className="text-sm text-gray-600">Regularly acknowledging things you're thankful for rewires your brain toward positivity.</p>
              </div>
            </li>
            <li className="bg-blue-50 p-3 rounded-lg flex">
              <span className="font-bold mr-2">2.</span>
              <div>
                <p className="font-medium">Social Connection</p>
                <p className="text-sm text-gray-600">Quality relationships are the strongest predictor of happiness across cultures.</p>
              </div>
            </li>
            <li className="bg-yellow-50 p-3 rounded-lg flex">
              <span className="font-bold mr-2">3.</span>
              <div>
                <p className="font-medium">Mindfulness</p>
                <p className="text-sm text-gray-600">Regular meditation and present-moment awareness reduce stress and enhance joy.</p>
              </div>
            </li>
            <li className="bg-orange-50 p-3 rounded-lg flex">
              <span className="font-bold mr-2">4.</span>
              <div>
                <p className="font-medium">Acts of Kindness</p>
                <p className="text-sm text-gray-600">Helping others triggers a "helper's high" through endorphin release.</p>
              </div>
            </li>
            <li className="bg-red-50 p-3 rounded-lg flex">
              <span className="font-bold mr-2">5.</span>
              <div>
                <p className="font-medium">Physical Activity</p>
                <p className="text-sm text-gray-600">Regular exercise boosts mood through endorphin release and improved brain function.</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">The Science Behind Journaling</h3>
          <p className="text-gray-700 mb-2">
            Regular journaling has been shown to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Reduce stress and anxiety by up to 28%</li>
            <li>Improve immune function</li>
            <li>Enhance emotional processing</li>
            <li>Accelerate healing from trauma</li>
            <li>Improve memory and cognitive function</li>
          </ul>
        </div>
      </div>
    </div>;
};

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

const Dashboard = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEntriesView, setIsEntriesView] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isWritePopupOpen, setIsWritePopupOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isHappinessDrawerOpen, setIsHappinessDrawerOpen] = useState(false);
  const [resolvedEntries, setResolvedEntries] = useState<JournalEntry[]>([]);
  const [showBubbles, setShowBubbles] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize BERT model when component mounts
  useEffect(() => {
    const initBert = async () => {
      try {
        await initBertModel();
        console.log("BERT model initialized successfully");
      } catch (error) {
        console.error("Failed to initialize BERT model:", error);
      }
    };
    initBert();
  }, []);

  // Load journal entries from local storage
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const entries: JournalEntry[] = JSON.parse(storedEntries);
        setJournalEntries(entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }

      // Load resolved entries
      const storedResolvedEntries = localStorage.getItem('resolvedJournalEntries');
      if (storedResolvedEntries) {
        const resolved: JournalEntry[] = JSON.parse(storedResolvedEntries);
        setResolvedEntries(resolved);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  }, [refreshTrigger]);

  // Handle storage events (when journal entries change)
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Check if we should show the entries view based on URL hash
  useEffect(() => {
    setIsEntriesView(location.hash === "#entries");
  }, [location.hash]);

  // Handle date selection in calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);

    // Find entries for the selected date
    const entriesForDate = journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, date);
    });
    if (entriesForDate.length > 0) {
      setSelectedEntry(entriesForDate[0]);
    } else {
      setSelectedEntry(null);
    }
  };

  // Handle bubble pop
  const handleBubblePop = (id: string) => {
    // Find the entry by ID
    const entry = journalEntries.find(e => e.id === id);
    if (!entry) return;

    // Move entry from journalEntries to resolvedEntries
    const updatedEntries = journalEntries.filter(e => e.id !== id);
    const updatedResolved = [entry, ...resolvedEntries];

    // Update state
    setJournalEntries(updatedEntries);
    setResolvedEntries(updatedResolved);

    // Save to localStorage
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    localStorage.setItem('resolvedJournalEntries', JSON.stringify(updatedResolved));

    // Update refreshTrigger to cause a re-render
    setRefreshTrigger(prev => prev + 1);
  };

  // Generate synthetic timeline data for JournalAnalysisSection
  const generateTimelineData = () => {
    return journalEntries.map(entry => {
      // Create a simple mapping from entry text to sentiment value
      const textLength = entry.text.length;
      // Generate a sentiment between -0.8 and 0.8 based on text length
      const sentiment = Math.sin(textLength * 0.01) * 0.8;
      return {
        date: format(new Date(entry.date), 'MMM dd'),
        sentiment: sentiment,
        text: entry.text.substring(0, 100) + (entry.text.length > 100 ? "..." : "")
      };
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Determine sentiment change direction
  const getOverallSentimentChange = () => {
    if (journalEntries.length < 2) return "neutral";
    const timelineData = generateTimelineData();
    if (timelineData.length < 2) return "neutral";
    const firstSentiment = timelineData[0].sentiment;
    const lastSentiment = timelineData[timelineData.length - 1].sentiment;
    if (lastSentiment > firstSentiment + 0.1) return "positive";
    if (lastSentiment < firstSentiment - 0.1) return "negative";
    return "neutral";
  };

  // Calculate average sentiment
  const getAverageSentiment = () => {
    const timelineData = generateTimelineData();
    if (timelineData.length === 0) return 0;
    const total = timelineData.reduce((sum, item) => sum + item.sentiment, 0);
    return total / timelineData.length;
  };

  // Helper function to get sentiment color
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return "#27AE60"; // Positive
    if (sentiment < -0.3) return "#E74C3C"; // Negative
    return "#3498DB"; // Neutral
  };

  // Export monthly analysis as PDF
  const exportMonthlyAnalysis = () => {
    try {
      toast.info("Preparing monthly analysis export...");
      const currentMonth = format(new Date(), 'MMMM yyyy');

      // Use jsPDF to create a PDF document
      const {
        jsPDF
      } = require('jspdf');
      const autoTable = require('jspdf-autotable').default;
      const doc = new jsPDF();

      // Title
      doc.setFontSize(22);
      doc.text(`Monthly Journal Analysis - ${currentMonth}`, 20, 20);

      // Overview section
      doc.setFontSize(16);
      doc.text("Journal Overview", 20, 35);

      // Journal statistics
      const monthEntries = journalEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        const now = new Date();
        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
      });
      autoTable(doc, {
        startY: 40,
        head: [["Metric", "Value"]],
        body: [["Total Entries", monthEntries.length.toString()], ["Overall Sentiment", getOverallSentimentChange()], ["Average Sentiment", getAverageSentiment().toFixed(2)]]
      });

      // Timeline data
      const timelineTableEndY = (doc as any).lastAutoTable?.finalY || 70;
      doc.setFontSize(16);
      doc.text("Sentiment Timeline", 20, timelineTableEndY + 10);
      const timelineData = generateTimelineData();
      const timelineRows = timelineData.map(item => [item.date, item.sentiment.toFixed(2), item.text.substring(0, 50) + (item.text.length > 50 ? "..." : "")]);
      autoTable(doc, {
        startY: timelineTableEndY + 15,
        head: [["Date", "Sentiment", "Entry Preview"]],
        body: timelineRows
      });

      // Monthly Journal Summary
      const entryTableEndY = (doc as any).lastAutoTable?.finalY || 140;
      if (entryTableEndY > 200) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Monthly Journal Summary", 20, 20);
      } else {
        doc.setFontSize(16);
        doc.text("Monthly Journal Summary", 20, entryTableEndY + 10);
      }

      // Get stored monthly reflections
      const storedReflections = localStorage.getItem('monthlyReflections');
      const reflections = storedReflections ? JSON.parse(storedReflections) : [];

      // Get most recent reflection for current month
      const currentMonthReflections = reflections.filter((ref: any) => {
        const refDate = new Date(ref.date);
        const now = new Date();
        return refDate.getMonth() === now.getMonth() && refDate.getFullYear() === now.getFullYear();
      });
      const latestReflection = currentMonthReflections[0];
      if (latestReflection) {
        const summaryStartY = entryTableEndY > 200 ? 30 : entryTableEndY + 20;
        doc.setFontSize(12);
        doc.text(latestReflection.text.substring(0, 1000) + (latestReflection.text.length > 1000 ? "..." : ""), 20, summaryStartY, {
          maxWidth: 170
        });
      } else {
        const summaryStartY = entryTableEndY > 200 ? 30 : entryTableEndY + 20;
        doc.setFontSize(12);
        doc.text("No monthly reflection available for this month.", 20, summaryStartY);
      }

      // Save the PDF
      doc.save(`monthly-analysis-${currentMonth.replace(/\s+/g, '-')}.pdf`);
      toast.success(`Monthly analysis for ${currentMonth} exported successfully`);
    } catch (error) {
      console.error("Error exporting monthly analysis:", error);
      toast.error("Failed to export monthly analysis");
    }
  };

  // Share functionality
  const shareJournalAnalysis = async () => {
    try {
      const shareData = {
        title: 'My Journal Analysis',
        text: `I've been journaling with Journal Analysis. Here's my monthly sentiment: ${getOverallSentimentChange()}.`,
        url: window.location.href
      };
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } else {
        // Fallback for browsers that don't support sharing
        navigator.clipboard.writeText(shareData.text + " " + shareData.url);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share");
    }
  };

  // Initiate delete journal entry
  const initiateDeleteEntry = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteDialog(true);
  };

  // Delete journal entry
  const confirmDeleteEntry = () => {
    if (!entryToDelete) return;
    try {
      const updatedEntries = journalEntries.filter(entry => entry.id !== entryToDelete);
      setJournalEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      if (selectedEntry?.id === entryToDelete) {
        setSelectedEntry(null);
      }
      toast.success("Journal entry deleted");
      setRefreshTrigger(prev => prev + 1);
      setShowDeleteDialog(false);
      setEntryToDelete(null);
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast.error("Failed to delete journal entry");
    }
  };

  // Enable SMS notifications
  const enableNotifications = () => {
    if (!phoneNumber || !/^\+?\d{10,15}$/.test(phoneNumber.replace(/\D/g, ''))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // In a real implementation, this would connect to a messaging service API
    console.log("Enabling notifications for:", phoneNumber);
    setNotificationsEnabled(true);
    setShowConsentDialog(false);
    toast.success("Daily journal reminders enabled");

    // Store in local storage
    localStorage.setItem('journalReminderPhone', phoneNumber);
    localStorage.setItem('journalRemindersEnabled', 'true');
  };

  // Load notification settings
  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem('journalReminderPhone');
      const remindersEnabled = localStorage.getItem('journalRemindersEnabled');
      if (savedPhone) {
        setPhoneNumber(savedPhone);
      }
      if (remindersEnabled === 'true') {
        setNotificationsEnabled(true);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  // Toggle notifications
  const toggleNotifications = () => {
    if (notificationsEnabled) {
      // Disable notifications
      setNotificationsEnabled(false);
      localStorage.setItem('journalRemindersEnabled', 'false');
      toast.success("Journal reminders disabled");
    } else {
      // Show consent dialog
      setShowConsentDialog(true);
    }
  };

  // Handle journal submission
  const handleSubmitJournal = async (text: string, addToMonthly: boolean) => {
    try {
      // Create new journal entry
      const newEntry = {
        id: uuidv4(),
        text: text.trim(),
        date: new Date().toISOString()
      };

      // Get existing entries
      const existingEntriesJSON = localStorage.getItem('journalEntries');
      const existingEntries = existingEntriesJSON ? JSON.parse(existingEntriesJSON) : [];

      // Add new entry to beginning
      const updatedEntries = [newEntry, ...existingEntries];

      // Save to localStorage
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

      // If addToMonthly is true, add it to monthly reflections
      if (addToMonthly) {
        // Get existing reflections
        const existingReflectionsJSON = localStorage.getItem('monthlyReflections');
        const existingReflections = existingReflectionsJSON ? JSON.parse(existingReflectionsJSON) : [];

        // Add new reflection
        const newReflection = {
          id: uuidv4(),
          text: text.trim(),
          date: new Date().toISOString()
        };

        // Add to beginning
        const updatedReflections = [newReflection, ...existingReflections];
        localStorage.setItem('monthlyReflections', JSON.stringify(updatedReflections));
      }

      // Analyze the new entry using BERT
      try {
        const analysis = await analyzeTextWithBert(text);
        console.log("Journal entry analyzed with BERT:", analysis);
      } catch (err) {
        console.error("Error analyzing journal with BERT:", err);
      }

      // Refresh the entries
      setRefreshTrigger(prev => prev + 1);
      toast.success("Journal entry saved");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast.error("Failed to save journal entry");
    }
  };

  // Open the write popup
  const openWritePopup = () => {
    setIsWritePopupOpen(true);
  };

  // Toggle view
  const toggleView = () => {
    if (isEntriesView) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard#entries');
    }
  };

  // Toggle bubbles display
  const toggleBubbles = () => {
    setShowBubbles(prev => !prev);
  };

  return <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-6 relative">
        <VectorDecorations className="absolute inset-0 pointer-events-none opacity-30" type="home" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-900">My Wellness Journal</h1>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={toggleBubbles} className="bg-white border-purple-200 text-purple-800 hover:bg-purple-50">
              {showBubbles ? 'Hide Bubbles' : 'Show Bubbles'}
            </Button>
            <Button variant="outline" size="sm" onClick={toggleView} className="bg-white border-purple-200 text-purple-800 hover:bg-purple-50">
              {isEntriesView ? 'Monthly View' : 'Entries View'}
            </Button>
          </div>
        </div>
        
        {isEntriesView ?
          // Entries View
          <div className="bg-white rounded-xl overflow-hidden shadow-md h-[calc(100vh-140px)]">
            <EntriesView entries={journalEntries} onSelectEntry={setSelectedEntry} />
          </div> :
          // Monthly View
          <>
            {/* Floating Bubbles Section - Only show if showBubbles is true */}
            {showBubbles && journalEntries.length > 0 && (
              <div className="mb-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-3 bg-purple-50 border-b border-purple-100">
                    <h2 className="text-lg font-semibold text-purple-900">Journal Bubbles</h2>
                    <p className="text-xs text-purple-700">Click to resolve entries</p>
                  </div>
                  <div className="h-[200px] w-full">
                    <FloatingBubbles 
                      entries={journalEntries} 
                      onBubblePop={handleBubblePop} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add the new Happiness Infographic */}
            <HappinessInfographic />
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6 relative">
                {/* Science of Happiness Button - positioned to be visible on the side of the calendar */}
                <div className="absolute -left-3 top-28 z-10">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 shadow-md rotate-90 origin-bottom-left">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Science of Happiness
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mx-auto w-full max-w-3xl p-6">
                        <DrawerHeader>
                          <DrawerTitle className="text-center text-2xl font-pacifico text-purple-800">
                            Science of Happiness
                          </DrawerTitle>
                        </DrawerHeader>
                        <ScienceOfHappiness />
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
                
                <MonthlyCalendar onSelectDate={handleDateSelect} journalEntries={journalEntries} />
                
                <Card className="rounded-xl overflow-hidden shadow-sm border border-purple-100">
                  <div className="p-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-purple-900">Journal Entries</h2>
                      <p className="text-sm text-purple-600">
                        {format(selectedDate, 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={toggleNotifications} className={`${notificationsEnabled ? 'text-purple-600' : 'text-gray-400'}`}>
                        <Bell className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    {journalEntries.filter(entry => {
                      const entryDate = new Date(entry.date);
                      return isSameDay(entryDate, selectedDate);
                    }).map(entry => <div key={entry.id} className="mb-4 last:mb-0">
                          <div className="flex justify-between items-start">
                            <div className="text-xs text-gray-500 mb-1">
                              {format(new Date(entry.date), 'h:mm a')}
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-500" onClick={() => initiateDeleteEntry(entry.id)}>
                              <span className="sr-only">Delete</span>
                              ×
                            </Button>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm line-clamp-5">{entry.text}</p>
                          </div>
                        </div>)}
                    
                    {journalEntries.filter(entry => {
                      const entryDate = new Date(entry.date);
                      return isSameDay(entryDate, selectedDate);
                    }).length === 0 && <div className="text-center py-8 text-gray-500">
                        <p>No journal entries for this date</p>
                        <Button variant="outline" size="sm" onClick={openWritePopup} className="mt-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                          Write an entry
                        </Button>
                      </div>}
                  </div>
                </Card>

                {/* Resolved Entries Section */}
                <Card className="rounded-xl overflow-hidden shadow-sm border border-purple-100">
                  <div className="p-4 bg-green-50 border-b border-green-100">
                    <h2 className="text-xl font-semibold text-green-900">Resolved Entries</h2>
                  </div>
                  <div className="bg-white">
                    <ResolvedEntries entries={resolvedEntries} />
                  </div>
                </Card>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <Goals />
                
                <MonthlyReflections journalText="" refreshTrigger={refreshTrigger} journalRefreshTrigger={refreshTrigger} />
                
                <JournalAnalysisSection journalEntries={journalEntries} timelineData={generateTimelineData()} overallSentimentChange={getOverallSentimentChange()} averageSentiment={getAverageSentiment()} getSentimentColor={getSentimentColor} refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </>
        }
        
        {/* SMS Notification Consent Dialog */}
        <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enable Daily Journal Reminders</DialogTitle>
              <DialogDescription>
                Receive a daily SMS reminder to write in your journal. 
                Standard message rates may apply.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="col-span-4 text-sm">
                  Enter your phone number to receive daily reminders. 
                  You can opt out at any time by replying "STOP" to any message.
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phoneNumber" className="text-right">
                  Phone
                </label>
                <Input id="phoneNumber" placeholder="+1 (555) 123-4567" className="col-span-3" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={enableNotifications} className="bg-purple-600 hover:bg-purple-700">
                Enable Reminders
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Entry Confirmation Dialog */}
        <DeleteEntryConfirm isOpen={showDeleteDialog} onOpenChange={setShowDeleteDialog} onConfirmDelete={confirmDeleteEntry} />
        
        {/* Journal Write Popup */}
        <JournalWritePopup isOpen={isWritePopupOpen} onClose={() => setIsWritePopupOpen(false)} onSubmitJournal={handleSubmitJournal} />
      </main>
    </div>;
};
export default Dashboard;
