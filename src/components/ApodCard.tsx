"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ApodData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  ai_summary?: string;
}

export default function ApodCard() {
  const [data, setData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // GitHub Actions가 생성한 정적 데이터 우선 사용, 없으면 직접 API 호출
    async function load() {
      try {
        const res = await fetch("/data/daily.json");
        if (res.ok) {
          const json = await res.json();
          setData(json.apod);
          return;
        }
      } catch {}

      // fallback: 직접 NASA API 호출
      try {
        const key = process.env.NEXT_PUBLIC_NASA_API_KEY ?? "DEMO_KEY";
        const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}`);
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    load().finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="rounded-2xl border border-white/10 bg-white/5 h-80 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !data) return (
    <div className="rounded-2xl border border-white/10 bg-white/5 h-40 flex items-center justify-center text-white/30 text-sm">
      데이터를 불러올 수 없습니다
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* 이미지 / 영상 */}
      <div className="relative aspect-video w-full bg-black">
        {data.media_type === "image" ? (
          <Image
            src={data.url}
            alt={data.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <iframe
            src={data.url}
            className="w-full h-full"
            allowFullScreen
            title={data.title}
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute bottom-3 left-4 text-xs text-white/50">{data.date}</span>
      </div>

      {/* 설명 */}
      <div className="p-5">
        <h3 className="font-semibold text-white mb-2">{data.title}</h3>

        {/* AI 한국어 요약 (GitHub Actions 생성 시) */}
        {data.ai_summary && (
          <div className="mb-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs text-blue-400 font-medium">🤖 AI 요약</span>
            <p className="text-sm text-white/80 mt-1">{data.ai_summary}</p>
          </div>
        )}

        <p className={`text-sm text-white/50 leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
          {data.explanation}
        </p>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {expanded ? "접기" : "더 보기"}
        </button>
      </div>
    </div>
  );
}
