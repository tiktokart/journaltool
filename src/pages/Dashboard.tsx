
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileUploader } from "@/components/FileUploader";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { WordComparison } from "@/components/WordComparison";
import * as pdfjs from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import { Point } from "@/types/embedding";
import { generateMockPoints } from "@/utils/embeddingUtils";
import { toast } from "sonner";

interface SentimentData {
  overallSentiment: {
    score: number;
    label: string;
  };
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  timeline: {
    page: number;
    score: number;
    text: string;
  }[];
  entities: {
    name: string;
    sentiment: number;
    mentions: number;
    contexts: string[];
  }[];
  keyPhrases: {
    phrase: string;
    relevance: number;
    sentiment: number;
    occurrences: number;
  }[];
}

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [relatedWords, setRelatedWords] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  }, []);

  const loadPdf = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => (item as any).str).join(" ");
          fullText += pageText + "\n";
        }
        setPdfText(fullText);
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF. Please try again.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getPdfText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const pdf = await pdfjs.getDocument(arrayBuffer).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => (item as any).str).join(" ");
            fullText += pageText + "\n";
          }
          resolve(fullText);
        } catch (error) {
          console.error("Error extracting text from PDF:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading PDF:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const analyzePdfContent = async (file: File) => {
    try {
      const text = await getPdfText(file);
      // Here you would send 'text' to your backend for sentiment analysis
      // and update the sentimentData state with the results.
      console.log("Extracted Text:", text);
      toast.success("Text extracted successfully! (Analysis not yet implemented)");
    } catch (error) {
      console.error("Error during PDF content analysis:", error);
      toast.error("Failed to analyze PDF content.");
    }
  };

  const extractMetadata = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        const metadata = await pdf.getMetadata();
        console.log("PDF Metadata:", metadata);
        toast.success("Metadata extracted successfully! (Display not yet implemented)");
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error extracting metadata:", error);
      toast.error("Failed to extract metadata.");
    }
  };

  const calculateSentiment = async (text: string) => {
    // Placeholder for sentiment calculation
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() * 2 - 1; // Returns a score between -1 and 1
  };

  useEffect(() => {
    if (sentimentData && pdfText) {
      const wordPoints = generateMockPoints(pdfText, {
        overallSentiment: sentimentData.overallSentiment,
        distribution: sentimentData.distribution,
        timeline: sentimentData.timeline,
        entities: sentimentData.entities,
        keyPhrases: sentimentData.keyPhrases,
        sourceDescription: fileName || "Uploaded Document"
      });
      
      setPoints(wordPoints);
    }
  }, [sentimentData, pdfText, fileName]);

  const handleFileUpload = (files: File[], extractedText?: string) => {
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
      setFileName(file.name);
      
      if (extractedText) {
        setPdfText(extractedText);
      } else {
        loadPdf(file);
      }
      
      setActiveTab("overview");
      toast.success("File uploaded successfully!");
    }
  };

  const analyzeSentiment = async () => {
    if (!file) return;
    
    try {
      setIsAnalyzing(true);
      
      const positiveVal = Math.random() * 0.4 + 0.3; // 0.3 to 0.7
      const negativeVal = Math.random() * 0.3; // 0 to 0.3
      const neutralVal = 1 - positiveVal - negativeVal; // Calculate neutral to make sum = 1
      
      const mockSentimentData: SentimentData = {
        overallSentiment: {
          score: Math.random() * 0.6 + 0.2, // 0.2 to 0.8
          label: (Math.random() * 0.6 + 0.2) < 0.4 ? "Negative" : (Math.random() * 0.6 + 0.2) > 0.6 ? "Positive" : "Neutral"
        },
        distribution: {
          positive: positiveVal,
          neutral: neutralVal,
          negative: negativeVal
        },
        timeline: Array.from({ length: 10 }, (_, i) => ({
          page: i + 1,
          score: 0.2 + Math.random() * 0.6, // 0.2 to 0.8
          text: pdfText?.substring(i * 50, (i + 1) * 50) || "Text segment"
        })),
        entities: [
          {
            name: "Anxiety",
            sentiment: Math.random() * 0.4 + 0.1, // 0.1 to 0.5
            mentions: Math.floor(Math.random() * 10) + 1,
            contexts: ["Context 1", "Context 2"]
          },
          {
            name: "Therapy",
            sentiment: Math.random() * 0.4 + 0.5, // 0.5 to 0.9
            mentions: Math.floor(Math.random() * 8) + 1,
            contexts: ["Context 1", "Context 2"]
          },
          {
            name: "Sleep",
            sentiment: Math.random() * 0.6 + 0.2, // 0.2 to 0.8
            mentions: Math.floor(Math.random() * 5) + 1,
            contexts: ["Context 1", "Context 2"]
          }
        ],
        keyPhrases: [
          {
            phrase: "mental health",
            relevance: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
            sentiment: Math.random() * 0.4 + 0.5, // 0.5 to 0.9
            occurrences: Math.floor(Math.random() * 10) + 1
          },
          {
            phrase: "feeling anxious",
            relevance: Math.random() * 0.3 + 0.6, // 0.6 to 0.9
            sentiment: Math.random() * 0.3, // 0 to 0.3
            occurrences: Math.floor(Math.random() * 8) + 1
          },
          {
            phrase: "therapy session",
            relevance: Math.random() * 0.2 + 0.7, // 0.7 to 0.9
            sentiment: Math.random() * 0.4 + 0.5, // 0.5 to 0.9
            occurrences: Math.floor(Math.random() * 5) + 1
          }
        ]
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSentimentData(mockSentimentData);
      setAnalysisComplete(true);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      toast.error("Error analyzing sentiment");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    const related = getRelatedWords(word);
    setRelatedWords(related);
  };

  const handleResetComparison = () => {
    setSelectedWord(null);
    setRelatedWords([]);
  };

  const getRelatedWords = (word: string): string[] => {
    // Placeholder for related word retrieval logic
    return [`${word}-related1`, `${word}-related2`, `${word}-related3`];
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-8">
          <Card className="shadow-md border-border">
            <CardHeader>
              <CardTitle>Upload and Analyze</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader 
                onFilesAdded={handleFileUpload}
                fileInputRef={fileInputRef}
              />
              {file && (
                <div className="mt-4">
                  <p>File: {fileName}</p>
                  <Button 
                    onClick={analyzeSentiment} 
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {analysisComplete && sentimentData && (
            <Card className="shadow-md border-border">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
                  <TabsList className="overflow-x-auto w-full justify-start">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="themes">Themes</TabsTrigger>
                    <TabsTrigger value="keyphrases">Key Words</TabsTrigger>
                    <TabsTrigger value="wordcomparison">Word Comparison</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-6">
                    <SentimentOverview 
                      data={{
                        overallSentiment: sentimentData.overallSentiment,
                        distribution: sentimentData.distribution,
                        fileName: fileName || "Uploaded Document"
                      }}
                      sourceDescription={fileName || "Uploaded Document"}
                    />
                  </TabsContent>
                  
                  <TabsContent value="timeline" className="mt-6">
                    <SentimentTimeline 
                      data={sentimentData.timeline}
                      sourceDescription={fileName || "Uploaded Document"}
                    />
                  </TabsContent>
                  
                  <TabsContent value="themes" className="mt-6">
                    <EntitySentiment 
                      data={sentimentData.entities}
                      sourceDescription={fileName || "Uploaded Document"}
                    />
                  </TabsContent>
                  
                  <TabsContent value="keyphrases" className="mt-6">
                    <KeyPhrases 
                      data={sentimentData.keyPhrases}
                      sourceDescription={fileName || "Uploaded Document"}
                    />
                  </TabsContent>
                  
                  <TabsContent value="wordcomparison" className="mt-6">
                    <WordComparison 
                      words={selectedWord ? [
                        {
                          id: "selected-word",
                          word: selectedWord,
                          color: [0.5, 0.5, 0.8],
                          sentiment: 0.7,
                          emotionalTone: "Positive"
                        }
                      ] : []}
                      onRemoveWord={() => handleResetComparison()}
                      calculateRelationship={() => ({
                        spatialSimilarity: 0.7,
                        sentimentSimilarity: 0.8,
                        sameEmotionalGroup: true,
                        sharedKeywords: ["keyword1", "keyword2"]
                      })}
                      sourceDescription={fileName || "Uploaded Document"}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
          
          {points.length > 0 && (
            <Card className="shadow-md border-border">
              <CardHeader>
                <CardTitle>Document Embedding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[600px]">
                  <DocumentEmbedding 
                    points={points}
                    onPointClick={(point) => console.log("Clicked point:", point)}
                    isInteractive={true}
                    focusOnWord={null}
                    sourceDescription={fileName || "Uploaded Document"}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
