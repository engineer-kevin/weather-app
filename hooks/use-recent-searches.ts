import { useCallback, useSyncExternalStore } from "react";
import type { Place } from "@/lib/types";

const STORAGE_KEY = "weather-app.recent-searches";
const MAX_RECENT = 5;
const EMPTY: Place[] = [];

function placeKey(place: Place): string {
  return `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  // 附带效果：其他标签页修改 localStorage 时同步更新
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function emitChange() {
  for (const listener of listeners) listener();
}

// 缓存上一次解析结果，确保 snapshot 内容不变时返回同一引用（避免无限重渲染）
let lastRaw: string | null = null;
let lastSnapshot: Place[] = EMPTY;

function getSnapshot(): Place[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      lastSnapshot = Array.isArray(parsed) ? (parsed as Place[]) : EMPTY;
    } catch {
      lastSnapshot = EMPTY;
    }
  }
  return lastSnapshot;
}

function getServerSnapshot(): Place[] {
  return EMPTY;
}

function write(places: Place[]) {
  try {
    if (places.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    }
  } catch {
    // 隐私模式等场景下写入失败，不影响本次 session 内的使用
  }
  emitChange();
}

/**
 * 最近搜索记录（最多 5 条，存 localStorage）。
 * 以 useSyncExternalStore 读写外部存储：SSR 安全（server snapshot 为空）、
 * 写入后即时通知、跨标签页同步。
 */
export function useRecentSearches() {
  const places = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((place: Place) => {
    const next = [
      place,
      ...getSnapshot().filter((p) => placeKey(p) !== placeKey(place)),
    ].slice(0, MAX_RECENT);
    write(next);
  }, []);

  const clear = useCallback(() => {
    write(EMPTY);
  }, []);

  return { places, add, clear };
}
