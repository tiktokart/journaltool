
import { useRef } from "react";
import { useAnalysisState } from "@/hooks/useAnalysisState";
import AnalysisControls from "@/components/dashboard/AnalysisControls";
import AnalysisResultsDisplay from "@/components/dashboard/AnalysisResultsDisplay";

interface BertAnalysisPageProps {
  onJournalEntryAdded?: () => void;
  onMonthlyReflectionAdded?: () => void;
}

const BertAnalysisPage = ({
  onJournalEntryAdded,
  onMonthlyReflectionAdded
}: BertAnalysisPageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
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
  } = useAnalysisState(onJournalEntryAdded);
  
  return (
    <div className="container mx-auto p-4 space-y-6" ref={containerRef}>
      <h1 className="text-2xl font-bold mb-6">Emotional Analysis</h1>
      
      <AnalysisControls
        file={file}
        pdfText={pdfText}
        isAnalyzing={isAnalyzing}
        onFileUpload={handleFileUpload}
        onAnalyzeClick={handleAnalyzeClick}
      />
      
      {sentimentData && (
        <AnalysisResultsDisplay
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
          handlePointClick={handlePointClick}
          handleResetVisualization={handleResetVisualization}
          handleClearSearch={handleClearSearch}
          onJournalEntryAdded={onJournalEntryAdded}
          onMonthlyReflectionAdded={onMonthlyReflectionAdded}
          connectedPoints={connectedPoints}
          setConnectedPoints={setConnectedPoints}
          onSaveToJournal={handleSaveToJournal}
        />
      )}
    </div>
  );
};

export default BertAnalysisPage;
