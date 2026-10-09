"use client";

import type { Place } from "@/lib/types";

interface RecentSearchesProps {
  places: Place[];
  onSelect: (place: Place) => void;
  onClear: () => void;
}

function placeKey(place: Place): string {
  return `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
}

export function RecentSearches({ places, onSelect, onClear }: RecentSearchesProps) {
  if (places.length === 0) return null;

  return (
    <section aria-label="最近搜索">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-500">最近搜索</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-400 transition hover:text-slate-600"
        >
          清除
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {places.map((place) => (
          <button
            key={placeKey(place)}
            type="button"
            onClick={() => onSelect(place)}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
          >
            {place.name}
          </button>
        ))}
      </div>
    </section>
  );
}
