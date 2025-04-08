
import { useState, useEffect } from 'react';
import { DocumentEmbeddingWrapper as OriginalDocumentEmbedding } from '@/components/ui/document-embedding';
import { Point } from '@/types/embedding';

interface DocumentEmbeddingProps {
  points: Point[];
  onPointClick?: (point: Point | null) => void;
  isInteractive?: boolean;
  depressedJournalReference?: boolean;
  focusOnWord?: string | null;
  sourceDescription?: string;
  onResetView?: () => void;
  visibleClusterCount?: number;
  onComparePoint?: (point: Point) => void;
  onSearchSelect?: (point: Point) => void;
}

export const DocumentEmbedding = (props: DocumentEmbeddingProps) => {
  // Convert types to match what the original component expects
  const convertedProps = {
    ...props,
    isInteractive: props.isInteractive === undefined ? true : props.isInteractive,
    depressedJournalReference: props.depressedJournalReference === undefined ? false : props.depressedJournalReference,
    visibleClusterCount: props.visibleClusterCount === undefined ? 5 : Number(props.visibleClusterCount),
  };

  return <OriginalDocumentEmbedding {...convertedProps} />;
};
