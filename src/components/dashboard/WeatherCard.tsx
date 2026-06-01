"use client";

import { useEffect, useState } from "react";

const WMO_CODE: Record<number, { label: string; icon: string }> = {
  0:  { label: "맑음",       icon: "☀️" },
  1:  { label: "대체로 맑음", icon: "🌤" },
  2:  { label: "구름 조금",   icon: "⛅" },
  3:  { label: "흐림",       icon: "☁️" },
  45: { label: "안개",       icon: "🌫" },
  48: { label: "안개",       icon: "🌫" },
  51: { label: "이슬비",     icon: "🌦" },
  53: { label: "이슬비",     icon: "🌦" },
  55: { label: "이슬비",     icon: "🌦" },
  61: { label: "비",         icon: "🌧" },
  63: { label: "비",         icon: "🌧" },
  65: { label: "강한 비",    icon: "🌧" },
  71: { label: "눈",         icon: "🌨" },
  73: { label: "눈",         icon: "🌨" },
  75: { label: "강한 눈",    icon: "❄️" },
  80: { label: "소나기",     icon: "🌦" },
  81: { label: "소나기",     icon: "🌦" },
  82: { label: "강한 소나기", icon: "⛈" },
  95: { label: "뇌우",       icon: "⛈" },
  99: { label: "강한 뇌우",  icon: "⛈" },
};

interface Weather {
  temp: number;
  code: number;
  wind: number;
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 서울 기준 (위도 37.5665, 경도 126.9780)
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia%2FSeoul"
    )
      .then((r) => r.json())
      .then((d) =>
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          wind: Math.round(d.current.wind_speed_10m),
        })
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const info = weather ? (WMO_CODE[weather.code] ?? { label: "알 수 없음", icon: "🌡" }) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/40 tracking-widest uppercase">서울 날씨</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Live</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      ) : weather && info ? (
        <>
          <div className="flex items-end gap-3">
            <span className="text-5xl">{info.icon}</span>
            <span className="text-4xl font-bold text-white">{weather.temp}°</span>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-white/70 font-medium">{info.label}</p>
            <p className="text-xs text-white/40">바람 {weather.wind} km/h</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-white/30">날씨 정보 없음</p>
      )}
    </div>
  );
}
