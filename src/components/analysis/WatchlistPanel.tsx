'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bookmark, X, Search, Trash2, TrendingUp, TrendingDown, RefreshCw, Minus,
} from 'lucide-react';
import TickerSearch from '@/components/ui/TickerSearch';
import { useAnalysisWatchlist } from '@/hooks/useAnalysisWatchlist';
import { useWatchlistQuotes, type WatchlistQuote } from '@/hooks/useWatchlistQuotes';

/**
 * Independent watchlist panel for the analysis dashboard.
 *
 * - LocalStorage-backed (see useAnalysisWatchlist), works without auth.
 * - Add tickers via the embedded TickerSearch.
 * - Per-row live price + intraday change% from `/api/v1/market/quote/{symbol}`
 *   (refreshes every 60s, see useWatchlistQuotes).
 * - Header shows the aggregate change% across all items (unweighted mean).
 */

function fmtPrice(p: number | null | undefined, currency?: string): string {
  if (p == null || !Number.isFinite(p)) return '—';
  const sym = currency === 'AUD' ? 'A$' : currency === 'GBP' ? '£' : currency === 'CAD' ? 'C$' : '$';
  if (p >= 1000) return `${sym}${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (p >= 10) return `${sym}${p.toFixed(2)}`;
  if (p >= 1) return `${sym}${p.toFixed(3)}`;
  return `${sym}${p.toFixed(4)}`;
}

function fmtPct(p: number | null | undefined): string {
  if (p == null || !Number.isFinite(p)) return '—';
  const sign = p > 0 ? '+' : '';
  return `${sign}${p.toFixed(2)}%`;
}

function pctClass(p: number | null | undefined): string {
  if (p == null || !Number.isFinite(p)) return 'text-metallic-500';
  if (p > 0) return 'text-emerald-400';
  if (p < 0) return 'text-rose-400';
  return 'text-metallic-400';
}

function PctBadge({ value }: { value: number | null }) {
  const cls = pctClass(value);
  const Icon = value == null || !Number.isFinite(value)
    ? Minus
    : value > 0
    ? TrendingUp
    : value < 0
    ? TrendingDown
    : Minus;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cls}`}>
      <Icon className="w-3 h-3" />
      {fmtPct(value)}
    </span>
  );
}

