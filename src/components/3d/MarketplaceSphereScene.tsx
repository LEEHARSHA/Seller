'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function MarketplaceOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 2]} />
        <MeshDistortMaterial
          color="#10b981"
          speed={3}
          distort={0.25}
          radius={1}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.7, 0.04, 16, 64]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function MarketplaceSphereScene() {
  return (
    <div className="w-full h-full min-h-[160px] relative flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#10b981" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#06b6d4" />
        <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1}>
          <MarketplaceOrb />
        </Float>
      </Canvas>
    </div>
  );
}
