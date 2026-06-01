"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import SpaceScene from "./SpaceScene";

export default function SpaceSceneCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 65 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <SpaceScene />
      </Suspense>
    </Canvas>
  );
}
