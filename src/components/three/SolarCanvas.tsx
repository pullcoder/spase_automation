"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import SolarSystem from "./SolarSystem";

interface Props {
  onSelect: (p: { nameKo: string; name: string; desc: string; color: string } | null) => void;
}

export default function SolarCanvas({ onSelect }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 14, 22], fov: 55 }}
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <SolarSystem onSelect={onSelect} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={45}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
