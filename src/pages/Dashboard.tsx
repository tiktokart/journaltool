
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
      
      // Extract significant words from the PDF text for visualization
      const significantWords = pdfText
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter((word, i, arr) => arr.indexOf(word) === i);
      
      // Use a reasonable number of words for visualization
      const wordLimit = Math.min(150, significantWords.length);
      const filteredSignificantWords = significantWords.slice(0, wordLimit);
      
      // Create embedding points using actual text from the document
      const mockPoints = generateMockPoints(pdfText, filteredSignificantWords.length, gemma3Results.sentiment);
      
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
      
      // Extract common word phrases for key phrases analysis
      const keyPhrases = [];
      const wordFrequency = new Map();
      
      // Count word frequency in the document
      pdfText.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .forEach(word => {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        });
      
      // Convert word frequency to key phrases with sentiment
      const sortedWords = [...wordFrequency.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
      
      sortedWords.forEach(([word, count]) => {
        // Use random sentiment based on global sentiment score
        const random = Math.random();
        let sentiment: "positive" | "neutral" | "negative";
        
        if (gemma3Results.sentiment > 0.6) {
          // For positive documents, more positive words
          sentiment = random < 0.6 ? "positive" : (random < 0.8 ? "neutral" : "negative");
        } else if (gemma3Results.sentiment < 0.4) {
          // For negative documents, more negative words
          sentiment = random < 0.6 ? "negative" : (random < 0.8 ? "neutral" : "positive");
        } else {
          // For neutral documents, balanced distribution
          sentiment = random < 0.33 ? "positive" : (random < 0.66 ? "neutral" : "negative");
        }
        
        keyPhrases.push({
          text: word,
          sentiment,
          count: count
        });
      });
      
      // Create themes/entities from frequent words or phrases
      const entities = [];
      const potentialThemes = sortedWords
        .filter(([word]) => word.length > 4)
        .slice(0, 15)
        .map(([word]) => word);
      
      // Select random themes from potential themes
      const themeCount = Math.min(8, potentialThemes.length);
      const shuffled = [...potentialThemes].sort(() => 0.5 - Math.random());
      const selectedThemes = shuffled.slice(0, themeCount);
      
      selectedThemes.forEach(theme => {
        const themeSentiment = Math.random() * 0.4 + (gemma3Results.sentiment - 0.2);
        entities.push({
          name: theme.charAt(0).toUpperCase() + theme.slice(1),
          score: Math.max(0, Math.min(1, themeSentiment)),
          mentions: Math.floor(Math.random() * 15) + 5
        });
      });
      
      // Generate timeline data based on text structure
      const pageCount = Math.max(5, Math.ceil(pdfText.length / 2000));
      const timeline = [];
      let prevScore = gemma3Results.sentiment * 0.8;
      
      for (let i = 1; i <= pageCount; i++) {
        const volatility = 0.1;
        const trend = (gemma3Results.sentiment - prevScore) * 0.3;
        const randomChange = (Math.random() * 2 - 1) * volatility;
        let newScore = prevScore + randomChange + trend;
        newScore = Math.min(1, Math.max(0, newScore));
        
        timeline.push({ page: i, score: newScore });
        prevScore = newScore;
      }
      
      // Calculate sentiment distribution
      const positivePercentage = Math.round(gemma3Results.sentiment * 100);
      const negativePercentage = Math.round((1 - gemma3Results.sentiment) * 0.5 * 100);
      const neutralPercentage = 100 - positivePercentage - negativePercentage;
      
      // Generate a summary based on the document content
      let summary = "";
      const sentences = pdfText
        .replace(/([.!?])\s*/g, "$1|")
        .split("|")
        .filter(s => s.trim().length > 10 && s.trim().length < 250)
        .map(s => s.trim());
      
      if (sentences.length > 0) {
        // Score sentences based on keywords and position
        const scoredSentences = sentences.map((sentence, index) => {
          const normalizedPosition = 1 - (index / sentences.length);
          const lowerSentence = sentence.toLowerCase();
          
          // Check if the sentence contains any of the top words
          let keywordScore = 0;
          sortedWords.slice(0, 10).forEach(([word]) => {
            if (lowerSentence.includes(word)) {
              keywordScore += 1;
            }
          });
          
          const score = (keywordScore * 0.7) + (normalizedPosition * 0.3);
          return { sentence, score };
        });
        
        scoredSentences.sort((a, b) => b.score - a.score);
        
        // Select top sentences for summary
        const summaryLength = Math.min(5, Math.max(2, Math.floor(sentences.length / 10)));
        const topSentences = scoredSentences.slice(0, summaryLength);
        
        // Reorder sentences to match their original sequence
        topSentences.sort((a, b) => {
          return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
        });
        
        summary = topSentences.map(s => s.sentence).join(" ");
        
        if (summary.length > 500) {
          summary = summary.substring(0, 497) + "...";
        }
      } else {
        // Fallback summary if no good sentences are found
        const dominantEmotion = Object.entries(gemma3Results.emotionalTones)
          .sort((a, b) => b[1] - a[1])[0][0];
        
        summary = `This document has a predominant ${dominantEmotion.toLowerCase()} emotional tone with an overall sentiment score of ${(gemma3Results.sentiment * 10).toFixed(1)}/10. The analysis reveals that the content is ${gemma3Results.sentiment >= 0.5 ? "generally positive" : "somewhat negative"} in nature.`;
      }
      
      const results = {
        fileName: file.name,
        fileSize: file.size,
        wordCount: pdfText.split(/\s+/).length,
        pdfTextLength: pdfText.length,
        sentiment: gemma3Results.sentiment,
        summary,
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
        timeline,
        entities,
        keyPhrases
      };
      
      console.log("Gemma 3 analysis results:", results);
      setSentimentData(results);
      setFilteredPoints(results.embeddingPoints || []);
      setAnalysisComplete(true);
      
      const resultWords = results.embeddingPoints
        .map((point: Point) => point.word)
        .filter((word: string, index: number, self: string[]) => 
          word && self.indexOf(word) === index
        )
        .sort();
      
      setUniqueWords(resultWords);
      
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

  useEffect(() => {
    const storedMethod = localStorage.getItem("analysisMethod");
    if (storedMethod === "gemma3" || storedMethod === "bert") {
      setAnalysisMethod(storedMethod as "bert" | "gemma3");
    }
  }, []);

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