export default function WatchlistPanel() {
  const { items, hydrated, add, remove, updateMeta } = useAnalysisWatchlist();
  const { quotes, aggregateChangePercent, loading, lastUpdated, refresh } =
    useWatchlistQuotes(items);

  // Backfill OpenFIGI ids onto items as quote responses arrive.
  useEffect(() => {
    for (const it of items) {
      const q = quotes.get(it.ticker.toUpperCase());
      if (!q) continue;
      const patch: Record<string, string> = {};
      if (q.figi && q.figi !== it.figi) patch.figi = q.figi;
      if (q.compositeFigi && q.compositeFigi !== it.compositeFigi) patch.compositeFigi = q.compositeFigi;
      if (q.shareClassFigi && q.shareClassFigi !== it.shareClassFigi) patch.shareClassFigi = q.shareClassFigi;
      if (Object.keys(patch).length > 0) updateMeta(it.ticker, it.exchange, patch);
    }
  }, [quotes, items, updateMeta]);

  // Group items sharing a share-class FIGI (same security across venues).
  // The first occurrence becomes the primary row; the rest surface as a
  // compact "also: TICKER.EX" badge so the user sees the duplicate without
  // taking up another row.
  const { primaryItems, crossListings } = useMemo(() => {
    const byKey = new Map<string, typeof items[number]>();
    const extras = new Map<string, typeof items>();
    const primary: typeof items = [];
    for (const it of items) {
      const k = it.shareClassFigi;
      if (!k) {
        primary.push(it);
        continue;
      }
      const existing = byKey.get(k);
      if (!existing) {
        byKey.set(k, it);
        primary.push(it);
      } else {
        const list = extras.get(k) || [];
        list.push(it);
        extras.set(k, list);
      }
    }
    return { primaryItems: primary, crossListings: extras };
  }, [items]);

  const aggCls = pctClass(aggregateChangePercent);

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-metallic-100">My Watchlist</h2>
          {hydrated && (
            <span className="text-xs text-metallic-500 bg-metallic-800 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wide text-metallic-500">
          Local &middot; independent of trading
        </span>
      </div>

      {/* Aggregate summary */}
      {hydrated && items.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-metallic-800 bg-metallic-950/50 px-4 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-metallic-500">
              Watchlist 1D change
            </div>
            <div className={`mt-0.5 text-2xl font-semibold ${aggCls}`}>
              {fmtPct(aggregateChangePercent)}
            </div>
            <div className="mt-0.5 text-[11px] text-metallic-500">
              Avg of {Array.from(quotes.values()).filter((q) => q.changePercent != null).length}/{items.length} tickers
            </div>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-metallic-400 hover:text-metallic-100 hover:bg-metallic-800 transition-colors disabled:opacity-50"
            title={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Refresh quotes'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : 'Refresh'}</span>
          </button>
        </div>
      )}

      {/* Add via search */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs text-metallic-400 mb-1.5">
          <Search className="w-3.5 h-3.5" />
          <span>Search any ticker or company to add</span>
        </div>
        <TickerSearch
          placeholder="Add to watchlist — e.g. BHP, Pilbara, FMG…"
          onSelect={(company) => {
            add({
              ticker: company.symbol,
              exchange: company.exchange,
              name: company.name,
              commodity: company.primary_commodity,
            });
          }}
        />
        <p className="text-[11px] text-metallic-500 mt-1.5">
          Picking a result adds it to your watchlist (stays on this page).
        </p>
      </div>

      {/* Items */}
      {!hydrated ? (
        <div className="text-sm text-metallic-500 py-6 text-center">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-metallic-500 py-8 text-center border border-dashed border-metallic-800 rounded-lg">
          Your watchlist is empty. Search above or tap the bookmark on any
          company profile.
        </div>
      ) : (
        <ul className="divide-y divide-metallic-800 max-h-[420px] overflow-y-auto">
          {primaryItems.map((it) => {
            const href = it.exchange
              ? `/company/${encodeURIComponent(it.ticker)}?exchange=${encodeURIComponent(it.exchange)}`
              : `/company/${encodeURIComponent(it.ticker)}`;
            const quote: WatchlistQuote | undefined = quotes.get(it.ticker.toUpperCase());
            const extras = it.shareClassFigi ? crossListings.get(it.shareClassFigi) : undefined;
            return (
              <li
                key={`${it.ticker}:${it.exchange || ''}`}
                className="flex items-center justify-between py-2.5 gap-3"
              >
                <Link href={href} className="flex-1 min-w-0 group">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-metallic-100 group-hover:text-primary-400">
                      {it.ticker}
                    </span>
                    {it.exchange && (
                      <span className="text-[10px] uppercase tracking-wide text-metallic-500 bg-metallic-800 px-1.5 py-0.5 rounded">
                        {it.exchange}
                      </span>
                    )}
                    {it.commodity && (
                      <span className="text-[10px] text-primary-400/80 bg-primary-500/10 px-1.5 py-0.5 rounded">
                        {it.commodity}
                      </span>
                    )}
                    {extras && extras.length > 0 && (
                      <span
                        className="text-[10px] text-amber-300/90 bg-amber-500/10 px-1.5 py-0.5 rounded"
                        title="Same security on another venue (matched by Bloomberg share-class FIGI)"
                      >
                        also: {extras.map((e) => `${e.ticker}${e.exchange ? '.' + e.exchange : ''}`).join(', ')}
                      </span>
                    )}
                  </div>
                  {it.name && (
                    <div className="text-xs text-metallic-500 truncate">
                      {it.name}
                    </div>
                  )}
                </Link>

                {/* Price + change */}
                <div className="flex flex-col items-end flex-shrink-0 min-w-[88px]">
                  <span className="text-sm font-mono text-metallic-200">
                    {fmtPrice(quote?.price, quote?.currency)}
                  </span>
                  <PctBadge value={quote?.changePercent ?? null} />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    remove(it.ticker, it.exchange);
                  }}
                  className="p-1.5 rounded-md text-metallic-500 hover:text-red-400 hover:bg-metallic-800 transition-colors flex-shrink-0"
                  aria-label={`Remove ${it.ticker}`}
                  title="Remove from watchlist"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {hydrated && items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-metallic-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear all watchlist items?')) {
                items.forEach((it) => remove(it.ticker, it.exchange));
              }
            }}
            className="flex items-center gap-1.5 text-xs text-metallic-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>
      )}
    </div>
  );
}
