"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 성운 클러스터 설정
const NEBULAE = [
  { color: "#3b82f6", pos: [-14,  4, -18] as [number,number,number], count: 3000, spread: 7 },
  { color: "#a855f7", pos: [ 12, -2, -14] as [number,number,number], count: 2500, spread: 6 },
  { color: "#f97316", pos: [ -4, -7, -22] as [number,number,number], count: 2000, spread: 5 },
  { color: "#06b6d4", pos: [ 18,  7,  -9] as [number,number,number], count: 1800, spread: 5 },
  { color: "#ec4899", pos: [  2,  8, -28] as [number,number,number], count: 2200, spread: 8 },
  { color: "#6366f1", pos: [-20, -4, -12] as [number,number,number], count: 1500, spread: 5 },
];

function Nebula({ color, pos, count, spread }: typeof NEBULAE[0]) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // 가우시안 분포 근사 (Box-Muller)
      const u = 1 - Math.random();
      const v = Math.random();
      const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      const g2 = Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v);
      const g3 = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
      arr[i * 3]     = pos[0] + g  * spread;
      arr[i * 3 + 1] = pos[1] + g2 * spread * 0.5;
      arr[i * 3 + 2] = pos[2] + g3 * spread;
    }
    return arr;
  }, [count, spread, pos]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.008;
      ref.current.rotation.z += delta * 0.003;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        sizeAttenuation
        color={color}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function BackgroundStars() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(8000 * 3);
    for (let i = 0; i < 8000; i++) {
      const r = 60 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.35} sizeAttenuation color="#ffffff" transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

function BrightStars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      const r = 20 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        sizeAttenuation
        color="#ffe8c0"
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.04) * 3;
    camera.position.y = Math.cos(t * 0.03) * 1.5;
    camera.lookAt(0, 0, -10);
  });
  return null;
}

export default function SpaceScene() {
  return (
    <>
      <color attach="background" args={["#000005"]} />
      <fog attach="fog" args={["#000010", 40, 120]} />
      <BackgroundStars />
      <BrightStars />
      {NEBULAE.map((n) => (
        <Nebula key={n.color + n.pos[0]} {...n} />
      ))}
      <CameraRig />
    </>
  );
}
