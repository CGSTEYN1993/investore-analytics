'use client';

/**
 * UniverseChart — TradingView-style chart for the InvestOre tradable universe.
 *
 * Features
 *  - Candlestick / area / OHLC bars / hollow candle
 *  - 20+ built-in technical indicators (MA, EMA, BOLL, MACD, KDJ, RSI, …)
 *  - Drawing tools (trendline, ray, segment, fibonacci, parallel channel,
 *    rectangle, triangle, brush, label, …)
 *  - Multiple timeframes (1m / 5m / 15m / 1h / 1d / 1wk / 1mo)
 *  - Multiple ranges (1d → max)
 *  - Crosshair, log scale, volume pane, fullscreen
 *
 * Data source: free Yahoo Finance OHLCV (delayed ~20min) via backend proxy.
 * Constrained to tickers in the InvestOre universe.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  init,
  dispose,
  type Chart,
  type KLineData,
  type PeriodType,
} from 'klinecharts';
import {
  Maximize2, Minimize2, Loader2, AlertCircle, X,
  TrendingUp, BarChart3, LineChart, Activity,
  Pencil, Trash2,
} from 'lucide-react';
import { fetchChart, fetchUniverse, type UniverseItem } from '@/services/tradingService';

// ─── Config ────────────────────────────────────────────────────────────────

const RANGES = [
  { label: '1D', range: '1d', interval: '5m', period: { type: 'minute' as PeriodType, span: 5 } },
  { label: '5D', range: '5d', interval: '15m', period: { type: 'minute' as PeriodType, span: 15 } },
  { label: '1M', range: '1mo', interval: '1d', period: { type: 'day' as PeriodType, span: 1 } },
  { label: '3M', range: '3mo', interval: '1d', period: { type: 'day' as PeriodType, span: 1 } },
  { label: '6M', range: '6mo', interval: '1d', period: { type: 'day' as PeriodType, span: 1 } },
  { label: '1Y', range: '1y', interval: '1d', period: { type: 'day' as PeriodType, span: 1 } },
  { label: '2Y', range: '2y', interval: '1d', period: { type: 'day' as PeriodType, span: 1 } },
  { label: '5Y', range: '5y', interval: '1wk', period: { type: 'week' as PeriodType, span: 1 } },
  { label: 'Max', range: 'max', interval: '1mo', period: { type: 'month' as PeriodType, span: 1 } },
] as const;

const CHART_TYPES = [
  { id: 'candle_solid', label: 'Candles', icon: BarChart3 },
  { id: 'candle_stroke', label: 'Hollow', icon: BarChart3 },
  { id: 'ohlc', label: 'OHLC', icon: Activity },
  { id: 'area', label: 'Area', icon: TrendingUp },
] as const;

// Indicators that draw on the main candle pane (overlays)
const MAIN_INDICATORS = [
  { id: 'MA', label: 'MA' },
  { id: 'EMA', label: 'EMA' },
  { id: 'SMA', label: 'SMA' },
  { id: 'BOLL', label: 'Bollinger' },
  { id: 'SAR', label: 'SAR' },
  { id: 'BBI', label: 'BBI' },
] as const;

// Indicators that get their own sub-pane
const SUB_INDICATORS = [
  { id: 'VOL', label: 'Volume' },
  { id: 'MACD', label: 'MACD' },
  { id: 'RSI', label: 'RSI' },
  { id: 'KDJ', label: 'KDJ' },
  { id: 'CCI', label: 'CCI' },
  { id: 'WR', label: 'W&R' },
  { id: 'DMI', label: 'DMI' },
  { id: 'OBV', label: 'OBV' },
  { id: 'BIAS', label: 'BIAS' },
  { id: 'PSY', label: 'PSY' },
  { id: 'MTM', label: 'MTM' },
  { id: 'ROC', label: 'ROC' },
  { id: 'TRIX', label: 'TRIX' },
  { id: 'AO', label: 'AO' },
] as const;

// Drawing overlays (built-in to klinecharts)
const DRAWING_TOOLS = [
  { id: 'priceLine', label: 'Horizontal price' },
  { id: 'horizontalRayLine', label: 'Horizontal ray' },
  { id: 'horizontalSegment', label: 'Horizontal segment' },
  { id: 'horizontalStraightLine', label: 'Horizontal line' },
  { id: 'verticalRayLine', label: 'Vertical ray' },
  { id: 'verticalSegment', label: 'Vertical segment' },
  { id: 'verticalStraightLine', label: 'Vertical line' },
  { id: 'rayLine', label: 'Ray' },
  { id: 'segment', label: 'Trend segment' },
  { id: 'straightLine', label: 'Trend line' },
  { id: 'priceChannelLine', label: 'Price channel' },
  { id: 'parallelStraightLine', label: 'Parallel channel' },
  { id: 'fibonacciLine', label: 'Fibonacci retrace' },
  { id: 'fibonacciSegment', label: 'Fibonacci segment' },
  { id: 'fibonacciCircle', label: 'Fibonacci circle' },
  { id: 'fibonacciSpiral', label: 'Fibonacci spiral' },
  { id: 'fibonacciSpeedResistanceFan', label: 'Fib speed fan' },
  { id: 'fibonacciExtension', label: 'Fibonacci extension' },
  { id: 'gannBox', label: 'Gann box' },
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'circle', label: 'Circle' },
  { id: 'arrow', label: 'Arrow' },
  { id: 'parallelogram', label: 'Parallelogram' },
  { id: 'threeWavesGraphic', label: 'Three waves' },
  { id: 'fiveWavesGraphic', label: 'Five waves' },
  { id: 'eightWavesGraphic', label: 'Eight waves' },
  { id: 'abcdGraphic', label: 'ABCD pattern' },
  { id: 'xabcdGraphic', label: 'XABCD pattern' },
] as const;

const ASX_DEFAULT = 'BHP';

export interface UniverseChartProps {
  initialSymbol?: string;
  initialExchange?: string;
  height?: number;
}

export function UniverseChart({
  initialSymbol = ASX_DEFAULT,
  initialExchange = 'ASX',
  height = 820,
}: UniverseChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const chartIdRef = useRef<string>(`klc-${Math.random().toString(36).slice(2)}`);

  const [symbol, setSymbol] = useState(initialSymbol);
  const [exchange, setExchange] = useState(initialExchange);
  const [rangeKey, setRangeKey] = useState<typeof RANGES[number]['label']>('1Y');
  const [chartType, setChartType] = useState<typeof CHART_TYPES[number]['id']>('candle_solid');
  const [activeMainInds, setActiveMainInds] = useState<Set<string>>(new Set(['MA']));
  const [activeSubInds, setActiveSubInds] = useState<Set<string>>(new Set(['VOL']));
  const [fullscreen, setFullscreen] = useState(false);
  const [drawingMenuOpen, setDrawingMenuOpen] = useState(false);
  const [indicatorMenuOpen, setIndicatorMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [universe, setUniverse] = useState<UniverseItem[]>([]);
  const [meta, setMeta] = useState<{ currency: string | null; lastPrice: number | null; prevClose: number | null }>(
    { currency: null, lastPrice: null, prevClose: null },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRange = useMemo(() => RANGES.find(r => r.label === rangeKey)!, [rangeKey]);

  // ── Init chart ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const id = chartIdRef.current;
    containerRef.current.id = id;
    const chart = init(id, {
      styles: {
        grid: {
          horizontal: { color: 'rgba(120,120,120,0.08)' },
          vertical: { color: 'rgba(120,120,120,0.08)' },
        },
        candle: {
          bar: {
            upColor: '#10b981',
            downColor: '#ef4444',
            upBorderColor: '#10b981',
            downBorderColor: '#ef4444',
            upWickColor: '#10b981',
            downWickColor: '#ef4444',
          },
        },
        xAxis: {
          axisLine: { color: 'rgba(120,120,120,0.2)' },
          tickText: { color: '#94a3b8' },
          tickLine: { color: 'rgba(120,120,120,0.2)' },
        },
        yAxis: {
          axisLine: { color: 'rgba(120,120,120,0.2)' },
          tickText: { color: '#94a3b8' },
          tickLine: { color: 'rgba(120,120,120,0.2)' },
        },
      },
    });
    chartRef.current = chart;

    return () => {
      dispose(id);
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch universe for picker ───────────────────────────────────────────
  useEffect(() => {
    fetchUniverse({ exchange: exchange || undefined, limit: 1000 })
      .then(r => setUniverse(r.items))
      .catch(() => setUniverse([]));
  }, [exchange]);

  // ── Load data (klinecharts v10 API: setSymbol + setPeriod + setDataLoader) ─
  const loadData = useCallback(async () => {
    const c = chartRef.current;
    if (!c) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchChart(symbol, {
        exchange,
        range: currentRange.range,
        interval: currentRange.interval,
      });
      const data: KLineData[] = res.candles.map(cd => ({
        timestamp: cd.timestamp,
        open: cd.open,
        high: cd.high,
        low: cd.low,
        close: cd.close,
        volume: cd.volume,
      }));
      c.setSymbol({ ticker: `${exchange}:${symbol}`, pricePrecision: 2, volumePrecision: 0 });
      c.setPeriod(currentRange.period);
      c.setDataLoader({
        getBars: ({ type, callback }) => {
          if (type === 'init') {
            callback(data, false);
          } else {
            callback([], false);
          }
        },
      });
      setMeta({
        currency: res.currency,
        lastPrice: res.regular_market_price ?? (data[data.length - 1]?.close ?? null),
        prevClose: res.previous_close,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  }, [symbol, exchange, currentRange]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Apply chart type ────────────────────────────────────────────────────
  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;
    c.setStyles({ candle: { type: chartType } });
  }, [chartType]);

  // ── Sync indicators ─────────────────────────────────────────────────────
  const indicatorIdsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;
    const ids = indicatorIdsRef.current;
    const desired = new Set<string>();
    activeMainInds.forEach(n => desired.add(n));
    activeSubInds.forEach(n => desired.add(n));

    // Remove indicators no longer desired
    for (const [name, id] of Array.from(ids.entries())) {
      if (!desired.has(name)) {
        c.removeIndicator({ id });
        ids.delete(name);
      }
    }
    // Add new main-pane indicators (overlay onto candle pane)
    for (const name of Array.from(activeMainInds)) {
      if (!ids.has(name)) {
        const id = c.createIndicator(name, true, { id: 'candle_pane' });
        if (id) ids.set(name, id);
      }
    }
    // Add new sub-pane indicators
    for (const name of Array.from(activeSubInds)) {
      if (!ids.has(name)) {
        const id = c.createIndicator(name, false);
        if (id) ids.set(name, id);
      }
    }
  }, [activeMainInds, activeSubInds]);

  // ── Drawing tools ───────────────────────────────────────────────────────
  const startDrawing = (overlayName: string) => {
    chartRef.current?.createOverlay({ name: overlayName });
    setDrawingMenuOpen(false);
  };

  const clearDrawings = () => {
    chartRef.current?.removeOverlay();
  };

  const toggleMain = (id: string) => {
    setActiveMainInds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSub = (id: string) => {
    setActiveSubInds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Symbol picker ───────────────────────────────────────────────────────
  const filteredPicker = useMemo(() => {
    const q = pickerQuery.toLowerCase();
    return universe
      .filter(u => !q || u.symbol.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [universe, pickerQuery]);

  const change = meta.lastPrice && meta.prevClose ? meta.lastPrice - meta.prevClose : null;
  const changePct = change != null && meta.prevClose ? (change / meta.prevClose) * 100 : null;

  return (
    <div
      className={`flex flex-col bg-metallic-950 border border-metallic-800 rounded-xl overflow-hidden ${
        fullscreen ? 'fixed inset-2 z-50' : ''
      }`}
    >
      {/* ─── Top toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-metallic-800 bg-metallic-900/60">
        {/* Symbol picker */}
        <div className="relative">
          <button
            onClick={() => setPickerOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-metallic-800 hover:bg-metallic-700 text-metallic-100 text-sm font-mono"
          >
            <span className="font-semibold">{symbol}</span>
            <span className="text-[10px] text-metallic-400">{exchange}</span>
          </button>
          {pickerOpen && (
            <div className="absolute z-30 mt-1 w-72 max-h-96 overflow-y-auto rounded-lg border border-metallic-700 bg-metallic-900 shadow-xl">
              <div className="p-2 border-b border-metallic-800 sticky top-0 bg-metallic-900">
                <div className="flex gap-1 mb-2">
                  {['ASX', 'NYSE', 'NASDAQ', 'TSX', 'TSXV', 'LSE', 'JSE'].map(e => (
                    <button
                      key={e}
                      onClick={() => setExchange(e)}
                      className={`px-2 py-1 text-[10px] rounded font-semibold ${
                        exchange === e ? 'bg-primary-500 text-white' : 'bg-metallic-800 text-metallic-400 hover:text-metallic-200'
                      }`}
                    >{e}</button>
                  ))}
                </div>
                <input
                  autoFocus
                  value={pickerQuery}
                  onChange={e => setPickerQuery(e.target.value)}
                  placeholder="Search universe…"
                  className="w-full px-2 py-1.5 text-xs rounded bg-metallic-800 border border-metallic-700 text-metallic-100 focus:border-primary-500 focus:outline-none"
                />
              </div>
              {filteredPicker.length === 0 ? (
                <div className="p-3 text-xs text-metallic-500 text-center">No matches</div>
              ) : filteredPicker.map(u => (
                <button
                  key={`${u.exchange}-${u.symbol}`}
                  onClick={() => {
                    setSymbol(u.symbol);
                    setExchange(u.exchange);
                    setPickerOpen(false);
                    setPickerQuery('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-metallic-800 border-b border-metallic-800/60 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-metallic-100 font-semibold">{u.symbol}</span>
                    <span className="text-[10px] text-metallic-500 uppercase">{u.primary_commodity}</span>
                  </div>
                  <div className="text-xs text-metallic-400 truncate">{u.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Last price */}
        {meta.lastPrice != null && (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-mono font-semibold text-metallic-100">
              {meta.lastPrice.toFixed(2)}
            </span>
            {meta.currency && <span className="text-[10px] text-metallic-500">{meta.currency}</span>}
            {change != null && changePct != null && (
              <span className={`text-xs font-mono ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePct.toFixed(2)}%)
              </span>
            )}
          </div>
        )}

        <div className="grow" />

        {/* Range selector */}
        <div className="flex rounded-lg border border-metallic-700 overflow-hidden">
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setRangeKey(r.label)}
              className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
                rangeKey === r.label
                  ? 'bg-primary-500 text-white'
                  : 'bg-metallic-800 text-metallic-400 hover:bg-metallic-700 hover:text-metallic-200'
              }`}
            >{r.label}</button>
          ))}
        </div>

        {/* Chart type */}
        <div className="flex rounded-lg border border-metallic-700 overflow-hidden">
          {CHART_TYPES.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setChartType(t.id)}
                title={t.label}
                className={`px-2 py-1 transition-colors ${
                  chartType === t.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-metallic-800 text-metallic-400 hover:bg-metallic-700'
                }`}
              ><Icon className="w-3.5 h-3.5" /></button>
            );
          })}
        </div>

        {/* Indicators dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIndicatorMenuOpen(o => !o); setDrawingMenuOpen(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-metallic-800 hover:bg-metallic-700 text-metallic-200 text-xs"
          >
            <LineChart className="w-3.5 h-3.5" /> Indicators
          </button>
          {indicatorMenuOpen && (
            <div className="absolute right-0 z-30 mt-1 w-64 rounded-lg border border-metallic-700 bg-metallic-900 shadow-xl p-3">
              <div className="text-[10px] font-semibold text-metallic-500 uppercase tracking-wider mb-1">Overlays</div>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {MAIN_INDICATORS.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => toggleMain(ind.id)}
                    className={`px-2 py-1 text-[10px] rounded font-mono ${
                      activeMainInds.has(ind.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-metallic-800 text-metallic-400 hover:bg-metallic-700'
                    }`}
                  >{ind.label}</button>
                ))}
              </div>
              <div className="text-[10px] font-semibold text-metallic-500 uppercase tracking-wider mb-1">Sub-panes</div>
              <div className="grid grid-cols-3 gap-1">
                {SUB_INDICATORS.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => toggleSub(ind.id)}
                    className={`px-2 py-1 text-[10px] rounded font-mono ${
                      activeSubInds.has(ind.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-metallic-800 text-metallic-400 hover:bg-metallic-700'
                    }`}
                  >{ind.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawing tools */}
        <div className="relative">
          <button
            onClick={() => { setDrawingMenuOpen(o => !o); setIndicatorMenuOpen(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-metallic-800 hover:bg-metallic-700 text-metallic-200 text-xs"
          >
            <Pencil className="w-3.5 h-3.5" /> Draw
          </button>
          {drawingMenuOpen && (
            <div className="absolute right-0 z-30 mt-1 w-72 max-h-96 overflow-y-auto rounded-lg border border-metallic-700 bg-metallic-900 shadow-xl p-2">
              {DRAWING_TOOLS.map(d => (
                <button
                  key={d.id}
                  onClick={() => startDrawing(d.id)}
                  className="w-full text-left px-2 py-1.5 text-xs text-metallic-200 hover:bg-metallic-800 rounded"
                >{d.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Clear drawings */}
        <button
          onClick={clearDrawings}
          title="Clear all drawings"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-metallic-800 hover:bg-red-500/20 text-metallic-400 hover:text-red-400 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={() => setFullscreen(f => !f)}
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="px-2 py-1 rounded-lg bg-metallic-800 hover:bg-metallic-700 text-metallic-200"
        >
          {fullscreen
            ? <Minimize2 className="w-3.5 h-3.5" />
            : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ─── Chart canvas ──────────────────────────────────────────────── */}
      <div className="relative flex-1" style={{ height: fullscreen ? undefined : height }}>
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-metallic-900/80 text-xs text-metallic-300">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-metallic-950/90">
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 max-w-md">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div className="text-xs text-red-300">{error}</div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <div className="px-3 py-1.5 border-t border-metallic-800 bg-metallic-900/40 text-[10px] text-metallic-500 flex items-center justify-between">
        <span>Data: Yahoo Finance · ~20min delayed · {RANGES.find(r => r.label === rangeKey)?.range} / {currentRange.interval}</span>
        <span className="font-mono">InvestOre universe only</span>
      </div>
    </div>
  );
}
