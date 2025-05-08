
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown } from "lucide-react";
import { WordComparison } from "@/components/WordComparison";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";

interface WordComparisonControllerProps {
  points: Point[];
  selectedPoint: Point | null;
  sourceDescription?: string;
  calculateRelationship: (point1: Point, point2: Point) => any;
}

const WordComparisonController = ({ 
  points, 
  selectedPoint,
  sourceDescription,
  calculateRelationship
}: WordComparisonControllerProps) => {
  const { t } = useLanguage();
  const [word1, setWord1] = useState<string>("");
  const [word2, setWord2] = useState<string>("");
  const [selectedWords, setSelectedWords] = useState<Point[]>([]);

  const handleAddWord = () => {
    const wordToAdd = word1.trim();
    
    if (!wordToAdd) return;
    
    const matchingPoint = points.find(
      point => point.word.toLowerCase() === wordToAdd.toLowerCase()
    );
    
    if (matchingPoint) {
      if (!selectedWords.some(w => w.id === matchingPoint.id)) {
        setSelectedWords(prev => [...prev, matchingPoint]);
      }
      setWord1("");
    }
  };

  const handleRemoveWord = (wordId: string) => {
    setSelectedWords(selectedWords.filter(word => word.id !== wordId));
  };

  return (
    <Card className="border border-border shadow-md bg-light-lavender">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Word Comparison</span>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t("enterAWord")}
              value={word1}
              onChange={(e) => setWord1(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddWord();
              }}
              className="max-w-[200px]"
            />
            <Button 
              onClick={handleAddWord} 
              variant="outline"
              size="sm"
            >
              {t("addWord")}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedWords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No Words Selected</p>
            <ArrowDown className="h-5 w-5 mx-auto mt-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-1">{t("addAWordToCompare")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {selectedWords.map(word => (
                <Button
                  key={word.id}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleRemoveWord(word.id)}
                >
                  {word.word}
                  <span className="ml-1 opacity-70">×</span>
                </Button>
              ))}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedWords.map((word, i) => (
                <div key={i}>
                  {selectedWords.slice(i + 1).map((otherWord, j) => (
                    <WordComparison
                      key={`${i}-${j}`}
                      word1={word}
                      word2={otherWord}
                      sourceDescription={sourceDescription}
                      relationship={calculateRelationship(word, otherWord)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordComparisonController;
