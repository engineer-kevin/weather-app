/**
 * WMO weather code 的集中映射：UI 只认「图标种类」，不认原始数字代码。
 * 参考 https://open-meteo.com/en/docs（WMO Weather interpretation codes）
 */

export type WeatherIconKind =
  | "clear"
  | "partly-cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "freezing"
  | "snow"
  | "showers"
  | "thunderstorm";

export interface WeatherDescriptor {
  label: string;
  icon: WeatherIconKind;
}

const WEATHER_CODE_MAP: Record<number, WeatherDescriptor> = {
  0: { label: "晴朗", icon: "clear" },
  1: { label: "大致晴朗", icon: "partly-cloudy" },
  2: { label: "局部多云", icon: "partly-cloudy" },
  3: { label: "阴天", icon: "overcast" },
  45: { label: "有雾", icon: "fog" },
  48: { label: "冻雾", icon: "fog" },
  51: { label: "小毛雨", icon: "drizzle" },
  53: { label: "毛毛雨", icon: "drizzle" },
  55: { label: "浓毛毛雨", icon: "drizzle" },
  56: { label: "冻毛毛雨", icon: "freezing" },
  57: { label: "浓冻毛毛雨", icon: "freezing" },
  61: { label: "小雨", icon: "rain" },
  63: { label: "中雨", icon: "rain" },
  65: { label: "大雨", icon: "rain" },
  66: { label: "冻雨", icon: "freezing" },
  67: { label: "强冻雨", icon: "freezing" },
  71: { label: "小雪", icon: "snow" },
  73: { label: "中雪", icon: "snow" },
  75: { label: "大雪", icon: "snow" },
  77: { label: "雪粒", icon: "snow" },
  80: { label: "小阵雨", icon: "showers" },
  81: { label: "阵雨", icon: "showers" },
  82: { label: "强阵雨", icon: "showers" },
  85: { label: "小阵雪", icon: "snow" },
  86: { label: "阵雪", icon: "snow" },
  95: { label: "雷雨", icon: "thunderstorm" },
  96: { label: "雷雨伴冰雹", icon: "thunderstorm" },
  99: { label: "强雷雨伴冰雹", icon: "thunderstorm" },
};

const UNKNOWN: WeatherDescriptor = { label: "未知天气", icon: "overcast" };

export function describeWeatherCode(code: number): WeatherDescriptor {
  return WEATHER_CODE_MAP[code] ?? UNKNOWN;
}

/** 按天气种类与昼夜返回卡片渐变背景（Tailwind class） */
export function getWeatherTheme(icon: WeatherIconKind, isDay: boolean): string {
  switch (icon) {
    case "clear":
      return isDay ? "from-sky-400 to-blue-600" : "from-slate-700 to-indigo-950";
    case "partly-cloudy":
      return isDay ? "from-sky-400 to-slate-500" : "from-slate-700 to-slate-900";
    case "overcast":
    case "fog":
      return "from-slate-400 to-slate-600";
    case "drizzle":
    case "rain":
    case "showers":
    case "freezing":
      return "from-sky-500 to-blue-800";
    case "snow":
      return "from-sky-300 to-slate-500";
    case "thunderstorm":
      return "from-slate-600 to-violet-950";
  }
}
