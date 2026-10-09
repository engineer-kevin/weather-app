const shimmer = "animate-pulse rounded bg-slate-200";

export function CurrentWeatherSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className={`h-5 w-28 ${shimmer}`} />
          <div className={`h-3.5 w-20 ${shimmer}`} />
        </div>
        <div className={`h-16 w-16 rounded-full ${shimmer}`} />
      </div>
      <div className={`mt-8 h-14 w-44 ${shimmer}`} />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={`h-16 rounded-xl ${shimmer}`} />
        <div className={`h-16 rounded-xl ${shimmer}`} />
        <div className={`h-16 rounded-xl ${shimmer}`} />
      </div>
    </div>
  );
}

export function HourlyForecastSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className={`h-4 w-24 ${shimmer}`} />
      <div className="mt-4 flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`h-24 min-w-16 rounded-xl ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}

export function DailyForecastSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className={`h-4 w-20 ${shimmer}`} />
      <div className="mt-3 space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`h-8 rounded-lg ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}
