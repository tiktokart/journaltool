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
import { WellbeingResources } from "@/components/WellbeingResources";
import { WordComparisonController } from "@/components/WordComparisonController";
import { DocumentSummary } from "@/components/DocumentSummary";
import { EmotionalClustersControl } from "@/components/EmotionalClustersControl";
import { FileInfoDisplay } from "@/components/FileInfoDisplay";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { analyzeTextWithGemma3 } from "@/utils/gemma3SentimentAnalysis";

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

  const analyzeSentiment = async () => {
    if (!file) {
      toast.error("Please upload a PDF file first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    try {
      toast.info("Starting document analysis with BERT...");
      const results = await analyzePdfContent(file, pdfText);
      console.log("Analysis results:", results); // Debug the results
      setSentimentData(results);
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
        toast.success(`BERT analysis completed! Analyzed ${results.pdfTextLength} characters of text from your PDF.`);
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
    if (!file) {
      toast.error("Please upload a PDF file first");
      return;
    }

    if (!pdfText || pdfText.trim().length === 0) {
      toast.error("No readable text found in the PDF");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    try {
      toast.info("Starting document analysis with Gemma 3...");
      
      const gemma3Results = await analyzeTextWithGemma3(pdfText);
      
      const mockPoints = generateMockPoints(pdfText, 150, gemma3Results.sentiment);
      
      const embeddingPoints = mockPoints.map(point => {
        const emotionalToneEntries = Object.entries(gemma3Results.emotionalTones);
        const sortedTones = emotionalToneEntries.sort((a, b) => b[1] - a[1]);
        
        const randomIndex = Math.floor(Math.random() * Math.min(3, sortedTones.length));
        const emotionalTone = sortedTones[randomIndex][0];
        
        return {
          ...point,
          emotionalTone,
          relationships: mockPoints
            .filter(p => p.id !== point.id)
            .slice(0, 5)
            .map(p => ({ id: p.id, strength: Math.random() }))
        };
      });
      
      const results = {
        fileName: file.name,
        fileSize: file.size,
        wordCount: pdfText.split(/\s+/).length,
        pdfTextLength: pdfText.length,
        sentiment: gemma3Results.sentiment,
        summary: `This document has an overall sentiment score of ${(gemma3Results.sentiment * 10).toFixed(1)}/10. The dominant emotional tones are ${Object.entries(gemma3Results.emotionalTones)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tone]) => tone)
          .join(", ")}.`,
        embeddingPoints,
        sourceDescription: "Analyzed with Gemma 3 Model"
      };
      
      console.log("Gemma 3 analysis results:", results);
      setSentimentData(results);
      setFilteredPoints(results.embeddingPoints || []);
      setAnalysisComplete(true);
      
      const words = results.embeddingPoints
        .map((point: Point) => point.word)
        .filter((word: string, index: number, self: string[]) => 
          word && self.indexOf(word) === index
        )
        .sort();
      
      setUniqueWords(words);
      
      toast.success(`Gemma 3 analysis completed! Analyzed ${results.pdfTextLength} characters of text from your PDF.`);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8">
          <Card className="border border-border shadow-md bg-card">
            <CardHeader>
              <CardTitle>Document Analysis with Data Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FileUploader onFilesAdded={handleFileUpload} />
                </div>
                <div className="flex flex-col justify-between space-y-4">
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
                      disabled={!file || isAnalyzing}
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
                      disabled={!file || isAnalyzing}
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
                <WordComparisonController 
                  points={sentimentData.embeddingPoints}
                  selectedPoint={selectedPoint}
                  sourceDescription={sentimentData.sourceDescription}
                  calculateRelationship={calculateRelationship}
                />
              </div>
              
              <div className="mt-8">
                <WellbeingResources />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
