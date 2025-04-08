
import { useState, useEffect, useRef } from 'react';
import { DocumentEmbeddingWrapper as OriginalDocumentEmbedding } from '@/components/ui/document-embedding';
import { Point, DocumentEmbeddingProps } from '@/types/embedding';
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

  // Share the points with window object for global access (useful for debugging and data sharing)
  useEffect(() => {
    if (typeof window !== 'undefined' && props.points.length > 0) {
      // @ts-ignore - Adding custom property to window
      window.documentEmbeddingPoints = props.points;
      console.log(`Embedding points set: ${props.points.length} points available for visualization`);
    }
  }, [props.points]);
  
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
        isInteractive={props.isInteractive !== undefined ? props.isInteractive : true}
        onPointSelect={handlePointSelect}
        focusOnWord={props.focusOnWord}
        selectedPoint={selectedPoint}
        comparisonPoint={comparisonPoint}
        depressedJournalReference={props.depressedJournalReference !== undefined ? props.depressedJournalReference : false}
        onResetView={props.onResetView}
        visibleClusterCount={props.visibleClusterCount || 5}
      />
    </div>
  );
};
