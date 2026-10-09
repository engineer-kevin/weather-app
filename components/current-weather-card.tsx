"use client";

import { describeWeatherCode, getWeatherTheme } from "@/lib/weather-codes";
import type { ForecastResponse, Place } from "@/lib/types";
import { WeatherIcon } from "./weather-icon";

interface CurrentWeatherCardProps {
  place: Place;
  forecast: ForecastResponse;
}

/** 「2026-09-22T19:15」（地点当地时间）→「9月22日 19:15」 */
function formatCurrentTime(isoTime: string): string {
  const [datePart, timePart] = isoTime.split("T");
  const [, month, day] = datePart.split("-").map(Number);
  return `${month}月${day}日 ${timePart}`;
}

export function CurrentWeatherCard({ place, forecast }: CurrentWeatherCardProps) {
  const current = forecast.current;
  const isDay = current.is_day === 1;
  const info = describeWeatherCode(current.weather_code);
  const theme = getWeatherTheme(info.icon, isDay);
  const todayPrecip = forecast.daily.precipitation_probability_max[0];

  return (
    <section
      aria-label={`${place.name} 当前天气`}
      className={`rounded-3xl bg-gradient-to-br p-6 text-white shadow-md sm:p-8 ${theme}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">{place.name}</h2>
          <p className="mt-0.5 text-sm text-white/70">
            {[place.admin1, place.country].filter(Boolean).join("、")}
          </p>
          <p className="mt-1 text-xs text-white/60">
            {formatCurrentTime(current.time)}（当地时间）
          </p>
        </div>
        <WeatherIcon code={current.weather_code} isDay={isDay} className="h-16 w-16 shrink-0" />
      </div>

      <div className="mt-7 flex items-end gap-4">
        <p className="text-6xl leading-none font-semibold tracking-tight">
          {Math.round(current.temperature_2m)}°
        </p>
        <div className="pb-1">
          <p className="text-lg">{info.label}</p>
          <p className="text-sm text-white/75">
            体感 {Math.round(current.apparent_temperature)}°
          </p>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <dt className="text-xs text-white/70">湿度</dt>
          <dd className="mt-1 text-lg font-medium">
            {current.relative_humidity_2m}%
          </dd>
        </div>
        <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <dt className="text-xs text-white/70">风速</dt>
          <dd className="mt-1 text-lg font-medium">
            {current.wind_speed_10m} km/h
          </dd>
        </div>
        <div className="col-span-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm sm:col-span-1">
          <dt className="text-xs text-white/70">今日降雨概率</dt>
          <dd className="mt-1 text-lg font-medium">
            {todayPrecip != null ? `${todayPrecip}%` : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
