'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function StarBadge() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Ring */}
      <mesh>
        <torusGeometry args={[1.2, 0.08, 16, 64]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
      </mesh>
      {/* Central Shield */}
      <mesh>
        <cylinderGeometry args={[0.9, 0.9, 0.15, 6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Checkmark Bar 1 */}
      <mesh position={[-0.15, -0.1, 0.12]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      {/* Checkmark Bar 2 */}
      <mesh position={[0.15, 0.05, 0.12]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </group>
  );
}

export default function SuccessBadgeScene() {
  return (
    <div className="w-full h-[180px] relative flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#10b981" />
        <Float speed={3} rotationIntensity={0.4} floatIntensity={0.8}>
          <StarBadge />
        </Float>
      </Canvas>
    </div>
  );
}
