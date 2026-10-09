"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { DailyForecast } from "./daily-forecast";
import { CurrentWeatherCard } from "./current-weather-card";
import { EmptyState, ErrorCard } from "./error-state";
import { HourlyForecast } from "./hourly-forecast";
import { RecentSearches } from "./recent-searches";
import { SearchBar } from "./search-bar";
import {
  CurrentWeatherSkeleton,
  DailyForecastSkeleton,
  HourlyForecastSkeleton,
} from "./skeletons";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { useWeather } from "@/hooks/use-weather";
import type { Place } from "@/lib/types";

/** 从 URL query 还原选中地点；任一必要参数缺失或格式错误视为未选择 */
function readPlaceFromParams(searchParams: ReadonlyURLSearchParams): Place | null {
  const latRaw = searchParams.get("lat");
  const lonRaw = searchParams.get("lon");
  const name = searchParams.get("name");
  if (!name || latRaw === null || lonRaw === null) return null;

  const latitude = Number(latRaw);
  const longitude = Number(lonRaw);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    name,
    latitude,
    longitude,
    country: searchParams.get("country") ?? undefined,
    admin1: searchParams.get("admin1") ?? undefined,
  };
}

export function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const place = readPlaceFromParams(searchParams);
  const weatherQuery = useWeather(place);
  const { places: recentPlaces, add: addRecent, clear: clearRecent } =
    useRecentSearches();

  /** 选中地点 → 写入 URL（唯一事实来源）+ 记录到最近搜索 */
  const selectPlace = useCallback(
    (next: Place) => {
      addRecent(next);
      const params = new URLSearchParams({
        lat: String(next.latitude),
        lon: String(next.longitude),
        name: next.name,
      });
      if (next.country) params.set("country", next.country);
      if (next.admin1) params.set("admin1", next.admin1);
      router.replace(`/?${params.toString()}`, { scroll: false });
    },
    [addRecent, router],
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12">
      <header className="py-6 sm:py-8">
        <h1 className="text-2xl font-bold tracking-tight">天气预报</h1>
        <p className="mt-1 text-sm text-slate-500">
          搜索地点，查看当前天气与未来预报
        </p>
      </header>

      <SearchBar onSelect={selectPlace} />

      <div className="mt-6 space-y-5">
        {place === null ? (
          <>
            <EmptyState />
            <RecentSearches
              places={recentPlaces}
              onSelect={selectPlace}
              onClear={clearRecent}
            />
          </>
        ) : weatherQuery.isError ? (
          <ErrorCard
            message={
              weatherQuery.error instanceof Error
                ? weatherQuery.error.message
                : "加载天气数据失败，请稍后再试"
            }
            onRetry={() => weatherQuery.refetch()}
          />
        ) : weatherQuery.isPending ? (
          <>
            <CurrentWeatherSkeleton />
            <HourlyForecastSkeleton />
            <DailyForecastSkeleton />
          </>
        ) : (
          <>
            <CurrentWeatherCard place={place} forecast={weatherQuery.data} />
            <HourlyForecast forecast={weatherQuery.data} />
            <DailyForecast forecast={weatherQuery.data} />
          </>
        )}
      </div>

      <footer className="mt-10 text-center text-xs text-slate-400">
        天气数据来源：Open-Meteo
      </footer>
    </main>
  );
}
