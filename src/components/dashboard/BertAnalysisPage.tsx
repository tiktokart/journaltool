
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DocumentAnalysisPanel from "@/components/dashboard/DocumentAnalysisPanel";
import AnalysisResults from "@/components/dashboard/AnalysisResults";
import { Point } from "@/types/embedding";
import { toast } from "sonner";
import { processBertAnalysis, saveBertAnalysisToJournal } from "@/utils/bertDataFlow";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";

interface BertAnalysisPageProps {
  onJournalEntryAdded?: () => void;
  onMonthlyReflectionAdded?: () => void;
}

const BertAnalysisPage = ({
  onJournalEntryAdded,
  onMonthlyReflectionAdded
}: BertAnalysisPageProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [uniqueWords, setUniqueWords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("analysis");
  const [visibleClusterCount, setVisibleClusterCount] = useState<number>(8);
  const [connectedPoints, setConnectedPoints] = useState<Point[]>([]);
  const [dataSource, setDataSource] = useState<string>("uploaded");
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize uniqueWords from points with emotional data
  useEffect(() => {
    if (sentimentData?.embeddingPoints && sentimentData.embeddingPoints.length > 0) {
      const words = sentimentData.embeddingPoints
        .filter((point: Point) => point.word && point.emotionalTone)
        .map((point: Point) => point.word || "");
        
      // Fixed TS error by ensuring we have array of strings
      setUniqueWords([...new Set(words)] as string[]);
      setFilteredPoints(sentimentData.embeddingPoints);
    }
  }, [sentimentData?.embeddingPoints]);
  
  const handleFileUpload = (files: File[], extractedText?: string) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      
      if (extractedText) {
        setPdfText(extractedText);
        setDataSource("uploaded"); // Mark that we're using uploaded data
      }
    }
  };
  
  const handleAnalyzeClick = async () => {
    if (!file && !pdfText) {
      toast.error("Please upload a file or enter text to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const text = pdfText || "Sample text for analysis";
      const sourceDescription = ""; // Remove file description from visualization
      
      // Process text through BERT analysis pipeline
      const analysis = await processBertAnalysis(
        text,
        file?.name || "",
        file?.size || 0,
        sourceDescription
      );
      
      // Update state with analysis results
      setSentimentData({
        ...analysis,
        pdfText: text,
        dataSource: "uploaded" // Mark data as coming from upload
      });
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Error analyzing text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handlePointClick = (point: Point | null) => {
    setSelectedPoint(point);
    
    if (!point) {
      setSelectedWord(null);
      return;
    }
    
    setSelectedWord(point.word || null);
  };
  
  const handleResetVisualization = () => {
    setSelectedPoint(null);
    setSelectedWord(null);
    setSearchTerm("");
    setFilteredPoints(sentimentData?.embeddingPoints || []);
  };
  
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredPoints(sentimentData?.embeddingPoints || []);
  };
  
  const handleSaveToJournal = () => {
    if (!sentimentData) return;
    
    try {
      // Save to journal entries
      saveBertAnalysisToJournal(sentimentData);
      
      toast.success("Analysis saved to journal entries!");
      
      // Notify parent component
      if (onJournalEntryAdded) {
        onJournalEntryAdded();
      }
    } catch (error) {
      console.error("Error saving to journal:", error);
      toast.error("Error saving to journal. Please try again.");
    }
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6" ref={containerRef}>
      <h1 className="text-2xl font-bold mb-6">Emotional Analysis</h1>
      
      <DocumentAnalysisPanel
        file={file}
        pdfText={pdfText}
        isAnalyzing={isAnalyzing}
        onFileUpload={handleFileUpload}
        onAnalyzeClick={handleAnalyzeClick}
      />
      
      {sentimentData && (
        <>
          <div className="mt-8">
            <TextEmotionViewer 
              pdfText={sentimentData.pdfText || pdfText}
              embeddingPoints={sentimentData.embeddingPoints}
              bertAnalysis={sentimentData.bertAnalysis}
            />
          </div>
          
          <div className="mt-8">
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
              visibleClusterCount={visibleClusterCount}
              setVisibleClusterCount={setVisibleClusterCount}
              handlePointClick={handlePointClick}
              handleResetVisualization={handleResetVisualization}
              handleClearSearch={handleClearSearch}
              onJournalEntryAdded={onJournalEntryAdded}
              onMonthlyReflectionAdded={onMonthlyReflectionAdded}
              connectedPoints={connectedPoints}
              setConnectedPoints={setConnectedPoints}
            />
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleSaveToJournal}
              className="bg-green-600 hover:bg-green-700"
            >
              Save to Journal Entries
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default BertAnalysisPage;
