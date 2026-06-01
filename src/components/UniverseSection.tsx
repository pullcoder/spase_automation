"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ApodCard from "./ApodCard";

const SolarCanvas = dynamic(() => import("./three/SolarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface PlanetInfo {
  nameKo: string;
  name: string;
  desc: string;
  color: string;
}

export default function UniverseSection() {
  const [selected, setSelected] = useState<PlanetInfo | null>(null);

  return (
    <section id="universe" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-blue-400 uppercase mb-3">Universe</p>
          <h2 className="text-4xl font-bold text-white">우주 탐험</h2>
          <p className="mt-4 text-white/50 text-sm">행성을 클릭해서 탐험하세요</p>
        </div>

        {/* 태양계 3D */}
        <div className="relative rounded-2xl border border-white/10 bg-[#02020f] overflow-hidden mb-12" style={{ height: 480 }}>
          <SolarCanvas onSelect={setSelected} />

          {/* 행성 정보 패널 */}
          {selected ? (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 rounded-xl border border-white/20 bg-black/80 backdrop-blur p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: selected.color }} />
                  <span className="font-semibold text-white">{selected.nameKo}</span>
                  <span className="text-xs text-white/40">{selected.name}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-lg leading-none">×</button>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{selected.desc}</p>
            </div>
          ) : (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/20 pointer-events-none">
              행성을 클릭하면 정보가 표시됩니다
            </div>
          )}
        </div>

        {/* NASA 오늘의 우주 사진 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔭</span>
            <div>
              <h3 className="font-semibold text-white">오늘의 우주 사진</h3>
              <p className="text-xs text-white/40">NASA Astronomy Picture of the Day</p>
            </div>
          </div>
          <ApodCard />
        </div>
      </div>
    </section>
  );
}
