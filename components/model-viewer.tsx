"use client";

import { Center, ContactShadows, Environment, Float, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AssetPreview } from "@/components/asset-preview";

type ModelViewerProps = {
  modelUrl?: string | null;
  title: string;
  compact?: boolean;
  loadingText?: string;
  hintText?: string;
  loadingBadgeText?: string;
  previewCategoryLabel?: string;
};

function DemoAsset({ title }: { title: string }) {
  const palette = useMemo(() => {
    if (title.toLowerCase().includes("shrine")) return ["#2f6b4f", "#f2c94c", "#d7eee3"];
    if (title.toLowerCase().includes("console")) return ["#2457a6", "#f06d4f", "#f5f0e7"];
    return ["#151718", "#f06d4f", "#d7eee3"];
  }, [title]);

  return (
    <Float rotationIntensity={0.35} speed={1.6}>
      <group rotation={[0.05, -0.55, 0]}>
        <mesh castShadow position={[0, 0.25, 0]}>
          <boxGeometry args={[1.7, 0.72, 1.2]} />
          <meshStandardMaterial color={palette[0]} roughness={0.48} metalness={0.25} />
        </mesh>
        <mesh castShadow position={[0, 0.82, 0.05]}>
          <boxGeometry args={[0.92, 0.58, 0.86]} />
          <meshStandardMaterial color={palette[2]} roughness={0.65} />
        </mesh>
        <mesh castShadow position={[-0.72, 0.27, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.22, 32]} />
          <meshStandardMaterial color={palette[1]} roughness={0.38} metalness={0.15} />
        </mesh>
        <mesh castShadow position={[0.72, 0.27, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.22, 32]} />
          <meshStandardMaterial color={palette[1]} roughness={0.38} metalness={0.15} />
        </mesh>
        <mesh castShadow position={[0, -0.2, 0]}>
          <torusGeometry args={[1.18, 0.035, 12, 96]} />
          <meshStandardMaterial color="#ffffff" roughness={0.22} />
        </mesh>
      </group>
    </Float>
  );
}

function LoadedModel({ modelUrl }: { modelUrl: string }) {
  const model = useGLTF(modelUrl);
  return (
    <Center>
      <primitive object={model.scene} scale={1.35} />
    </Center>
  );
}

function Scene({ modelUrl, title, loadingBadgeText }: ModelViewerProps) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight castShadow intensity={1.8} position={[4, 6, 4]} />
      <Suspense
        fallback={
          <Html center>
            <span className="pill">{loadingBadgeText || "Loading 3D"}</span>
          </Html>
        }
      >
        {modelUrl && !modelUrl.startsWith("/models/") && (modelUrl.endsWith(".glb") || modelUrl.endsWith(".gltf")) ? (
          <LoadedModel modelUrl={modelUrl} />
        ) : (
          <DemoAsset title={title} />
        )}
        <Environment preset="city" />
        <ContactShadows blur={2.8} far={4} opacity={0.34} position={[0, -1.05, 0]} />
      </Suspense>
      <OrbitControls enablePan={false} maxDistance={5} minDistance={2.2} />
    </>
  );
}

export function ModelViewer({ modelUrl, title, compact, loadingText, hintText, loadingBadgeText, previewCategoryLabel }: ModelViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!compact);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!compact || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [compact]);

  return (
    <div className="viewer-wrap" ref={ref}>
      <div className={isReady ? "viewer-fallback is-hidden" : "viewer-fallback"}>
        <AssetPreview title={title} category={previewCategoryLabel || "3D model"} />
        <span className="viewer-loading">{loadingText || "Preparing realtime 3D preview"}</span>
      </div>
      {isVisible ? (
        <Canvas
          camera={{ position: [2.8, 2, 3.4], fov: compact ? 42 : 36 }}
          dpr={[1, compact ? 1.1 : 1.35]}
          gl={{ antialias: !compact, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
          onCreated={() => setIsReady(true)}
        >
          <Scene modelUrl={modelUrl} title={title} loadingBadgeText={loadingBadgeText} />
        </Canvas>
      ) : null}
      {!compact ? <div className="viewer-label">{hintText || "Drag to orbit / Scroll to zoom"}</div> : null}
    </div>
  );
}
