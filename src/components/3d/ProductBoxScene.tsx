'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function PackageBox() {
  const boxRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group ref={boxRef} scale={1.1}>
      {/* Box Body */}
      <mesh>
        <boxGeometry args={[1.5, 1.8, 1.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Glowing Edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.52, 1.82, 1.22)]} />
        <lineBasicMaterial color="#10b981" linewidth={2} />
      </lineSegments>
      {/* Tape Emblem */}
      <mesh position={[0, 0, 0.61]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
    </group>
  );
}

export default function ProductBoxScene() {
  return (
    <div className="w-full h-[220px] relative flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#10b981" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
          <PackageBox />
        </Float>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}
