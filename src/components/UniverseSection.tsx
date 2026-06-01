"use client";

import dynamic from "next/dynamic";
import ApodCard from "./ApodCard";

const SpaceSceneCanvas = dynamic(() => import("./three/SpaceSceneCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const SPACE_FACTS = [
  { icon: "🌌", label: "관측 가능한 우주", value: "930억 광년", sub: "지름" },
  { icon: "⭐", label: "우리 은하 별 개수", value: "약 2,000억", sub: "개" },
  { icon: "🕳", label: "블랙홀 최고 온도", value: "수조 °C", sub: "호킹 복사" },
  { icon: "🚀", label: "빛의 속도", value: "299,792 km/s", sub: "진공 중" },
];

export default function UniverseSection() {
  return (
    <section id="universe" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-blue-400 uppercase mb-3">Universe</p>
          <h2 className="text-4xl font-bold text-white">우주 탐험</h2>
          <p className="mt-4 text-white/50 text-sm">NASA API · 성운 시각화 · AI 해설</p>
        </div>

        {/* 우주 3D 시각화 */}
        <div
          className="relative rounded-2xl border border-white/10 overflow-hidden mb-8"
          style={{ height: 500 }}
        >
          <SpaceSceneCanvas />

          {/* 오버레이 텍스트 */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <p className="text-xs text-white/30 tracking-widest uppercase">Deep Space Visualization</p>
            <p className="text-sm text-white/50 mt-1">성운 · 항성 · 딥필드</p>
          </div>
        </div>

        {/* 우주 팩트 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {SPACE_FACTS.map((f) => (
            <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <span className="text-2xl block mb-2">{f.icon}</span>
              <p className="text-white font-semibold text-sm">{f.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{f.label}</p>
            </div>
          ))}
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
