
import { useState, useEffect } from 'react';
import { DocumentEmbeddingWrapper as OriginalDocumentEmbedding } from '@/components/ui/document-embedding';
import { Point, DocumentEmbeddingProps } from '@/types/embedding';

export const DocumentEmbedding = (props: DocumentEmbeddingProps) => {
  // Convert types to match what the original component expects
  const convertedProps = {
    ...props,
    isInteractive: props.isInteractive === undefined ? true : props.isInteractive,
    depressedJournalReference: props.depressedJournalReference === undefined ? false : props.depressedJournalReference,
    visibleClusterCount: props.visibleClusterCount === undefined ? 5 : props.visibleClusterCount,
  };

  return <OriginalDocumentEmbedding {...convertedProps} />;
};
