'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchWatchlists,
  fetchWatchlistQuotes,
  addWatchlistItem,
  removeWatchlistItem,
} from '@/services/tradingService';

/**
 * Independent analysis-dashboard watchlist.
 *
 * Persisted in localStorage so it works without auth/enterprise tier. When
 * the user IS signed in, every add/remove is also mirrored to the backend
 * `/api/v1/watchlist` so the daily pre-market newsletter can personalise
 * the email with the user's watchlist companies + their commodity drivers
 * (see backend/app/services/newsletter_personalization.py).
 *
 * Used by:
 *   - the analysis dashboard `WatchlistPanel`
 *   - the holdings-drawer Watchlist tab
 *   - the company profile bookmark button
 */

const STORAGE_KEY = 'investore.analysis.watchlist.v1';
const SYNCED_KEY = 'investore.analysis.watchlist.synced.v1';

export interface WatchlistItem {
  ticker: string;
  exchange?: string;
  name?: string;
  commodity?: string;
  addedAt: string; // ISO
  /** Backend trading_watchlist_items.id once mirrored — used for remove. */
  serverId?: number;
}

function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  // Match tradingService.getToken() lookup order.
  if (document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)) return true;
  try {
    return !!(
      window.localStorage.getItem('access_token') ||
      window.sessionStorage.getItem('access_token')
    );
  } catch {
    return false;
  }
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
    window.dispatchEvent(new CustomEvent('investore:watchlist-changed'));
  } catch {
    /* quota / private mode — silent */
  }
}

function keyOf(ticker: string, exchange?: string) {
  return `${ticker.toUpperCase()}:${(exchange || '').toUpperCase()}`;
}

/** Resolve the user's default watchlist id (creating one if needed). */
async function getDefaultWatchlistId(): Promise<number | null> {
  try {
    const lists = await fetchWatchlists();
    const def = lists.find((w) => w.is_default) || lists[0];
    return def ? def.id : null;
  } catch {
    return null;
  }
}

export function useAnalysisWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const defaultIdRef = useRef<number | null>(null);

  // ── Initial hydration + best-effort server pull/merge ────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const local = readStorage();
      if (!cancelled) {
        setItems(local);
        setHydrated(true);
      }

      if (!isLoggedIn()) return;

      try {
        const wid = await getDefaultWatchlistId();
        defaultIdRef.current = wid;
        if (!wid) return;

        // Pull server items
        const quotes = await fetchWatchlistQuotes(wid);
        const serverItems = quotes.items || [];
        const serverByKey = new Map<string, { id: number; ticker: string; exchange: string }>();
        for (const it of serverItems) {
          serverByKey.set(keyOf(it.ticker, it.exchange), {
            id: it.id,
            ticker: it.ticker,
            exchange: it.exchange,
          });
        }

        const localByKey = new Map<string, WatchlistItem>();
        for (const it of local) localByKey.set(keyOf(it.ticker, it.exchange), it);

        const synced = (() => {
          try {
            return JSON.parse(window.localStorage.getItem(SYNCED_KEY) || 'false');
          } catch {
            return false;
          }
        })();

        // First sync after sign-in: push any local-only items up to the server.
        if (!synced) {
          for (const [k, it] of localByKey) {
            if (!serverByKey.has(k) && it.exchange) {
              try {
                const created = await addWatchlistItem(wid, it.ticker, it.exchange);
                serverByKey.set(k, {
                  id: created.id,
                  ticker: created.ticker,
                  exchange: created.exchange,
                });
              } catch {
                /* ignore one-off failures */
              }
            }
          }
          try {
            window.localStorage.setItem(SYNCED_KEY, 'true');
          } catch {
            /* ignore */
          }
        }

        // Merge: server is the source of truth for membership; local keeps name/commodity.
        const merged: WatchlistItem[] = [];
        for (const [k, srv] of serverByKey) {
          const loc = localByKey.get(k);
          merged.push({
            ticker: srv.ticker.toUpperCase(),
            exchange: srv.exchange.toUpperCase(),
            name: loc?.name,
            commodity: loc?.commodity,
            addedAt: loc?.addedAt || new Date().toISOString(),
            serverId: srv.id,
          });
        }
        // Keep any local items the server doesn't have (e.g. no exchange known).
        for (const [k, loc] of localByKey) {
          if (!serverByKey.has(k)) merged.push(loc);
        }

        if (!cancelled) {
          writeStorage(merged);
          setItems(merged);
        }
      } catch {
        /* Backend not reachable — keep local state. */
      }
    };

    init();

    const onChange = () => setItems(readStorage());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    };
    window.addEventListener('investore:watchlist-changed', onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
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
    (item: Omit<WatchlistItem, 'addedAt' | 'serverId'> & { addedAt?: string }) => {
      const next = readStorage();
      const k = keyOf(item.ticker, item.exchange);
      if (next.some((it) => keyOf(it.ticker, it.exchange) === k)) return;
      const entry: WatchlistItem = {
        ticker: item.ticker.toUpperCase(),
        exchange: item.exchange ? item.exchange.toUpperCase() : undefined,
        name: item.name,
        commodity: item.commodity,
        addedAt: item.addedAt || new Date().toISOString(),
      };
      next.unshift(entry);
      writeStorage(next);
      setItems(next);

      // Mirror to backend so the pre-market email picks it up.
      if (isLoggedIn() && entry.exchange) {
        (async () => {
          try {
            const wid =
              defaultIdRef.current ?? (await getDefaultWatchlistId());
            defaultIdRef.current = wid;
            if (!wid) return;
            const created = await addWatchlistItem(
              wid,
              entry.ticker,
              entry.exchange!
            );
            // Stamp serverId on the stored entry.
            const after = readStorage().map((it) =>
              keyOf(it.ticker, it.exchange) === k
                ? { ...it, serverId: created.id }
                : it
            );
            writeStorage(after);
            setItems(after);
          } catch {
            /* offline / not logged in — local-only is fine */
          }
        })();
      }
    },
    []
  );

  const remove = useCallback((ticker: string, exchange?: string) => {
    const k = keyOf(ticker, exchange);
    const current = readStorage();
    const removed = current.find((it) => keyOf(it.ticker, it.exchange) === k);
    const next = current.filter((it) => keyOf(it.ticker, it.exchange) !== k);
    writeStorage(next);
    setItems(next);

    if (isLoggedIn() && removed?.serverId) {
      (async () => {
        try {
          const wid =
            defaultIdRef.current ?? (await getDefaultWatchlistId());
          defaultIdRef.current = wid;
          if (!wid) return;
          await removeWatchlistItem(wid, removed.serverId!);
        } catch {
          /* ignore */
        }
      })();
    }
  }, []);

  const toggle = useCallback(
    (item: Omit<WatchlistItem, 'addedAt' | 'serverId'>) => {
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
    const current = readStorage();
    writeStorage([]);
    setItems([]);
    if (isLoggedIn()) {
      (async () => {
        try {
          const wid =
            defaultIdRef.current ?? (await getDefaultWatchlistId());
          defaultIdRef.current = wid;
          if (!wid) return;
          for (const it of current) {
            if (it.serverId) {
              try {
                await removeWatchlistItem(wid, it.serverId);
              } catch {
                /* ignore */
              }
            }
          }
        } catch {
          /* ignore */
        }
      })();
    }
  }, []);

  return { items, hydrated, has, add, remove, toggle, clear };
}
