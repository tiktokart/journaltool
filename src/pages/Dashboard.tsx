
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/FileUploader";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";
import { Point } from "@/types/embedding";
import { generateMockPoints } from "@/utils/embeddingUtils";
import { analyzePdfContent } from "@/utils/documentAnalysis";
import { WordComparisonController } from "@/components/WordComparisonController";
import { DocumentSummary } from "@/components/DocumentSummary";
import { EmotionalClustersControl } from "@/components/EmotionalClustersControl";
import { FileInfoDisplay } from "@/components/FileInfoDisplay";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { PdfExport } from "@/components/PdfExport";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
import { analyzeTextWithGemma3 } from "@/utils/gemma3SentimentAnalysis";
import { WellbeingResources } from "@/components/WellbeingResources";
import { JournalInput } from "@/components/JournalInput";
import { JournalCache } from "@/components/JournalCache";
import { v4 as uuidv4 } from 'uuid';

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
  const [analysisMethod, setAnalysisMethod] = useState<"bert" | "gemma3">("bert");
  const [journalText, setJournalText] = useState<string>("");

  // Load analysis method preference
  useEffect(() => {
    const storedMethod = localStorage.getItem("analysisMethod");
    if (storedMethod === "gemma3" || storedMethod === "bert") {
      setAnalysisMethod(storedMethod as "bert" | "gemma3");
    }
  }, []);

  // Save analysis method preference
  useEffect(() => {
    if (analysisMethod) {
      localStorage.setItem("analysisMethod", analysisMethod);
    }
  }, [analysisMethod]);

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
      toast.success("Journal entry saved");
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error("Failed to save journal entry");
    }
  };

  const analyzeSentiment = async () => {
    if (!file && !pdfText) {
      toast.error("Please upload a PDF file or enter journal text first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisMethod("bert");
    
    try {
      toast.info("Starting document analysis with BERT...");
      const results = await analyzePdfContent(file!, pdfText);
      console.log("BERT Analysis results:", results);
      
      // Add pdfText to the results object for PDF export
      const resultsWithText = {
        ...results,
        pdfText: pdfText
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

  const analyzeWithGemma3 = async () => {
    if (!file && !pdfText) {
      toast.error("Please upload a PDF file or enter journal text first");
      return;
    }

    if (!pdfText || pdfText.trim().length === 0) {
      toast.error("No readable text found to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisMethod("gemma3");
    
    try {
      toast.info("Starting document analysis with Gemma 3...");
      
      const gemma3Results = await analyzeTextWithGemma3(pdfText);
      
      // Extract significant words from the text for visualization
      const significantWords = pdfText
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter((word, i, arr) => arr.indexOf(word) === i);
      
      // Use all significant words for visualization, with reasonable limit
      const wordLimit = Math.min(500, significantWords.length);
      const filteredSignificantWords = significantWords.slice(0, wordLimit);
      
      // Create embedding points using actual text from the document
      const mockPoints = generateMockPoints(false, filteredSignificantWords.length);
      
      // Assign real words from the document to the points instead of random words
      const embeddingPoints = mockPoints.map((point, index) => {
        const emotionalToneEntries = Object.entries(gemma3Results.emotionalTones);
        const sortedTones = emotionalToneEntries.sort((a, b) => b[1] - a[1]);
        
        // Assign emotional tones based on sentiment scores
        let emotionalTone;
        const random = Math.random();
        
        if (random < 0.7) {
          // 70% chance to get one of the top 2 emotional tones
          const topIndex = Math.floor(Math.random() * Math.min(2, sortedTones.length));
          emotionalTone = sortedTones[topIndex][0];
        } else {
          // 30% chance to get any other emotional tone
          const randomIndex = Math.floor(Math.random() * sortedTones.length);
          emotionalTone = sortedTones[randomIndex][0];
        }
        
        // Assign the actual word from the document
        const wordIndex = index % filteredSignificantWords.length;
        
        return {
          ...point,
          word: filteredSignificantWords[wordIndex],
          emotionalTone,
          relationships: mockPoints
            .filter(p => p.id !== point.id)
            .slice(0, 5)
            .map(p => ({ id: p.id, strength: Math.random() }))
        };
      });
      
      // Calculate sentiment distribution
      const positivePercentage = Math.round(gemma3Results.sentiment * 100);
      const negativePercentage = Math.round((1 - gemma3Results.sentiment) * 0.5 * 100);
      const neutralPercentage = 100 - positivePercentage - negativePercentage;
      
      const fileName = file ? file.name : `Journal_Entry_${new Date().toLocaleString().replace(/[/:\\]/g, '-')}`;
      const fileSize = file ? file.size : new Blob([pdfText]).size;
      
      const results = {
        fileName,
        fileSize,
        wordCount: pdfText.split(/\s+/).length,
        pdfTextLength: pdfText.length,
        pdfText: pdfText,
        sentiment: gemma3Results.sentiment,
        summary: gemma3Results.summary || "Analysis complete with Gemma 3 model.",
        embeddingPoints,
        sourceDescription: "Analyzed with Gemma 3 Model",
        overallSentiment: {
          score: gemma3Results.sentiment,
          label: gemma3Results.sentiment > 0.6 ? "Positive" : (gemma3Results.sentiment > 0.4 ? "Neutral" : "Negative")
        },
        distribution: {
          positive: positivePercentage,
          neutral: neutralPercentage,
          negative: negativePercentage
        },
        timeline: gemma3Results.timeline || [],
        entities: gemma3Results.entities || [],
        keyPhrases: gemma3Results.keyPhrases || []
      };
      
      console.log("Gemma 3 analysis results:", results);
      setSentimentData(results);
      setFilteredPoints(results.embeddingPoints || []);
      setAnalysisComplete(true);
      
      const uniqueResultWords = results.embeddingPoints
        .map((point: Point) => point.word)
        .filter((word: string, index: number, self: string[]) => 
          word && self.indexOf(word) === index
        )
        .sort();
      
      setUniqueWords(uniqueResultWords);
      
      toast.success(`Gemma 3 analysis completed! Analyzed ${results.pdfTextLength} characters and found ${filteredSignificantWords.length} unique words.`);
    } catch (error) {
      toast.error("Error analyzing document with Gemma 3");
      console.error("Gemma 3 analysis error:", error);
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Journal Input Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <JournalInput onJournalEntrySubmit={handleJournalEntrySubmit} />
            <JournalCache onSelectEntry={handleCachedEntrySelect} />
          </div>
          
          <Card className="border border-border shadow-md bg-card">
            <CardHeader>
              <CardTitle>Document Analysis with Data Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FileUploader onFilesAdded={handleFileUpload} />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Selected File</h3>
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : "No file selected"}
                    </p>
                    {file && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                    {pdfText && pdfText.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {pdfText.split(/\s+/).length} words extracted
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={analyzeSentiment} 
                      disabled={(!file && !pdfText) || isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing && analysisMethod === "bert" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing with BERT...
                        </>
                      ) : "Analyze with BERT"}
                    </Button>
                    <Button 
                      onClick={analyzeWithGemma3} 
                      disabled={(!file && !pdfText) || isAnalyzing}
                      variant="outline"
                      className="w-full"
                    >
                      {isAnalyzing && analysisMethod === "gemma3" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing with Gemma 3...
                        </>
                      ) : "Analyze with Gemma 3"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {sentimentData && (
            <div className="animate-fade-in">
              <FileInfoDisplay 
                fileName={sentimentData.fileName}
                fileSize={sentimentData.fileSize}
                wordCount={sentimentData.wordCount}
              />
              
              <DocumentSummary summary={sentimentData.summary} />
              
              <AnalysisTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sentimentData={sentimentData}
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
                handlePointClick={handlePointClick}
                handleResetVisualization={handleResetVisualization}
                handleClearSearch={handleClearSearch}
              />
              
              <div className="mt-8 mb-4">
                <EmotionalClustersControl 
                  visibleClusterCount={visibleClusterCount}
                  setVisibleClusterCount={setVisibleClusterCount}
                  activeTab={activeTab}
                />
              </div>
              
              <div className="mt-8 mb-4">
                <TextEmotionViewer 
                  pdfText={pdfText}
                  embeddingPoints={sentimentData.embeddingPoints}
                  sourceDescription={sentimentData.sourceDescription}
                />
              </div>
              
              <div className="mt-8 mb-4">
                <WordComparisonController 
                  points={sentimentData.embeddingPoints}
                  selectedPoint={selectedPoint}
                  sourceDescription={sentimentData.sourceDescription}
                  calculateRelationship={calculateRelationship}
                />
              </div>
              
              <div className="mt-8">
                <WellbeingResources embeddingPoints={sentimentData.embeddingPoints} />
              </div>
              
              <PdfExport sentimentData={sentimentData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
