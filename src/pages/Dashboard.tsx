import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/FileUploader";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { Header } from "@/components/Header";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { toast } from "sonner";
import { Loader2, CircleDot, Search, FileText, X, GitCompareArrows, ArrowLeftRight, RotateCcw, BookOpen, Info, Settings, Heart, Brain } from "lucide-react";
import { Point } from "@/types/embedding";
import { generateMockPoints, getEmotionColor } from "@/utils/embeddingUtils";
import { WordComparison } from "@/components/WordComparison";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

const analyzePdfContent = (file: File, pdfText?: string): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileName = file.name.toLowerCase();
      const seed = fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      let customWordBank: string[] = [];
      let emotionalDistribution = {
        Joy: 0.15,
        Sadness: 0.25,
        Anger: 0.1,
        Fear: 0.2,
        Surprise: 0.05,
        Disgust: 0.05,
        Trust: 0.1,
        Anticipation: 0.1,
        Neutral: 0.0
      };
      
      if (pdfText && pdfText.length > 0) {
        console.log("Processing PDF text of length:", pdfText.length);
        
        const cleanText = pdfText
          .toLowerCase()
          .replace(/[^\\w\\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        const stopWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        customWordBank = cleanText
          .split(' ')
          .filter(word => word.length > 2 && !stopWords.has(word))
          .filter((word, index, self) => self.indexOf(word) === index)
          .slice(0, 200);
          
        console.log("Extracted unique words:", customWordBank.length);
        console.log("Sample words:", customWordBank.slice(0, 10));
        
        const emotionWords = {
          Joy: ['happy', 'joy', 'delight', 'pleased', 'glad', 'content', 'satisfied'],
          Sadness: ['sad', 'sorrow', 'unhappy', 'depressed', 'gloomy', 'miserable'],
          Anger: ['angry', 'mad', 'furious', 'outraged', 'annoyed', 'irritated'],
          Fear: ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried'],
          Surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'startled'],
          Disgust: ['disgusted', 'repulsed', 'revolted', 'appalled', 'distaste'],
          Trust: ['trust', 'believe', 'faith', 'confidence', 'reliable', 'depend'],
          Anticipation: ['expect', 'anticipate', 'look forward', 'await', 'hope']
        };
        
        const emotionCounts: Record<string, number> = {
          Joy: 0, Sadness: 0, Anger: 0, Fear: 0, Surprise: 0, Disgust: 0, Trust: 0, Anticipation: 0
        };
        
        const words = cleanText.split(' ');
        words.forEach(word => {
          for (const [emotion, keywords] of Object.entries(emotionWords)) {
            if (keywords.some(keyword => word.includes(keyword))) {
              emotionCounts[emotion] += 1;
            }
          }
        });
        
        const totalEmotionWords = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0) || 1;
        
        for (const emotion in emotionCounts) {
          if (totalEmotionWords > 0) {
            emotionalDistribution[emotion as keyof typeof emotionalDistribution] = 
              0.1 + (emotionCounts[emotion] / totalEmotionWords) * 0.7;
          }
        }
      } else {
        if (fileName.includes('happy') || fileName.includes('joy')) {
          emotionalDistribution.Joy = 0.4;
          emotionalDistribution.Sadness = 0.05;
        } else if (fileName.includes('sad') || fileName.includes('depress')) {
          emotionalDistribution.Sadness = 0.5;
          emotionalDistribution.Joy = 0.05;
        } else if (fileName.includes('anger') || fileName.includes('mad')) {
          emotionalDistribution.Anger = 0.4;
          emotionalDistribution.Trust = 0.05;
        } else if (fileName.includes('fear') || fileName.includes('anxiety')) {
          emotionalDistribution.Fear = 0.4;
          emotionalDistribution.Trust = 0.05;
        }
      }
      
      const overallSentiment = 
        (emotionalDistribution.Joy * 0.9) + 
        (emotionalDistribution.Trust * 0.8) + 
        (emotionalDistribution.Anticipation * 0.6) + 
        (emotionalDistribution.Surprise * 0.5) - 
        (emotionalDistribution.Sadness * 0.3) - 
        (emotionalDistribution.Fear * 0.3) - 
        (emotionalDistribution.Anger * 0.3) - 
        (emotionalDistribution.Disgust * 0.3);
      
      const normalizedSentiment = Math.min(1, Math.max(0, (overallSentiment + 1) / 2));
      
      const embeddingPoints = generateMockPoints(
        false, 
        emotionalDistribution, 
        customWordBank.length > 0 ? customWordBank : undefined
      );

      console.log("Generated embedding points:", embeddingPoints.length);
      console.log("Sample embedding words:", embeddingPoints.slice(0, 5).map(p => p.word));

      const positivePercentage = Math.round(normalizedSentiment * 100);
      const negativePercentage = Math.round((1 - normalizedSentiment) * 0.5 * 100);
      const neutralPercentage = 100 - positivePercentage - negativePercentage;

      const pageCount = pdfText ? Math.ceil(pdfText.length / 2000) : 5 + Math.floor((seed % 10));
      const timeline = [];
      let prevScore = normalizedSentiment * 0.8;

      for (let i = 1; i <= pageCount; i++) {
        const volatility = pdfText ? 0.1 : 0.15;
        const trend = (normalizedSentiment - prevScore) * 0.3;
        const randomChange = (Math.random() * 2 - 1) * volatility;
        let newScore = prevScore + randomChange + trend;
        newScore = Math.min(1, Math.max(0, newScore));

        timeline.push({ page: i, score: newScore });
        prevScore = newScore;
      }

      let themeNames = [
        "Work", "Family", "Health", "Relationships", 
        "Future", "Goals", "Education", "Friends",
        "Hobbies", "Travel", "Home", "Money"
      ];

      if (customWordBank.length > 20) {
        const potentialThemes = customWordBank.slice(0, 20);
        const selectedThemes = [];
        const themeCount = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < themeCount && i < potentialThemes.length; i++) {
          const randomIndex = Math.floor(Math.random() * potentialThemes.length);
          selectedThemes.push(potentialThemes[randomIndex]);
          potentialThemes.splice(randomIndex, 1);
        }

        themeNames = selectedThemes.map(theme => 
          theme.charAt(0).toUpperCase() + theme.slice(1)
        );
        
        console.log("Using custom themes from PDF:", themeNames);
      }

      const themes = [];
      const themeCount = Math.min(themeNames.length, 4 + Math.floor(Math.random() * 4));

      const usedThemeIndices = new Set();
      for (let i = 0; i < themeCount; i++) {
        let themeIndex;
        do {
          themeIndex = Math.floor(Math.random() * themeNames.length);
        } while (usedThemeIndices.has(themeIndex) && usedThemeIndices.size < themeNames.length);

        if (usedThemeIndices.size >= themeNames.length) break;
        usedThemeIndices.add(themeIndex);

        const variation = Math.random() * 0.4 - 0.2;
        const themeSentiment = Math.min(1, Math.max(0, normalizedSentiment + variation));

        themes.push({
          name: themeNames[themeIndex],
          score: themeSentiment,
          mentions: 5 + Math.floor(Math.random() * 20)
        });
      }

      const wordFrequency: Record<string, { count: number, sentiment: number, emotionalTone: string }> = {};
      embeddingPoints.forEach(point => {
        if (point.word) {
          if (!wordFrequency[point.word]) {
            wordFrequency[point.word] = { 
              count: 0, 
              sentiment: 0, 
              emotionalTone: point.emotionalTone || "Neutral" 
            };
          }
          wordFrequency[point.word].count += 1;
          wordFrequency[point.word].sentiment += point.sentiment;
        }
      });

      Object.keys(wordFrequency).forEach(word => {
        const entry = wordFrequency[word];
        entry.sentiment = entry.sentiment / entry.count;
      });

      const sortedWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 30);

      console.log("Top words with frequency:", sortedWords.slice(0, 5).map(([word, data]) => `${word}: ${data.count}`));

      const keyPhrases = sortedWords.map(([word, data]) => {
        let sentimentCategory: "positive" | "neutral" | "negative" = "neutral";
        if (data.sentiment >= 0.6) {
          sentimentCategory = "positive";
        } else if (data.sentiment <= 0.4) {
          sentimentCategory = "negative";
        }

        if (data.emotionalTone === "Neutral") {
          sentimentCategory = "neutral";
        }

        return {
          text: word,
          sentiment: sentimentCategory,
          count: data.count
        };
      });

      let summary = "";
      if (pdfText && pdfText.length > 0) {
        const sentences = pdfText
          .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
          .split("|")
          .filter(s => s.trim().length > 10)
          .slice(0, 20);
          
        const summaryLength = Math.min(5, Math.max(3, Math.floor(sentences.length / 4)));
        summary = sentences.slice(0, summaryLength).join(" ");
        
        if (summary.length > 500) {
          summary = summary.substring(0, 497) + "...";
        }
      } else {
        const dominantEmotion = Object.entries(emotionalDistribution)
          .sort((a, b) => b[1] - a[1])[0][0];
        
        const emotionSummaries = {
          Joy: "This document contains predominantly positive content, expressing optimism and satisfaction. The author appears to convey enthusiasm and positive outlook throughout.",
          Sadness: "The document expresses significant melancholy and disappointment. Several passages indicate feelings of loss or regret, with an overall somber tone.",
          Anger: "There are strong expressions of frustration and discontent throughout this document. The author appears to be addressing perceived injustices or grievances.",
          Fear: "Concerns and anxieties are prominent throughout this text. The author expresses worry about future outcomes and potential threats.",
          Surprise: "The document contains unexpected revelations and sudden shifts in perspective. The author seems to be processing unexpected information.",
          Disgust: "There are strong expressions of aversion and disapproval throughout. The author takes a critical stance toward the subject matter.",
          Trust: "Expressions of confidence and reliability dominate this document. The author establishes credibility and trustworthiness throughout.",
          Anticipation: "The document focuses on future possibilities and expectations. There's a forward-looking perspective throughout the content.",
          Neutral: "This document presents information in a balanced, objective manner. The content is primarily factual with minimal emotional expression."
        };
        
        summary = emotionSummaries[dominantEmotion as keyof typeof emotionSummaries];
      }

      const sourceDescription = pdfText && pdfText.length > 0 
        ? `Analysis based on ${customWordBank.length} unique words extracted from your PDF`
        : undefined;

      const analysisResults = {
        overallSentiment: {
          score: normalizedSentiment,
          label: normalizedSentiment >= 0.6 ? "Positive" : normalizedSentiment >= 0.4 ? "Neutral" : "Negative"
        },
        distribution: {
          positive: positivePercentage,
          neutral: neutralPercentage,
          negative: negativePercentage
        },
        timeline: timeline,
        entities: themes,
        keyPhrases: keyPhrases,
        embeddingPoints: embeddingPoints,
        fileName: file.name,
        fileSize: file.size,
        wordCount: customWordBank.length,
        pdfTextLength: pdfText ? pdfText.length : 0,
        summary: summary,
        sourceDescription: sourceDescription
      };

      resolve(analysisResults);
    }, 2000);
  });
};

