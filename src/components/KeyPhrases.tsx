
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Lightbulb, Tag, PlusCircle, MinusCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface KeyPhrase {
  phrase: string;
  score: number;
  count: number;
}

interface KeyPhrasesProps {
  data: KeyPhrase[];
  sourceDescription?: string;
}

export const KeyPhrases = ({ data, sourceDescription }: KeyPhrasesProps) => {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  const [primaryPhrases, setPrimaryPhrases] = useState<KeyPhrase[]>([]);
  const [secondaryPhrases, setSecondaryPhrases] = useState<KeyPhrase[]>([]);
  const [tertiaryPhrases, setTertiaryPhrases] = useState<KeyPhrase[]>([]);

  // Group emotional categories based on score
  useEffect(() => {
    try {
      if (!data || !Array.isArray(data)) {
        console.warn("Invalid data provided to KeyPhrases component:", data);
        return;
      }
      
      // Sort by score (highest first)
      const sortedData = [...data].sort((a, b) => b.score - a.score);
      
      // Divide into primary (high score), secondary (medium), and tertiary (lower) phrases
      const primary = sortedData.filter(phrase => phrase.score >= 0.65);
      const secondary = sortedData.filter(phrase => phrase.score >= 0.5 && phrase.score < 0.65);
      const tertiary = sortedData.filter(phrase => phrase.score < 0.5);
      
      setPrimaryPhrases(primary);
      setSecondaryPhrases(secondary);
      setTertiaryPhrases(tertiary);
    } catch (error) {
      console.error("Error processing key phrases:", error);
    }
  }, [data]);

  // Function to categorize key phrases into emotional groups
  const categorizeEmotions = (phrases: KeyPhrase[]) => {
    const emotionCategories = {
      'Joy': ['happy', 'joy', 'excitement', 'delight', 'pleased', 'cheerful', 'content', 'love', 'thrill', 'elation'],
      'Sadness': ['sad', 'grief', 'sorrow', 'depression', 'melancholy', 'upset', 'unhappy', 'blue', 'regret'],
      'Fear': ['afraid', 'fear', 'anxiety', 'nervous', 'worry', 'panic', 'dread', 'terror', 'scared', 'horror'],
      'Anger': ['angry', 'rage', 'fury', 'mad', 'irritated', 'annoyed', 'hostile', 'bitter', 'resentment', 'hatred'],
      'Surprise': ['surprised', 'shock', 'amazement', 'astonishment', 'wonder', 'startled', 'unexpected'],
      'Trust': ['trust', 'believe', 'faith', 'confidence', 'reliance', 'assurance', 'conviction', 'dependence'],
      'Anticipation': ['anticipation', 'waiting', 'expecting', 'looking forward', 'hope', 'excitement', 'preparation'],
      'Disgust': ['disgust', 'revulsion', 'repulsion', 'distaste', 'aversion', 'loathing', 'dislike']
    };
    
    const categorized: Record<string, KeyPhrase[]> = {};
    
    phrases.forEach(phrase => {
      let matchFound = false;
      
      for (const [emotionCategory, keywords] of Object.entries(emotionCategories)) {
        for (const keyword of keywords) {
          if (phrase.phrase.toLowerCase().includes(keyword)) {
            if (!categorized[emotionCategory]) {
              categorized[emotionCategory] = [];
            }
            categorized[emotionCategory].push(phrase);
            matchFound = true;
            break;
          }
        }
        if (matchFound) break;
      }
      
      if (!matchFound) {
        if (!categorized['Other']) {
          categorized['Other'] = [];
        }
        categorized['Other'].push(phrase);
      }
    });
    
    return categorized;
  };

  // Group key phrases by emotional categories
  const emotionGroups = categorizeEmotions([...primaryPhrases, ...secondaryPhrases, ...tertiaryPhrases]);

  // Select color based on emotion category
  const getEmotionColor = (emotion: string) => {
    switch(emotion) {
      case 'Joy': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Sadness': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fear': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Anger': return 'bg-red-100 text-red-800 border-red-300';
      case 'Surprise': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'Trust': return 'bg-green-100 text-green-800 border-green-300';
      case 'Anticipation': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Disgust': return 'bg-stone-100 text-stone-800 border-stone-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-pacifico">
          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
          {t("keyPhrases")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Theme Categories</h3>
          
          <div className="flex flex-wrap gap-3">
            {Object.keys(emotionGroups).map(emotion => (
              <div key={emotion} className={`p-3 rounded-md border ${getEmotionColor(emotion)}`}>
                <div className="font-medium mb-2">{emotion}</div>
                <div className="flex flex-wrap gap-2">
                  {emotionGroups[emotion].slice(0, showAll ? undefined : 3).map((phrase, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {phrase.phrase}
                    </Badge>
                  ))}
                  
                  {emotionGroups[emotion].length > 3 && !showAll && (
                    <Badge variant="outline" className="bg-white/50 cursor-pointer" onClick={() => setShowAll(true)}>
                      +{emotionGroups[emotion].length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="flex items-center text-sm text-muted-foreground mt-4" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <MinusCircle className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-1" />
                Show all phrases
              </>
            )}
          </button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Key Phrases</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-purple-800 mb-2">Primary Themes</h4>
              <div className="flex flex-wrap gap-2">
                {primaryPhrases.slice(0, showAll ? undefined : 5).map((phrase, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-purple-50 text-purple-800 hover:bg-purple-100">
                    {phrase.phrase}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">Secondary Themes</h4>
              <div className="flex flex-wrap gap-2">
                {secondaryPhrases.slice(0, showAll ? undefined : 5).map((phrase, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-800 hover:bg-blue-100">
                    {phrase.phrase}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-2">Supporting Themes</h4>
              <div className="flex flex-wrap gap-2">
                {tertiaryPhrases.slice(0, showAll ? undefined : 5).map((phrase, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-green-50 text-green-800 hover:bg-green-100">
                    {phrase.phrase}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
