import { useState, useEffect } from "react";
import { Point } from "@/types/embedding";
import { toast } from "sonner";
import { processBertAnalysis, saveBertAnalysisToJournal } from "@/utils/bertDataFlow";

export function useAnalysisState(
  onJournalEntryAdded?: () => void
) {
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
  
  // Initialize uniqueWords from points with emotional data
  useEffect(() => {
    if (sentimentData?.embeddingPoints && sentimentData.embeddingPoints.length > 0) {
      console.log("Setting up unique words from embedding points", sentimentData.embeddingPoints.length);
      
      // Clean up emotion labels by removing "Theme" suffix - more aggressive cleaning
      const cleanedPoints = sentimentData.embeddingPoints.map((point: Point) => {
        // Remove any "Theme" suffix from emotional tones
        let cleanedTone = point.emotionalTone;
        if (cleanedTone && typeof cleanedTone === 'string') {
          cleanedTone = cleanedTone.replace(/\s*Theme\s*$/i, '');
        }
        return {
          ...point,
          emotionalTone: cleanedTone || point.emotionalTone
        };
      });
      
      const words = cleanedPoints
        .filter((point: Point) => point.word && point.emotionalTone)
        .map((point: Point) => point.word || "");
        
      // Fixed TS error by ensuring we have array of strings
      setUniqueWords([...new Set(words)] as string[]);
      setFilteredPoints(cleanedPoints);
      
      console.log("Cleaned points for analysis:", cleanedPoints.slice(0, 5));
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
      
      console.log("Starting analysis with text length:", text.length);
      
      // Process text through BERT analysis pipeline
      const analysis = await processBertAnalysis(
        text,
        file?.name || "",
        file?.size || 0,
        sourceDescription
      );
      
      console.log("Analysis complete with results:", {
        bertKeywordsCount: analysis.keywords?.length,
        embeddingPointsCount: analysis.embeddingPoints?.length,
        distribution: analysis.distribution
      });
      
      // Clean up emotion labels by removing "Theme" suffix
      if (analysis.keywords) {
        analysis.keywords = analysis.keywords.map((kw: any) => ({
          ...kw,
          tone: kw.tone?.replace(/\s*Theme\s*$/i, '') || kw.tone
        }));
      }
      
      if (analysis.embeddingPoints) {
        analysis.embeddingPoints = analysis.embeddingPoints.map((point: Point) => ({
          ...point,
          emotionalTone: point.emotionalTone?.replace(/\s*Theme\s*$/i, '') || point.emotionalTone
        }));
      }
      
      // Update state with analysis results
      setSentimentData({
        ...analysis,
        pdfText: text,
        dataSource: "uploaded", // Mark data as coming from upload
        totalWordCount: text.split(/\s+/).filter(word => word.trim().length > 0).length
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

  return {
    file,
    pdfText,
    isAnalyzing,
    sentimentData,
    filteredPoints,
    selectedPoint,
    selectedWord,
    searchTerm,
    uniqueWords,
    activeTab,
    visibleClusterCount,
    connectedPoints,
    dataSource,
    setFilteredPoints,
    setSelectedPoint,
    setSelectedWord,
    setSearchTerm,
    setActiveTab,
    setConnectedPoints,
    handleFileUpload,
    handleAnalyzeClick,
    handlePointClick,
    handleResetVisualization,
    handleClearSearch,
    handleSaveToJournal
  };
}
