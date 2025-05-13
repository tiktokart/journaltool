
import React from 'react';
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../ui/collapsible";
import { Slider } from "../../ui/slider";
import { SentimentDistribution } from "../../SentimentDistribution";

interface OverviewSectionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sentimentLabel: string;
  sentimentScore: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  documentStats: { wordCount: number; sentenceCount: number; paragraphCount: number };
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  isOpen,
  setIsOpen,
  sentimentLabel,
  sentimentScore,
  sentimentDistribution,
  documentStats
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4 border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <h3 className="text-lg font-medium font-pacifico">Overview</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Overall Sentiment</h4>
            <p className="text-xl font-semibold mb-1">
              {sentimentLabel}
            </p>
            <p className="text-gray-700">
              Score: {Math.round(sentimentScore * 100)}%
            </p>
            <div className="mt-4">
              <Slider
                value={[sentimentScore * 100]}
                max={100}
                step={1}
                disabled={true}
                className="cursor-default"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sentiment Distribution</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Positive</span>
                  <span>{sentimentDistribution.positive || 0}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${sentimentDistribution.positive || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Neutral</span>
                  <span>{sentimentDistribution.neutral || 0}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400"
                    style={{ width: `${sentimentDistribution.neutral || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Negative</span>
                  <span>{sentimentDistribution.negative || 0}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ width: `${sentimentDistribution.negative || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default OverviewSection;
