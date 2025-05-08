import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Point } from "@/types/embedding";
import { analyzePdfContent } from "@/utils/documentAnalysis";
import { v4 as uuidv4 } from 'uuid';
import PerfectLifePlan from "@/components/dashboard/PerfectLifePlan";
import { MonthlyReflections } from "@/components/MonthlyReflections";
import { JournalInput } from "@/components/JournalInput";
import { JournalCache } from "@/components/JournalCache";
import DocumentAnalysisPanel from "@/components/dashboard/DocumentAnalysisPanel";
import AnalysisResults from "@/components/dashboard/AnalysisResults";

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("embedding");
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uniqueWords, setUniqueWords] = useState<string[]>([]);
  const [pdfText, setPdfText] = useState<string>("");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [connectedPoints, setConnectedPoints] = useState<Point[]>([]);
  const [visibleClusterCount, setVisibleClusterCount] = useState(8);
  const [journalText, setJournalText] = useState<string>("");
  const [monthlyReflectionText, setMonthlyReflectionText] = useState<string>("");
  const [refreshJournalTrigger, setRefreshJournalTrigger] = useState(0);
  const [refreshReflectionsTrigger, setRefreshReflectionsTrigger] = useState(0);

  // Callback functions for triggering refreshes
  const handleJournalEntryAdded = useCallback(() => {
    setRefreshJournalTrigger(prev => prev + 1);
  }, []);
  
  const handleMonthlyReflectionAdded = useCallback(() => {
    setRefreshReflectionsTrigger(prev => prev + 1);
  }, []);

  const handleFileUpload = (files: File[], extractedText?: string) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      setPdfText(extractedText || "");
      toast.success(`File "${files[0].name}" uploaded successfully`);
      
      if (extractedText && extractedText.length > 0) {
        const wordCount = extractedText.split(/\s+/).length;
        toast.info(`Extracted ${wordCount} words from PDF for analysis`);
      }
      
      if (sentimentData) {
        setSentimentData(null);
        setSelectedPoint(null);
        setAnalysisComplete(false);
      }
    }
  };

  const handleJournalEntrySubmit = (text: string) => {
    // Set the text as the current PDF text
    setPdfText(text);
    setJournalText(text);
    
    // Create a virtual "file" for the journal entry
    const fileName = `Journal_Entry_${new Date().toLocaleString().replace(/[/:\\]/g, '-')}`;
    setFile(new File([text], fileName, { type: "text/plain" }));
    
    // Clear existing results
    if (sentimentData) {
      setSentimentData(null);
      setSelectedPoint(null);
      setAnalysisComplete(false);
    }
    
    // Save to local storage
    try {
      const entry = {
        id: uuidv4(),
        text: text,
        date: new Date().toISOString()
      };
      
      const storedEntries = localStorage.getItem('journalEntries');
      const entries = storedEntries ? JSON.parse(storedEntries) : [];
      entries.push(entry);
      
      localStorage.setItem('journalEntries', JSON.stringify(entries));
      
      // Dispatch a storage event for other components to detect the change
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'journalEntries',
        newValue: JSON.stringify(entries)
      }));
      
      toast.success("Journal entry saved");
      
      // Trigger refresh for journal cache
      setRefreshJournalTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error("Failed to save journal entry");
    }
  };

  const handleAddToMonthlyReflection = (text: string) => {
    setMonthlyReflectionText(text);
    
    try {
      const reflection = {
        id: uuidv4(),
        text: text,
        date: new Date().toISOString()
      };
      
      const storedReflections = localStorage.getItem('monthlyReflections');
      const reflections = storedReflections ? JSON.parse(storedReflections) : [];
      reflections.push(reflection);
      
      localStorage.setItem('monthlyReflections', JSON.stringify(reflections));
      
      // Trigger refresh for monthly reflections
      setRefreshReflectionsTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error adding to monthly reflections:', error);
    }
  };

  const analyzeSentiment = async () => {
    if (!file && !pdfText) {
      toast.error("Please upload a PDF file or enter journal text first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    try {
      toast.info("Starting document analysis with BERT...");
      const results = await analyzePdfContent(file!, pdfText);
      console.log("BERT Analysis results:", results);
      
      // Add pdfText to the results object for PDF export and ensure text property
      const resultsWithText = {
        ...results,
        pdfText: pdfText,
        text: pdfText || results.text // Ensure we have text property available
      };
      
      setSentimentData(resultsWithText);
      setFilteredPoints(results.embeddingPoints || []);
      setAnalysisComplete(true);
      
      const words = results.embeddingPoints
        .map((point: Point) => point.word)
        .filter((word: string, index: number, self: string[]) => 
          word && self.indexOf(word) === index
        )
        .sort();
      
      setUniqueWords(words);
      
      // Make sure points are exposed to window for visualization connection
      window.documentEmbeddingPoints = results.embeddingPoints;
      
      if (results.pdfTextLength > 0) {
        toast.success(`BERT analysis completed! Analyzed ${results.pdfTextLength} characters of text.`);
      } else {
        toast.success("BERT document analysis completed! All tabs are now available.");
      }
    } catch (error) {
      toast.error("Error analyzing document with BERT");
      console.error("BERT analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePointClick = (point: Point | null) => {
    if (!point) {
      setSelectedPoint(null);
      setSelectedWord(null);
      setConnectedPoints([]);
      return;
    }
    
    setSelectedPoint(point);
    setSelectedWord(point.word);
    
    if (point.relationships && point.relationships.length > 0) {
      const sortedRelationships = [...point.relationships]
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3);
        
      const connected = sentimentData.embeddingPoints
        .filter((p: Point) => sortedRelationships.some(rel => rel.id === p.id));
      
      setConnectedPoints(connected);
    } else {
      setConnectedPoints([]);
    }
    
    toast(`Selected: "${point.word}" (${point.emotionalTone || 'Neutral'})`);
  };

  const handleResetVisualization = () => {
    if (window.documentEmbeddingActions && window.documentEmbeddingActions.resetView) {
      window.documentEmbeddingActions.resetView();
      toast.info("Visualization reset to default view");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedWord(null);
  };

  const calculateRelationship = (point1: Point, point2: Point) => {
    if (!point1 || !point2) return null;
    
    const distance = Math.sqrt(
      Math.pow(point1.position[0] - point2.position[0], 2) +
      Math.pow(point1.position[1] - point2.position[1], 2) +
      Math.pow(point1.position[2] - point2.position[2], 2)
    );
    
    const spatialSimilarity = Math.max(0, 1 - (distance / 40));
    
    const sentimentDiff = Math.abs(point1.sentiment - point2.sentiment);
    const sentimentSimilarity = 1 - sentimentDiff;
    
    const sameEmotionalGroup = 
      (point1.emotionalTone || "Neutral") === (point2.emotionalTone || "Neutral");
    
    const point1Keywords = point1.keywords || [];
    const point2Keywords = point2.keywords || [];
    const sharedKeywords = point1Keywords.filter(k => point2Keywords.includes(k));
    
    return {
      spatialSimilarity,
      sentimentSimilarity,
      sameEmotionalGroup,
      sharedKeywords
    };
  };

  const handleCachedEntrySelect = (text: string) => {
    setPdfText(text);
    setJournalText(text);
    
    // Create a virtual "file" for the journal entry
    const fileName = `Journal_Entry_${new Date().toLocaleString().replace(/[/:\\]/g, '-')}`;
    setFile(new File([text], fileName, { type: "text/plain" }));
    
    // Clear existing results
    if (sentimentData) {
      setSentimentData(null);
      setSelectedPoint(null);
      setAnalysisComplete(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-yellow">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Perfect Life and Monthly Reflections - Side by Side */}
          <div className="grid md:grid-cols-2 gap-6">
            <PerfectLifePlan />
            <div className="bg-white p-4 rounded-lg">
              <MonthlyReflections 
                journalText={monthlyReflectionText} 
                refreshTrigger={refreshReflectionsTrigger}
                journalRefreshTrigger={refreshJournalTrigger}
              />
            </div>
          </div>
          
          {/* Journal Input Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg">
              <JournalInput 
                onJournalEntrySubmit={handleJournalEntrySubmit}
                onAddToMonthlyReflection={handleAddToMonthlyReflection}
              />
            </div>
            <div className="bg-white p-4 rounded-lg">
              <JournalCache 
                onSelectEntry={handleCachedEntrySelect} 
                refreshTrigger={refreshJournalTrigger}
              />
            </div>
          </div>
          
          {/* Document Analysis Section */}
          <DocumentAnalysisPanel
            file={file}
            pdfText={pdfText}
            isAnalyzing={isAnalyzing}
            onFileUpload={handleFileUpload}
            onAnalyzeClick={analyzeSentiment}
          />

          {/* Analysis Results Section */}
          {sentimentData && (
            <AnalysisResults
              sentimentData={sentimentData}
              pdfText={pdfText}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedPoint={selectedPoint}
              setSelectedPoint={setSelectedPoint}
              selectedWord={selectedWord}
              setSelectedWord={setSelectedWord}
              filteredPoints={filteredPoints}
              setFilteredPoints={setFilteredPoints}
              uniqueWords={uniqueWords}
              connectedPoints={connectedPoints}
              setConnectedPoints={setConnectedPoints}
              visibleClusterCount={visibleClusterCount}
              setVisibleClusterCount={setVisibleClusterCount}
              handlePointClick={handlePointClick}
              handleResetVisualization={handleResetVisualization}
              handleClearSearch={handleClearSearch}
              calculateRelationship={calculateRelationship}
              onJournalEntryAdded={handleJournalEntryAdded}
              onMonthlyReflectionAdded={handleMonthlyReflectionAdded}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
