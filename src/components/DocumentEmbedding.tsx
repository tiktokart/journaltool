
// This is a read-only file, so we'll create a wrapper component to handle the prop type conversion correctly

import { useState, useEffect } from 'react';
import { DocumentEmbedding as OriginalDocumentEmbedding } from '@/components/DocumentEmbedding';
import { Point } from '@/types/embedding';

interface DocumentEmbeddingWrapperProps {
  points: Point[];
  onPointClick?: (point: Point | null) => void;
  isInteractive?: boolean;
  depressedJournalReference?: boolean;
  focusOnWord?: string | null;
  sourceDescription?: string;
  onResetView?: () => void;
  visibleClusterCount?: number;
}

export const DocumentEmbeddingWrapper = (props: DocumentEmbeddingWrapperProps) => {
  // Convert types to match what the original component expects
  const convertedProps = {
    ...props,
    isInteractive: props.isInteractive === undefined ? true : props.isInteractive,
    depressedJournalReference: props.depressedJournalReference === undefined ? false : props.depressedJournalReference,
    visibleClusterCount: props.visibleClusterCount === undefined ? 5 : Number(props.visibleClusterCount),
  };

  return <OriginalDocumentEmbedding {...convertedProps} />;
};
