"use client";

import type { ForecastResponse } from "@/lib/types";
import { WeatherIcon } from "./weather-icon";

interface HourlyForecastProps {
  forecast: ForecastResponse;
}

const HOURS_TO_SHOW = 24;

/** 从 hourly 数组中找出「不小于当前整点」的起点索引 */
function findStartIndex(currentTime: string, hourlyTimes: string[]): number {
  const currentHourStart = `${currentTime.slice(0, 13)}:00`;
  const index = hourlyTimes.findIndex((time) => time >= currentHourStart);
  const maxStart = Math.max(hourlyTimes.length - HOURS_TO_SHOW, 0);
  return index === -1 ? 0 : Math.min(index, maxStart);
}

export function HourlyForecast({ forecast }: HourlyForecastProps) {
  const { current, hourly } = forecast;
  const start = findStartIndex(current.time, hourly.time);
  const hours = Array.from({ length: HOURS_TO_SHOW }, (_, i) => ({
    time: hourly.time[start + i],
    temperature: hourly.temperature_2m[start + i],
    code: hourly.weather_code[start + i],
    isDay: hourly.is_day[start + i] === 1,
  }));

  return (
    <section
      aria-label="未来 24 小时预报"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <h2 className="text-sm font-medium text-slate-500">未来 24 小时</h2>
      <ol className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {hours.map((hour, i) => (
          <li
            key={hour.time}
            className={`flex min-w-16 flex-col items-center gap-1.5 rounded-xl py-3 ${
              i === 0 ? "bg-sky-50" : ""
            }`}
          >
            <span className="text-xs text-slate-500">
              {i === 0 ? "现在" : hour.time.slice(11, 16)}
            </span>
            <WeatherIcon
              code={hour.code}
              isDay={hour.isDay}
              className="h-7 w-7 text-slate-600"
            />
            <span className="text-sm font-medium text-slate-800">
              {Math.round(hour.temperature)}°
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
