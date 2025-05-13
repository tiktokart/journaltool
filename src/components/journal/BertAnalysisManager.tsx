
import React, { useEffect, useState } from 'react';
import { analyzeTextWithBert } from '@/utils/bertIntegration';
import { BertAnalysisResult } from '@/types/bertAnalysis';

interface BertAnalysisManagerProps {
  selectedEntry: {
    id: string;
    text: string;
    date: string;
    [key: string]: any;
  } | null;
  setDocumentStats: (stats: { wordCount: number; sentenceCount: number; paragraphCount: number }) => void;
  setMainSubjects: (subjects: string[]) => void;
  setBertAnalysis: (analysis: any) => void;
  setEmotionGroups: (groups: {[key: string]: any[]}) => void;
  setThemeCategories: (categories: {name: string, words: string[], color: string}[]) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
}

const BertAnalysisManager: React.FC<BertAnalysisManagerProps> = ({
  selectedEntry,
  setDocumentStats,
  setMainSubjects,
  setBertAnalysis,
  setEmotionGroups,
  setThemeCategories,
  setIsAnalyzing
}) => {
  
  useEffect(() => {
    const analyzeEntry = async () => {
      if (!selectedEntry) {
        setBertAnalysis(null);
        setDocumentStats({ wordCount: 0, sentenceCount: 0, paragraphCount: 0 });
        setMainSubjects([]);
        setEmotionGroups({});
        setThemeCategories([]);
        return;
      }
      
      setIsAnalyzing(true);
      try {
        // Calculate document stats
        const text = selectedEntry.text;
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        setDocumentStats({
          wordCount: words.length,
          sentenceCount: sentences.length,
          paragraphCount: Math.max(1, paragraphs.length)
        });
        
        // Run BERT analysis
        console.log("Analyzing entry with BERT...");
        const analysis = await analyzeTextWithBert(selectedEntry.text);
        console.log("BERT analysis result:", analysis);
        
        // Create full BertAnalysisResult with required distribution data
        const fullAnalysis: BertAnalysisResult = {
          sentiment: analysis.sentiment || { score: 0.5, label: "Neutral" },
          keywords: analysis.keywords || [],
          distribution: analysis.distribution || {
            positive: 33,
            neutral: 34,
            negative: 33
          }
        };
        
        // Calculate distribution if missing or ensure it exists
        if (analysis.keywords && analysis.keywords.length > 0 && !analysis.distribution) {
          let positive = 0;
          let neutral = 0;
          let negative = 0;
          
          analysis.keywords.forEach((keyword: any) => {
            const sentiment = keyword.sentiment || 0.5;
            if (sentiment > 0.6) positive++;
            else if (sentiment < 0.4) negative++;
            else neutral++;
          });
          
          const total = Math.max(1, positive + negative + neutral);
          fullAnalysis.distribution = {
            positive: Math.round((positive / total) * 100),
            neutral: Math.round((neutral / total) * 100),
            negative: Math.round((negative / total) * 100)
          };
        }
        
        setBertAnalysis(fullAnalysis);
        
        // Create theme categories from keywords
        if (analysis?.keywords && Array.isArray(analysis.keywords)) {
          // Group by tones first
          const toneGroups: {[key: string]: any[]} = {};
          analysis.keywords.forEach((kw: any) => {
            const tone = kw.tone || 'Neutral';
            if (!toneGroups[tone]) {
              toneGroups[tone] = [];
            }
            toneGroups[tone].push(kw);
          });
          
          // Create theme categories based on emotional tones and related concepts
          const themes: {name: string, words: string[], color: string}[] = [];
          
          // Process each emotional tone group
          Object.entries(toneGroups).forEach(([tone, keywords]) => {
            if (keywords.length >= 2) {
              // Extract words for this theme
              const themeWords = keywords.map((k: any) => k.word || k.text);
              
              // Use the first keyword's color for the theme
              const themeColor = keywords[0]?.color || '#CCCCCC';
              
              themes.push({
                name: `${tone} Theme`,
                words: themeWords.slice(0, 5),
                color: themeColor
              });
            }
          });
          
          // Add additional themes based on related concepts if available
          const relatedConcepts = new Set<string>();
          analysis.keywords.forEach((kw: any) => {
            if (kw.relatedConcepts && Array.isArray(kw.relatedConcepts)) {
              kw.relatedConcepts.forEach((concept: string) => relatedConcepts.add(concept));
            }
          });
          
          if (relatedConcepts.size >= 3) {
            themes.push({
              name: 'Related Concepts',
              words: Array.from(relatedConcepts).slice(0, 5),
              color: '#6C5CE7'
            });
          }
          
          setThemeCategories(themes);
        }
        
        console.log("BERT analysis complete with themes");
      } catch (error) {
        console.error("Error analyzing entry:", error);
        // Provide fallback analysis with default values
        const fallbackAnalysis: BertAnalysisResult = {
          sentiment: { score: 0.5, label: "Neutral" },
          distribution: { positive: 33, neutral: 34, negative: 33 },
          keywords: []
        };
        setBertAnalysis(fallbackAnalysis);
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    analyzeEntry();
  }, [selectedEntry, setBertAnalysis, setDocumentStats, setEmotionGroups, setIsAnalyzing, setMainSubjects, setThemeCategories]);
  
  return null; // This is a logic component, not a UI component
};

export default BertAnalysisManager;
