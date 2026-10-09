"use client";

import { WeatherIcon } from "./weather-icon";

interface ErrorCardProps {
  message: string;
  onRetry: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center"
    >
      <WeatherIcon code={95} className="h-10 w-10 text-red-400" />
      <p className="mt-3 font-medium text-red-700">加载失败</p>
      <p className="mt-1 text-sm text-red-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        重试
      </button>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <WeatherIcon code={2} className="h-14 w-14 text-sky-400" />
      <p className="mt-4 font-medium text-slate-700">搜索任一城市，开始查看天气</p>
      <p className="mt-1 text-sm text-slate-400">
        建议输入英文地名（如 Tokyo、London）效果更佳
      </p>
    </div>
  );
}
