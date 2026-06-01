export default function UniverseSection() {
  return (
    <section id="universe" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-blue-400 uppercase mb-3">
            Universe
          </p>
          <h2 className="text-4xl font-bold text-white">우주 탐험</h2>
          <p className="mt-4 text-white/50">
            NASA API · 3D 태양계 · 오늘의 우주 사진
          </p>
        </div>

        {/* Three.js 3D 컴포넌트 추가 예정 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 h-96 flex items-center justify-center">
          <p className="text-white/30 text-sm">🚀 3D 태양계 — 다음 단계에서 추가됩니다</p>
        </div>
      </div>
    </section>
  );
}
