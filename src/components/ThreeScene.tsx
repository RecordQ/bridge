'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Galaxy parameters
    const galaxyParameters = {
        count: 200000,
        size: 2.0,
        radius: 600,
        branches: 5,
        spin: 1.5,
        randomness: 1.8,
        randomnessPower: 3,
        insideColor: '#ff6030',
        outsideColor: '#1b3984'
    };
    
    // Background Stars
    const bgStarsGeometry = new THREE.BufferGeometry();
    const bgStarsVertices = [];
    for (let i = 0; i < 50000; i++) {
        const x = THREE.MathUtils.randFloatSpread(3000);
        const y = THREE.MathUtils.randFloatSpread(3000);
        const z = THREE.MathUtils.randFloatSpread(3000);
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

    // Nebula Cloud
    const nebulaVertices: number[] = [];
    const nebulaColors: number[] = [];
    const nebulaBaseColor1 = new THREE.Color(0x6a0dad); // purple
    const nebulaBaseColor2 = new THREE.Color(0xdc143c); // crimson
    
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
        size: 4.0,
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

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      if (galaxyPoints) {
        galaxyPoints.rotation.y = elapsedTime * 0.04;
      }
      nebula.rotation.y = elapsedTime * 0.06;
      backgroundStars.rotation.y = elapsedTime * 0.01;

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
