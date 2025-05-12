
import { FileInfoDisplay } from "@/components/FileInfoDisplay";
import { ViewDetailedAnalysis } from "@/components/ViewDetailedAnalysis";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { EntryContent } from "@/components/EntryContent";
import { Point } from "@/types/embedding";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PdfExport } from "@/components/PdfExport";
import { BertAnalysisResult } from "@/utils/bertIntegration";

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
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [viewType, setViewType] = useState("analysis");
  const [bertData, setBertData] = useState<BertAnalysisResult | null>(null);

  useEffect(() => {
    // Ensure BERT data is properly loaded
    if (sentimentData?.bertAnalysis) {
      console.log("Setting BERT data from sentiment data");
      setBertData(sentimentData.bertAnalysis);
    }
  }, [sentimentData]);

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
    <div className="animate-fade-in flex flex-col items-center">
      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* File Information Section */}
        <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg mb-4">
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
            <CollapsibleContent>
              <FileInfoDisplay 
                fileName={sentimentData.fileName}
                fileSize={sentimentData.fileSize}
                wordCount={sentimentData.wordCount}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Detailed Analysis Section */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
                Detailed Analysis Data
              </h2>
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
            <CollapsibleContent>
              <ViewDetailedAnalysis 
                summary={sentimentData.summary} 
                wordCount={sentimentData.wordCount}
                sourceDescription={sentimentData.sourceDescription}
                bertAnalysis={bertData || sentimentData.bertAnalysis}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Tab Selection */}
        <div className="flex justify-center w-full mb-4">
          <div className="grid w-full max-w-md grid-cols-2 rounded-lg overflow-hidden border border-gray-200">
            <button 
              onClick={() => setViewType("analysis")}
              className={`py-2 px-4 text-center transition-colors ${viewType === "analysis" ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Analysis
            </button>
            <button 
              onClick={() => setViewType("entry")}
              className={`py-2 px-4 text-center transition-colors ${viewType === "entry" ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Entry
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="w-full">
          {viewType === "analysis" ? (
            <div className="bg-white p-4 rounded-lg mb-4 w-full">
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
                bertAnalysis={bertData || sentimentData.bertAnalysis}
              />
            </div>
          ) : (
            <EntryContent 
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
            />
          )}
        </div>
        
        {/* Export Options Section */}
        <Collapsible open={isPdfOpen} onOpenChange={setIsPdfOpen} className="w-full">
          <div className="mt-8 bg-white p-4 rounded-lg">
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
            <CollapsibleContent>
              <PdfExport 
                sentimentData={sentimentData}
                onJournalEntryAdded={onJournalEntryAdded}
                onMonthlyReflectionAdded={onMonthlyReflectionAdded}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  );
};

export default AnalysisResults;
