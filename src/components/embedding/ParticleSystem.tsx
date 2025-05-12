
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Point } from '@/types/embedding';

interface ParticleSystemProps {
  points: Point[];
  selectedEmotionalGroup?: string | null;
  selectedPoint?: Point | null;
  pointSize?: number;
  isAnimated?: boolean;
}

const ParticleSystem = ({ 
  points, 
  selectedEmotionalGroup = null,
  selectedPoint = null,
  pointSize = 4,
  isAnimated = true 
}: ParticleSystemProps) => {
  const pointsRef = useRef<THREE.Points | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const initialPositions = useRef<Float32Array | null>(null);
  
  // Create and update particles
  useEffect(() => {
    if (!points || points.length === 0) return;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Extract positions and colors
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const sizes = new Float32Array(points.length);
    const visibilities = new Float32Array(points.length);
    
    // Create points
    points.forEach((point, i) => {
      if (!point.position || point.position.length < 3) return;
      
      const [x, y, z] = point.position;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      let color = point.color;
      if (Array.isArray(color) && color.length >= 3) {
        colors[i * 3] = color[0];
        colors[i * 3 + 1] = color[1];
        colors[i * 3 + 2] = color[2];
      } else {
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 0.7;
      }
      
      // Set size based on selected point or frequency
      const isSelected = selectedPoint && (point.id === selectedPoint.id);
      const isConnected = selectedPoint && selectedPoint.relationships?.some(r => r.id === point.id);
      
      // Base size with scaling for selected/connected points
      sizes[i] = pointSize * (isSelected ? 2 : isConnected ? 1.5 : 1) * (point.frequency ? Math.min(2, Math.sqrt(point.frequency) / 2 + 0.8) : 1);
      
      // Set visibility based on emotional group filter
      visibilities[i] = selectedEmotionalGroup && point.emotionalTone !== selectedEmotionalGroup ? 0.2 : 1.0;
    });
    
    // Set attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('visibility', new THREE.BufferAttribute(visibilities, 1));
    
    // Store initial positions for animations
    initialPositions.current = positions.slice();
    
    // Save geometry reference
    geometryRef.current = geometry;
    
  }, [points, selectedEmotionalGroup, selectedPoint, pointSize]);
  
  // Animation frame
  useFrame(({ clock }) => {
    if (!isAnimated || !pointsRef.current || !geometryRef.current || !initialPositions.current) return;
    
    const time = clock.getElapsedTime();
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    
    // Gently animate particles
    for (let i = 0; i < positions.length / 3; i++) {
      const offsetFactor = 0.05; // How much particles move
      
      // Different frequency for each axis for more natural movement
      const xFreq = 0.2 + (i % 5) * 0.02;
      const yFreq = 0.3 + (i % 3) * 0.01;
      const zFreq = 0.25 + (i % 7) * 0.015;
      
      // Original positions
      const ox = initialPositions.current[i * 3];
      const oy = initialPositions.current[i * 3 + 1];
      const oz = initialPositions.current[i * 3 + 2];
      
      // Apply gentle sine wave animation
      positions[i * 3] = ox + Math.sin(time * xFreq) * offsetFactor;
      positions[i * 3 + 1] = oy + Math.sin(time * yFreq) * offsetFactor;
      positions[i * 3 + 2] = oz + Math.sin(time * zFreq) * offsetFactor;
    }
    
    geometryRef.current.attributes.position.needsUpdate = true;
  });
  
  // Create material with custom shader to handle visibility
  const shaderMaterial = {
    uniforms: {
      pointTexture: { value: new THREE.TextureLoader().load('/particle.png') }
    },
    vertexShader: `
      attribute float size;
      attribute float visibility;
      varying float vVisibility;
      
      void main() {
        vVisibility = visibility;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D pointTexture;
      varying float vVisibility;
      
      void main() {
        gl_FragColor = texture2D(pointTexture, gl_PointCoord);
        if (gl_FragColor.a < 0.5) discard;
        gl_FragColor = vec4(gl_FragColor.rgb, gl_FragColor.a * vVisibility);
      }
    `,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending
  };
  
  return geometryRef.current ? (
    <points ref={pointsRef}>
      <primitive object={geometryRef.current} attach="geometry" />
      <shaderMaterial attach="material" args={[shaderMaterial]} />
    </points>
  ) : null;
};

export default ParticleSystem;
