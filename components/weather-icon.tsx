import type { ReactNode } from "react";
import { describeWeatherCode } from "@/lib/weather-codes";

interface WeatherIconProps {
  code: number;
  /** 仅对有昼夜差异的天气（晴朗、局部多云）有效 */
  isDay?: boolean;
  className?: string;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Sun() {
  return (
    <>
      <circle cx="12" cy="12" r="4" {...stroke} />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        {...stroke}
      />
    </>
  );
}

function Moon() {
  return (
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" {...stroke} />
  );
}

function Overcast() {
  return (
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" {...stroke} />
  );
}

/** 雨雪类共用的偏高云朵 */
function RainCloud() {
  return (
    <path
      d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
      {...stroke}
    />
  );
}

function PartlyCloudy({ isDay }: { isDay: boolean }) {
  if (isDay) {
    return (
      <>
        <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" {...stroke} />
        <path
          d="M15.947 12.65a4 4 0 0 0-5.925-4.128"
          {...stroke}
        />
        <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" {...stroke} />
      </>
    );
  }
  return (
    <>
      <path d="M19 8.5A3.5 3.5 0 1 1 15.5 4a2.8 2.8 0 0 0 3.5 4.5Z" {...stroke} />
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" {...stroke} />
    </>
  );
}

const ICON_RENDERERS: Record<
  string,
  (isDay: boolean) => ReactNode
> = {
  clear: (isDay) => (isDay ? <Sun /> : <Moon />),
  "partly-cloudy": (isDay) => <PartlyCloudy isDay={isDay} />,
  overcast: () => <Overcast />,
  fog: () => (
    <>
      <Overcast />
      <path d="M16 17H7M17 21H9" {...stroke} />
    </>
  ),
  drizzle: () => (
    <>
      <RainCloud />
      <path d="M8 15v1M8 19v1M12 17v1M12 21v1M16 15v1M16 19v1" {...stroke} />
    </>
  ),
  rain: () => (
    <>
      <RainCloud />
      <path d="M16 14v5M8 14v5M12 16v5" {...stroke} />
    </>
  ),
  showers: () => (
    <>
      <RainCloud />
      <path d="m16 14-1.5 5M8 14l-1.5 5M12 16l-1.5 5" {...stroke} />
    </>
  ),
  freezing: () => (
    <>
      <RainCloud />
      <path d="M12 14v3M8 16h.01M8 20h.01M16 16h.01M16 20h.01" {...stroke} />
    </>
  ),
  snow: () => (
    <>
      <RainCloud />
      <path d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01" {...stroke} />
    </>
  ),
  thunderstorm: () => (
    <>
      <RainCloud />
      <path d="m13 13-3 5h4l-3 5" {...stroke} />
    </>
  ),
};

export function WeatherIcon({ code, isDay = true, className }: WeatherIconProps) {
  const { icon } = describeWeatherCode(code);
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {ICON_RENDERERS[icon](isDay)}
    </svg>
  );
}
