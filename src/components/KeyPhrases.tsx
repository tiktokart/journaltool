
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X, List, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface KeywordItem {
  word: string;
  phrase?: string;
  frequency?: number;
  score?: number;
  tone?: string;
  color?: string;
}

interface KeyPhrasesProps {
  data: KeywordItem[];
  sourceDescription?: string;
}

export const KeyPhrases = ({ data, sourceDescription }: KeyPhrasesProps) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordItem[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItem | null>(null);
  const [themeGroups, setThemeGroups] = useState<{[key: string]: KeywordItem[]}>({});
  
  // Process keywords and group them by theme (based on sentiment and tone)
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredKeywords([]);
      return;
    }
    
    // Filter based on search term
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      const wordToCheck = item.word || item.phrase || '';
      return !searchTerm || wordToCheck.toLowerCase().includes(lowercaseSearchTerm);
    });
    
    setFilteredKeywords(filtered);
    
    // Group keywords by theme based on tone
    const groups: {[key: string]: KeywordItem[]} = {
      'Primary Themes': [],
      'Secondary Themes': [],
      'Tertiary Themes': []
    };
    
    // Sort by score to determine theme grouping
    const sortedByScore = [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Distribute into theme categories based on score
    sortedByScore.forEach((keyword, index) => {
      if (index < Math.min(5, Math.ceil(sortedByScore.length * 0.25))) {
        groups['Primary Themes'].push(keyword);
      } else if (index < Math.min(10, Math.ceil(sortedByScore.length * 0.5))) {
        groups['Secondary Themes'].push(keyword);
      } else {
        groups['Tertiary Themes'].push(keyword);
      }
    });
    
    // Sort words within each group by score
    Object.keys(groups).forEach(theme => {
      groups[theme] = groups[theme].sort((a, b) => (b.score || 0) - (a.score || 0));
    });
    
    setThemeGroups(groups);
  }, [data, searchTerm]);
  
  // Get the highest score for normalization
  const maxScore = filteredKeywords.length > 0 
    ? Math.max(...filteredKeywords.map(kw => kw.score || 0)) 
    : 1;
  
  // Get font size based on score importance
  const getFontSize = (score: number = 0): string => {
    const normalized = (score / maxScore) || 0.5;
    const minSize = 0.8;
    const maxSize = 1.6;
    const size = minSize + normalized * (maxSize - minSize);
    return `${size}rem`;
  };
  
  // Get colors for theme levels
  const getThemeColor = (theme: string): string => {
    const themeColors: Record<string, string> = {
      'Primary Themes': '#8B5CF6', // Purple
      'Secondary Themes': '#3B82F6', // Blue
      'Tertiary Themes': '#10B981', // Green
      'default': '#94A3B8' // Gray
    };
    
    return themeColors[theme] || themeColors.default;
  };
  
  // Handle keyword click
  const handleKeywordClick = (keyword: KeywordItem) => {
    setSelectedKeyword(keyword === selectedKeyword ? null : keyword);
  };
  
  // Get related words (based on first letters)
  const getRelatedWords = (keyword: KeywordItem): KeywordItem[] => {
    if (!keyword) return [];
    
    const wordToCheck = keyword.word || keyword.phrase || '';
    const wordStart = wordToCheck.substring(0, 2).toLowerCase();
    
    // Find words with similar beginning
    return filteredKeywords.filter(item => {
      const itemWord = item.word || item.phrase || '';
      return itemWord !== wordToCheck && 
             (itemWord.toLowerCase().startsWith(wordStart) || 
              (keyword.tone && item.tone === keyword.tone));
    }).slice(0, 5); // Limit to 5 related words
  };
  
  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-pacifico">
          <Tag className="h-5 w-5 mr-2 text-primary" />
          {t("themes")}
        </CardTitle>
        {sourceDescription && (
          <p className="text-sm text-muted-foreground font-georgia">{sourceDescription}</p>
        )}
        
        <div className="mt-2 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchThemes")}
            className="pl-8 pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredKeywords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? t("noMatchingThemes") : t("noThemesAvailable")}
          </div>
        ) : (
          <>
            {/* Theme visualization */}
            <div className="flex flex-wrap gap-2 justify-center py-4 mb-6 bg-gray-50 rounded-lg p-3 border">
              {filteredKeywords
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, 30)
                .map((keyword, idx) => {
                  const wordToShow = keyword.phrase || keyword.word || '';
                  return (
                    <button
                      key={`${wordToShow}-${idx}`}
                      className={`px-3 py-1.5 rounded-full transition-all ${
                        selectedKeyword?.word === keyword.word || 
                        selectedKeyword?.phrase === keyword.phrase
                          ? 'ring-2 ring-primary'
                          : 'hover:bg-gray-100'
                      }`}
                      style={{
                        fontSize: getFontSize(keyword.score),
                        color: keyword.color || (keyword.tone && getThemeColor(keyword.tone)) || '#6366F1'
                      }}
                      onClick={() => handleKeywordClick(keyword)}
                    >
                      {wordToShow}
                    </button>
                  );
                })}
            </div>
            
            {/* Theme groupings */}
            <div className="space-y-4">
              {Object.entries(themeGroups).map(([theme, keywords]) => {
                if (keywords.length === 0) return null;
                return (
                  <div key={theme} 
                    className={`border rounded-lg p-4 ${
                      theme === 'Primary Themes' ? 'bg-purple-50' : 
                      theme === 'Secondary Themes' ? 'bg-blue-50' : 
                      'bg-green-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getThemeColor(theme) }}
                        ></div>
                        {theme}
                      </h3>
                      <Badge variant="outline">{keywords.length}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {keywords.map((word, idx) => {
                        const wordToShow = word.phrase || word.word || '';
                        return (
                          <Badge 
                            key={`${wordToShow}-${idx}`} 
                            variant="secondary"
                            className={`cursor-pointer ${
                              theme === 'Primary Themes' ? 'bg-purple-100 hover:bg-purple-200' : 
                              theme === 'Secondary Themes' ? 'bg-blue-100 hover:bg-blue-200' : 
                              'bg-green-100 hover:bg-green-200'
                            }`}
                            onClick={() => handleKeywordClick(word)}
                          >
                            {wordToShow}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* Selected theme details */}
        {selectedKeyword && (
          <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium">
                  {selectedKeyword.phrase || selectedKeyword.word}
                </h4>
                {selectedKeyword.tone && (
                  <Badge className="mt-1" variant="outline">
                    {selectedKeyword.tone}
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedKeyword(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              {selectedKeyword.frequency !== undefined && (
                <div className="p-2 bg-white rounded border">
                  <span className="text-sm text-muted-foreground">Frequency:</span>
                  <span className="block font-medium">{selectedKeyword.frequency}</span>
                </div>
              )}
              
              {selectedKeyword.score !== undefined && (
                <div className="p-2 bg-white rounded border">
                  <span className="text-sm text-muted-foreground">Relevance:</span>
                  <span className="block font-medium">
                    {Math.round((selectedKeyword.score) * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            {/* Related themes */}
            <div className="mt-3">
              <h5 className="text-sm font-medium mb-2">Related themes:</h5>
              <div className="flex flex-wrap gap-1">
                {getRelatedWords(selectedKeyword).length > 0 ? (
                  getRelatedWords(selectedKeyword).map((related, idx) => {
                    const relatedWord = related.phrase || related.word || '';
                    return (
                      <Badge 
                        key={`${relatedWord}-${idx}`} 
                        variant="outline"
                        className="cursor-pointer bg-white"
                        onClick={() => handleKeywordClick(related)}
                      >
                        {relatedWord}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-sm text-muted-foreground">No related themes found</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
