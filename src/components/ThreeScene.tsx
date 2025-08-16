// src/components/ThreeScene.tsx
"use client";

import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

export function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  const sceneColors = useMemo(() => [
    new THREE.Color('#00ffff'), // cyan
    new THREE.Color('#4d00ff'), // purple
    new THREE.Color('#ff00ff'), // pink
    new THREE.Color('#0077ff'), // blue
    new THREE.Color('#ffffff'), // white
  ], []);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // Particles
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
        // Spiral formation
        const i3 = i * 3;
        const radius = Math.random() * 5 + 1;
        const angle = 0.1 * i;
        const y = (i / (particleCount * 3) - 0.5) * 20;

        posArray[i3] = radius * Math.sin(angle);
        posArray[i3 + 1] = y;
        posArray[i3 + 2] = radius * Math.cos(angle);

        const color = sceneColors[Math.floor(Math.random() * sceneColors.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    const particleMesh = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleMesh);

    // Handle Resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      particleMesh.rotation.y = elapsedTime * 0.1;
      particleMesh.rotation.x = elapsedTime * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [sceneColors]);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
}
