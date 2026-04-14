'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, TrendingUp, TrendingDown, Bell, RefreshCw,
  Clock, ChevronRight, Activity, AlertTriangle, Eye
} from 'lucide-react';
import {
  fetchExchangeStatus,
  fetchCrossExchangeSignals,
  fetchPreOpenReport,
  triggerCrossExchangeAnalysis,
  ExchangeStatus,
  CrossExchangeSignal,
  PreOpenReport,
} from '@/services/crossExchangeSignals';

// ── Exchange Status Card ──
function ExchangeStatusCard({ exchange }: { exchange: ExchangeStatus }) {
  const isOpen = exchange.is_open;
  return (
    <div className={`rounded-lg border p-3 ${
      isOpen ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-700 bg-gray-800/40'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm">{exchange.code}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-600/30 text-gray-400'
        }`}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>
      <div className="text-xs text-gray-400">{exchange.name}</div>
      <div className="text-xs text-gray-500 mt-1">
        {exchange.local_time}
        {exchange.minutes_until_open && !isOpen && (
          <span className="text-amber-400 ml-1">
            · opens in {Math.round(exchange.minutes_until_open)}m
          </span>
        )}
      </div>
    </div>
  );
}

// ── Signal Card ──
function SignalCard({ signal }: { signal: CrossExchangeSignal }) {
  const isBullish = signal.signal_type === 'bullish';
  const strengthColors: Record<string, string> = {
    strong: 'bg-red-500/20 text-red-400',
    moderate: 'bg-amber-500/20 text-amber-400',
    weak: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className={`rounded-lg border p-4 ${
      isBullish ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isBullish ? (
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          <span className="font-semibold text-sm">{signal.headline}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          strengthColors[signal.signal_strength] || strengthColors.weak
        }`}>
          {signal.signal_strength.toUpperCase()}
        </span>
      </div>

      <p className="text-sm text-gray-300 mb-3">{signal.reasoning}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-gray-800/60 rounded px-2 py-1">
          <span className="text-gray-500">Source</span>
          <div className="font-medium">{signal.source_exchange}</div>
        </div>
        <div className="bg-gray-800/60 rounded px-2 py-1">
          <span className="text-gray-500">Target</span>
          <div className="font-medium">{signal.target_exchange}</div>
        </div>
        <div className="bg-gray-800/60 rounded px-2 py-1">
          <span className="text-gray-500">Predicted</span>
          <div className={`font-medium ${
            signal.predicted_direction === 'up' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {signal.predicted_magnitude_pct > 0 ? '+' : ''}{signal.predicted_magnitude_pct.toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800/60 rounded px-2 py-1">
          <span className="text-gray-500">Confidence</span>
          <div className="font-medium">{(signal.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      {signal.affected_tickers && signal.affected_tickers.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          <span className="text-gray-400">Watch: </span>
          {signal.affected_tickers.slice(0, 8).map((t, i) => (
            <span key={t.symbol}>
              <span className="text-teal-400">{t.symbol}</span>
              {i < Math.min(signal.affected_tickers.length, 8) - 1 ? ', ' : ''}
            </span>
          ))}
          {signal.affected_tickers.length > 8 && (
            <span className="text-gray-600"> +{signal.affected_tickers.length - 8} more</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pre-Open Report Panel ──
function PreOpenPanel({ report }: { report: PreOpenReport }) {
  const outlookColors: Record<string, string> = {
    bullish: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    slightly_bullish: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    neutral: 'border-gray-500 bg-gray-500/10 text-gray-400',
    slightly_bearish: 'border-orange-500 bg-orange-500/10 text-orange-400',
    bearish: 'border-red-500 bg-red-500/10 text-red-400',
  };
  const color = outlookColors[report.outlook] || outlookColors.neutral;

  return (
    <div className={`rounded-lg border-2 p-5 ${color}`}>
      <div className="text-center mb-4">
        <div className="text-3xl mb-1">{report.outlook_emoji}</div>
        <div className="text-xl font-bold uppercase tracking-wide">
          {report.outlook.replace(/_/g, ' ')}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {report.exchange_name}
          {report.minutes_until_open && ` · Opens in ${Math.round(report.minutes_until_open)} min`}
        </div>
      </div>
      <div className="flex justify-center gap-6 text-sm mb-4">
        <div className="text-center">
          <div className="text-emerald-400 font-bold text-lg">{report.bullish_signals}</div>
          <div className="text-gray-500 text-xs">Bullish</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-bold text-lg">{report.bearish_signals}</div>
          <div className="text-gray-500 text-xs">Bearish</div>
        </div>
        <div className="text-center">
          <div className="text-gray-300 font-bold text-lg">{report.total_signals}</div>
          <div className="text-gray-500 text-xs">Total</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function CrossExchangeSignalsPage() {
  const [exchanges, setExchanges] = useState<ExchangeStatus[]>([]);
  const [signals, setSignals] = useState<CrossExchangeSignal[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [preOpenReport, setPreOpenReport] = useState<PreOpenReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusData, signalsData] = await Promise.all([
        fetchExchangeStatus(),
        fetchCrossExchangeSignals({ limit: 50 }),
      ]);
      setExchanges(statusData.exchanges);
      setSignals(signalsData.signals);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const loadPreOpen = async (exchangeCode: string) => {
    setSelectedExchange(exchangeCode);
    try {
      const report = await fetchPreOpenReport(exchangeCode);
      setPreOpenReport(report);
    } catch (err) {
      console.error('Error loading pre-open report:', err);
    }
  };

  const runAnalysis = async () => {
    setAnalysisRunning(true);
    try {
      await triggerCrossExchangeAnalysis();
      await loadData();
    } catch (err) {
      console.error('Error running analysis:', err);
    } finally {
      setAnalysisRunning(false);
    }
  };

  const filteredSignals = filterType === 'all'
    ? signals
    : signals.filter(s => s.signal_type === filterType);

  const openCount = exchanges.filter(e => e.is_open).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1800px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Globe className="w-7 h-7 text-teal-400" />
              Cross-Exchange Intelligence
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Analyse closing trends on one exchange to predict impacts on another before it opens
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analysisRunning}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${analysisRunning ? 'animate-spin' : ''}`} />
            {analysisRunning ? 'Analysing...' : 'Run Analysis'}
          </button>
        </div>

        {/* Exchange Status Row */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Exchange Status · {openCount}/{exchanges.length} Open
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {exchanges.map(ex => (
              <button
                key={ex.code}
                onClick={() => loadPreOpen(ex.code)}
                className={`text-left transition rounded-lg ${
                  selectedExchange === ex.code ? 'ring-2 ring-teal-500' : ''
                }`}
              >
                <ExchangeStatusCard exchange={ex} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signals List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Cross-Exchange Signals
              </h2>
              <div className="flex gap-1">
                {['all', 'bullish', 'bearish'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      filterType === t
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-800/40 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredSignals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No cross-exchange signals yet.</p>
                <p className="text-sm mt-1">Click &quot;Run Analysis&quot; to generate signals from recent market data.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSignals.map(sig => (
                  <SignalCard key={sig.id} signal={sig} />
                ))}
              </div>
            )}
          </div>

          {/* Pre-Open Report Sidebar */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-teal-400" />
              Pre-Open Report
            </h2>
            {preOpenReport ? (
              <div className="space-y-4">
                <PreOpenPanel report={preOpenReport} />
                {preOpenReport.signals.length > 0 && (
                  <div className="space-y-2">
                    {preOpenReport.signals.slice(0, 5).map(sig => (
                      <div
                        key={sig.id}
                        className={`text-xs rounded border p-2 ${
                          sig.signal_type === 'bullish'
                            ? 'border-emerald-600/20 bg-emerald-900/10'
                            : 'border-red-600/20 bg-red-900/10'
                        }`}
                      >
                        <div className="font-medium truncate">{sig.headline}</div>
                        <div className="text-gray-500 mt-0.5">
                          {sig.source_exchange} → {sig.commodity_group} · {(sig.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-gray-800 rounded-lg">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an exchange above to view<br />its pre-open report</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
