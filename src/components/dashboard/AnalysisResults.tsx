import { FileInfoDisplay } from "@/components/FileInfoDisplay";
import { ViewDetailedAnalysis } from "@/components/ViewDetailedAnalysis";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { EmotionalClustersControl } from "@/components/EmotionalClustersControl";
import { WordComparisonController } from "@/components/WordComparisonController";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
import { WellbeingResources } from "@/components/WellbeingResources";
import { PdfExport } from "@/components/PdfExport";
import { Point } from "@/types/embedding";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef } from "react";
import { ScrollToSection } from "@/components/ScrollToSection";

interface AnalysisResultsProps {
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
  onJournalEntryAdded: () => void;
  onMonthlyReflectionAdded: () => void;
}

const AnalysisResults = ({
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
  calculateRelationship,
  onJournalEntryAdded,
  onMonthlyReflectionAdded
}: AnalysisResultsProps) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isClustersOpen, setIsClustersOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isTextVisualizationOpen, setIsTextVisualizationOpen] = useState(true);
  
  // References to collapsible sections for scrolling
  const infoRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const clustersRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const textVisualizationRef = useRef<HTMLDivElement>(null);

  // Function to scroll to a section when opened
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    
    setTimeout(() => {
      const headerOffset = 80; // Adjust based on your header height
      const elementPosition = ref.current?.getBoundingClientRect().top || 0;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }, 100);
  };
  
  // Add effects to scroll to sections when they're opened
  useEffect(() => {
    if (isInfoOpen) scrollToSection(infoRef);
  }, [isInfoOpen]);
  
  useEffect(() => {
    if (isDetailsOpen) scrollToSection(detailsRef);
  }, [isDetailsOpen]);
  
  useEffect(() => {
    if (isClustersOpen) scrollToSection(clustersRef);
  }, [isClustersOpen]);
  
  useEffect(() => {
    if (isComparisonOpen) scrollToSection(comparisonRef);
  }, [isComparisonOpen]);
  
  useEffect(() => {
    if (isPdfOpen) scrollToSection(pdfRef);
  }, [isPdfOpen]);
  
  useEffect(() => {
    if (isTextVisualizationOpen) scrollToSection(textVisualizationRef);
  }, [isTextVisualizationOpen]);

  if (!sentimentData) {
    return null;
  }

  // Log BERT analysis data to verify it's available
  console.log("BERT data available in AnalysisResults:", 
    sentimentData.bertAnalysis ? 
    `Yes, with ${sentimentData.bertAnalysis.keywords?.length || 0} keywords` : 
    "No"
  );

  return (
    <div className="animate-fade-in">
      {/* Scroll helpers */}
      <ScrollToSection isOpen={isInfoOpen} elementId="file-info-section" />
      <ScrollToSection isOpen={isDetailsOpen} elementId="document-summary-section" />
      <ScrollToSection isOpen={isClustersOpen} elementId="emotional-clusters-section" />
      <ScrollToSection isOpen={isComparisonOpen} elementId="word-comparison-section" />
      <ScrollToSection isOpen={isPdfOpen} elementId="export-options-section" />
      <ScrollToSection isOpen={isTextVisualizationOpen} elementId="text-visualization-section" />
      
      {/* Document Text Visualization - Moved above the Overview section */}
      <Collapsible open={isTextVisualizationOpen} onOpenChange={setIsTextVisualizationOpen} className="w-full mb-4">
        <div id="text-visualization-section">
          <TextEmotionViewer 
            pdfText={pdfText}
            embeddingPoints={sentimentData.embeddingPoints}
            sourceDescription={sentimentData.sourceDescription}
            bertAnalysis={sentimentData.bertAnalysis}
          />
        </div>
      </Collapsible>
      
      <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen} className="w-full">
        <div id="file-info-section" className="bg-white p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">File Information</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isInfoOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden">
            <FileInfoDisplay 
              fileName={sentimentData.fileName}
              fileSize={sentimentData.fileSize}
              wordCount={sentimentData.wordCount}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="w-full">
        <div id="document-summary-section" className="bg-white p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Document Summary</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isDetailsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden">
            <ViewDetailedAnalysis 
              summary={sentimentData.summary} 
              text={sentimentData.text || sentimentData.pdfText}
              wordCount={sentimentData.wordCount}
              sourceDescription={sentimentData.sourceDescription}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      <div className="bg-white p-4 rounded-lg mb-4">
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
          bertAnalysis={sentimentData.bertAnalysis}
        />
      </div>
      
      <Collapsible open={isClustersOpen} onOpenChange={setIsClustersOpen} className="w-full">
        <div id="emotional-clusters-section" className="mt-8 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Emotional Clusters</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isClustersOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden">
            <EmotionalClustersControl 
              visibleClusterCount={visibleClusterCount}
              setVisibleClusterCount={setVisibleClusterCount}
              activeTab={activeTab}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      <Collapsible open={isComparisonOpen} onOpenChange={setIsComparisonOpen} className="w-full">
        <div id="word-comparison-section" className="mt-8 mb-4 bg-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Word Comparison</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isComparisonOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden">
            <WordComparisonController 
              points={sentimentData.embeddingPoints}
              selectedPoint={selectedPoint}
              sourceDescription={sentimentData.sourceDescription}
              calculateRelationship={calculateRelationship}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      <Collapsible open={isPdfOpen} onOpenChange={setIsPdfOpen} className="w-full">
        <div id="export-options-section" className="mt-8 bg-white p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Export Options</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isPdfOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden">
            <PdfExport 
              sentimentData={sentimentData}
              onJournalEntryAdded={onJournalEntryAdded}
              onMonthlyReflectionAdded={onMonthlyReflectionAdded}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default AnalysisResults;
