"use client";

import { useEffect, useRef, useState } from "react";
import { useLocationSearch } from "@/hooks/use-location-search";
import type { GeoLocation, Place } from "@/lib/types";

interface SearchBarProps {
  /** 选择地点后的回调（参数已转换为应用内的 Place 模型） */
  onSelect: (place: Place) => void;
}

const MIN_QUERY_LENGTH = 2;

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const { data, isPending } = useLocationSearch(query);
  const results = data?.results ?? [];
  const showNoResults =
    !isPending && trimmed.length >= MIN_QUERY_LENGTH && results.length === 0;

  // 点击组件外部时收起下拉
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function select(location: GeoLocation) {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery("");
    onSelect({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      admin1: location.admin1,
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (results.length > 0) {
          setIsOpen(true);
          setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      }
      case "Enter": {
        const picked = results[activeIndex] ?? results[0];
        if (picked) {
          event.preventDefault();
          select(picked);
        }
        break;
      }
      case "Escape": {
        setIsOpen(false);
        break;
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="place-search" className="sr-only">
          搜索地点
        </label>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="place-search"
            type="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="place-search-results"
            aria-autocomplete="list"
            placeholder="搜索城市，例如 Tokyo、东京…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      </form>

      {isOpen && trimmed.length >= MIN_QUERY_LENGTH && (
        <div
          id="place-search-results"
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
        >
          {isPending ? (
            <div aria-hidden="true" className="space-y-2 p-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((location, index) => (
                <li
                  key={location.id}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(location)}
                    className={`w-full px-4 py-2.5 text-left text-sm ${
                      index === activeIndex
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-700"
                    }`}
                  >
                    <span className="font-medium">{location.name}</span>
                    <span className="ml-2 text-xs text-slate-400">
                      {[location.admin1, location.country]
                        .filter(Boolean)
                        .join("、")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : showNoResults ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              找不到与「{trimmed}」匹配的地点，试试英文地名（如 Tokyo）
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
