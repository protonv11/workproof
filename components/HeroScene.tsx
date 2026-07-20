"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = () => setReduced(mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setMobile(mq.matches);
    const listener = () => setMobile(mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return mobile;
}

function DriftingShapes({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reduced) {
      group.current.rotation.y += delta * 0.06;
      group.current.rotation.x += delta * 0.015;
    }
    const targetX = reduced ? 0 : pointer.current.y * 0.15;
    const targetY = reduced ? 0 : pointer.current.x * 0.15;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.02;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.02;
  });

  return (
    <group ref={group}>
      <mesh position={[2.2, 0.6, -2]}>
        <torusKnotGeometry args={[1.1, 0.32, 128, 32]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.6}
          transparent
          opacity={0.35}
        />
      </mesh>
      <mesh position={[-2.4, -0.8, -3]}>
        <icosahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#06B6D4"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.5}
          transparent
          opacity={0.28}
          wireframe
        />
      </mesh>
      <mesh position={[0.5, -2, -4]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color="#EC4899"
          emissive="#EC4899"
          emissiveIntensity={0.3}
          roughness={0.25}
          metalness={0.5}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

export function HeroScene() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <Canvas
        dpr={mobile ? 1 : [1, 1.5]}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: mobile ? "low-power" : "default" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={40} color="#7C3AED" />
          <pointLight position={[-5, -3, -5]} intensity={30} color="#06B6D4" />
          <DriftingShapes reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}