const wellbeingSuggestions = [
  {
    title: "Practice Mindfulness",
    description: "Spend 5-10 minutes each day focusing on your breath and being present in the moment.",
    category: "Meditation",
    benefit: "Reduces stress and anxiety, improves focus and emotional regulation."
  },
  {
    title: "Connect with Others",
    description: "Reach out to a friend or family member you haven't spoken to in a while.",
    category: "Social Connection",
    benefit: "Strengthens relationships, reduces feelings of isolation."
  },
  {
    title: "Physical Activity",
    description: "Take a 20-minute walk outdoors or do a short home workout.",
    category: "Exercise",
    benefit: "Boosts mood, improves energy levels and overall health."
  },
  {
    title: "Digital Detox",
    description: "Set aside 1-2 hours before bed as screen-free time.",
    category: "Lifestyle",
    benefit: "Improves sleep quality and reduces mental fatigue."
  },
  {
    title: "Gratitude Practice",
    description: "Write down three things you're grateful for before going to sleep.",
    category: "Reflection",
    benefit: "Shifts focus to positive aspects of life, improves outlook."
  }
];

const mentalHealthResources = [
  {
    name: "Crisis Text Line",
    description: "Text HOME to 741741 to connect with a Crisis Counselor",
    category: "Crisis Support",
    contact: "Text 741741",
    website: "crisistextline.org"
  },
  {
    name: "National Suicide Prevention Lifeline",
    description: "24/7, free and confidential support for people in distress",
    category: "Crisis Support",
    contact: "1-800-273-8255",
    website: "suicidepreventionlifeline.org"
  },
  {
    name: "Psychology Today Therapist Finder",
    description: "Find therapists and counselors near you",
    category: "Professional Help",
    website: "psychologytoday.com/us/therapists"
  },
  {
    name: "Headspace",
    description: "Guided meditation and mindfulness app",
    category: "Self-help Apps",
    website: "headspace.com"
  },
  {
    name: "MoodTools",
    description: "Free app designed to help you combat depression and alleviate your negative moods",
    category: "Self-help Apps",
    website: "moodtools.org"
  }
];

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("embedding");
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [open, setOpen] = useState(false);
  const [uniqueWords, setUniqueWords] = useState<string[]>([]);
  const [pdfText, setPdfText] = useState<string>(""); 
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [connectedPoints, setConnectedPoints] = useState<Point[]>([]);
  const [compareWords, setCompareWords] = useState<Point[]>([]);
  const [compareSearchOpen, setCompareSearchOpen] = useState(false);
  const [compareSearchTerm, setCompareSearchTerm] = useState("");
  const [compareSearchResults, setCompareSearchResults] = useState<Point[]>([]);
  const [resourcesTab, setResourcesTab] = useState("wellbeing");
  const [visibleClusterCount, setVisibleClusterCount] = useState(8);
  
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
        setCompareWords([]);
        setCompareSearchResults([]);
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
    setCompareWords([]);
    setCompareSearchResults([]);
    
    try {
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
      
      setCompareSearchResults(results.embeddingPoints.slice(0, 15));
      
      if (results.pdfTextLength > 0) {
        toast.success(`Analysis completed! Analyzed ${results.pdfTextLength} characters of text from your PDF.`);
      } else {
        toast.success("Document analysis completed! All tabs are now available.");
      }
    } catch (error) {
      toast.error("Error analyzing document");
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePointClick = (point: Point) => {
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
  
  const handleSelectWord = (word: string) => {
    setSearchTerm(word);
    setSelectedWord(word);
    setOpen(false);
    
    if (sentimentData && sentimentData.embeddingPoints) {
      const selectedPoint = sentimentData.embeddingPoints.find(
        (point: Point) => point.word === word
      );
      
      if (selectedPoint) {
        setSelectedPoint(selectedPoint);
        
        if (selectedPoint.relationships && selectedPoint.relationships.length > 0) {
          const sortedRelationships = [...selectedPoint.relationships]
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 3);
            
          const connected = sentimentData.embeddingPoints
            .filter((p: Point) => sortedRelationships.some(rel => rel.id === p.id));
          
          setConnectedPoints(connected);
          toast(`Selected: "${selectedPoint.word}" (${selectedPoint.emotionalTone || 'Neutral'})`);
        } else {
          setConnectedPoints([]);
        }
      }
    }
  };
  
  const handleCompareSearchChange = (value: string) => {
    setCompareSearchTerm(value);
    
    if (!value.trim()) {
      setCompareSearchResults([]);
      return;
    }
    
    if (!sentimentData || !sentimentData.embeddingPoints) return;
    
    const results = sentimentData.embeddingPoints.filter((point: Point) => 
      (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase())) ||
      point.word.toLowerCase().includes(value.toLowerCase()) ||
      (point.keywords && point.keywords.some(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      ))
    );
    
    results.sort((a: Point, b: Point) => {
      const aEmotionMatch = a.emotionalTone && a.emotionalTone.toLowerCase().includes(value.toLowerCase());
      const bEmotionMatch = b.emotionalTone && b.emotionalTone.toLowerCase().includes(value.toLowerCase());
      
      if (aEmotionMatch && !bEmotionMatch) return -1;
      if (!aEmotionMatch && bEmotionMatch) return 1;
      return 0;
    });
    
    setCompareSearchResults(results);
  };

  const handleAddToComparison = (point: Point) => {
    if (compareWords.length >= 4) {
      toast.error("You can only compare up to 4 words");
      return;
    }
    
    if (compareWords.some(p => p.id === point.id)) {
      toast.info(`"${point.word}" is already in your comparison`);
      return;
    }
    
    setCompareWords([...compareWords, point]);
    setCompareSearchOpen(false);
    toast.success(`Added "${point.word}" to comparison`);
  };

  const handleRemoveFromComparison = (point: Point) => {
    setCompareWords(compareWords.filter(p => p.id !== point.id));
    toast.info(`Removed "${point.word}" from comparison`);
  };

  const handleClearComparison = () => {
    setCompareWords([]);
    toast.info("Cleared all comparison words");
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

  const handleResetVisualization = () => {
    if (window.documentEmbeddingActions && window.documentEmbeddingActions.resetView) {
      window.documentEmbeddingActions.resetView();
      toast.info("Visualization reset to default view");
    }
  };

  useEffect(() => {
    if (!sentimentData) return;
    
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredPoints(sentimentData.embeddingPoints || []);
      return;
    }
    
    const filtered = sentimentData.embeddingPoints.filter((point: Point) => {
      return point.word.toLowerCase().includes(term) || 
             (point.emotionalTone && point.emotionalTone.toLowerCase().includes(term));
    });
    
    setFilteredPoints(filtered);
  }, [searchTerm, sentimentData]);

  useEffect(() => {
    if (sentimentData && sentimentData.embeddingPoints) {
      setCompareSearchResults(sentimentData.embeddingPoints.slice(0, 15));
    }
  }, [sentimentData]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedWord(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8">
          <Card className="border border-border shadow-md bg-card">
            <CardHeader>
              <CardTitle>Document Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FileUploader onFilesAdded={handleFileUpload} />
                </div>
                <div className="flex flex-col justify-center space-y-4">
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
                  <Button 
                    onClick={analyzeSentiment} 
                    disabled={!file || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : "Analyze Document"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {sentimentData && (
            <div className="animate-fade-in">
              <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <span className="text-sm">
                  <span className="font-medium">Currently analyzing:</span> {sentimentData.fileName} ({(sentimentData.fileSize / 1024 / 1024).toFixed(2)} MB)
                  {sentimentData.wordCount > 0 && (
                    <> • <span className="font-medium">{sentimentData.wordCount}</span> unique words extracted</>
                  )}
                </span>
              </div>
              
              <Card className="mb-6 border border-border shadow-md bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-xl">Document Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {sentimentData.summary || "No summary available for this document."}
                  </div>
                </CardContent>
              </Card>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="overflow-x-auto">
                  <TabsList className="inline-flex w-full justify-start space-x-1 overflow-x-auto">
                    <TabsTrigger value="embedding" className="min-w-max">Latent Emotional Analysis</TabsTrigger>
                    <TabsTrigger value="overview" className="min-w-max">Overview</TabsTrigger>
                    <TabsTrigger value="timeline" className="min-w-max">Timeline</TabsTrigger>
                    <TabsTrigger value="themes" className="min-w-max">Themes</TabsTrigger>
                    <TabsTrigger value="keyphrases" className="min-w-max">Key Words</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="embedding" className="mt-6">
                  <Card className="border border-border shadow-md overflow-hidden bg-card">
                    <CardHeader className="z-10">
                      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
                        <CardTitle className="flex items-center">
                          <span>Latent Emotional Analysis</span>
                        </CardTitle>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleResetVisualization}
                            className="h-9"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset View
                          </Button>
                          
                          <div className="relative w-full md:w-64">
                            <div className="relative w-full">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="Search words or emotions..." 
                                className="pl-8 w-full pr-8"
                                value={searchTerm}
                                onChange={(e) => {
                                  setSearchTerm(e.target.value);
                                }}
                                onFocus={() => {
                                  if (uniqueWords.length > 0) {
                                    setOpen(true);
                                  }
                                }}
                              />
                              {searchTerm && (
                                <button 
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                  onClick={handleClearSearch}
                                >
                                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </button>
                              )}
                            </div>
                            {uniqueWords.length > 0 && open && (
                              <div className="absolute w-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 max-h-[300px] overflow-y-auto">
                                <Command>
                                  <CommandInput 
                                    placeholder="Search words..." 
                                    value={searchTerm}
                                    onValueChange={setSearchTerm}
                                  />
                                  <CommandList>
                                    <CommandEmpty>No results found</CommandEmpty>
                                    <CommandGroup>
                                      {uniqueWords
                                        .filter(word => word.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .slice(0, 100)
                                        .map((word) => (
                                          <CommandItem 
                                            key={word} 
                                            value={word}
                                            onSelect={handleSelectWord}
                                          >
                                            {word}
                                          </CommandItem>
                                        ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-normal flex items-center text-muted-foreground">
                        <CircleDot className="h-4 w-4 mr-2" />
                        <span>
                          Hover or click on words to see emotional relationships. Use the Reset View button when needed.
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[500px] relative">
                        <DocumentEmbedding 
                          points={filteredPoints}
                          onPointClick={handlePointClick}
                          isInteractive={true}
                          focusOnWord={selectedWord || null}
                          sourceDescription={sentimentData.sourceDescription}
                          onResetView={handleResetVisualization}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="overview" className="mt-6">
                  <SentimentOverview 
                    data={{
                      overallSentiment: sentimentData.overallSentiment,
                      distribution: sentimentData.distribution,
                      fileName: sentimentData.fileName
                    }}
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-6">
                  <SentimentTimeline 
                    data={sentimentData.timeline}
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="themes" className="mt-6">
                  <EntitySentiment 
                    data={sentimentData.entities}
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="keyphrases" className="mt-6">
                  <KeyPhrases 
                    data={sentimentData.keyPhrases}
                    sourceDescription={sentimentData.sourceDescription}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="mt-8 mb-4">
                <Card className="border border-border shadow-md bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Brain className="h-5 w-5 mr-2 text-primary" />
                      Emotional Clusters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        Adjust the number of emotional clusters visible in the visualization:
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">4</span>
                        <Slider 
                          value={[visibleClusterCount]} 
                          min={4}
                          max={12}
                          step={1}
                          onValueChange={(value) => setVisibleClusterCount(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">12</span>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium ml-2">
                          {visibleClusterCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 mb-4">
                <Card className="border border-border shadow-md bg-card">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center text-xl">
                        <GitCompareArrows className="h-5 w-5 mr-2 text-primary" />
                        Word Comparison
                      </CardTitle>
                      
                      <div className="flex gap-2">
                        <Popover open={compareSearchOpen} onOpenChange={setCompareSearchOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                              <Search className="h-4 w-4 mr-2" />
                              Add Word
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="end">
                            <Command>
                              <CommandInput 
                                placeholder="Search words..." 
                                value={compareSearchTerm}
                                onValueChange={handleCompareSearchChange}
                              />
                              <CommandList>
                                <CommandEmpty>No matching words</CommandEmpty>
                                <CommandGroup>
                                  {compareSearchResults.map((point) => (
                                    <CommandItem 
                                      key={point.id} 
                                      onSelect={() => handleAddToComparison(point)}
                                    >
                                      <div className="flex items-center">
                                        <div 
                                          className="w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                                          }} 
                                        />
                                        <span>{point.word}</span>
                                      </div>
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {point.emotionalTone || "Neutral"}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        {compareWords.length > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9"
                            onClick={handleClearComparison}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear All
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <WordComparison 
                      words={compareWords}
                      onRemoveWord={handleRemoveFromComparison}
                      calculateRelationship={calculateRelationship}
                      onAddWordClick={() => setCompareSearchOpen(true)}
                      sourceDescription={sentimentData.sourceDescription}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8">
                <Card className="border border-border shadow-md bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Heart className="h-5 w-5 mr-2 text-primary" />
                      Resources & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={resourcesTab} onValueChange={setResourcesTab} className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="wellbeing">Wellbeing Suggestions</TabsTrigger>
                        <TabsTrigger value="resources">Mental Health Resources</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="wellbeing">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                          {wellbeingSuggestions.map((suggestion, index) => (
                            <div 
                              key={index} 
                              className="border rounded-lg p-4 bg-card/50"
                            >
                              <div className="flex items-center mb-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {suggestion.category}
                                </Badge>
                              </div>
                              <h3 className="font-medium text-lg">{suggestion.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 mb-3">{suggestion.description}</p>
                              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                <strong>Benefit:</strong> {suggestion.benefit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="resources">
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                          {mentalHealthResources.map((resource, index) => (
                            <div 
                              key={index} 
                              className="border rounded-lg p-4 bg-card/50"
                            >
                              <div className="flex items-center mb-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {resource.category}
                                </Badge>
                              </div>
                              <h3 className="font-medium text-lg">{resource.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1 mb-3">{resource.description}</p>
                              {resource.contact && (
                                <p className="text-sm mt-2">
                                  <strong>Contact:</strong> {resource.contact}
                                </p>
                              )}
                              <p className="text-sm mt-2">
                                <strong>Website:</strong> {resource.website}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 text-sm text-center text-muted-foreground">
                          <div className="flex items-center justify-center">
                            <Info className="h-4 w-4 mr-1" />
                            These resources are provided for informational purposes only. 
                            Please consult with healthcare professionals for personalized advice.
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
