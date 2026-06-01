"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useCallback, useEffect, useState } from "react";
import CosmosScene from "./CosmosScene";

const SCALE_LABELS = [
  { z: 0.00, label: "지구" },
  { z: 0.20, label: "달 궤도" },
  { z: 0.45, label: "태양계" },
  { z: 0.68, label: "성간 공간" },
  { z: 0.88, label: "우리 은하" },
];

function getScaleLabel(z: number) {
  let best = SCALE_LABELS[0];
  for (const s of SCALE_LABELS) {
    if (z >= s.z) best = s;
  }
  return best.label;
}

export default function CosmosCanvas() {
  const zoomRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomDisplay, setZoomDisplay] = useState(0);

  // 휠 줌
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.012 : -0.012;
    zoomRef.current = Math.max(0, Math.min(1, zoomRef.current + delta));
    setZoomDisplay(zoomRef.current);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // 전체화면 토글
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const scaleLabel = getScaleLabel(zoomDisplay);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black outline-none" tabIndex={0}>
      <Canvas
        camera={{ position: [8, 0.5, 5], fov: 60, near: 0.1, far: 10000 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <CosmosScene zoomRef={zoomRef} />
        </Suspense>
      </Canvas>

      {/* 스케일 표시 */}
      <div className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none px-6">
        {/* 스케일 바 */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <span className="text-xs text-white/30 w-12 text-right">지구</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full relative">
            <div
              className="absolute top-0 left-0 h-full bg-blue-400 rounded-full transition-all duration-100"
              style={{ width: `${zoomDisplay * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/30 w-12">은하</span>
        </div>
        <span className="text-xs text-blue-300 font-medium tracking-widest uppercase">
          {scaleLabel}
        </span>
      </div>

      {/* 조작 안내 */}
      <div className="absolute bottom-4 left-4 text-xs text-white/20 pointer-events-none">
        🖱 스크롤로 줌
      </div>

      {/* 전체화면 버튼 */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
        title={isFullscreen ? "전체화면 종료" : "전체화면"}
      >
        {isFullscreen ? (
          // 축소 아이콘
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        ) : (
          // 확대 아이콘
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        )}
      </button>
    </div>
  );
}
