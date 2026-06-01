"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
}

interface DailyData {
  updatedAt: string;
  news?: {
    items: NewsItem[];
    ai_digest: string;
  };
}

export default function NewsCard() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/daily.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/40 tracking-widest uppercase">오늘의 뉴스</span>
        {updatedAt && <span className="text-xs text-white/30">{updatedAt} 업데이트</span>}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30 flex-1">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      ) : !data?.news ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <span className="text-2xl">📰</span>
          <p className="text-sm text-white/40">GitHub Actions 설정 후 매일 자동 업데이트</p>
          <p className="text-xs text-white/20">Actions → Daily Data Update → Run workflow</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          {/* AI 종합 요약 */}
          {data.news.ai_digest && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs text-purple-400 font-medium">🤖 AI 오늘의 브리핑</span>
              <p className="text-sm text-white/80 mt-1 leading-relaxed">{data.news.ai_digest}</p>
            </div>
          )}
          {/* 뉴스 목록 */}
          <ul className="space-y-3">
            {data.news.items.slice(0, 5).map((item, i) => (
              <li key={i} className="group">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <p className="text-sm text-white/80 group-hover:text-white transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  <span className="text-xs text-white/30 mt-0.5 block">{item.source}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
