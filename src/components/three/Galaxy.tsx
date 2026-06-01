"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Galaxy() {
  const mesh = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 12000;
    const arms = 3;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const innerColor = new THREE.Color("#3b6fd4");
    const outerColor = new THREE.Color("#8b3dd4");

    for (let i = 0; i < count; i++) {
      const arm = (i % arms) * ((Math.PI * 2) / arms);
      const radius = Math.pow(Math.random(), 0.5) * 18;
      const spin = radius * 0.6;
      const angle = arm + spin;
      const spread = (Math.random() - 0.5) * (radius * 0.35);

      pos[i * 3] = Math.cos(angle) * radius + spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 2] = Math.sin(angle) * radius + spread;

      const t = radius / 18;
      const c = innerColor.clone().lerp(outerColor, t);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <points ref={mesh} position={[0, -6, -20]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}
