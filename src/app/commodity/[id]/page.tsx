'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  ExternalLink,
  Building2,
  Newspaper,
  BarChart3,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_BASE = RAILWAY_API_URL;

const PERIODS = ['1W', '1M', '3M', '6M', '1Y', '2Y', '5Y'] as const;
type Period = typeof PERIODS[number];

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface History {
  commodity_id: string;
  name: string;
  symbol: string;
  unit: string;
  currency: string;
  period: string;
  candles: Candle[];
  history: { date: string; price: number }[];
  available: boolean;
  source: string;
}

interface PriceSnapshot {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  currency: string;
  category: string;
  timestamp: string;
}

interface NewsItem {
  id: number;
  ticker: string | null;
  exchange: string | null;
  company_name: string | null;
  source: string | null;
  title: string;
  summary: string | null;
  published_at: string | null;
  sentiment_label: string | null;
  sentiment_score: number | null;
  event_type: string | null;
  event_significance: string | null;
  stock_impact_prediction: string | null;
  url: string | null;
  commodities_mentioned: string[];
  is_macro?: boolean;
}

interface NewsResponse {
  commodity_id: string;
  name: string;
  symbol: string;
  count: number;
  aliases?: string[];
  summary: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    avg_sentiment: number | null;
  };
  items: NewsItem[];
}

interface CompaniesResponse {
  companies?: {
    total: number;
    producers: { ticker: string; name: string; exchange?: string }[];
    explorers: { ticker: string; name: string; exchange?: string }[];
    all: { ticker: string; name: string; exchange?: string; company_type?: string }[];
  };
}

