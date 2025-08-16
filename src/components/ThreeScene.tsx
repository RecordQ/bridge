// src/components/ThreeScene.tsx
'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    if (rendererRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a192f, 1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Planet
    const planetGeometry = new THREE.SphereGeometry(100, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a90e2,
        roughness: 0.8,
        metalness: 0.1 
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(400, -100, -800);
    scene.add(planet);

    // Moon
    const moonGeometry = new THREE.SphereGeometry(30, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc,
        roughness: 0.9
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(200, 0, 0);
    const moonOrbit = new THREE.Object3D();
    moonOrbit.add(moon);
    planet.add(moonOrbit);

    const galaxyParameters = {
        count: 500000,
        size: 0.5,
        radius: 600,
        branches: 5,
        spin: 1,
        randomness: 1.8,
        randomnessPower: 3,
        insideColor: 0xff6030,
        outsideColor: 0x1b3984,
    };
    
    // Background Stars (far)
    const bgStarsGeometry = new THREE.BufferGeometry();
    const bgStarsVertices = [];
    for (let i = 0; i < 50000; i++) {
        const x = THREE.MathUtils.randFloatSpread(3500);
        const y = THREE.MathUtils.randFloatSpread(3500);
        const z = THREE.MathUtils.randFloatSpread(3500);
        bgStarsVertices.push(x, y, z);
    }
    bgStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bgStarsVertices, 3));
    const bgStarsMaterial = new THREE.PointsMaterial({
        size: 0.7,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
    });
    const backgroundStars = new THREE.Points(bgStarsGeometry, bgStarsMaterial);
    scene.add(backgroundStars);
    
    // Background Stars (near)
    const nearStarsGeometry = new THREE.BufferGeometry();
    const nearStarsVertices = [];
    for (let i = 0; i < 20000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        nearStarsVertices.push(x, y, z);
    }
    nearStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nearStarsVertices, 3));
    const nearStarsMaterial = new THREE.PointsMaterial({
        size: 0.3,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
    });
    const nearStars = new THREE.Points(nearStarsGeometry, nearStarsMaterial);
    scene.add(nearStars);


    let galaxyGeometry: THREE.BufferGeometry | null = null;
    let galaxyMaterial: THREE.PointsMaterial | null = null;
    let galaxyPoints: THREE.Points | null = null;

    const generateGalaxy = () => {
        if (galaxyPoints !== null) {
            galaxyGeometry?.dispose();
            galaxyMaterial?.dispose();
            scene.remove(galaxyPoints);
        }

        galaxyGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(galaxyParameters.count * 3);
        const colors = new Float32Array(galaxyParameters.count * 3);
        const colorInside = new THREE.Color(galaxyParameters.insideColor);
        const colorOutside = new THREE.Color(galaxyParameters.outsideColor);

        for (let i = 0; i < galaxyParameters.count; i++) {
            const i3 = i * 3;
            const radius = Math.random() * galaxyParameters.radius;
            const spinAngle = radius * galaxyParameters.spin;
            const branchAngle = (i % galaxyParameters.branches) / galaxyParameters.branches * Math.PI * 2;
            
            const randomX = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius;
            const randomY = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius / 2;
            const randomZ = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / galaxyParameters.radius);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        galaxyMaterial = new THREE.PointsMaterial({
            size: galaxyParameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
        scene.add(galaxyPoints);
    };

    generateGalaxy();

    const nebulaVertices: number[] = [];
    const nebulaColors: number[] = [];
    const nebulaBaseColor1 = new THREE.Color(0x6a0dad); // Purple
    const nebulaBaseColor2 = new THREE.Color(0xdc143c); // Crimson
    
    for (let i = 0; i < 50000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2500);
        const y = THREE.MathUtils.randFloatSpread(2500);
        const z = THREE.MathUtils.randFloatSpread(2500) - 500;
        nebulaVertices.push(x, y, z);
        
        const color = new THREE.Color().lerpColors(nebulaBaseColor1, nebulaBaseColor2, Math.random());
        nebulaColors.push(color.r, color.g, color.b);
    }
    
    const nebulaGeometry = new THREE.BufferGeometry();
    nebulaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nebulaVertices, 3));
    nebulaGeometry.setAttribute('color', new THREE.Float32BufferAttribute(nebulaColors, 3));
    
    const nebulaMaterial = new THREE.PointsMaterial({
        size: 1.0,
        vertexColors: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    
    const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
    nebula.position.set(-400, 200, -700);
    scene.add(nebula);

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX - window.innerWidth / 2) / 250;
        mouseY = (event.clientY - window.innerHeight / 2) / 250;
    };
    document.addEventListener('mousemove', onMouseMove);

    const onScroll = () => {
        const t = document.body.getBoundingClientRect().top;
        camera.position.z = 1000 + t * 0.35;
        camera.position.y = t * 0.1;
        camera.position.x = t * 0.05;
    };
    document.addEventListener('scroll', onScroll);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      if (galaxyPoints) {
        galaxyPoints.rotation.y = elapsedTime * 0.04;
      }
      planet.rotation.y += 0.002;
      moonOrbit.rotation.y += 0.01;
      nebula.rotation.y = elapsedTime * 0.06;
      backgroundStars.rotation.y = elapsedTime * 0.01;
      nearStars.rotation.y = elapsedTime * 0.02;

      camera.position.x += (mouseX - camera.position.x) * 0.02;
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
      document.removeEventListener('scroll', onScroll);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);


  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default ThreeScene;
