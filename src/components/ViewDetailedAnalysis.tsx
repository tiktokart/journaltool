
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdvancedBadge } from "@/components/ui/advanced-badge"; 

interface ViewDetailedAnalysisProps {
  summary: string;
  wordCount?: number;
  sourceDescription?: string;
  bertAnalysis?: any;
}

export const ViewDetailedAnalysis: React.FC<ViewDetailedAnalysisProps> = ({ 
  summary, 
  wordCount,
  sourceDescription,
  bertAnalysis
}) => {
  // Extract action verbs and main topics from BERT analysis if available
  const actionVerbs = bertAnalysis?.keywords
    ?.filter((kw: any) => kw.pos === 'verb')
    ?.sort((a: any, b: any) => b.weight - a.weight)
    ?.slice(0, 10)
    ?.map((kw: any) => ({ word: kw.word, tone: kw.tone, weight: kw.weight })) || [];
    
  const mainTopics = bertAnalysis?.keywords
    ?.filter((kw: any) => kw.pos === 'noun')
    ?.sort((a: any, b: any) => b.frequency - a.frequency)
    ?.slice(0, 8)
    ?.map((kw: any) => ({ word: kw.word, tone: kw.tone, weight: kw.weight })) || [];

  // Get emotional tones from BERT if available
  const emotionalTones = bertAnalysis?.emotionalTones || [];

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium mb-2">Summary</h3>
          <p className="text-sm text-muted-foreground">{summary || "No summary available."}</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Action Verbs Card */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-2">Action Verbs</h3>
            {actionVerbs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {actionVerbs.map((item: any, index: number) => (
                  <AdvancedBadge
                    key={index}
                    emotion={item.tone || "neutral"}
                    clickable
                    className="text-xs cursor-pointer transition-all hover:scale-105"
                  >
                    {item.word}
                  </AdvancedBadge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No action verbs detected.</p>
            )}
          </CardContent>
        </Card>

        {/* Main Topics Card */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-2">Main Topics</h3>
            {mainTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mainTopics.map((item: any, index: number) => (
                  <AdvancedBadge
                    key={index}
                    emotion={item.tone || "neutral"}
                    clickable
                    className="text-xs cursor-pointer transition-all hover:scale-105"
                  >
                    {item.word}
                  </AdvancedBadge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No main topics detected.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Emotional Tones */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium mb-2">Emotional Tones</h3>
          {emotionalTones.length > 0 ? (
            <div className="space-y-2">
              {emotionalTones.slice(0, 5).map((tone: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <AdvancedBadge emotion={tone.tone}>
                    {tone.tone}
                  </AdvancedBadge>
                  <div className="flex-grow mx-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600" 
                        style={{ width: `${(tone.count / emotionalTones[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium">{tone.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No emotional tones detected.</p>
          )}
        </CardContent>
      </Card>

      {/* Word Count */}
      {wordCount && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-2">Word Count</h3>
            <p>{wordCount}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Source Description */}
      {sourceDescription && (
        <div className="text-xs text-muted-foreground mt-2">
          Source: {sourceDescription}
        </div>
      )}
    </div>
  );
};
