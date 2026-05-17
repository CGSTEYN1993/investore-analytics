'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Independent analysis-dashboard watchlist.
 *
 * Persisted in localStorage and intentionally decoupled from the IBKR/trading
 * watchlist (`/api/v1/watchlist`) so it works without auth/enterprise tier and
 * survives logout. Used by:
 *   - the analysis dashboard `WatchlistPanel`
 *   - the company profile bookmark button
 */

const STORAGE_KEY = 'investore.analysis.watchlist.v1';

export interface WatchlistItem {
  ticker: string;
  exchange?: string;
  name?: string;
  commodity?: string;
  addedAt: string; // ISO
}

function readStorage(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (it) => it && typeof it.ticker === 'string'
    ) as WatchlistItem[];
  } catch {
    return [];
  }
}

function writeStorage(items: WatchlistItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Notify other hook instances in the same tab.
    window.dispatchEvent(new CustomEvent('investore:watchlist-changed'));
  } catch {
    /* quota / private mode — silent */
  }
}

function keyOf(ticker: string, exchange?: string) {
  return `${ticker.toUpperCase()}:${(exchange || '').toUpperCase()}`;
}

export function useAnalysisWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Initial hydration
  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);

    const onChange = () => setItems(readStorage());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    };
    window.addEventListener('investore:watchlist-changed', onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('investore:watchlist-changed', onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const has = useCallback(
    (ticker: string, exchange?: string) => {
      const k = keyOf(ticker, exchange);
      return items.some((it) => keyOf(it.ticker, it.exchange) === k);
    },
    [items]
  );

  const add = useCallback(
    (item: Omit<WatchlistItem, 'addedAt'> & { addedAt?: string }) => {
      const next = readStorage();
      const k = keyOf(item.ticker, item.exchange);
      if (next.some((it) => keyOf(it.ticker, it.exchange) === k)) return;
      next.unshift({
        ticker: item.ticker.toUpperCase(),
        exchange: item.exchange ? item.exchange.toUpperCase() : undefined,
        name: item.name,
        commodity: item.commodity,
        addedAt: item.addedAt || new Date().toISOString(),
      });
      writeStorage(next);
      setItems(next);
    },
    []
  );

  const remove = useCallback((ticker: string, exchange?: string) => {
    const k = keyOf(ticker, exchange);
    const next = readStorage().filter(
      (it) => keyOf(it.ticker, it.exchange) !== k
    );
    writeStorage(next);
    setItems(next);
  }, []);

  const toggle = useCallback(
    (item: Omit<WatchlistItem, 'addedAt'>) => {
      if (has(item.ticker, item.exchange)) {
        remove(item.ticker, item.exchange);
        return false;
      }
      add(item);
      return true;
    },
    [add, has, remove]
  );

  const clear = useCallback(() => {
    writeStorage([]);
    setItems([]);
  }, []);

  return { items, hydrated, has, add, remove, toggle, clear };
}
