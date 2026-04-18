'use client';

/**
 * TradingViewChart — embeds TradingView's free hosted Advanced Chart widget.
 *
 * No npm dependency required; pulls the script from s3.tradingview.com.
 * Maps our internal exchange codes to TradingView's symbol prefix.
 *
 * Usage:
 *   <TradingViewChart symbol="AAPL" exchange="NASDAQ" height={520} />
 */

import { useEffect, useRef } from 'react';

const EXCHANGE_PREFIX: Record<string, string> = {
  NASDAQ: 'NASDAQ',
  NYSE: 'NYSE',
  AMEX: 'AMEX',
  ASX: 'ASX',
  TSX: 'TSX',
  TSXV: 'TSXV',
  LSE: 'LSE',
  JSE: 'JSE',
  HKEX: 'HKEX',
  SMART: '', // let TradingView resolve
};

declare global {
  interface Window {
    TradingView?: {
      widget: new (cfg: Record<string, unknown>) => unknown;
    };
  }
}

const SCRIPT_URL = 'https://s3.tradingview.com/tv.js';
let scriptPromise: Promise<void> | null = null;

function loadTradingViewScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.TradingView) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('TradingView script failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('TradingView script failed to load'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface TradingViewChartProps {
  symbol: string;
  exchange?: string;
  interval?: string; // '1','5','15','60','D','W'
  theme?: 'light' | 'dark';
  height?: number;
}

export function TradingViewChart({
  symbol,
  exchange = 'SMART',
  interval = 'D',
  theme = 'dark',
  height = 480,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerId = useRef(`tv-chart-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let cancelled = false;
    loadTradingViewScript()
      .then(() => {
        if (cancelled || !window.TradingView || !containerRef.current) return;
        // Clear any previous widget DOM
        containerRef.current.innerHTML = '';
        const prefix = EXCHANGE_PREFIX[exchange.toUpperCase()] ?? '';
        const tvSymbol = prefix ? `${prefix}:${symbol}` : symbol;
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval,
          timezone: 'Etc/UTC',
          theme,
          style: '1',
          locale: 'en',
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          backgroundColor: '#0b0b0e',
          gridColor: 'rgba(255,255,255,0.04)',
          container_id: containerId.current,
        });
      })
      .catch(() => { /* swallow — chart will just not render */ });
    return () => { cancelled = true; };
  }, [symbol, exchange, interval, theme]);

  return (
    <div
      ref={containerRef}
      id={containerId.current}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden border border-metallic-800 bg-metallic-950"
    />
  );
}
