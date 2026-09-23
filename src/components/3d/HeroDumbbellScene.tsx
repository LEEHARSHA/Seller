'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function StylizedDumbbell() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Central Handle */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 2.6, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Left Weights */}
      <mesh position={[-1.1, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.35, 32]} />
        <MeshDistortMaterial color="#10b981" speed={2} distort={0.15} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.4, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.25, 32]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Right Weights */}
      <mesh position={[1.1, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.35, 32]} />
        <MeshDistortMaterial color="#10b981" speed={2} distort={0.15} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.4, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.25, 32]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Glowing Energy Ring */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.8, 0.03, 16, 100]} />
        <meshBasicMaterial color="#10b981" wireframe />
      </mesh>
    </group>
  );
}

export default function HeroDumbbellScene() {
  return (
    <div className="w-full h-[360px] relative flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#10b981" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#06b6d4" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <StylizedDumbbell />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>
    </div>
  );
}
