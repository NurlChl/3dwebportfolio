"use client";

import { Float, MeshDistortMaterial, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function ToolRig() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.22;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
  });

  return (
    <group ref={group}>
      <Float speed={1.8} rotationIntensity={0.45} floatIntensity={0.5}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <icosahedronGeometry args={[1.25, 2]} />
          <MeshDistortMaterial color="#fff2cc" distort={0.22} metalness={0.12} roughness={0.38} speed={1.4} />
        </mesh>
        <mesh castShadow position={[-1.8, -0.18, 0.2]} rotation={[0.4, 0.2, -0.3]}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial color="#ff6f59" roughness={0.42} metalness={0.18} />
        </mesh>
        <mesh castShadow position={[1.65, -0.1, -0.2]} rotation={[1.1, 0.2, 0.3]}>
          <torusKnotGeometry args={[0.56, 0.16, 128, 16]} />
          <meshStandardMaterial color="#56d6ff" roughness={0.25} metalness={0.32} />
        </mesh>
        <mesh castShadow position={[0.2, -1.35, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.32, 48]} />
          <meshStandardMaterial color="#11151c" roughness={0.52} metalness={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

export function StudioWorld({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "world compact" : "world"}>
      <Canvas camera={{ position: [0, 0.7, compact ? 5.8 : 6.4], fov: compact ? 38 : 34 }} dpr={[1, 1.25]}>
        <color attach="background" args={["#090b10"]} />
        <fog attach="fog" args={["#090b10", 6, 13]} />
        <ambientLight intensity={0.35} />
        <pointLight color="#ff6f59" intensity={6} position={[-3, 2.2, 2.8]} />
        <pointLight color="#56d6ff" intensity={5} position={[3.3, 1.5, 2.4]} />
        <directionalLight intensity={1.15} position={[3, 5, 4]} />
        <Stars count={compact ? 45 : 80} depth={32} factor={3} fade speed={0.45} />
        <ToolRig />
        <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4.4, 96]} />
          <meshStandardMaterial color="#141822" roughness={0.8} metalness={0.2} />
        </mesh>
        <OrbitControls autoRotate autoRotateSpeed={0.35} enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}
