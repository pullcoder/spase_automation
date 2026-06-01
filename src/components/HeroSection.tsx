"use client";

import dynamic from "next/dynamic";

const SpaceCanvas = dynamic(() => import("./three/SpaceCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0d1b4b_0%,_#000_70%)]" />,
});

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* 3D 우주 배경 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#050d2e_0%,_#000_65%)]" />
        <SpaceCanvas />
      </div>

      {/* 중앙 텍스트 */}
      <div className="relative z-10 text-center px-6 pointer-events-none">
        <p className="text-sm tracking-[0.4em] text-blue-400 mb-4 uppercase">
          Welcome to my universe
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          우주를 탐험하는
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            개발자
          </span>
        </h1>
        <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
          3D 우주 시각화 · AI 자동화 · 풀스택 개발
        </p>
        <a
          href="#universe"
          className="pointer-events-auto inline-block px-8 py-3 rounded-full border border-white/30 text-white text-sm tracking-widest hover:bg-white/10 transition-colors"
        >
          탐험 시작 ↓
        </a>
      </div>

      {/* 하단 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
