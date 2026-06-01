"use client";

import { useEffect, useState } from "react";

interface GhEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    commits?: { message: string }[];
    ref?: string;
    action?: string;
  };
}

function eventLabel(e: GhEvent): string {
  switch (e.type) {
    case "PushEvent":
      return `📝 ${e.payload.commits?.[0]?.message ?? "push"} → ${e.repo.name}`;
    case "CreateEvent":
      return `✨ ${e.repo.name} 브랜치/저장소 생성`;
    case "PullRequestEvent":
      return `🔀 PR ${e.payload.action} — ${e.repo.name}`;
    case "IssuesEvent":
      return `🐛 Issue ${e.payload.action} — ${e.repo.name}`;
    case "WatchEvent":
      return `⭐ ${e.repo.name} starred`;
    case "ForkEvent":
      return `🍴 ${e.repo.name} forked`;
    default:
      return `${e.type} — ${e.repo.name}`;
  }
}

export default function GithubCard() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "pullcoder";
  const [events, setEvents] = useState<GhEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.github.com/users/${username}/events/public?per_page=10`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setEvents(d.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/40 tracking-widest uppercase">GitHub 활동</span>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/40 hover:text-white transition-colors"
        >
          @{username} ↗
        </a>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30 flex-1">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-white/30 flex-1">최근 활동 없음</p>
      ) : (
        <ul className="space-y-2.5 flex-1">
          {events.map((e, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-white/20 text-xs mt-0.5 shrink-0">
                {new Date(e.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              </span>
              <p className="text-sm text-white/70 leading-snug line-clamp-1">{eventLabel(e)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
