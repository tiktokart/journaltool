import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleBackgroundProps {
  containerRef: React.RefObject<HTMLDivElement>;
  points: { position: number[], emotionalTone?: string, color?: number[] }[];
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ containerRef, points }) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    // Create renderer with transparency
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Setup the renderer size
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    renderer.setSize(containerWidth, containerHeight);
    
    // Add canvas as background
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    containerRef.current.appendChild(renderer.domElement);

    // Group points by emotional tone
    const emotionalGroupings = new Map<string, { 
      points: { position: number[] }[],
      color: number[],
      center: number[],
      radius: number
    }>();
    
    // Default colors for emotional groups (you can adjust these)
    const defaultColors = {
      "Anxiety": [0.5, 0.9, 0.5],       // Light green
      "Anger": [0.8, 0.5, 0.5],         // Light red
      "Fear": [0.5, 0.5, 0.9],          // Light blue
      "Sadness": [0.6, 0.6, 0.9],       // Light purple
      "Confusion": [0.9, 0.9, 0.5],     // Light yellow
      "Shame": [0.9, 0.6, 0.5],         // Light orange
      "Helplessness": [0.7, 0.5, 0.8],  // Light purple
      "Neutral": [0.8, 0.8, 0.8],       // Light gray
      "Unknown": [0.7, 0.9, 0.7]        // Default light green
    };
    
    // Group points by emotional tone
    points.forEach(point => {
      const tone = point.emotionalTone || "Unknown";
      
      if (!emotionalGroupings.has(tone)) {
        emotionalGroupings.set(tone, {
          points: [],
          color: point.color || defaultColors[tone as keyof typeof defaultColors] || defaultColors.Unknown,
          center: [0, 0, 0],
          radius: 0
        });
      }
      
      emotionalGroupings.get(tone)!.points.push(point);
    });
    
    // Calculate center and radius for each group
    emotionalGroupings.forEach((group, tone) => {
      if (group.points.length === 0) return;
      
      let sumX = 0, sumY = 0, sumZ = 0;
      
      group.points.forEach(point => {
        sumX += point.position[0];
        sumY += point.position[1];
        sumZ += point.position[2];
      });
      
      const centerX = sumX / group.points.length;
      const centerY = sumY / group.points.length;
      const centerZ = sumZ / group.points.length;
      
      group.center = [centerX, centerY, centerZ];
      
      // Calculate radius (max distance from center to any point)
      let maxDistance = 0;
      group.points.forEach(point => {
        const dx = point.position[0] - centerX;
        const dy = point.position[1] - centerY;
        const dz = point.position[2] - centerZ;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        maxDistance = Math.max(maxDistance, distance);
      });
      
      // Add some padding to the radius
      group.radius = maxDistance * 1.5;
    });

    // Calculate boundaries of the points
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    points.forEach(point => {
      minX = Math.min(minX, point.position[0]);
      maxX = Math.max(maxX, point.position[0]);
      minY = Math.min(minY, point.position[1]);
      maxY = Math.max(maxY, point.position[1]);
      minZ = Math.min(minZ, point.position[2]);
      maxZ = Math.max(maxZ, point.position[2]);
    });
    
    // Add padding to the boundaries
    const padding = 1.5;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;
    minZ -= padding;
    maxZ += padding;

    // Create particles - increase count for more density
    const particleCount = 3000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random position within boundaries
      particlePositions[i * 3] = minX + Math.random() * (maxX - minX);
      particlePositions[i * 3 + 1] = minY + Math.random() * (maxY - minY);
      particlePositions[i * 3 + 2] = minZ + Math.random() * (maxZ - minZ);
      
      // Determine if this particle is inside any emotional group
      const x = particlePositions[i * 3];
      const y = particlePositions[i * 3 + 1];
      const z = particlePositions[i * 3 + 2];
      
      let insideAnyGroup = false;
      let groupColor = [0.8, 0.9, 0.8]; // Default light green
      
      // Check if particle is within any group's radius
      emotionalGroupings.forEach(group => {
        const dx = x - group.center[0];
        const dy = y - group.center[1];
        const dz = z - group.center[2];
        const distanceToCenter = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (distanceToCenter <= group.radius) {
          insideAnyGroup = true;
          groupColor = group.color;
          
          // Adjust particle size based on distance from center (larger near center)
          const distanceRatio = 1 - (distanceToCenter / group.radius);
          particleSizes[i] = 0.05 + (distanceRatio * 0.1);
        }
      });
      
      // If not in any group, assign a smaller size
      if (!insideAnyGroup) {
        particleSizes[i] = 0.02 + Math.random() * 0.03;
        
        // Sparse green particles for areas outside groups
        particleColors[i * 3] = 0.7 + Math.random() * 0.2; // Red (low) 
        particleColors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // Green (high)
        particleColors[i * 3 + 2] = 0.7 + Math.random() * 0.2; // Blue (low)
      } else {
        // Use group color with variation
        const colorVariation = 0.2; // Amount of variation
        particleColors[i * 3] = groupColor[0] * (0.8 + Math.random() * colorVariation); 
        particleColors[i * 3 + 1] = groupColor[1] * (0.8 + Math.random() * colorVariation);
        particleColors[i * 3 + 2] = groupColor[2] * (0.8 + Math.random() * colorVariation);
      }
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    // Create custom shader material for better-looking particles
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.0002;
        particlesRef.current.rotation.y += 0.0001;
      }
      
      renderer.render(scene, camera);
    };
    
    // Start the animation and keep track of the ID
    const animationId = requestAnimationFrame(animate);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(containerWidth, containerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [containerRef, points]);

  return null;
};

export default ParticleBackground;
