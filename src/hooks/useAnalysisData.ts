
import { useState, useEffect } from 'react';
import { Point } from "@/types/embedding";

export const useAnalysisData = (
  sentimentData: any,
  searchTerm: string, 
  setFilteredPoints: (points: Point[]) => void,
  setSelectedWord: (word: string | null) => void,
  setSelectedPoint: (point: Point | null) => void
) => {
  const [normalizedData, setNormalizedData] = useState<any>(sentimentData);
  const [clusterCount, setClusterCount] = useState<number>(8);

  // Process and normalize sentiment data
  useEffect(() => {
    // Process sentiment data to ensure it has valid values
    if (sentimentData) {
      const processedData = {
        ...sentimentData,
        overallSentiment: {
          score: sentimentData.overallSentiment?.score || 0.5,
          label: sentimentData.overallSentiment?.label || "Neutral"
        },
        distribution: {
          positive: Math.max(1, sentimentData.distribution?.positive || 33),
          neutral: Math.max(1, sentimentData.distribution?.neutral || 34),
          negative: Math.max(1, sentimentData.distribution?.negative || 33)
        },
        // Make sure keyPhrases is valid
        keyPhrases: Array.isArray(sentimentData.keyPhrases) ? sentimentData.keyPhrases : 
                   (sentimentData.bertAnalysis?.keywords || []).map((kw: any) => ({
                      phrase: kw.text || kw.word || "",
                      score: kw.sentiment || 0.5,
                      count: 1
                    })),
        // Make sure timeline has valid data points
        timeline: Array.isArray(sentimentData.timeline) && sentimentData.timeline.length > 0 ? 
                 sentimentData.timeline : 
                 [
                   { page: 1, score: 0.4, time: "Start" },
                   { page: 2, score: 0.5, time: "Middle" },
                   { page: 3, score: 0.6, time: "End" }
                 ],
        // Ensure embeddingPoints is an array
        embeddingPoints: Array.isArray(sentimentData.embeddingPoints) ? sentimentData.embeddingPoints : []
      };
      
      setNormalizedData(processedData);
    }
  }, [sentimentData]);

  // Handle search term changes
  useEffect(() => {
    // Find word in embedding points when search changes
    if (searchTerm && searchTerm.length > 0) {
      const points = normalizedData?.embeddingPoints || [];
      
      // First try exact match
      const exactMatches = points.filter((p: Point) => p.word && p.word.toLowerCase() === searchTerm.toLowerCase());
      
      // If no exact matches, try contains
      const filteredResults = exactMatches.length > 0 ? exactMatches : 
        points.filter((p: Point) => p.word && p.word.toLowerCase().includes(searchTerm.toLowerCase()));
        
      if (filteredResults.length > 0) {
        setFilteredPoints(filteredResults);
        setSelectedWord(filteredResults[0].word);
        setSelectedPoint(filteredResults[0]);
      } else {
        // Reset if no matches
        setFilteredPoints(points);
      }
    } else {
      // Reset when search term is cleared
      setFilteredPoints(normalizedData?.embeddingPoints || []);
    }
  }, [searchTerm, normalizedData?.embeddingPoints, setFilteredPoints, setSelectedWord, setSelectedPoint]);

  return { normalizedData, clusterCount, setClusterCount };
};
