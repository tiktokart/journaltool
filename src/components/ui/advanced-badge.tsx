
import React from 'react';
import { Badge, BadgeProps } from './badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AdvancedBadgeProps extends BadgeProps {
  emotion?: string;
  sentiment?: number;
  clickable?: boolean;
  title?: string; // Add title for tooltip
}

export function AdvancedBadge({
  children,
  className,
  emotion,
  sentiment,
  clickable = false,
  title,
  ...props
}: AdvancedBadgeProps) {
  // Get emotion-specific colors
  const getEmotionColor = (emotion?: string) => {
    if (!emotion) return { bg: '', text: '', hover: '' };
    
    const colorMap: Record<string, {bg: string, text: string, hover: string}> = {
      joy: {bg: 'bg-yellow-100', text: 'text-yellow-800', hover: 'hover:bg-yellow-200'},
      happiness: {bg: 'bg-yellow-100', text: 'text-yellow-800', hover: 'hover:bg-yellow-200'},
      sadness: {bg: 'bg-blue-100', text: 'text-blue-800', hover: 'hover:bg-blue-200'},
      anger: {bg: 'bg-red-100', text: 'text-red-800', hover: 'hover:bg-red-200'},
      fear: {bg: 'bg-purple-100', text: 'text-purple-800', hover: 'hover:bg-purple-200'},
      disgust: {bg: 'bg-green-100', text: 'text-green-800', hover: 'hover:bg-green-200'},
      surprise: {bg: 'bg-pink-100', text: 'text-pink-800', hover: 'hover:bg-pink-200'},
      trust: {bg: 'bg-teal-100', text: 'text-teal-800', hover: 'hover:bg-teal-200'},
      anticipation: {bg: 'bg-orange-100', text: 'text-orange-800', hover: 'hover:bg-orange-200'},
      calm: {bg: 'bg-sky-100', text: 'text-sky-800', hover: 'hover:bg-sky-200'},
      nervous: {bg: 'bg-violet-100', text: 'text-violet-800', hover: 'hover:bg-violet-200'},
      anxious: {bg: 'bg-violet-100', text: 'text-violet-800', hover: 'hover:bg-violet-200'},
      positive: {bg: 'bg-emerald-100', text: 'text-emerald-800', hover: 'hover:bg-emerald-200'},
      negative: {bg: 'bg-rose-100', text: 'text-rose-800', hover: 'hover:bg-rose-200'},
      neutral: {bg: 'bg-gray-100', text: 'text-gray-800', hover: 'hover:bg-gray-200'},
      action: {bg: 'bg-blue-100', text: 'text-blue-800', hover: 'hover:bg-blue-200'},
      topic: {bg: 'bg-purple-100', text: 'text-purple-800', hover: 'hover:bg-purple-200'},
    };
    
    const lowerEmotion = emotion.toLowerCase();
    return colorMap[lowerEmotion] || {bg: 'bg-gray-100', text: 'text-gray-800', hover: 'hover:bg-gray-200'};
  };

  // Get sentiment-specific colors
  const getSentimentColor = (sentiment?: number) => {
    if (sentiment === undefined) return { bg: '', text: '', hover: '' };
    
    if (sentiment >= 0.7) return {bg: 'bg-emerald-100', text: 'text-emerald-800', hover: 'hover:bg-emerald-200'};
    if (sentiment >= 0.5) return {bg: 'bg-green-100', text: 'text-green-800', hover: 'hover:bg-green-200'};
    if (sentiment >= 0.4) return {bg: 'bg-gray-100', text: 'text-gray-800', hover: 'hover:bg-gray-200'};
    if (sentiment >= 0.25) return {bg: 'bg-amber-100', text: 'text-amber-800', hover: 'hover:bg-amber-200'};
    return {bg: 'bg-rose-100', text: 'text-rose-800', hover: 'hover:bg-rose-200'};
  };
  
  const colorClasses = emotion ? getEmotionColor(emotion) : 
                       sentiment !== undefined ? getSentimentColor(sentiment) : 
                       { bg: '', text: '', hover: '' };
  
  const badgeContent = (
    <Badge
      className={cn(
        colorClasses.bg,
        colorClasses.text,
        clickable && 'cursor-pointer',
        clickable && colorClasses.hover,
        clickable && 'transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  );

  // Wrap with tooltip if title exists
  if (title) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
          {emotion && <p>Emotional category: {emotion}</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return badgeContent;
}
