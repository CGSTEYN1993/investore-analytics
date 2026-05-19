'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Tracks per-day usage of a named action in localStorage.
 *
 * Used by free-tier rate limits (currently: AI Research Analyst queries).
 * This is best-effort client-side enforcement that improves UX and prevents
 * casual abuse — backend rate limiting should be added separately for
 * authoritative enforcement.
 *
 * @param key   stable storage key (e.g. "ai-analyst-queries")
 * @param limit max number of uses allowed per UTC day
 */
export function useDailyQueryLimit(key: string, limit: number) {
  const storageKey = `investore.dailyLimit.${key}`;

  const todayStamp = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC

  const readCount = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as { date: string; count: number };
      if (parsed.date !== todayStamp()) return 0;
      return parsed.count ?? 0;
    } catch {
      return 0;
    }
  }, [storageKey]);

  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(readCount());
  }, [readCount]);

  const increment = useCallback(() => {
    if (typeof window === 'undefined') return;
    const next = readCount() + 1;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ date: todayStamp(), count: next }));
    } catch {
      // ignore (private mode / quota)
    }
    setUsed(next);
  }, [readCount, storageKey]);

  const remaining = Math.max(0, limit - used);
  const exhausted = used >= limit;

  return { used, remaining, exhausted, limit, increment };
}
