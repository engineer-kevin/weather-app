import type { ForecastResponse, GeocodingResponse } from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 10_000;

/** 带用户可读信息的 API 错误（UI 直接显示 message） */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("请求超时，请稍后再试");
    }
    throw new ApiError("网络连接异常，请确认网络后重试");
  }

  if (!response.ok) {
    throw new ApiError(`天气服务响应异常（HTTP ${response.status}）`);
  }

  return (await response.json()) as T;
}

export function searchLocations(query: string): Promise<GeocodingResponse> {
  const params = new URLSearchParams({
    name: query,
    count: "5",
    language: "zh",
    format: "json",
  });
  return request<GeocodingResponse>(`${GEOCODING_URL}?${params.toString()}`);
}

export function fetchForecast(
  latitude: number,
  longitude: number,
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    hourly: "temperature_2m,weather_code,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
  });
  return request<ForecastResponse>(`${FORECAST_URL}?${params.toString()}`);
}
