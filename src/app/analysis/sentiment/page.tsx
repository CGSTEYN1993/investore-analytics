'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Eye, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus, Activity,
  BarChart3, Zap, Globe
} from 'lucide-react';
import {
  getActiveSignals,
  generateSignals,
  getTrendingBySentiment,
  getCommoditySentiment,
  getCompanySentiment,
  getSignalColor,
  getSentimentEmoji,
  InvestmentSignal,
  TrendingStock,
  CommoditySentiment,
  CompanySentiment,
} from '@/services/sentimentSignals';

const COMMODITIES = ['Gold', 'Copper', 'Lithium', 'Zinc', 'Nickel', 'Iron Ore', 'Uranium', 'Silver', 'Cobalt'];

export default function SentimentDashboardPage() {
  const [signals, setSignals] = useState<InvestmentSignal[]>([]);
  const [trending, setTrending] = useState<TrendingStock[]>([]);
  const [commoditySentiments, setCommoditySentiments] = useState<Record<string, CommoditySentiment>>({});
  const [selectedCompany, setSelectedCompany] = useState<CompanySentiment | null>(null);
  const [searchTicker, setSearchTicker] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sigData, trendData] = await Promise.all([
        getActiveSignals(undefined, undefined, undefined, 50),
        getTrendingBySentiment(20),
      ]);
      setSignals(sigData.signals);
      setTrending(trendData.trending || []);

      // Fetch commodity sentiments
      const commodityResults: Record<string, CommoditySentiment> = {};
      const commodityPromises = COMMODITIES.map(async (c) => {
        try {
          const data = await getCommoditySentiment(c);
          commodityResults[c] = data;
        } catch { /* ignore */ }
      });
      await Promise.all(commodityPromises);
      setCommoditySentiments(commodityResults);
    } catch (err) {
      console.error('Failed to load sentiment data:', err);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await generateSignals(30, 2);
      await fetchAll();
    } catch { /* ignore */ }
    setRefreshing(false);
  };

  const handleSearchCompany = async () => {
    if (!searchTicker.trim()) return;
    try {
      const data = await getCompanySentiment(searchTicker.trim().toUpperCase());
      setSelectedCompany(data);
    } catch {
      setSelectedCompany(null);
    }
  };

  const investSignals = signals.filter(s => s.signal_type === 'invest');
  const divestSignals = signals.filter(s => s.signal_type === 'divest');
  const watchSignals = signals.filter(s => s.signal_type === 'watch');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-amber-400 animate-pulse mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading sentiment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity className="w-6 h-6 text-amber-400" />
                Market Sentiment & Signals
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                AI-driven investment signals based on news sentiment analysis across mining & exploration stocks
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Signals
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 mt-6 space-y-6">
        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Buy Signals</span>
            </div>
            <p className="text-3xl font-bold text-white">{investSignals.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {investSignals.filter(s => s.signal_strength === 'strong').length} strong, {investSignals.filter(s => s.signal_strength === 'moderate').length} moderate
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm font-medium">Sell Signals</span>
            </div>
            <p className="text-3xl font-bold text-white">{divestSignals.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {divestSignals.filter(s => s.signal_strength === 'strong').length} strong, {divestSignals.filter(s => s.signal_strength === 'moderate').length} moderate
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">Watchlist</span>
            </div>
            <p className="text-3xl font-bold text-white">{watchSignals.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              Monitoring for breakout
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Trending</span>
            </div>
            <p className="text-3xl font-bold text-white">{trending.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              Companies with active news
            </p>
          </div>
        </div>

        {/* ── Buy / Sell Signals Side-by-Side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy Signals */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Investment Opportunities</h3>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-96 overflow-y-auto">
              {investSignals.length === 0 ? (
                <p className="p-6 text-center text-slate-500 text-sm">No buy signals currently active</p>
              ) : (
                investSignals.map(sig => (
                  <SignalRow key={sig.id} signal={sig} />
                ))
              )}
            </div>
          </div>

          {/* Sell Signals */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Divestment Alerts</h3>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-96 overflow-y-auto">
              {divestSignals.length === 0 ? (
                <p className="p-6 text-center text-slate-500 text-sm">No sell signals currently active</p>
              ) : (
                divestSignals.map(sig => (
                  <SignalRow key={sig.id} signal={sig} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Commodity Sentiment Grid ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Commodity Sector Sentiment</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-800">
            {COMMODITIES.map(commodity => {
              const data = commoditySentiments[commodity];
              if (!data) {
                return (
                  <div key={commodity} className="bg-slate-900 p-4">
                    <p className="text-sm font-medium text-slate-400">{commodity}</p>
                    <p className="text-xs text-slate-600 mt-1">No data</p>
                  </div>
                );
              }
              const bias = data.sector_bias || 'neutral';
              const biasColor = bias === 'bullish' ? 'text-emerald-400' :
                               bias === 'bearish' ? 'text-red-400' : 'text-slate-400';
              return (
                <div key={commodity} className="bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{commodity}</p>
                    <span className={`text-xs font-semibold uppercase ${biasColor}`}>
                      {bias}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>Avg 7d: {data.avg_sentiment_7d?.toFixed(2) || 'N/A'}</span>
                    <span>{data.total_news_hits || 0} articles</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-emerald-400">{data.positive_count || 0} ↑</span>
                    <span className="text-red-400">{data.negative_count || 0} ↓</span>
                    <span className="text-slate-500">{data.neutral_count || 0} —</span>
                  </div>
                  {data.top_movers && data.top_movers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {data.top_movers.slice(0, 3).map((m: any) => (
                        <a
                          key={m.ticker}
                          href={`/company/${m.ticker}`}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 hover:bg-slate-700"
                        >
                          {m.ticker}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Company Sentiment Lookup ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Company Sentiment Lookup</h3>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchCompany()}
                placeholder="Enter ticker (e.g. NST, BHP, PLS)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSearchCompany}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm"
              >
                Analyze
              </button>
            </div>

            {selectedCompany && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <a
                    href={`/company/${selectedCompany.ticker}`}
                    className="text-lg font-bold text-amber-400 hover:text-amber-300 font-mono"
                  >
                    {selectedCompany.ticker}
                  </a>
                  {selectedCompany.investment_signal && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      selectedCompany.investment_signal === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedCompany.investment_signal === 'BEARISH'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {selectedCompany.investment_signal}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <MetricBox
                    label="7-Day Avg"
                    value={selectedCompany.avg_sentiment_7d?.toFixed(3) || 'N/A'}
                    color={Number(selectedCompany.avg_sentiment_7d) > 0 ? 'green' : Number(selectedCompany.avg_sentiment_7d) < 0 ? 'red' : 'neutral'}
                  />
                  <MetricBox
                    label="30-Day Avg"
                    value={selectedCompany.avg_sentiment_30d?.toFixed(3) || 'N/A'}
                    color={Number(selectedCompany.avg_sentiment_30d) > 0 ? 'green' : Number(selectedCompany.avg_sentiment_30d) < 0 ? 'red' : 'neutral'}
                  />
                  <MetricBox
                    label="Positive"
                    value={String(selectedCompany.positive_count || 0)}
                    color="green"
                  />
                  <MetricBox
                    label="Negative"
                    value={String(selectedCompany.negative_count || 0)}
                    color="red"
                  />
                </div>

                {selectedCompany.trend && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500">Trend:</span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${
                      selectedCompany.trend === 'improving' ? 'text-emerald-400' :
                      selectedCompany.trend === 'deteriorating' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {selectedCompany.trend === 'improving' ? <ArrowUpRight className="w-3 h-3" /> :
                       selectedCompany.trend === 'deteriorating' ? <ArrowDownRight className="w-3 h-3" /> :
                       <Minus className="w-3 h-3" />}
                      {selectedCompany.trend}
                    </span>
                  </div>
                )}

                {selectedCompany.recent_headlines && selectedCompany.recent_headlines.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Recent Headlines</p>
                    <div className="space-y-1.5">
                      {selectedCompany.recent_headlines.slice(0, 5).map((h: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span>{getSentimentEmoji(h.sentiment_label)}</span>
                          <span className="text-slate-300 flex-1">{h.headline}</span>
                          <span className="text-slate-600 shrink-0">{h.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Trending Stocks ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Trending by News Volume</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-800">
                  <th className="text-left px-4 py-2">Ticker</th>
                  <th className="text-left px-4 py-2">Company</th>
                  <th className="text-right px-4 py-2">7d News</th>
                  <th className="text-right px-4 py-2">Avg Sentiment</th>
                  <th className="text-center px-4 py-2">Bias</th>
                  <th className="text-right px-4 py-2">↑ / ↓</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {trending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500">No trending data</td>
                  </tr>
                ) : (
                  trending.map(stock => (
                    <tr key={stock.ticker} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2">
                        <a href={`/company/${stock.ticker}`} className="font-mono text-amber-400 hover:text-amber-300 font-bold">
                          {stock.ticker}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-slate-300">{stock.company_name || '—'}</td>
                      <td className="px-4 py-2 text-right text-white font-medium">{stock.news_count_7d}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={
                          (stock.avg_sentiment ?? 0) > 0 ? 'text-emerald-400' :
                          (stock.avg_sentiment ?? 0) < 0 ? 'text-red-400' : 'text-slate-400'
                        }>
                          {stock.avg_sentiment?.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          stock.sentiment_bias === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                          stock.sentiment_bias === 'bearish' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {stock.sentiment_bias || 'neutral'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className="text-emerald-400">{stock.positive_count}</span>
                        <span className="text-slate-600 mx-1">/</span>
                        <span className="text-red-400">{stock.negative_count}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function SignalRow({ signal }: { signal: InvestmentSignal }) {
  const icon = signal.signal_type === 'invest'
    ? <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
    : signal.signal_type === 'divest'
    ? <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
    : <Eye className="w-4 h-4 text-amber-400 shrink-0" />;

  return (
    <div className="p-3 hover:bg-slate-800/30 transition-colors">
      <div className="flex items-start gap-2">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={`/company/${signal.ticker}`}
              className="font-mono font-bold text-amber-400 hover:text-amber-300 text-sm"
            >
              {signal.ticker}
            </a>
            <span className="text-xs text-slate-500">{signal.exchange}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
              signal.signal_strength === 'strong'
                ? 'bg-white/10 text-white'
                : signal.signal_strength === 'moderate'
                ? 'bg-slate-700 text-slate-300'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {signal.signal_strength}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{signal.reasoning}</p>
          {signal.triggers && signal.triggers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {signal.triggers.slice(0, 3).map((t, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>Score: {signal.sentiment_score?.toFixed(2)}</span>
            {signal.sentiment_shift !== null && (
              <span className={signal.sentiment_shift > 0 ? 'text-emerald-400' : 'text-red-400'}>
                Δ{signal.sentiment_shift > 0 ? '+' : ''}{signal.sentiment_shift.toFixed(2)}
              </span>
            )}
            <span>{signal.news_count_7d} news/7d</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, color }: { label: string; value: string; color: 'green' | 'red' | 'neutral' }) {
  const colorClass =
    color === 'green' ? 'text-emerald-400' :
    color === 'red' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="bg-slate-800 rounded-lg p-3 text-center">
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
