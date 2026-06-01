export default function DashboardSection() {
  const cards = [
    { icon: "📰", title: "뉴스 요약", desc: "AI가 오늘의 주요 뉴스를 3줄로 요약", badge: "AI" },
    { icon: "🌤", title: "날씨", desc: "Open-Meteo 기반 실시간 날씨 정보", badge: "API" },
    { icon: "🔭", title: "오늘의 우주", desc: "NASA APOD — AI 한국어 해설 포함", badge: "NASA" },
    { icon: "💻", title: "GitHub 활동", desc: "오늘의 커밋 및 기여 현황", badge: "GitHub" },
  ];

  return (
    <section id="dashboard" className="py-24 bg-[#050510]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-purple-400 uppercase mb-3">
            Dashboard
          </p>
          <h2 className="text-4xl font-bold text-white">AI 대시보드</h2>
          <p className="mt-4 text-white/50">
            GitHub Actions 자동화 · Claude AI · 실시간 데이터
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{card.icon}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {card.badge}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">{card.title}</h3>
              <p className="text-sm text-white/50">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
