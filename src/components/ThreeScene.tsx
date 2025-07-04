'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Starfield
    const starVertices: number[] = [];
    const starColors: number[] = [];
    const starBaseColors = [
        new THREE.Color(0xffffff), // white
        new THREE.Color(0xffd2a1), // pale yellow
        new THREE.Color(0xa1c2ff), // pale blue
    ];

    for (let i = 0; i < 20000; i++) {
      const x = THREE.MathUtils.randFloatSpread(3000);
      const y = THREE.MathUtils.randFloatSpread(3000);
      const z = THREE.MathUtils.randFloatSpread(3000);
      starVertices.push(x, y, z);

      const color = starBaseColors[Math.floor(Math.random() * starBaseColors.length)];
      starColors.push(color.r, color.g, color.b);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    
    const starMaterial = new THREE.PointsMaterial({ 
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Nebula Cloud
    const nebulaVertices: number[] = [];
    const nebulaColors: number[] = [];
    const nebulaBaseColor1 = new THREE.Color(0xee82ee); // violet
    const nebulaBaseColor2 = new THREE.Color(0xff00ff); // magenta/pink
    
    for (let i = 0; i < 5000; i++) {
        const x = THREE.MathUtils.randFloatSpread(400) - 150;
        const y = THREE.MathUtils.randFloatSpread(300);
        const z = THREE.MathUtils.randFloatSpread(400) - 200;
        nebulaVertices.push(x, y, z);
        
        const color = new THREE.Color().lerpColors(nebulaBaseColor1, nebulaBaseColor2, Math.random());
        nebulaColors.push(color.r, color.g, color.b);
    }
    
    const nebulaGeometry = new THREE.BufferGeometry();
    nebulaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nebulaVertices, 3));
    nebulaGeometry.setAttribute('color', new THREE.Float32BufferAttribute(nebulaColors, 3));
    
    const nebulaMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    
    const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);


    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX - window.innerWidth / 2) / 200;
        mouseY = (event.clientY - window.innerHeight / 2) / 200;
    };
    document.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      stars.rotation.x = elapsedTime * 0.02;
      stars.rotation.y = elapsedTime * 0.02;
      
      nebula.rotation.y = elapsedTime * 0.05;

      camera.position.x += (mouseX - camera.position.x) * 0.02;
      camera.position.y += (-mouseY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onMouseMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default ThreeScene;
