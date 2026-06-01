"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useCallback, useEffect, useState } from "react";
import CosmosScene, { type PlanetInfo, type DragState } from "./CosmosScene";

const SCALE_LABELS = [
  { z: 0.00, label: "지구" },
  { z: 0.20, label: "달 궤도" },
  { z: 0.45, label: "태양계" },
  { z: 0.68, label: "성간 공간" },
  { z: 0.88, label: "우리 은하" },
];

function getScaleLabel(z: number) {
  let best = SCALE_LABELS[0];
  for (const s of SCALE_LABELS) { if (z >= s.z) best = s; }
  return best.label;
}

export default function CosmosCanvas() {
  const containerRef    = useRef<HTMLDivElement>(null);
  const zoomRef         = useRef(0);
  const dragRef         = useRef<DragState>({ azimuth: 0, elevation: 0 });
  const wasDraggingRef  = useRef(false);

  // 드래그 추적용 (ref → 렌더 없이)
  const isDragging      = useRef(false);
  const dragStart       = useRef({ x: 0, y: 0 });
  const dragTotal       = useRef(0);

  const [zoomDisplay, setZoomDisplay]       = useState(0);
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);

  // ── 휠 줌 ────────────────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    zoomRef.current = Math.max(0, Math.min(1, zoomRef.current + (e.deltaY > 0 ? 0.012 : -0.012)));
    setZoomDisplay(zoomRef.current);
  }, []);

  // ── 드래그 ───────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current  = true;
    wasDraggingRef.current = false;
    dragTotal.current   = 0;
    dragStart.current   = { x: e.clientX, y: e.clientY };
    containerRef.current?.setPointerCapture(e.pointerId);
    document.body.style.cursor = "grabbing";
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragTotal.current += Math.abs(e.movementX) + Math.abs(e.movementY);
    if (dragTotal.current > 4) wasDraggingRef.current = true;

    dragRef.current.azimuth   -= e.movementX * 0.008;
    dragRef.current.elevation -= e.movementY * 0.006;
    dragRef.current.elevation  = Math.max(-0.55, Math.min(0.55, dragRef.current.elevation));

    void dx; void dy; // suppress unused warning
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "grab";
    // 짧은 딜레이 후 wasDragging 리셋 (R3F onClick보다 늦게)
    setTimeout(() => { wasDraggingRef.current = false; }, 50);
  }, []);

  // ── 전체화면 ─────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
    else await document.exitFullscreen();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  const scaleLabel = getScaleLabel(zoomDisplay);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none outline-none"
      style={{ cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Canvas
        camera={{ position: [8, 0.5, 5], fov: 60, near: 0.1, far: 12000 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <CosmosScene
            zoomRef={zoomRef}
            dragRef={dragRef}
            wasDraggingRef={wasDraggingRef}
            onPlanetClick={setSelectedPlanet}
          />
        </Suspense>
      </Canvas>

      {/* 행성 정보 패널 */}
      {selectedPlanet && (
        <div className="absolute left-3 top-3 w-64 rounded-xl border border-white/20 bg-black/85 backdrop-blur-md p-4 text-sm shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: selectedPlanet.color }} />
              <span className="font-bold text-white text-base">{selectedPlanet.nameKo}</span>
              <span className="text-white/40 text-xs">{selectedPlanet.name}</span>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="text-white/40 hover:text-white text-xl leading-none ml-2 flex-shrink-0"
            >×</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-white/40 text-[10px] uppercase tracking-wide">거리</p>
              <p className="text-white font-medium text-xs mt-0.5">{selectedPlanet.distAU}</p>
            </div>
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-white/40 text-[10px] uppercase tracking-wide">공전 주기</p>
              <p className="text-white font-medium text-xs mt-0.5">{selectedPlanet.period}</p>
            </div>
          </div>
          <p className="text-white/65 text-xs leading-relaxed">{selectedPlanet.desc}</p>
        </div>
      )}

      {/* 스케일 바 */}
      <div className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none px-6">
        <div className="flex items-center gap-3 w-full max-w-xs">
          <span className="text-xs text-white/30 w-12 text-right">지구</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full relative">
            <div className="absolute top-0 left-0 h-full bg-blue-400 rounded-full transition-all duration-100"
              style={{ width: `${zoomDisplay * 100}%` }} />
          </div>
          <span className="text-xs text-white/30 w-12">은하</span>
        </div>
        <span className="text-xs text-blue-300 font-medium tracking-widest uppercase">{scaleLabel}</span>
      </div>

      {/* 조작 안내 */}
      <div className="absolute bottom-4 left-4 text-xs text-white/20 pointer-events-none space-y-0.5">
        <p>🖱 스크롤 — 줌</p>
        <p>🖱 드래그 — 시점 회전</p>
      </div>

      {/* 전체화면 버튼 */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
        title={isFullscreen ? "전체화면 종료" : "전체화면"}
      >
        {isFullscreen ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
            <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
            <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
          </svg>
        )}
      </button>
    </div>
  );
}
