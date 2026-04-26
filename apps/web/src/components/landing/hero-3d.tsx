'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Environment, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { Suspense as ReactSuspense, useRef } from 'react';
import { Group } from 'three';

/* eslint-disable @typescript-eslint/no-explicit-any */
const Suspense: any = ReactSuspense;

function FloatingCard({
  position,
  color,
  emissiveIntensity = 0.3,
  size = [1.6, 1.0, 0.14] as [number, number, number],
  floatIntensity = 1.6,
  speed = 1.1,
  rotationIntensity = 0.35,
  metalness = 0.3,
  roughness = 0.35,
}: {
  position: [number, number, number];
  color: string;
  emissiveIntensity?: number;
  size?: [number, number, number];
  floatIntensity?: number;
  speed?: number;
  rotationIntensity?: number;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <Float floatIntensity={floatIntensity} speed={speed} rotationIntensity={rotationIntensity}>
      <RoundedBox args={size} radius={0.14} smoothness={4} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={metalness}
          roughness={roughness}
        />
      </RoundedBox>
    </Float>
  );
}

function GlowSphere({ position }: { position: [number, number, number] }) {
  return (
    <Float floatIntensity={1.0} speed={0.9} rotationIntensity={0.5}>
      <Sphere args={[0.42, 64, 64]} position={position}>
        <MeshDistortMaterial
          color="#b8f5d8"
          emissive="#84e1bc"
          emissiveIntensity={0.55}
          distort={0.35}
          speed={1.6}
          metalness={0.4}
          roughness={0.15}
        />
      </Sphere>
    </Float>
  );
}

/**
 * 3D scene is DECORATIVE — pushed to the corners, behind the text.
 * Far camera + small objects + edge positioning = atmospheric, not blocking.
 */
function Scene() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // very subtle parallax
    group.current.rotation.y = Math.sin(t * 0.15) * 0.08 + state.pointer.x * 0.12;
    group.current.rotation.x = Math.cos(t * 0.12) * 0.04 + -state.pointer.y * 0.06;
  });

  return (
    <group ref={group}>
      {/* top-left mint card */}
      <FloatingCard
        position={[-5.2, 2.4, -1]}
        color="#84e1bc"
        emissiveIntensity={0.45}
        size={[1.8, 1.1, 0.14]}
        floatIntensity={2.0}
        speed={1.0}
      />
      {/* top-right pink card */}
      <FloatingCard
        position={[5.4, 2.0, -2]}
        color="#f472b6"
        emissiveIntensity={0.35}
        size={[1.5, 0.95, 0.13]}
        floatIntensity={1.7}
        speed={1.3}
        rotationIntensity={0.4}
      />
      {/* bottom-left violet card */}
      <FloatingCard
        position={[-4.8, -2.6, -1.5]}
        color="#8b5cf6"
        emissiveIntensity={0.4}
        size={[1.6, 1.0, 0.13]}
        floatIntensity={2.4}
        speed={1.5}
        rotationIntensity={0.3}
      />
      {/* bottom-right amber */}
      <FloatingCard
        position={[5.0, -2.2, -1]}
        color="#fbbf24"
        emissiveIntensity={0.45}
        size={[0.9, 0.9, 0.12]}
        floatIntensity={2.2}
        speed={1.6}
        rotationIntensity={0.6}
        metalness={0.5}
        roughness={0.25}
      />
      {/* mid-left small mint glow sphere */}
      <GlowSphere position={[-3.2, -0.4, -0.5]} />
      {/* mid-right small pink sphere */}
      <Float floatIntensity={1.5} speed={1.2} rotationIntensity={0.4}>
        <Sphere args={[0.32, 48, 48]} position={[3.5, 0.6, -1]}>
          <meshStandardMaterial
            color="#f472b6"
            emissive="#f472b6"
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.2}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export function Hero3D() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden
      style={{
        opacity: 0.78,
        filter: 'blur(0.3px)',
        maskImage:
          'radial-gradient(ellipse 55% 45% at 50% 50%, transparent 0%, transparent 35%, rgba(0,0,0,0.55) 60%, black 85%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 55% 45% at 50% 50%, transparent 0%, transparent 35%, rgba(0,0,0,0.55) 60%, black 85%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.35} color="#8b5cf6" />
        <pointLight position={[0, 0, 4]} intensity={0.4} color="#84e1bc" />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
