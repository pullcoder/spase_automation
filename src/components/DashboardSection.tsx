import WeatherCard from "./dashboard/WeatherCard";
import NewsCard from "./dashboard/NewsCard";
import GithubCard from "./dashboard/GithubCard";

export default function DashboardSection() {
  return (
    <section id="dashboard" className="py-24 bg-[#050510]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-purple-400 uppercase mb-3">Dashboard</p>
          <h2 className="text-4xl font-bold text-white">AI 대시보드</h2>
          <p className="mt-4 text-white/50 text-sm">
            매일 오전 9시 자동 업데이트 · GitHub Actions · Groq AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 날씨 — 작은 카드 */}
          <div className="lg:col-span-1">
            <WeatherCard />
          </div>

          {/* GitHub 활동 — 작은 카드 */}
          <div className="lg:col-span-2">
            <GithubCard />
          </div>

          {/* 뉴스 — 넓은 카드 */}
          <div className="lg:col-span-3">
            <NewsCard />
          </div>
        </div>
      </div>
    </section>
  );
}
