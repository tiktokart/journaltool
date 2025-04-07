
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleBackgroundProps {
  containerRef: React.RefObject<HTMLDivElement>;
  points: { position: number[] }[];
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

    // Create particles
    const particleCount = 2000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random position within boundaries
      particlePositions[i * 3] = minX + Math.random() * (maxX - minX);
      particlePositions[i * 3 + 1] = minY + Math.random() * (maxY - minY);
      particlePositions[i * 3 + 2] = minZ + Math.random() * (maxZ - minZ);
      
      // Random size
      particleSizes[i] = Math.random() * 0.05 + 0.02;
      
      // Green color with slight variation
      const greenIntensity = 0.8 + Math.random() * 0.2;
      particleColors[i * 3] = 0.8 * Math.random(); // Red (low)
      particleColors[i * 3 + 1] = 0.7 + 0.3 * greenIntensity; // Green (high)
      particleColors[i * 3 + 2] = 0.4 * Math.random(); // Blue (low)
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.0002;
        particlesRef.current.rotation.y += 0.0001;
      }
      
      renderer.render(scene, camera);
      
      return () => cancelAnimationFrame(animationId);
    };
    
    const animationId = animate();
    
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
