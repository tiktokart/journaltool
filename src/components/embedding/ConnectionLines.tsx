
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Point } from '@/types/embedding';

interface ConnectionLinesProps {
  selectedPoint: Point | null;
  connectedPoints: Point[];
  lineWidth?: number;
  lineOpacity?: number;
}

const ConnectionLines = ({ 
  selectedPoint, 
  connectedPoints,
  lineWidth = 2,
  lineOpacity = 0.5
}: ConnectionLinesProps) => {
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  
  useEffect(() => {
    // Only render if we have a selected point and connected points
    if (!selectedPoint || connectedPoints.length === 0) {
      if (geometryRef.current) {
        geometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
        if (linesRef.current) linesRef.current.visible = false;
      }
      return;
    }
    
    // Create line geometry
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    // For each connected point, create a line from selected point to it
    connectedPoints.forEach(connectedPoint => {
      if (selectedPoint && connectedPoint.position) {
        positions.push(
          ...selectedPoint.position,
          ...connectedPoint.position
        );
      }
    });
    
    // Set position attribute
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometryRef.current = geometry;
    
    // Make lines visible
    if (linesRef.current) linesRef.current.visible = true;
    
  }, [selectedPoint, connectedPoints]);
  
  return (
    <lineSegments ref={linesRef}>
      {geometryRef.current && <primitive object={geometryRef.current} attach="geometry" />}
      <lineBasicMaterial 
        attach="material" 
        color="#ffffff" 
        transparent={true} 
        opacity={lineOpacity} 
        linewidth={lineWidth} 
      />
    </lineSegments>
  );
};

export default ConnectionLines;
