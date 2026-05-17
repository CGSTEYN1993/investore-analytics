'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, X, Search, Trash2 } from 'lucide-react';
import TickerSearch from '@/components/ui/TickerSearch';
import { useAnalysisWatchlist } from '@/hooks/useAnalysisWatchlist';

/**
 * Independent watchlist panel for the analysis dashboard.
 *
 * - LocalStorage-backed (see useAnalysisWatchlist), so it is completely
 *   decoupled from the IBKR / trading watchlist and works without auth.
 * - Add tickers via the embedded TickerSearch (autocomplete against
 *   /api/v1/spatial/companies).
 * - Each row links to /company/{ticker}.
 */
export default function WatchlistPanel() {
  const { items, hydrated, add, remove } = useAnalysisWatchlist();

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
          {items.map((it) => {
            const href = it.exchange
              ? `/company/${encodeURIComponent(it.ticker)}?exchange=${encodeURIComponent(it.exchange)}`
              : `/company/${encodeURIComponent(it.ticker)}`;
            return (
              <li
                key={`${it.ticker}:${it.exchange || ''}`}
                className="flex items-center justify-between py-2.5"
              >
                <Link
                  href={href}
                  className="flex-1 min-w-0 group"
                >
                  <div className="flex items-center gap-2">
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
                  </div>
                  {it.name && (
                    <div className="text-xs text-metallic-500 truncate">
                      {it.name}
                    </div>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    remove(it.ticker, it.exchange);
                  }}
                  className="ml-2 p-1.5 rounded-md text-metallic-500 hover:text-red-400 hover:bg-metallic-800 transition-colors"
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
