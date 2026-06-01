"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import StarField from "./StarField";
import Galaxy from "./Galaxy";

export default function SpaceCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <StarField count={6000} />
        <Galaxy />
      </Suspense>
    </Canvas>
  );
}
