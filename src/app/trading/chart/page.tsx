'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// klinecharts touches `window` on import — must be SSR-disabled
const UniverseChart = dynamic(
  () => import('@/components/trading/UniverseChart').then(m => m.UniverseChart),
  { ssr: false, loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-metallic-950 border border-metallic-800 rounded-xl">
      <span className="text-xs text-metallic-500">Loading chart engine…</span>
    </div>
  ) },
);

export default function ChartPage() {
  const [symbol, setSymbol] = useState('BHP');
  const [exchange, setExchange] = useState('ASX');

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-10">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-metallic-100">Charts</h1>
        <p className="text-xs text-metallic-500 mt-0.5">
          TradingView-style charts restricted to the InvestOre universe — candles,
          20+ indicators, full drawing toolkit, free Yahoo data (~20min delayed).
        </p>
      </div>
      <UniverseChart
        initialSymbol={symbol}
        initialExchange={exchange}
        height={1200}
      />
    </div>
  );
}
