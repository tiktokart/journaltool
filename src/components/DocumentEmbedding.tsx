
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const DocumentEmbedding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 10000;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Generate points in a spherical cloud
    for (let i = 0; i < particleCount; i++) {
      // Generate points in a 3D gaussian distribution
      const radius = 10 * Math.pow(Math.random(), 1/3);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Color based on position (purplish gradient)
      const distanceFromCenter = Math.sqrt(x*x + y*y + z*z) / 10;
      colors[i * 3] = 0.5 - distanceFromCenter * 0.1;     // R
      colors[i * 3 + 1] = 0.3 - distanceFromCenter * 0.1; // G
      colors[i * 3 + 2] = 1 - distanceFromCenter * 0.3;   // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const pointCloud = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(pointCloud);
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate point cloud slowly
      pointCloud.rotation.y += 0.001;
      pointCloud.rotation.x += 0.0005;
      
      renderer.render(scene, camera);
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.remove(pointCloud);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] rounded-lg overflow-hidden"
    />
  );
};
