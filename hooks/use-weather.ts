import { useQuery } from "@tanstack/react-query";
import { fetchForecast } from "@/lib/api";
import type { Place } from "@/lib/types";

const STALE_TIME_MS = 10 * 60 * 1000;

/** 获取指定地点的天气预报；place 为 null 时不发请求 */
export function useWeather(place: Place | null) {
  return useQuery({
    queryKey: ["weather", place?.latitude, place?.longitude],
    queryFn: () => fetchForecast(place!.latitude, place!.longitude),
    enabled: place !== null,
    staleTime: STALE_TIME_MS,
  });
}
