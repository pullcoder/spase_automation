"use client";

import dynamic from "next/dynamic";
import ApodCard from "./ApodCard";

const CosmosCanvas = dynamic(() => import("./three/CosmosCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const SPACE_FACTS = [
  { icon: "🌍", label: "지구에서 태양까지", value: "1억 5천만 km" },
  { icon: "🌌", label: "우리 은하 지름",    value: "10만 광년" },
  { icon: "⭐", label: "우리 은하 별 개수", value: "약 2,000억 개" },
  { icon: "🕳",  label: "태양계→은하 중심", value: "26,000 광년" },
];

export default function UniverseSection() {
  return (
    <section id="universe" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-blue-400 uppercase mb-3">Universe</p>
          <h2 className="text-4xl font-bold text-white">우주 탐험</h2>
          <p className="mt-4 text-white/50 text-sm">
            스크롤로 지구 → 태양계 → 은하 이동 · 전체화면 지원
          </p>
        </div>

        {/* 우주 뷰어 */}
        <div className="relative rounded-2xl border border-white/10 overflow-hidden mb-8" style={{ height: 560 }}>
          <CosmosCanvas />
        </div>

        {/* 스케일 팩트 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {SPACE_FACTS.map((f) => (
            <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <span className="text-2xl block mb-2">{f.icon}</span>
              <p className="text-white font-semibold text-sm">{f.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{f.label}</p>
            </div>
          ))}
        </div>

        {/* NASA APOD */}
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