function sentimentColor(label: string | null): string {
  switch ((label || '').toLowerCase()) {
    case 'positive':
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'negative':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'neutral':
      return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    default:
      return 'text-slate-500 bg-slate-800 border-slate-700';
  }
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CommodityProfilePage() {
  const params = useParams<{ id: string }>();
  const commodityId = (params?.id || '').toString().toLowerCase();

  const [snapshot, setSnapshot] = useState<PriceSnapshot | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [companies, setCompanies] = useState<CompaniesResponse['companies'] | null>(null);
  const [period, setPeriod] = useState<Period>('1M');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!commodityId) return;
    setLoading(true);
    setError(null);
    try {
      const [snapRes, histRes, newsRes, compRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/market/commodities`),
        fetch(`${API_BASE}/api/v1/market/commodities/${commodityId}/history?period=${period}`),
        fetch(`${API_BASE}/api/v1/market/commodities/${commodityId}/news?days=30&limit=40`),
        fetch(`${API_BASE}/api/v1/market/commodities/${commodityId}/companies`),
      ]);

      if (snapRes.ok) {
        const all = await snapRes.json();
        const me = (all.commodities || []).find((c: PriceSnapshot) => c.id === commodityId);
        if (me) setSnapshot(me);
      }
      if (histRes.ok) setHistory(await histRes.json());
      if (newsRes.ok) setNews(await newsRes.json());
      if (compRes.ok) {
        const j: CompaniesResponse = await compRes.json();
        setCompanies(j.companies || null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load commodity');
    } finally {
      setLoading(false);
    }
  }, [commodityId, period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isPositive = (snapshot?.changePercent ?? 0) >= 0;
  const chartData = (history?.candles || []).map((c) => ({
    date: c.timestamp,
    price: c.close,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href="/analysis/prices"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-white truncate">
                  {snapshot?.name || history?.name || commodityId}
                </h1>
                <div className="text-sm text-slate-400 flex items-center gap-2 flex-wrap">
                  <span className="font-mono">{snapshot?.symbol || history?.symbol}</span>
                  {snapshot?.category && (
                    <span className="text-slate-600">·</span>
                  )}
                  {snapshot?.category && (
                    <span className="capitalize">{snapshot.category.replace('_', ' ')}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analysis/prices/charts"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Compare on chart
              </Link>
              <button
                onClick={fetchAll}
                disabled={loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Hero: price + chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Price card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Spot price</div>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-white font-mono">
                {snapshot ? formatPrice(snapshot.price) : '—'}
              </div>
              {snapshot && (
                <div className="text-sm text-slate-500">/{snapshot.unit}</div>
              )}
            </div>
            {snapshot && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-medium ${
                  isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}
                {snapshot.change.toLocaleString(undefined, { maximumFractionDigits: 2 })} (
                {isPositive ? '+' : ''}
                {snapshot.changePercent.toFixed(2)}%)
              </div>
            )}
            {snapshot?.timestamp && (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Updated {new Date(snapshot.timestamp).toLocaleString()}
              </div>
            )}

            {/* News sentiment summary */}
            {news?.summary && news.summary.total > 0 && (
              <div className="pt-3 mt-3 border-t border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                  News sentiment (30d)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                    <div className="text-lg font-bold text-green-400">{news.summary.positive}</div>
                    <div className="text-[10px] text-green-400/70 uppercase">Positive</div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded p-2">
                    <div className="text-lg font-bold text-slate-300">{news.summary.neutral}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Neutral</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                    <div className="text-lg font-bold text-red-400">{news.summary.negative}</div>
                    <div className="text-[10px] text-red-400/70 uppercase">Negative</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Price history
              </div>
              <div className="flex gap-1 flex-wrap">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      period === p
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              {loading && !chartData.length ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Loading chart…
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-4">
                  No historical price data available for this commodity yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cprice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      minTickGap={32}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(value: number | undefined) => [`$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, history?.name || 'Price']}
                      labelFormatter={(v) => new Date(v as string).toLocaleString()}
                    />
                    <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} fill="url(#cprice)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {history && history.source && history.source !== 'unavailable' && (
              <div className="text-[10px] text-slate-600 mt-2 text-right">
                Source: {history.source}
              </div>
            )}
          </div>
        </div>

        {/* News */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-amber-400" />
              Latest news & announcements
              {news && (
                <span className="text-sm text-slate-500 font-normal">({news.count})</span>
              )}
            </h2>
            {news && news.aliases && (
              <div className="text-xs text-slate-500 hidden md:block">
                Matched on: {news.aliases?.slice(0, 4).join(', ') || '—'}
              </div>
            )}
          </div>
          {loading && !news ? (
            <div className="text-slate-500 text-sm py-8 text-center">Loading news…</div>
          ) : !news || news.items.length === 0 ? (
            <div className="text-slate-500 text-sm py-8 text-center">
              No recent news tagged with this commodity in the last 30 days.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {news.items.map((it) => (
                <article key={it.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium leading-snug">
                        {it.url ? (
                          <a
                            href={it.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-amber-400 inline-flex items-start gap-1"
                          >
                            <span>{it.title}</span>
                            <ExternalLink className="w-3 h-3 mt-1 shrink-0 opacity-60" />
                          </a>
                        ) : (
                          it.title
                        )}
                      </h3>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        {it.is_macro && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 uppercase tracking-wide text-[10px] font-semibold">
                            Macro driver
                          </span>
                        )}
                        {it.ticker && (
                          <Link
                            href={`/company/${it.ticker}${it.exchange ? `?exchange=${encodeURIComponent(it.exchange)}` : ''}`}
                            className="text-accent-gold hover:underline flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3" />
                            {it.ticker}
                            {it.company_name ? ` — ${it.company_name}` : ''}
                          </Link>
                        )}
                        {it.source && <span>{it.source}</span>}
                        {it.published_at && (
                          <span>{new Date(it.published_at).toLocaleDateString()}</span>
                        )}
                        {it.event_type && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                            {it.event_type.replace(/_/g, ' ')}
                          </span>
                        )}
                        {it.event_significance === 'high' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase text-[10px] font-semibold">
                            High impact
                          </span>
                        )}
                        {it.stock_impact_prediction && it.stock_impact_prediction !== 'neutral' && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              it.stock_impact_prediction === 'bullish'
                                ? 'bg-green-500/15 border border-green-500/30 text-green-300'
                                : 'bg-red-500/15 border border-red-500/30 text-red-300'
                            }`}
                          >
                            {it.stock_impact_prediction === 'bullish' ? '↑ ' : '↓ '}
                            {it.stock_impact_prediction}
                          </span>
                        )}
                      </div>
                    </div>
                    {it.sentiment_label && (
                      <span
                        className={`shrink-0 px-2 py-0.5 text-xs rounded border ${sentimentColor(it.sentiment_label)}`}
                      >
                        {it.sentiment_label}
                      </span>
                    )}
                  </div>
                  {it.summary && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{it.summary}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Companies exposed to this commodity */}
        {companies && companies.total > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Companies exposed to {snapshot?.name || history?.name}
              <span className="text-sm text-slate-500 font-normal">({companies.total})</span>
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {companies.all.slice(0, 32).map((c) => (
                <Link
                  key={`${c.ticker}-${c.exchange || ''}`}
                  href={`/company/${c.ticker}${c.exchange ? `?exchange=${encodeURIComponent(c.exchange)}` : ''}`}
                  className="px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 hover:text-amber-400 flex items-center justify-between gap-2"
                >
                  <span className="font-mono">{c.ticker}</span>
                  <span className="text-xs text-slate-500 truncate">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
