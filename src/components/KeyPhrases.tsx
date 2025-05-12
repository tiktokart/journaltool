
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

interface KeywordItem {
  word: string;
  frequency: number;
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
  const [activeTab, setActiveTab] = useState('all');
  const [themeGroups, setThemeGroups] = useState<{[key: string]: KeywordItem[]}>({});
  
  // Process keywords and group them by theme (based on sentiment and tone)
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredKeywords([]);
      return;
    }
    
    // Filter based on search term
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const filtered = data.filter(item => 
      item.word && (!searchTerm || item.word.toLowerCase().includes(lowercaseSearchTerm))
    );
    
    setFilteredKeywords(filtered);
    
    // Group keywords by theme based on tone and sentiment
    const groups: {[key: string]: KeywordItem[]} = {};
    
    // Create groups based on emotional tones
    filtered.forEach(keyword => {
      // Default to neutral if no tone is provided
      const tone = keyword.tone || 'Neutral';
      
      if (!groups[tone]) {
        groups[tone] = [];
      }
      
      groups[tone].push(keyword);
    });
    
    // Sort words within each group by frequency
    Object.keys(groups).forEach(theme => {
      groups[theme] = groups[theme].sort((a, b) => b.frequency - a.frequency);
    });
    
    setThemeGroups(groups);
  }, [data, searchTerm]);
  
  // Get the highest frequency for normalization
  const maxFrequency = filteredKeywords.length > 0 
    ? Math.max(...filteredKeywords.map(kw => kw.frequency)) 
    : 1;
  
  // Get font size based on frequency
  const getFontSize = (frequency: number): string => {
    const normalized = (frequency / maxFrequency);
    const minSize = 0.8;
    const maxSize = 1.6;
    const size = minSize + normalized * (maxSize - minSize);
    return `${size}rem`;
  };
  
  // Get colors for themes
  const getThemeColor = (theme: string): string => {
    const themeColors: Record<string, string> = {
      'Joy': '#FFD700',
      'Joyful': '#F1C40F',
      'Happy': '#2ECC71',
      'Excited': '#E67E22',
      'Peaceful': '#3498DB',
      'Calm': '#2980B9',
      'Neutral': '#95A5A6',
      'Anxious': '#E74C3C',
      'Angry': '#C0392B',
      'Sad': '#9B59B6',
      'Depressed': '#8E44AD',
      'Frustrated': '#D35400',
      'Confused': '#F39C12',
      'Scared': '#7F8C8D',
      'Disgusted': '#6C3483',
      'Surprised': '#16A085',
      'Fearful': '#D35400',
    };
    
    return themeColors[theme] || '#95A5A6'; // Default gray
  };
  
  // Handle keyword click
  const handleKeywordClick = (keyword: KeywordItem) => {
    setSelectedKeyword(keyword === selectedKeyword ? null : keyword);
  };
  
  // Get related words (based on tone or first letters)
  const getRelatedWords = (keyword: KeywordItem): KeywordItem[] => {
    if (!keyword) return [];
    
    const wordStart = keyword.word.substring(0, 2).toLowerCase();
    
    // Find words with the same tone or similar beginning
    return filteredKeywords.filter(item => 
      item.word !== keyword.word && (
        (item.tone && item.tone === keyword.tone) ||
        item.word.toLowerCase().startsWith(wordStart)
      )
    ).slice(0, 5); // Limit to 5 related words
  };
  
  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-pacifico">
          <List className="h-5 w-5 mr-2 text-primary" />
          {t("keywordThemes")}
        </CardTitle>
        {sourceDescription && (
          <p className="text-sm text-muted-foreground font-georgia">{sourceDescription}</p>
        )}
        
        <div className="mt-2 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchKeywords")}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted w-full overflow-x-auto">
            <TabsTrigger value="all" className="min-w-max">All Themes</TabsTrigger>
            {Object.keys(themeGroups).sort().map(theme => (
              <TabsTrigger key={theme} value={theme} className="min-w-max">
                {theme}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {Object.keys(themeGroups).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? t("noMatchingKeywords") : t("noKeywordsAvailable")}
              </div>
            ) : (
              <>
                {/* Word cloud visualization for all words */}
                <div className="flex flex-wrap gap-2 justify-center py-4">
                  {filteredKeywords
                    .sort((a, b) => b.frequency - a.frequency)
                    .slice(0, 50)
                    .map((keyword) => (
                      <button
                        key={keyword.word}
                        className={`px-2 py-1 rounded-full transition-all ${
                          selectedKeyword?.word === keyword.word
                            ? 'ring-2 ring-primary'
                            : 'hover:bg-muted'
                        }`}
                        style={{
                          fontSize: getFontSize(keyword.frequency),
                          color: keyword.color || (keyword.tone ? getThemeColor(keyword.tone) : undefined)
                        }}
                        onClick={() => handleKeywordClick(keyword)}
                      >
                        {keyword.word}
                      </button>
                    ))}
                </div>
                
                {/* Theme groupings */}
                <div className="space-y-4">
                  {Object.entries(themeGroups).map(([theme, keywords]) => (
                    <div key={theme} className="border rounded-lg p-4">
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
                        {keywords.slice(0, 10).map(word => (
                          <Badge 
                            key={word.word} 
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleKeywordClick(word)}
                          >
                            {word.word}
                          </Badge>
                        ))}
                        {keywords.length > 10 && (
                          <Badge variant="outline">+{keywords.length - 10} more</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Individual theme tabs */}
          {Object.entries(themeGroups).map(([theme, words]) => (
            <TabsContent key={theme} value={theme} className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: getThemeColor(theme) }}
                  ></div>
                  {theme} Theme
                </h3>
                
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {words.map(word => (
                      <div 
                        key={word.word} 
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedKeyword?.word === word.word ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleKeywordClick(word)}
                      >
                        <div className="font-medium truncate">{word.word}</div>
                        <div className="text-sm text-muted-foreground">
                          Frequency: {word.frequency}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Selected keyword details */}
        {selectedKeyword && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium">{selectedKeyword.word}</h4>
                <Badge className="mt-1" variant="outline">
                  {selectedKeyword.tone || 'Neutral'}
                </Badge>
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
              <div className="p-2 bg-white rounded border">
                <span className="text-sm text-muted-foreground">Frequency:</span>
                <span className="block font-medium">{selectedKeyword.frequency}</span>
              </div>
              
              {selectedKeyword.score !== undefined && (
                <div className="p-2 bg-white rounded border">
                  <span className="text-sm text-muted-foreground">Sentiment:</span>
                  <span className="block font-medium">
                    {Math.round((selectedKeyword.score) * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            {/* Related words */}
            <div className="mt-3">
              <h5 className="text-sm font-medium mb-2">Related words:</h5>
              <div className="flex flex-wrap gap-1">
                {getRelatedWords(selectedKeyword).length > 0 ? (
                  getRelatedWords(selectedKeyword).map(related => (
                    <Badge 
                      key={related.word} 
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleKeywordClick(related)}
                    >
                      {related.word}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No related words found</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
