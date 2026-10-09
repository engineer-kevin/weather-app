"use client";

import type { ForecastResponse } from "@/lib/types";
import { WeatherIcon } from "./weather-icon";

interface DailyForecastProps {
  forecast: ForecastResponse;
}

/** 「2026-09-22」→「周一」（用当地日期分量构造 Date，避免时区偏移） */
function weekdayOf(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("zh-CN", {
    weekday: "short",
  });
}

export function DailyForecast({ forecast }: DailyForecastProps) {
  const daily = forecast.daily;
  const globalMin = Math.min(...daily.temperature_2m_min);
  const globalMax = Math.max(...daily.temperature_2m_max);
  const span = Math.max(globalMax - globalMin, 1);

  return (
    <section
      aria-label="未来 7 天预报"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <h2 className="text-sm font-medium text-slate-500">未来 7 天</h2>
      <ul className="mt-2 divide-y divide-slate-100">
        {daily.time.map((date, i) => {
          const min = daily.temperature_2m_min[i];
          const max = daily.temperature_2m_max[i];
          const left = ((min - globalMin) / span) * 100;
          const width = ((max - min) / span) * 100;
          const precip = daily.precipitation_probability_max[i];

          return (
            <li
              key={date}
              className="grid grid-cols-[52px_32px_40px_1fr_88px] items-center gap-2 py-2.5 sm:grid-cols-[64px_36px_48px_1fr_88px]"
            >
              <span className="text-sm text-slate-700">
                {i === 0 ? "今天" : weekdayOf(date)}
              </span>
              <WeatherIcon
                code={daily.weather_code[i]}
                className="h-6 w-6 text-slate-600"
              />
              <span className="text-xs text-sky-600">
                {precip != null && precip > 0 ? `${precip}%` : ""}
              </span>
              <span className="relative h-1.5 rounded-full bg-slate-100">
                <span
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                  style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                />
              </span>
              <span className="text-right text-sm text-slate-700 tabular-nums">
                {Math.round(min)}° / {Math.round(max)}°
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
