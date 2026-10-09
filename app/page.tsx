import { Suspense } from "react";
import { Home } from "@/components/home";
import {
  CurrentWeatherSkeleton,
  DailyForecastSkeleton,
  HourlyForecastSkeleton,
} from "@/components/skeletons";

export default function Page() {
  return (
    // useSearchParams 需在 Suspense boundary 内，让页面其余部分可预先渲染
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12">
          <div className="py-6 sm:py-8" aria-hidden="true">
            <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          </div>
          <div
            aria-hidden="true"
            className="h-12 animate-pulse rounded-2xl bg-white shadow-sm"
          />
          <div className="mt-6 space-y-5" aria-hidden="true">
            <CurrentWeatherSkeleton />
            <HourlyForecastSkeleton />
            <DailyForecastSkeleton />
          </div>
        </main>
      }
    >
      <Home />
    </Suspense>
  );
}
