'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, PieChart } from 'lucide-react';
import {
  fetchPortfolioOverview, PortfolioOverview, Timeframe,
} from '@/services/tradingService';
import TimeframeSelector from '@/components/trading/TimeframeSelector';
import { formatPrice } from '@/lib/utils';

const EXCHANGE_CCY: Record<string, string> = {
  ASX: 'A$', JSE: 'R', TSX: 'C$', TSXV: 'C$', LSE: '£',
  NYSE: '$', NASDAQ: '$', HKEX: 'HK$',
};
const ccy = (ex: string) => EXCHANGE_CCY[ex] || '$';

function pct(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function money(v: number | null | undefined, decimals = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return v.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function PortfolioPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [data, setData] = useState<PortfolioOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPortfolioOverview(timeframe);
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => { void load(); }, [load]);

  const aggReturn = data?.aggregate.weighted_period_return_pct ?? null;
  const aggUp = (aggReturn ?? 0) >= 0;
  const aggPnl = data?.aggregate.period_pnl ?? 0;
  const totalMv = data?.aggregate.total_market_value ?? 0;

  return (
    <div className="min-h-screen bg-metallic-950 text-metallic-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <PieChart className="w-6 h-6 text-primary-400" />
              <h1 className="text-2xl font-bold">Portfolio</h1>
            </div>
            <p className="text-sm text-metallic-400 mt-1">
              Live broker positions with timeframe returns from IB historical bars.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TimeframeSelector value={timeframe} onChange={setTimeframe} disabled={loading} />
            <button
              onClick={load}
              disabled={loading}
              className="p-2 rounded-lg bg-metallic-900/60 border border-metallic-700/50 hover:bg-metallic-800 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Aggregate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-metallic-500 mb-1">Total Market Value</div>
            <div className="text-2xl font-bold">{money(totalMv)}</div>
            <div className="text-xs text-metallic-500 mt-1">{data?.positions.length ?? 0} positions</div>
          </div>
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-metallic-500 mb-1">{timeframe} Return</div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${aggUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {aggUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {pct(aggReturn)}
            </div>
            <div className="text-xs text-metallic-500 mt-1">value-weighted</div>
          </div>
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-metallic-500 mb-1">{timeframe} P&L</div>
            <div className={`text-2xl font-bold ${aggPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {aggPnl >= 0 ? '+' : ''}{money(aggPnl)}
            </div>
            <div className="text-xs text-metallic-500 mt-1">across all positions</div>
          </div>
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-metallic-500 mb-1">Best / Worst</div>
            <div className="text-sm">
              <div className="text-emerald-400">
                ▲ {data?.aggregate.best?.ticker ?? '—'} {data?.aggregate.best ? pct(data.aggregate.best.return_pct) : ''}
              </div>
              <div className="text-red-400 mt-0.5">
                ▼ {data?.aggregate.worst?.ticker ?? '—'} {data?.aggregate.worst ? pct(data.aggregate.worst.return_pct) : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Banner if data unavailable */}
        {data?.data_source === 'unavailable' && (data?.positions.length ?? 0) > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-200">
              <div className="font-semibold">Historical bars unavailable</div>
              <div className="text-amber-200/80 mt-1">
                Your IB agent isn&apos;t returning historical data. Make sure the local agent
                is running, IB Gateway is logged in, and you have market-data permissions for
                your tickers.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Positions table */}
        <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-metallic-700/30 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-metallic-200">Positions</h2>
            <Link href="/trading/positions" className="text-xs text-primary-400 hover:text-primary-300">
              Manage positions →
            </Link>
          </div>

          {loading && !data ? (
            <div className="p-10 text-center text-sm text-metallic-500">Loading…</div>
          ) : (data?.positions.length ?? 0) === 0 ? (
            <div className="p-10 text-center text-sm text-metallic-500">
              No open positions. Open one from the trading dashboard.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-metallic-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Ticker</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3">Entry</th>
                    <th className="px-5 py-3">Current</th>
                    <th className="px-5 py-3">{timeframe} Start</th>
                    <th className="px-5 py-3 text-right">{timeframe} %</th>
                    <th className="px-5 py-3 text-right">{timeframe} P&L</th>
                    <th className="px-5 py-3 text-right">Market Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.positions.map((p) => {
                    const ret = p.period_return_pct;
                    const up = (ret ?? 0) >= 0;
                    return (
                      <tr key={p.id} className="border-t border-metallic-800/50 hover:bg-metallic-800/30">
                        <td className="px-5 py-3">
                          <span className="font-semibold text-metallic-100">{p.ticker}</span>
                          <span className="text-xs text-metallic-500 ml-2">{p.exchange}</span>
                        </td>
                        <td className="px-5 py-3 text-metallic-300">{p.quantity}</td>
                        <td className="px-5 py-3 text-metallic-300">{ccy(p.exchange)}{formatPrice(p.entry_price)}</td>
                        <td className="px-5 py-3 text-metallic-200 font-medium">
                          {p.current_price !== null ? `${ccy(p.exchange)}${formatPrice(p.current_price)}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-metallic-400">
                          {p.period_start_price !== null ? `${ccy(p.exchange)}${formatPrice(p.period_start_price)}` : '—'}
                        </td>
                        <td className={`px-5 py-3 text-right font-semibold ${ret === null ? 'text-metallic-500' : up ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pct(ret)}
                        </td>
                        <td className={`px-5 py-3 text-right font-medium ${(p.period_pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {p.period_pnl === null ? '—' : `${(p.period_pnl ?? 0) >= 0 ? '+' : ''}${ccy(p.exchange)}${money(p.period_pnl)}`}
                        </td>
                        <td className="px-5 py-3 text-right text-metallic-200">{ccy(p.exchange)}{money(p.market_value)}</td>
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
