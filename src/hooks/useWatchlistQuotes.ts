'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '@/lib/public-api-url';
import type { WatchlistItem } from './useAnalysisWatchlist';

/**
 * Per-ticker live quote (current price + intraday change).
 *
 * Sourced from `/api/v1/market/quote/{symbol}` — ASX-native for AU
 * tickers, Finnhub for everything else. Refreshes every 60 seconds.
 *
 * Returns a Map keyed by uppercase ticker as well as an aggregate
 * change-percent across the whole watchlist (simple unweighted mean of
 * each item's `changePercent`, ignoring items with no quote available).
 */

export interface WatchlistQuote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency?: string;
  error?: string;
}

export interface WatchlistQuotesState {
  quotes: Map<string, WatchlistQuote>;
  aggregateChangePercent: number | null;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

const REFRESH_INTERVAL_MS = 60_000;

async function fetchQuote(symbol: string, exchange?: string): Promise<WatchlistQuote> {
  try {
    const qs = exchange ? `?exchange=${encodeURIComponent(exchange)}` : '';
    const res = await fetch(
      `${API_BASE_URL}/api/v1/market/quote/${encodeURIComponent(symbol)}${qs}`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      return { symbol, price: null, change: null, changePercent: null, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return {
      symbol,
      price: typeof data?.price === 'number' ? data.price : null,
      change: typeof data?.change === 'number' ? data.change : null,
      changePercent: typeof data?.changePercent === 'number' ? data.changePercent : null,
      currency: typeof data?.currency === 'string' ? data.currency : undefined,
    };
  } catch (err) {
    return {
      symbol,
      price: null,
      change: null,
      changePercent: null,
      error: err instanceof Error ? err.message : 'fetch failed',
    };
  }
}

export function useWatchlistQuotes(items: WatchlistItem[]): WatchlistQuotesState {
  const [quotes, setQuotes] = useState<Map<string, WatchlistQuote>>(new Map());
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inflightRef = useRef(false);

  const pairs = useMemo(() => {
    const seen = new Map<string, string | undefined>();
    for (const it of items) {
      const sym = (it.ticker || '').toUpperCase();
      if (!sym) continue;
      // Keep the first exchange we see for a given symbol.
      if (!seen.has(sym)) seen.set(sym, it.exchange);
    }
    return Array.from(seen.entries()).map(([symbol, exchange]) => ({ symbol, exchange }));
  }, [items]);
  const pairsKey = pairs.map((p) => `${p.symbol}:${p.exchange || ''}`).join(',');

  const refresh = useCallback(async () => {
    if (pairs.length === 0) {
      setQuotes(new Map());
      setLastUpdated(new Date());
      return;
    }
    if (inflightRef.current) return;
    inflightRef.current = true;
    setLoading(true);
    try {
      const results = await Promise.all(
        pairs.map((p) => fetchQuote(p.symbol, p.exchange))
      );
      const next = new Map<string, WatchlistQuote>();
      for (const q of results) next.set(q.symbol, q);
      setQuotes(next);
      setLastUpdated(new Date());
    } finally {
      inflightRef.current = false;
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairsKey]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const aggregateChangePercent = useMemo(() => {
    const pcts: number[] = [];
    for (const q of Array.from(quotes.values())) {
      if (typeof q.changePercent === 'number' && Number.isFinite(q.changePercent)) {
        pcts.push(q.changePercent);
      }
    }
    if (pcts.length === 0) return null;
    return pcts.reduce((a, b) => a + b, 0) / pcts.length;
  }, [quotes]);

  return { quotes, aggregateChangePercent, loading, lastUpdated, refresh };
}
