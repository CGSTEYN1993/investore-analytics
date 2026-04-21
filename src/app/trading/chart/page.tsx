'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Square, Rows, Columns, Grid2X2 } from 'lucide-react';

// klinecharts touches `window` on import — must be SSR-disabled
const UniverseChart = dynamic(
  () => import('@/components/trading/UniverseChart').then(m => m.UniverseChart),
  { ssr: false, loading: () => (
    <div className="h-full min-h-[400px] flex items-center justify-center bg-metallic-950 border border-metallic-800 rounded-xl">
      <span className="text-xs text-metallic-500">Loading chart engine…</span>
    </div>
  ) },
);

type LayoutId = '1' | '2v' | '2h' | '4';
type Cell = { id: string; symbol: string; exchange: string };

const LAYOUTS: { id: LayoutId; label: string; cells: number; icon: React.ComponentType<{ className?: string }>; grid: string; cellHeight: number }[] = [
  { id: '1',  label: '1',         cells: 1, icon: Square,    grid: 'grid-cols-1',                       cellHeight: 1400 },
  { id: '2v', label: '2 stacked', cells: 2, icon: Rows,      grid: 'grid-cols-1',                       cellHeight: 850 },
  { id: '2h', label: '2 side',    cells: 2, icon: Columns,   grid: 'grid-cols-1 lg:grid-cols-2',        cellHeight: 1200 },
  { id: '4',  label: '4 quad',    cells: 4, icon: Grid2X2,   grid: 'grid-cols-1 lg:grid-cols-2',        cellHeight: 850 },
];

const STORAGE_KEY = 'investore.charts.layout.v1';
const DEFAULT_CELLS: Cell[] = [
  { id: 'c1', symbol: 'BHP',  exchange: 'ASX' },
  { id: 'c2', symbol: 'RIO',  exchange: 'ASX' },
  { id: 'c3', symbol: 'FMG',  exchange: 'ASX' },
  { id: 'c4', symbol: 'NST',  exchange: 'ASX' },
];

function uid(): string { return `c${Math.random().toString(36).slice(2, 8)}`; }

export default function ChartPage() {
  const [layoutId, setLayoutId] = useState<LayoutId>('1');
  const [cells, setCells] = useState<Cell[]>(DEFAULT_CELLS);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as { layoutId?: LayoutId; cells?: Cell[] };
      if (parsed.layoutId) setLayoutId(parsed.layoutId);
      if (Array.isArray(parsed.cells) && parsed.cells.length > 0) {
        setCells(parsed.cells.map(c => ({ id: c.id || uid(), symbol: c.symbol, exchange: c.exchange })));
      }
    } catch { /* ignore */ }
  }, []);

  // Persist
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ layoutId, cells }));
    } catch { /* ignore */ }
  }, [layoutId, cells]);

  const layout = useMemo(() => LAYOUTS.find(l => l.id === layoutId)!, [layoutId]);

  // Visible cells = first N from the cell pool, where N = layout.cells.
  // If the pool is shorter than N, top up with sensible defaults so every
  // pane has something to render.
  const visible: Cell[] = useMemo(() => {
    const out = cells.slice(0, layout.cells);
    while (out.length < layout.cells) {
      const fallback = DEFAULT_CELLS[out.length] ?? { id: uid(), symbol: 'BHP', exchange: 'ASX' };
      out.push({ ...fallback, id: uid() });
    }
    return out;
  }, [cells, layout.cells]);

  // Sync the visible top-up back into state if needed (so persistence captures them)
  useEffect(() => {
    if (visible.length > cells.length) {
      setCells(prev => {
        const merged = [...prev];
        for (let i = prev.length; i < visible.length; i++) merged.push(visible[i]);
        return merged;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutId]);

  const updateCell = (id: string, patch: Partial<Cell>) => {
    setCells(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCell = (id: string) => {
    setCells(prev => prev.filter(c => c.id !== id));
    // shrink layout if needed
    const remaining = cells.filter(c => c.id !== id).length;
    if (remaining < layout.cells) {
      const next = LAYOUTS.find(l => l.cells <= Math.max(1, remaining));
      if (next) setLayoutId(next.id);
    }
  };

  const addCell = () => {
    setCells(prev => [...prev, { id: uid(), symbol: 'BHP', exchange: 'ASX' }]);
    // upgrade layout to fit if there's room
    const target = cells.length + 1;
    const next = LAYOUTS.find(l => l.cells >= target) || LAYOUTS[LAYOUTS.length - 1];
    setLayoutId(next.id);
  };

  return (
    <div className="max-w-[1920px] 2xl:max-w-none mx-auto px-3 sm:px-4 lg:px-6 pt-5 pb-10">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-metallic-100">Charts</h1>
          <p className="text-xs text-metallic-500 mt-0.5">
            TradingView-style charts restricted to the InvestOre universe — candles,
            20+ indicators, full drawing toolkit, free Yahoo data (~20min delayed).
            Use the layout buttons to split the workspace into multiple panes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout switcher */}
          <div className="flex rounded-lg border border-metallic-700 bg-metallic-900 overflow-hidden">
            {LAYOUTS.map(l => {
              const Icon = l.icon;
              const active = l.id === layoutId;
              return (
                <button
                  key={l.id}
                  onClick={() => setLayoutId(l.id)}
                  title={l.label}
                  className={`px-3 py-2 flex items-center gap-1.5 text-xs transition-colors ${
                    active ? 'bg-primary-500/20 text-primary-300' : 'text-metallic-400 hover:bg-metallic-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{l.label}</span>
                </button>
              );
            })}
          </div>

          {/* Add pane (only meaningful when current layout has spare cells beyond list) */}
          <button
            onClick={addCell}
            disabled={cells.length >= 4}
            title="Add pane"
            className="px-3 py-2 rounded-lg border border-metallic-700 bg-metallic-900 text-xs text-metallic-300 hover:bg-metallic-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add pane</span>
          </button>
        </div>
      </div>

      {/* Grid of charts */}
      <div className={`grid ${layout.grid} gap-4`}>
        {visible.map((cell, i) => (
          <div key={cell.id} className="relative group">
            {layout.cells > 1 && (
              <button
                onClick={() => removeCell(cell.id)}
                title="Remove pane"
                className="absolute top-2 right-2 z-30 p-1 rounded-md bg-metallic-900/80 border border-metallic-700 text-metallic-400 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <UniverseChart
              key={`${cell.id}-${cell.exchange}-${cell.symbol}`}
              initialSymbol={cell.symbol}
              initialExchange={cell.exchange}
              height={layout.cellHeight}
              onSymbolChange={(symbol, exchange) => updateCell(cell.id, { symbol, exchange })}
            />
            {/* hidden index marker for screenreaders */}
            <span className="sr-only">Pane {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
