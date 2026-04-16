'use client';

import React, { useEffect, useState } from 'react';
import {
  X, TrendingUp, TrendingDown, Activity, Target, Shield,
  Clock, BarChart3, Zap, ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid, Bar
} from 'recharts';
import {
  fetchPositionDetail,
  PositionDetail,
  ChartCandle,
} from '@/services/tradingService';

interface TradeDetailModalProps {
  positionId: number;
  onClose: () => void;
}

function formatCurrency(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '—';
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function StatRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-metallic-500">{label}</span>
      <span className={`text-xs font-medium ${valueClass || 'text-metallic-200'}`}>{value}</span>
    </div>
  );
}

function SentimentBar({ value, label }: { value: number | null; label: string }) {
  if (value == null) return null;
  const pct = Math.min(Math.max((value + 1) / 2 * 100, 0), 100);
  const color = value > 0.1 ? 'bg-emerald-500' : value < -0.1 ? 'bg-red-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-metallic-500 w-8">{label}</span>
      <div className="flex-1 h-1.5 bg-metallic-800 rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-metallic-400 w-10 text-right">{value.toFixed(3)}</span>
    </div>
  );
}

// Custom tooltip for the chart
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartCandle;
  if (!d) return null;
  return (
    <div className="bg-metallic-900 border border-metallic-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-metallic-400 mb-1.5">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-metallic-500">Open</span>
        <span className="text-metallic-200 text-right">{d.open?.toFixed(2)}</span>
        <span className="text-metallic-500">High</span>
        <span className="text-metallic-200 text-right">{d.high?.toFixed(2)}</span>
        <span className="text-metallic-500">Low</span>
        <span className="text-metallic-200 text-right">{d.low?.toFixed(2)}</span>
        <span className="text-metallic-500">Close</span>
        <span className="text-metallic-200 text-right font-semibold">{d.close?.toFixed(2)}</span>
        <span className="text-metallic-500">Volume</span>
        <span className="text-metallic-200 text-right">{(d.volume || 0).toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function TradeDetailModal({ positionId, onClose }: TradeDetailModalProps) {
  const [detail, setDetail] = useState<PositionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartTab, setChartTab] = useState<'price' | 'volume'>('price');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPositionDetail(positionId);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [positionId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (loading) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex items-center justify-center h-64">
          <Activity className="w-8 h-8 text-primary-400 animate-pulse" />
        </div>
      </Overlay>
    );
  }

  if (error || !detail) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">{error || 'No data'}</p>
        </div>
      </Overlay>
    );
  }

  const isProfit = detail.unrealised_pnl >= 0;
  const chartData = detail.chart.map(c => ({
    ...c,
    date: c.date.slice(0, 10),
  }));

  // Calculate Y axis domain – only extend for TP/SL if they are in a similar price range as chart data
  const closes = chartData.map(c => c.close).filter((v): v is number => v != null);
  const chartMin = Math.min(...closes);
  const chartMax = Math.max(...closes);
  const chartRange = chartMax - chartMin || chartMax * 0.1;
  // A level is "in range" if it's within 3x the chart range from the chart edges
  const inRange = (v: number | null | undefined): v is number =>
    v != null && v > chartMin - chartRange * 3 && v < chartMax + chartRange * 3;
  let yMin = chartMin;
  let yMax = chartMax;
  if (inRange(detail.entry_price)) { yMin = Math.min(yMin, detail.entry_price); yMax = Math.max(yMax, detail.entry_price); }
  if (inRange(detail.stop_loss)) yMin = Math.min(yMin, detail.stop_loss);
  if (inRange(detail.take_profit)) yMax = Math.max(yMax, detail.take_profit);
  if (inRange(detail.current_price)) { yMin = Math.min(yMin, detail.current_price); yMax = Math.max(yMax, detail.current_price); }
  const yPad = (yMax - yMin) * 0.08;
  yMin = Math.floor((yMin - yPad) * 100) / 100;
  yMax = Math.ceil((yMax + yPad) * 100) / 100;

  // Hide reference lines that would be far outside the visible chart area
  const showEntry = inRange(detail.entry_price);
  const showSL = inRange(detail.stop_loss);
  const showTP = inRange(detail.take_profit);
  const showCurrent = inRange(detail.current_price);

  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-metallic-100">{detail.ticker}</h2>
            <span className="text-sm text-metallic-500">{detail.exchange}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              detail.side === 'long' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {detail.side.toUpperCase()}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              detail.status === 'open' ? 'bg-primary-500/15 text-primary-400' : 'bg-metallic-700/50 text-metallic-500'
            }`}>
              {detail.status.toUpperCase()}
            </span>
          </div>
          {detail.strategy_name && (
            <p className="text-xs text-metallic-500 mt-1">
              Strategy: <span className="text-metallic-400">{detail.strategy_name}</span>
              {detail.account_name && <> &middot; {detail.account_name}</>}
            </p>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-metallic-700/50 transition-colors">
          <X className="w-5 h-5 text-metallic-400" />
        </button>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Current Price" value={`${detail.currency} ${formatCurrency(detail.current_price)}`}
          sub={`${detail.day_change >= 0 ? '+' : ''}${formatCurrency(detail.day_change, 4)} (${detail.day_change_pct >= 0 ? '+' : ''}${detail.day_change_pct}%)`}
          subColor={detail.day_change >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <MetricCard label="Unrealised P&L" value={`${isProfit ? '+' : ''}${detail.currency} ${formatCurrency(detail.unrealised_pnl)}`}
          sub={`${isProfit ? '+' : ''}${detail.pnl_pct}%`}
          highlight={isProfit ? 'emerald' : 'red'}
          subColor={isProfit ? 'text-emerald-400' : 'text-red-400'}
        />
        <MetricCard label="Position Value" value={`${detail.currency} ${formatCurrency(detail.position_value)}`}
          sub={`Cost: ${detail.currency} ${formatCurrency(detail.cost_basis)}`} />
        <MetricCard label="Risk / Reward" value={detail.risk_reward_ratio ? `1 : ${detail.risk_reward_ratio}` : '—'}
          sub={detail.hold_hours != null ? `Held ${detail.hold_hours}h` : '—'} />
      </div>

      {/* Chart */}
      <div className="bg-metallic-800/50 rounded-xl border border-metallic-700/30 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-semibold text-metallic-300 uppercase tracking-wider">Price Chart (90d)</span>
            <span className="text-[10px] text-metallic-600 bg-metallic-800 px-1.5 py-0.5 rounded">
              {detail.data_source}
            </span>
          </div>
          <div className="flex rounded border border-metallic-700/50 overflow-hidden">
            {(['price', 'volume'] as const).map(t => (
              <button key={t} onClick={() => setChartTab(t)}
                className={`px-3 py-1 text-[10px] font-medium transition-colors ${
                  chartTab === t ? 'bg-primary-500/20 text-primary-400' : 'bg-metallic-800 text-metallic-500 hover:text-metallic-300'
                }`}>
                {t === 'price' ? 'Price' : 'Volume'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartTab === 'price' ? (
              <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false}
                  interval={Math.max(Math.floor(chartData.length / 8), 1)}
                  tickFormatter={(v: string) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                <YAxis domain={[yMin, yMax]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false}
                  width={65} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />

                {/* Price area + line */}
                <Area type="monotone" dataKey="close" stroke="#60a5fa" strokeWidth={2}
                  fill="url(#priceGradient)" dot={false} />

                {/* Entry price line */}
                {showEntry && (
                <ReferenceLine y={detail.entry_price} stroke="#a78bfa" strokeDasharray="6 4" strokeWidth={1.5}
                  label={{ value: `Entry ${formatCurrency(detail.entry_price)}`, fill: '#a78bfa', fontSize: 10, position: 'right' }} />
                )}

                {/* Stop Loss line */}
                {showSL && (
                  <ReferenceLine y={detail.stop_loss!} stroke="#f87171" strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: `SL ${formatCurrency(detail.stop_loss)}`, fill: '#f87171', fontSize: 10, position: 'right' }} />
                )}

                {/* Take Profit line */}
                {showTP && (
                  <ReferenceLine y={detail.take_profit!} stroke="#34d399" strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: `TP ${formatCurrency(detail.take_profit)}`, fill: '#34d399', fontSize: 10, position: 'right' }} />
                )}

                {/* Current price line */}
                {showCurrent && (
                <ReferenceLine y={detail.current_price} stroke="#fbbf24" strokeDasharray="2 2" strokeWidth={1}
                  label={{ value: `Now ${formatCurrency(detail.current_price)}`, fill: '#fbbf24', fontSize: 10, position: 'left' }} />
                )}
              </ComposedChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false}
                  interval={Math.max(Math.floor(chartData.length / 8), 1)}
                  tickFormatter={(v: string) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} width={60}
                  tickFormatter={(v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : String(v)} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="volume" fill="#3b82f6" opacity={0.6} radius={[2, 2, 0, 0]} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart legend */}
        <div className="flex flex-wrap items-center gap-4 mt-2 px-1">
          <LegendItem color="#60a5fa" label="Close price" />
          <LegendItem color="#a78bfa" label="Entry" dashed />
          {detail.stop_loss && <LegendItem color="#f87171" label="Stop Loss" dashed />}
          {detail.take_profit && <LegendItem color="#34d399" label="Take Profit" dashed />}
          <LegendItem color="#fbbf24" label="Current" dashed />
        </div>
      </div>

      {/* Statistics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Position Info */}
        <div className="bg-metallic-800/50 rounded-xl border border-metallic-700/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs font-semibold text-metallic-300 uppercase tracking-wider">Position</span>
          </div>
          <StatRow label="Quantity" value={`${detail.quantity} shares`} />
          <StatRow label="Entry Price" value={`${detail.currency} ${formatCurrency(detail.entry_price)}`} />
          <StatRow label="Current Price" value={`${detail.currency} ${formatCurrency(detail.current_price)}`} />
          <StatRow label="Stop Loss" value={detail.stop_loss ? `${detail.currency} ${formatCurrency(detail.stop_loss)}` : '—'}
            valueClass={detail.stop_loss ? 'text-red-400' : 'text-metallic-600'} />
          <StatRow label="Take Profit" value={detail.take_profit ? `${detail.currency} ${formatCurrency(detail.take_profit)}` : '—'}
            valueClass={detail.take_profit ? 'text-emerald-400' : 'text-metallic-600'} />
          {detail.trailing_stop_pct && <StatRow label="Trailing Stop" value={`${detail.trailing_stop_pct}%`} />}
          <StatRow label="Opened" value={detail.opened_at ? formatDate(detail.opened_at) : '—'} />
          {detail.closed_at && <StatRow label="Closed" value={formatDate(detail.closed_at)} />}
        </div>

        {/* Risk Metrics */}
        <div className="bg-metallic-800/50 rounded-xl border border-metallic-700/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-metallic-300 uppercase tracking-wider">Risk Analysis</span>
          </div>
          <StatRow label="P&L" value={`${isProfit ? '+' : ''}${detail.currency} ${formatCurrency(detail.unrealised_pnl)}`}
            valueClass={isProfit ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label="P&L %" value={`${isProfit ? '+' : ''}${detail.pnl_pct}%`}
            valueClass={isProfit ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label="Risk/Reward" value={detail.risk_reward_ratio ? `1 : ${detail.risk_reward_ratio}` : '—'} />
          <StatRow label="SL Distance" value={detail.sl_distance_pct != null ? `${detail.sl_distance_pct}%` : '—'}
            valueClass={detail.sl_distance_pct != null ? (detail.sl_distance_pct < 0 ? 'text-red-400' : 'text-metallic-200') : undefined} />
          <StatRow label="TP Distance" value={detail.tp_distance_pct != null ? `${detail.tp_distance_pct}%` : '—'}
            valueClass={detail.tp_distance_pct != null ? (detail.tp_distance_pct > 0 ? 'text-emerald-400' : 'text-metallic-200') : undefined} />
          <StatRow label="Day Change" value={`${detail.day_change >= 0 ? '+' : ''}${detail.day_change_pct}%`}
            valueClass={detail.day_change >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label="Hold Duration" value={detail.hold_hours != null ? `${detail.hold_hours}h` : '—'} />
        </div>

        {/* Signal & Sentiment */}
        <div className="bg-metallic-800/50 rounded-xl border border-metallic-700/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-diamond-400" />
            <span className="text-xs font-semibold text-metallic-300 uppercase tracking-wider">Signal & Sentiment</span>
          </div>
          {detail.signal ? (
            <>
              <StatRow label="Signal Type" value={detail.signal.type} />
              <StatRow label="Strength" value={detail.signal.strength != null ? `${(detail.signal.strength * 100).toFixed(0)}%` : '—'} />
              <StatRow label="Triggered" value={formatDateTime(detail.signal.created_at)} />
              {detail.signal.triggered_rules && detail.signal.triggered_rules.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] text-metallic-500 uppercase mb-1">Triggered Rules</p>
                  <div className="space-y-1">
                    {detail.signal.triggered_rules.map((rule, i) => (
                      <div key={i} className="text-[11px] text-metallic-400 bg-metallic-900/60 rounded px-2 py-1">
                        {String(rule.rule || rule.type || JSON.stringify(rule).slice(0, 40))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-metallic-600 italic">No signal data (manual trade)</p>
          )}

          {/* Sentiment */}
          <div className="mt-3 pt-3 border-t border-metallic-700/30">
            <p className="text-[10px] text-metallic-500 uppercase mb-2">7-Day News Sentiment ({detail.sentiment.count_7d} articles)</p>
            <SentimentBar value={detail.sentiment.avg} label="Avg" />
            <SentimentBar value={detail.sentiment.max} label="Max" />
            <SentimentBar value={detail.sentiment.min} label="Min" />
          </div>
        </div>
      </div>

      {/* Orders History */}
      {detail.orders.length > 0 && (
        <div className="bg-metallic-800/50 rounded-xl border border-metallic-700/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-metallic-400" />
            <span className="text-xs font-semibold text-metallic-300 uppercase tracking-wider">Order History</span>
          </div>
          <div className="space-y-2">
            {detail.orders.map(order => (
              <div key={order.id} className="flex items-center justify-between text-xs bg-metallic-900/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    order.side === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {order.side.toUpperCase()}
                  </span>
                  <span className="text-metallic-300">{order.quantity} @ {order.fill_price ? formatCurrency(order.fill_price) : 'pending'}</span>
                  <span className="text-metallic-600">{order.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    order.status === 'filled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-metallic-700/50 text-metallic-500'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-metallic-600">{formatDateTime(order.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Overlay>
  );
}

// ── Sub-components ──

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-5xl mx-4 bg-metallic-900 border border-metallic-700/50 rounded-2xl shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
        {children}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, subColor, highlight }: {
  label: string; value: string; sub?: string; subColor?: string;
  highlight?: 'emerald' | 'red';
}) {
  const borderColor = highlight === 'emerald' ? 'border-emerald-500/30' : highlight === 'red' ? 'border-red-500/30' : 'border-metallic-700/30';
  return (
    <div className={`bg-metallic-800/50 rounded-xl border ${borderColor} p-3`}>
      <p className="text-[10px] text-metallic-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-bold text-metallic-100">{value}</p>
      {sub && <p className={`text-[11px] mt-0.5 ${subColor || 'text-metallic-500'}`}>{sub}</p>}
    </div>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-0.5 rounded" style={{
        backgroundColor: color,
        ...(dashed ? { background: `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)` } : {}),
      }} />
      <span className="text-[10px] text-metallic-500">{label}</span>
    </div>
  );
}
