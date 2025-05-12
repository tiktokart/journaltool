
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { WordComparisonController } from "@/components/WordComparisonController";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { KeyPhrases } from "@/components/KeyPhrases";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, BarChart2, BookOpen, Clock, KeySquare, Network } from "lucide-react";
import { Point } from "@/types/embedding";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdvancedBadge } from "./ui/advanced-badge";
import { BertAnalysisResult } from '../utils/bertIntegration';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EntryContentProps {
  sentimentData: any;
  pdfText: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
  filteredPoints: Point[];
  setFilteredPoints: (points: Point[]) => void;
  uniqueWords: string[];
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
  visibleClusterCount: number;
  setVisibleClusterCount: (count: number) => void;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  calculateRelationship: (point1: Point, point2: Point) => any;
}

export const EntryContent: React.FC<EntryContentProps> = ({
  sentimentData,
  pdfText,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedPoint,
  setSelectedPoint,
  selectedWord,
  setSelectedWord,
  filteredPoints,
  setFilteredPoints,
  uniqueWords,
  connectedPoints,
  setConnectedPoints,
  visibleClusterCount,
  setVisibleClusterCount,
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  calculateRelationship
}) => {
  const { t } = useLanguage();
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isTextAnalysisOpen, setIsTextAnalysisOpen] = useState(true);
  const [isLatentAnalysisOpen, setIsLatentAnalysisOpen] = useState(true);
  const [isWordComparisonOpen, setIsWordComparisonOpen] = useState(true);
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(true);
  
  // References for scrolling
  const overviewRef = useRef<HTMLDivElement>(null);
  const textAnalysisRef = useRef<HTMLDivElement>(null);
  const latentAnalysisRef = useRef<HTMLDivElement>(null);
  const wordComparisonRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const keywordsRef = useRef<HTMLDivElement>(null);

  // Add scroll controls to fix scrolling issues
  useEffect(() => {
    const handleResize = () => {
      const collapsibleContents = document.querySelectorAll('.collapsible-content');
      collapsibleContents.forEach((content: any) => {
        content.style.maxHeight = `${window.innerHeight * 0.6}px`;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!sentimentData) return null;

  // Ensure bertAnalysis is available in the correct format
  const bertAnalysis = sentimentData.bertAnalysis as BertAnalysisResult;
  
  // Handle cases where BERT analysis is missing or incomplete
  if (!bertAnalysis || !bertAnalysis.keywords || bertAnalysis.keywords.length === 0) {
    console.warn("BERT analysis data is missing or empty");
  } else {
    console.log(`BERT analysis available with ${bertAnalysis.keywords.length} keywords`);
  }

  // Extract action verbs and main topics from BERT analysis if available
  const actionVerbs = bertAnalysis?.keywords
    ?.filter((kw: any) => kw.pos === 'verb')
    ?.sort((a: any, b: any) => b.weight - a.weight)
    ?.slice(0, 10)
    ?.map((kw: any) => ({...kw, word: kw.word})) || [];
    
  const mainTopics = bertAnalysis?.keywords
    ?.filter((kw: any) => kw.pos === 'noun')
    ?.sort((a: any, b: any) => b.frequency - a.frequency)
    ?.slice(0, 8)
    ?.map((kw: any) => ({...kw, word: kw.word})) || [];
  
  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    const matchingPoint = filteredPoints.find(p => p.word === word);
    if (matchingPoint) {
      handlePointClick(matchingPoint);
      toast.success(`Selected word: ${word}`);
    }
  };

  // Get emotional tone for tooltip display
  const getEmotionalTone = (word: string): string | null => {
    if (!bertAnalysis || !bertAnalysis.keywords) return null;
    
    const keyword = bertAnalysis.keywords.find((kw: any) => 
      kw.word.toLowerCase() === word.toLowerCase()
    );
    
    return keyword ? keyword.tone || null : null;
  };

  // Render a badge for a word with tooltip showing emotional tone
  const renderWordBadge = (word: string, emotion: string, index: number) => {
    const tone = getEmotionalTone(word);
    
    return (
      <TooltipProvider key={index}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AdvancedBadge 
              emotion={emotion}
              className="text-xs cursor-pointer"
              clickable
              onClick={() => handleWordClick(word)}
            >
              {word}
            </AdvancedBadge>
          </TooltipTrigger>
          <TooltipContent>
            <p><strong>{word}</strong></p>
            {tone && <p>Tone: {tone}</p>}
            <p>Click to highlight in visualization</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* FIRST: Overview Section */}
      <div ref={overviewRef}>
        <Collapsible open={isOverviewOpen} onOpenChange={setIsOverviewOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
                Overview
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isOverviewOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="collapsible-content overflow-y-auto">
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-sm mb-2">Sentiment</h3>
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2" 
                          style={{
                            backgroundColor: sentimentData.overallSentiment?.label === "Positive" ? "#4CAF50" :
                                            sentimentData.overallSentiment?.label === "Negative" ? "#F44336" :
                                            "#FFC107"
                          }}
                        />
                        <p>{sentimentData.overallSentiment?.label || "N/A"}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-sm mb-2">Word Count</h3>
                      <p>{sentimentData.wordCount || "N/A"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-sm mb-2">Emotional Intensity</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full" 
                          style={{ width: `${sentimentData.emotionalIntensity || 50}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Action Words and Main Topics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm">Action Verbs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {actionVerbs && actionVerbs.length > 0 ? (
                          actionVerbs.map((verb: any, i: number) => 
                            renderWordBadge(verb.word, "action", i)
                          )
                        ) : (
                          <p className="text-sm text-gray-500">No action verbs detected in your journal</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm">Main Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {mainTopics && mainTopics.length > 0 ? (
                          mainTopics.map((topic: any, i: number) => 
                            renderWordBadge(topic.word, "topic", i)
                          )
                        ) : (
                          <p className="text-sm text-gray-500">No main topics detected in your journal</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
      
      {/* SECOND: Document Text Analysis */}
      <div ref={textAnalysisRef}>
        <Collapsible open={isTextAnalysisOpen} onOpenChange={setIsTextAnalysisOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Document Text Analysis
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isTextAnalysisOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="collapsible-content overflow-y-auto">
              <div className="mt-4">
                <ScrollArea className="h-[400px]">
                  <TextEmotionViewer 
                    pdfText={pdfText} 
                    embeddingPoints={sentimentData.embeddingPoints} 
                    sourceDescription={sentimentData.sourceDescription}
                    bertAnalysis={bertAnalysis}
                  />
                </ScrollArea>
                <p className="text-xs text-gray-500 mt-2">
                  Hover over highlighted words to see their emotional tones and contextual importance.
                </p>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
      
      {/* THIRD: Latent Emotional Analysis */}
      <div ref={latentAnalysisRef}>
        <Collapsible open={isLatentAnalysisOpen} onOpenChange={setIsLatentAnalysisOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <Network className="h-5 w-5 mr-2 text-green-600" />
                Latent Emotional Analysis
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isLatentAnalysisOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="collapsible-content overflow-y-auto">
              <div className="mt-4">
                <div className="h-[350px] w-full bg-gray-50 rounded-lg overflow-hidden">
                  <DocumentEmbedding 
                    points={sentimentData.embeddingPoints || []} 
                    isInteractive={true}
                    onPointClick={handlePointClick}
                    selectedPoint={selectedPoint}
                    selectedWord={selectedWord}
                    filteredPoints={filteredPoints}
                    visibleClusterCount={visibleClusterCount}
                    bertData={bertAnalysis}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This 3D visualization shows emotional connections between words in your text. Similar emotions appear closer together.
                  Click on points to explore relationships.
                </p>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
      
      {/* FOURTH: Word Comparison */}
      <div ref={wordComparisonRef}>
        <Collapsible open={isWordComparisonOpen} onOpenChange={setIsWordComparisonOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Word Comparison
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isWordComparisonOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="collapsible-content overflow-y-auto">
              <div className="mt-4">
                <WordComparisonController 
                  points={sentimentData.embeddingPoints || []}
                  selectedPoint={selectedPoint}
                  sourceDescription={sentimentData.sourceDescription}
                  calculateRelationship={calculateRelationship}
                  bertKeywords={bertAnalysis?.keywords}
                />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
      
      {/* FIFTH: Timeline */}
      <div ref={timelineRef}>
        <Collapsible open={isTimelineOpen} onOpenChange={setIsTimelineOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Timeline
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isTimelineOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="collapsible-content overflow-y-auto">
              <div className="mt-4">
                <ScrollArea className="max-h-[300px]">
                  <SentimentTimeline 
                    data={sentimentData.timelineEvents || []} 
                    sourceDescription={sentimentData.sourceDescription}
                    bertData={bertAnalysis}
                  />
                </ScrollArea>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
      
      {/* SIXTH: Keywords */}
      <div ref={keywordsRef}>
        <Collapsible open={isKeywordsOpen} onOpenChange={setIsKeywordsOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <KeySquare className="h-5 w-5 mr-2 text-red-600" />
                Keywords
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isKeywordsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="collapsible-content overflow-y-auto">
              <div className="mt-4">
                <KeyPhrases 
                  data={sentimentData.keyPhrases || []} 
                  scoreMax={1.0}
                  sourceDescription={sentimentData.sourceDescription}
                  bertKeywords={bertAnalysis?.keywords || []}
                />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  );
};

export default EntryContent;
