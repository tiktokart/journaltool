
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export interface ParticleBackgroundProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  points?: { position: number[], emotionalTone?: string, color?: number[] }[];
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  containerRef: externalContainerRef,
  points = []
}) => {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const mountedRef = useRef<boolean>(false);
  const canvasAddedRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize only once or when renderer doesn't exist
    if (!rendererRef.current) {
      // Initialize scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Initialize camera
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 15;
      cameraRef.current = camera;

      // Create renderer with transparency and anti-flickering settings
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true // Helps reduce flickering
      });
      
      renderer.setClearColor(0x000000, 0);
      // Set pixel ratio to device pixel ratio to improve quality
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
    }

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    
    if (!scene || !camera || !renderer || !containerRef.current) return;

    // Setup the renderer size
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    renderer.setSize(containerWidth, containerHeight);
    
    // Add canvas as background - only add it once
    if (!canvasAddedRef.current && containerRef.current) {
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.zIndex = '0';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      containerRef.current.appendChild(renderer.domElement);
      canvasAddedRef.current = true;
    }

    // Remove existing particles if they exist
    if (particlesRef.current) {
      scene.remove(particlesRef.current);
      
      // Clean up previous particles geometry and material
      if (particlesRef.current.geometry) {
        particlesRef.current.geometry.dispose();
      }
      if (particlesRef.current.material) {
        if (Array.isArray(particlesRef.current.material)) {
          particlesRef.current.material.forEach(m => m.dispose());
        } else {
          particlesRef.current.material.dispose();
        }
      }
    }

    // Create a simple particle system for background
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
      particlePositions[i + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x88cc88,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    particlesRef.current = particleSystem;

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.0001;
        particlesRef.current.rotation.y += 0.0001;
      }
      renderer.render(scene, camera);
    };
    
    animate();
    
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      renderer.setSize(width, height);
      if (camera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={externalContainerRef ? undefined : internalContainerRef} className="absolute inset-0" />
  );
};

export default ParticleBackground;
