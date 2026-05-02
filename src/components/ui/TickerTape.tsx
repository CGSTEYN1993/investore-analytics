'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/public-api-url';

type LiveItem = {
  id: string;
  symbol: string;
  price: number;
  change_pct: number;
  currency: string;
  unit: string;
  source?: string;
};

type LivePayload = {
  items: LiveItem[];
  count: number;
  asof: string;
  ttl_seconds: number;
};

const FALLBACK: LiveItem[] = [
  { id: 'gold',      symbol: 'GOLD',      price: 0, change_pct: 0, currency: 'USD', unit: 'USD/oz' },
  { id: 'silver',    symbol: 'SILVER',    price: 0, change_pct: 0, currency: 'USD', unit: 'USD/oz' },
  { id: 'copper',    symbol: 'COPPER',    price: 0, change_pct: 0, currency: 'USD', unit: 'USD/lb' },
  { id: 'platinum',  symbol: 'PLATINUM',  price: 0, change_pct: 0, currency: 'USD', unit: 'USD/oz' },
  { id: 'palladium', symbol: 'PALLADIUM', price: 0, change_pct: 0, currency: 'USD', unit: 'USD/oz' },
  { id: 'uranium',   symbol: 'URANIUM',   price: 0, change_pct: 0, currency: 'USD', unit: 'USD/lb' },
];

function formatPrice(p: number): string {
  if (!p) return '—';
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 10) return p.toFixed(2);
  return p.toFixed(3);
}

const TickerTape: React.FC = () => {
  const [items, setItems] = useState<LiveItem[]>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/market/commodities/live`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data: LivePayload = await res.json();
        if (!cancelled && data?.items?.length) {
          setItems(data.items);
          setLoaded(true);
        }
      } catch {
        /* silent — keep fallback */
      }
    }

    load();
    const id = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Triple the array so the CSS marquee loops smoothly
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-metallic-950 border-b border-metallic-800/50 overflow-hidden h-8 flex items-center">
      <div className="animate-ticker flex whitespace-nowrap">
        {tickerItems.map((item, index) => {
          const up = item.change_pct > 0;
          const flat = item.change_pct === 0;
          const colorClass = flat
            ? 'text-metallic-500'
            : up
            ? 'text-emerald-500'
            : 'text-red-400';
          const arrow = flat ? '·' : up ? '▲' : '▼';
          return (
            <div key={index} className="inline-flex items-center mx-5 text-xs font-mono">
              <span className="text-metallic-500 font-semibold mr-1.5">{item.symbol}</span>
              <span className="text-metallic-300 mr-1.5">${formatPrice(item.price)}</span>
              <span className={colorClass}>
                {arrow} {Math.abs(item.change_pct).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      {!loaded && (
        <span className="sr-only">Loading live commodity prices…</span>
      )}
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-ticker {
          animation: ticker 35s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TickerTape;