
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { KeyRound, Book, Tag, Filter, ArrowDownUp, Hash } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface KeyPhrase {
  word: string;
  score?: number;
  type?: string;
  count?: number;
  sentiment?: number;
  category?: string;
  theme?: string;
}

interface KeyPhrasesProps {
  data: KeyPhrase[];
  sourceDescription?: string;
}

export const KeyPhrases = ({ data, sourceDescription }: KeyPhrasesProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('themes');
  const [sortedData, setSortedData] = useState<KeyPhrase[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'alphabetical'>('score');
  const [themesByCategory, setThemesByCategory] = useState<{[key: string]: KeyPhrase[]}>({});
  
  // Process data to organize phrases by theme and category
  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      setSortedData([]);
      return;
    }
    
    // First organize by theme categories
    const themes: {[key: string]: KeyPhrase[]} = {};
    
    // Define some theme categories
    const themeCategories = [
      'Emotions',
      'Relationships',
      'Work',
      'Health',
      'Personal Development',
      'Life Events',
      'Activities',
      'Other'
    ];
    
    // Function to determine theme category based on word
    const getThemeCategory = (word: string, type?: string, theme?: string): string => {
      if (!word) return 'Other';
      
      // First check if the item already has a theme
      if (theme) return theme;
      
      // Use lowercased word for comparison
      const lowerWord = word.toLowerCase();
      
      // Emotional themes
      if (lowerWord.includes('happy') || lowerWord.includes('sad') || 
          lowerWord.includes('joy') || lowerWord.includes('anger') ||
          lowerWord.includes('fear') || lowerWord.includes('anxious') ||
          lowerWord.includes('love') || lowerWord.includes('hate') ||
          lowerWord.includes('worry') || lowerWord.includes('stress') ||
          lowerWord.includes('depress') || lowerWord.includes('peace')) {
        return 'Emotions';
      }
      
      // Relationship themes
      if (lowerWord.includes('friend') || lowerWord.includes('family') ||
          lowerWord.includes('parent') || lowerWord.includes('child') ||
          lowerWord.includes('spouse') || lowerWord.includes('partner') ||
          lowerWord.includes('marriage') || lowerWord.includes('divorce') ||
          lowerWord.includes('relationship')) {
        return 'Relationships';
      }
      
      // Work themes
      if (lowerWord.includes('work') || lowerWord.includes('job') ||
          lowerWord.includes('career') || lowerWord.includes('boss') ||
          lowerWord.includes('coworker') || lowerWord.includes('project') ||
          lowerWord.includes('office') || lowerWord.includes('meeting') ||
          lowerWord.includes('deadline')) {
        return 'Work';
      }
      
      // Health themes
      if (lowerWord.includes('health') || lowerWord.includes('sick') ||
          lowerWord.includes('doctor') || lowerWord.includes('hospital') ||
          lowerWord.includes('pain') || lowerWord.includes('symptom') ||
          lowerWord.includes('ill') || lowerWord.includes('medicine') ||
          lowerWord.includes('exercise') || lowerWord.includes('diet')) {
        return 'Health';
      }
      
      // Personal development
      if (lowerWord.includes('goal') || lowerWord.includes('improve') ||
          lowerWord.includes('learn') || lowerWord.includes('growth') ||
          lowerWord.includes('change') || lowerWord.includes('skill') ||
          lowerWord.includes('better') || lowerWord.includes('progress') ||
          lowerWord.includes('success') || lowerWord.includes('achievement')) {
        return 'Personal Development';
      }
      
      // Life events
      if (lowerWord.includes('birthday') || lowerWord.includes('wedding') ||
          lowerWord.includes('funeral') || lowerWord.includes('graduation') ||
          lowerWord.includes('vacation') || lowerWord.includes('holiday') ||
          lowerWord.includes('anniversary') || lowerWord.includes('event')) {
        return 'Life Events';
      }
      
      // Activities
      if (lowerWord.includes('hobby') || lowerWord.includes('sport') ||
          lowerWord.includes('game') || lowerWord.includes('read') ||
          lowerWord.includes('movie') || lowerWord.includes('travel') ||
          lowerWord.includes('music') || lowerWord.includes('art') ||
          lowerWord.includes('cook') || lowerWord.includes('play')) {
        return 'Activities';
      }
      
      // Default to Other if no category matches
      return 'Other';
    };
    
    // Go through each phrase and assign it to a theme
    data.forEach(phrase => {
      const category = getThemeCategory(phrase.word, phrase.type, phrase.theme);
      
      // Add theme info to the phrase
      const enrichedPhrase = {
        ...phrase,
        category
      };
      
      if (!themes[category]) {
        themes[category] = [];
      }
      themes[category].push(enrichedPhrase);
    });
    
    // Order categories according to themeCategories array
    const orderedThemes: {[key: string]: KeyPhrase[]} = {};
    
    // First add categories from our predefined list that exist in the data
    themeCategories.forEach(category => {
      if (themes[category] && themes[category].length > 0) {
        orderedThemes[category] = themes[category];
      }
    });
    
    // Then add any other categories that weren't in our list
    Object.keys(themes).forEach(category => {
      if (!themeCategories.includes(category)) {
        orderedThemes[category] = themes[category];
      }
    });
    
    setThemesByCategory(orderedThemes);
    
    // Sort data for regular view
    let sorted = [...data];
    
    if (sortBy === 'score') {
      sorted = sorted.sort((a, b) => 
        ((b.score || 0) > (a.score || 0)) ? 1 : -1
      );
    } else {
      sorted = sorted.sort((a, b) => 
        a.word.localeCompare(b.word)
      );
    }
    
    setSortedData(sorted);
  }, [data, sortBy]);

  const getThemeBadgeColor = (category: string) => {
    switch(category) {
      case 'Emotions': return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      case 'Relationships': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'Work': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Health': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Personal Development': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Life Events': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Activities': return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getSentimentColor = (sentiment: number | undefined) => {
    if (sentiment === undefined) return 'text-gray-600';
    if (sentiment >= 0.6) return 'text-green-600';
    if (sentiment <= 0.4) return 'text-red-600';
    return 'text-blue-600';
  };
  
  const getSentimentLabel = (sentiment: number | undefined) => {
    if (sentiment === undefined) return 'Neutral';
    if (sentiment >= 0.8) return 'Very Positive';
    if (sentiment >= 0.6) return 'Positive';
    if (sentiment <= 0.2) return 'Very Negative';
    if (sentiment <= 0.4) return 'Negative';
    return 'Neutral';
  };
  
  return (
    <Card className="border shadow-md bg-white">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl flex items-center font-pacifico">
            <KeyRound className="h-5 w-5 mr-2" />
            Thematic Keywords
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortBy(sortBy === 'score' ? 'alphabetical' : 'score')}
            className="flex items-center text-xs h-8"
          >
            <ArrowDownUp className="h-3 w-3 mr-1.5" />
            Sort: {sortBy === 'score' ? 'By Relevance' : 'Alphabetical'}
          </Button>
        </div>
        
        {sourceDescription && (
          <CardDescription>{sourceDescription}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No key phrases or themes available
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="themes" className="flex items-center">
                <Book className="h-4 w-4 mr-1.5" />
                Themes
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex items-center">
                <Tag className="h-4 w-4 mr-1.5" />
                Keywords
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="themes" className="space-y-4">
              {Object.keys(themesByCategory).length > 0 ? (
                Object.entries(themesByCategory).map(([category, phrases]) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Hash className="h-4 w-4 mr-1.5" />
                      {category}
                      <Badge variant="outline" className="ml-2">{phrases.length}</Badge>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {phrases.map((phrase, i) => (
                        <Badge 
                          key={`${phrase.word}-${i}`}
                          variant="secondary"
                          className={`cursor-default transition-colors ${getThemeBadgeColor(category)}`}
                        >
                          {phrase.word}
                          {phrase.sentiment !== undefined && (
                            <span className={`ml-1 text-xs ${getSentimentColor(phrase.sentiment)}`}>
                              ({getSentimentLabel(phrase.sentiment)})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No themes detected in the text
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="keywords" className="p-0">
              <div className="flex flex-wrap gap-2">
                {sortedData.map((phrase, index) => (
                  <Badge 
                    key={`${phrase.word}-${index}`}
                    variant="secondary" 
                    className={`cursor-default ${
                      phrase.sentiment && phrase.sentiment > 0.6 ? 'bg-green-100 text-green-800' : 
                      phrase.sentiment && phrase.sentiment < 0.4 ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {phrase.word}
                    {phrase.score && (
                      <span className="ml-1 opacity-70 text-xs">
                        {phrase.score.toFixed(2)}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
