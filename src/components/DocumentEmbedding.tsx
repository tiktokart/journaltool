
import { useState, useEffect } from 'react';
import { DocumentEmbeddingWrapper as OriginalDocumentEmbedding } from '@/components/ui/document-embedding';
import { Point, DocumentEmbeddingProps } from '@/types/embedding';
import { useRef } from 'react';
import EmbeddingScene from '@/components/embedding/EmbeddingScene';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const DocumentEmbedding = (props: DocumentEmbeddingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [comparisonPoint, setComparisonPoint] = useState<Point | null>(null);
  
  // Handle point selection
  const handlePointSelect = (point: Point | null) => {
    setSelectedPoint(point);
    if (props.onPointClick) {
      props.onPointClick(point);
    }
  };
  
  // Convert types to match what the original component expects
  const convertedProps = {
    ...props,
    points: props.points || [], // Ensure points is never undefined
    isInteractive: props.isInteractive === undefined ? true : props.isInteractive,
    depressedJournalReference: props.depressedJournalReference === undefined ? false : props.depressedJournalReference,
    visibleClusterCount: props.visibleClusterCount === undefined ? 5 : props.visibleClusterCount,
  };

  if (props.points.length === 0) {
    return (
      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-lg font-medium">Document Embedding Visualization</p>
          <p className="text-sm text-muted-foreground mt-2">No data available for visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <EmbeddingScene
        points={props.points}
        containerRef={containerRef}
        cameraRef={cameraRef}
        controlsRef={controlsRef}
        isInteractive={props.isInteractive}
        onPointSelect={handlePointSelect}
        focusOnWord={props.focusOnWord}
        selectedPoint={selectedPoint}
        comparisonPoint={comparisonPoint}
        depressedJournalReference={props.depressedJournalReference}
        onResetView={props.onResetView}
        visibleClusterCount={props.visibleClusterCount}
      />
    </div>
  );
};
