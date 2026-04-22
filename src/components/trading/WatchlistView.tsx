'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import UpgradePrompt from '@/components/ui/UpgradePrompt';
import {
  RefreshCw, TrendingUp, TrendingDown, Plus, Trash2, AlertTriangle, Star,
} from 'lucide-react';
import {
  fetchWatchlists, fetchWatchlistQuotes, addWatchlistItem, removeWatchlistItem,
  createWatchlist, Watchlist, WatchlistQuotes, Timeframe,
} from '@/services/tradingService';
import TimeframeSelector from '@/components/trading/TimeframeSelector';
import { formatPrice } from '@/lib/utils';

const EXCHANGE_CCY: Record<string, string> = {
  ASX: 'A$', JSE: 'R', TSX: 'C$', TSXV: 'C$', LSE: '£',
  NYSE: '$', NASDAQ: '$', HKEX: 'HK$',
};
const ccy = (ex: string) => EXCHANGE_CCY[ex] || '$';
const EXCHANGES = ['ASX', 'JSE', 'TSX', 'TSXV', 'LSE', 'NYSE', 'NASDAQ', 'HKEX'];

function pct(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

export default function WatchlistView() {
  const { user, isLoading } = useAuth();
  const [lists, setLists] = useState<Watchlist[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [quotes, setQuotes] = useState<WatchlistQuotes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add-item form state
  const [newTicker, setNewTicker] = useState('');
  const [newExchange, setNewExchange] = useState('ASX');
  const [adding, setAdding] = useState(false);

  // New-watchlist form state
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const loadLists = useCallback(async () => {
    try {
      const ws = await fetchWatchlists();
      setLists(ws);
      if (ws.length && activeId === null) {
        setActiveId(ws[0].id);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load watchlists');
    }
  }, [activeId]);

  const loadQuotes = useCallback(async () => {
    if (activeId === null) return;
    setLoading(true);
    setError(null);
    try {
      const q = await fetchWatchlistQuotes(activeId, timeframe);
      setQuotes(q);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, [activeId, timeframe]);

  useEffect(() => { void loadLists(); }, [loadLists]);
  useEffect(() => { void loadQuotes(); }, [loadQuotes]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim() || activeId === null) return;
    setAdding(true);
    try {
      await addWatchlistItem(activeId, newTicker.trim().toUpperCase(), newExchange);
      setNewTicker('');
      await loadQuotes();
      await loadLists();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add ticker');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (itemId: number) => {
    if (activeId === null) return;
    try {
      await removeWatchlistItem(activeId, itemId);
      await loadQuotes();
      await loadLists();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to remove');
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const w = await createWatchlist(newListName.trim());
      setNewListName('');
      setShowNewList(false);
      await loadLists();
      setActiveId(w.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    }
  };

  if (isLoading) return null;
  if (!user) return <UpgradePrompt feature="Watchlist" />;

  const avg = quotes?.aggregate.avg_return_pct ?? null;
  const avgUp = (avg ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-metallic-950 text-metallic-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary-400" />
              <h1 className="text-2xl font-bold">Watchlist</h1>
            </div>
            <p className="text-sm text-metallic-400 mt-1">
              Track tickers with timeframe returns. Aggregate is equal-weighted.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TimeframeSelector value={timeframe} onChange={setTimeframe} disabled={loading} />
            <button
              onClick={loadQuotes}
              disabled={loading || activeId === null}
              className="p-2 rounded-lg bg-metallic-900/60 border border-metallic-700/50 hover:bg-metallic-800 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Watchlist tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {lists.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveId(w.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeId === w.id
                  ? 'bg-primary-500/15 border-primary-500/40 text-primary-300'
                  : 'bg-metallic-900/60 border-metallic-700/50 text-metallic-400 hover:text-metallic-200'
              }`}
            >
              {w.name} <span className="text-xs opacity-60 ml-1">({w.item_count})</span>
            </button>
          ))}
          {showNewList ? (
            <form onSubmit={handleCreateList} className="flex items-center gap-2">
              <input
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New watchlist name"
                className="px-3 py-2 rounded-lg bg-metallic-900/60 border border-metallic-700/50 text-sm focus:outline-none focus:border-primary-500/40"
              />
              <button type="submit" className="px-3 py-2 rounded-lg bg-primary-500/20 border border-primary-500/40 text-primary-300 text-sm">
                Create
              </button>
              <button type="button" onClick={() => setShowNewList(false)} className="px-2 py-2 text-metallic-500 text-sm">
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowNewList(true)}
              className="px-3 py-2 rounded-lg bg-metallic-900/60 border border-metallic-700/50 text-metallic-400 hover:text-metallic-200 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          )}
        </div>

        {/* Aggregate row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-metallic-500 mb-1">{timeframe} Avg Return</div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${avgUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {avgUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {pct(avg)}
            </div>
            <div className="text-xs text-metallic-500 mt-1">equal-weighted across {quotes?.items.length ?? 0} items</div>
          </div>
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-metallic-500 mb-1">Best Performer</div>
            <div className="text-lg font-semibold text-emerald-400">
              {quotes?.aggregate.best ? `${quotes.aggregate.best.ticker} ${pct(quotes.aggregate.best.return_pct)}` : '—'}
            </div>
          </div>
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-metallic-500 mb-1">Worst Performer</div>
            <div className="text-lg font-semibold text-red-400">
              {quotes?.aggregate.worst ? `${quotes.aggregate.worst.ticker} ${pct(quotes.aggregate.worst.return_pct)}` : '—'}
            </div>
          </div>
        </div>

        {/* Add ticker form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2 mb-4">
          <input
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder="Ticker (e.g. BHP, ANAX)"
            className="px-3 py-2 rounded-lg bg-metallic-900/60 border border-metallic-700/50 text-sm focus:outline-none focus:border-primary-500/40 flex-1 max-w-xs"
          />
          <select
            value={newExchange}
            onChange={(e) => setNewExchange(e.target.value)}
            className="px-3 py-2 rounded-lg bg-metallic-900/60 border border-metallic-700/50 text-sm"
          >
            {EXCHANGES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <button
            type="submit"
            disabled={adding || !newTicker.trim() || activeId === null}
            className="px-4 py-2 rounded-lg bg-primary-500/20 border border-primary-500/40 text-primary-300 text-sm font-medium disabled:opacity-50"
          >
            <Plus className="w-4 h-4 inline mr-1" />Add
          </button>
        </form>

        {/* Banner if data unavailable */}
        {quotes?.data_source === 'unavailable' && (quotes?.items.length ?? 0) > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-200">
              <div className="font-semibold">Historical bars unavailable</div>
              <div className="text-amber-200/80 mt-1">
                Your IB agent isn&apos;t returning data for these tickers. Confirm IB Gateway
                is logged in and you have market-data subscriptions for the relevant exchanges.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Items table */}
        <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl overflow-hidden">
          {loading && !quotes ? (
            <div className="p-10 text-center text-sm text-metallic-500">Loading…</div>
          ) : (quotes?.items.length ?? 0) === 0 ? (
            <div className="p-10 text-center text-sm text-metallic-500">
              No tickers yet. Add one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-metallic-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Ticker</th>
                    <th className="px-5 py-3">Current</th>
                    <th className="px-5 py-3">{timeframe} Start</th>
                    <th className="px-5 py-3 text-right">{timeframe} %</th>
                    <th className="px-5 py-3 text-right">Bars</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {quotes!.items.map((it) => {
                    const ret = it.period_return_pct ?? null;
                    const up = (ret ?? 0) >= 0;
                    return (
                      <tr key={it.id} className="border-t border-metallic-800/50 hover:bg-metallic-800/30">
                        <td className="px-5 py-3">
                          <span className="font-semibold text-metallic-100">{it.ticker}</span>
                          <span className="text-xs text-metallic-500 ml-2">{it.exchange}</span>
                        </td>
                        <td className="px-5 py-3 text-metallic-200 font-medium">
                          {it.current_price != null ? `${ccy(it.exchange)}${formatPrice(it.current_price)}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-metallic-400">
                          {it.period_start_price != null ? `${ccy(it.exchange)}${formatPrice(it.period_start_price)}` : '—'}
                        </td>
                        <td className={`px-5 py-3 text-right font-semibold ${ret === null ? 'text-metallic-500' : up ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pct(ret)}
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-metallic-500">{it.bar_count ?? 0}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleRemove(it.id)}
                            className="p-1.5 rounded text-metallic-500 hover:text-red-400 hover:bg-red-500/10"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
