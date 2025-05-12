
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeyRound, Book, Hash, ArrowDownUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

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
  const [sortBy, setSortBy] = useState<'size' | 'alphabetical'>('size');
  const [themesByCategory, setThemesByCategory] = useState<{[key: string]: KeyPhrase[]}>({});
  
  // Process data to organize phrases by theme and category
  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      setThemesByCategory({});
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
    
    // Order categories according to themeCategories array and sort by count
    const orderedThemes: {[key: string]: KeyPhrase[]} = {};
    
    // Sort categories by size or alphabetically
    const sortedCategories = sortBy === 'size' 
      ? Object.keys(themes).sort((a, b) => themes[b].length - themes[a].length)
      : Object.keys(themes).sort();
    
    // Add sorted categories to the ordered themes
    sortedCategories.forEach(category => {
      orderedThemes[category] = themes[category];
    });
    
    setThemesByCategory(orderedThemes);
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
  
  return (
    <Card className="border shadow-md bg-white">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl flex items-center font-pacifico">
            <KeyRound className="h-5 w-5 mr-2" />
            Content Theme Analysis
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortBy(sortBy === 'size' ? 'alphabetical' : 'size')}
            className="flex items-center text-xs h-8"
          >
            <ArrowDownUp className="h-3 w-3 mr-1.5" />
            Sort: {sortBy === 'size' ? 'By Size' : 'Alphabetical'}
          </Button>
        </div>
        
        {sourceDescription && (
          <CardDescription>{sourceDescription}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No themes available in the content
          </div>
        ) : Object.keys(themesByCategory).length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Processing content themes...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Theme Visualization */}
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.entries(themesByCategory).map(([category, phrases]) => {
                // Calculate size based on number of phrases
                const minSize = 70;
                const maxSize = 180; 
                const maxPhrases = Math.max(...Object.values(themesByCategory).map(p => p.length));
                const size = minSize + (phrases.length / maxPhrases) * (maxSize - minSize);
                
                return (
                  <div 
                    key={`bubble-${category}`}
                    className={`rounded-full flex flex-col items-center justify-center ${getThemeBadgeColor(category).split(' ')[0]} border shadow-md transition-all hover:scale-105 p-2 text-center`}
                    style={{ 
                      width: `${size}px`, 
                      height: `${size}px`
                    }}
                  >
                    <div className="font-semibold text-sm">{category}</div>
                    <div className="text-xs mt-1">{phrases.length} elements</div>
                  </div>
                );
              })}
            </div>
            
            {/* Theme Categories Details */}
            {Object.entries(themesByCategory).map(([category, phrases]) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Book className="h-4 w-4 mr-1.5" />
                  {category}
                  <Badge variant="outline" className="ml-2">{phrases.length}</Badge>
                </h3>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-slate-50">
                  {phrases.map((phrase, i) => (
                    <Badge 
                      key={`${phrase.word}-${i}`}
                      variant="secondary"
                      className={`cursor-default transition-colors ${getThemeBadgeColor(category)}`}
                    >
                      {phrase.word}
                      {phrase.sentiment !== undefined && (
                        <span className={`ml-1 text-xs ${getSentimentColor(phrase.sentiment)}`}>
                          {phrase.sentiment >= 0.6 ? "+" : 
                           phrase.sentiment <= 0.4 ? "-" : 
                           "~"}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
