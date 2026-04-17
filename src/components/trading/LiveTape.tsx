'use client';

import { useEffect, useRef, useState } from 'react';
import { liveTapeUrl } from '@/services/tradingService';
import { Activity, AlertCircle, ArrowDownCircle, ArrowUpCircle, Radio } from 'lucide-react';

type TapeKind = 'signal' | 'order' | 'audit';

interface TapeEvent {
  id: string;
  kind: TapeKind;
  ts: string;
  data: Record<string, unknown>;
}

const MAX_ITEMS = 30;

export function LiveTape({ kinds = ['signals', 'orders', 'audit'] }: { kinds?: string[] }) {
  const [events, setEvents] = useState<TapeEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let es: EventSource;
    try {
      es = new EventSource(liveTapeUrl(kinds));
      esRef.current = es;
    } catch {
      return;
    }

    const push = (kind: TapeKind, e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => {
          const item: TapeEvent = {
            id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            kind,
            ts: new Date().toISOString(),
            data,
          };
          return [item, ...prev].slice(0, MAX_ITEMS);
        });
      } catch { /* ignore parse errors */ }
    };

    es.addEventListener('hello', () => setConnected(true));
    es.addEventListener('signal', (e) => push('signal', e as MessageEvent));
    es.addEventListener('order', (e) => push('order', e as MessageEvent));
    es.addEventListener('audit', (e) => push('audit', e as MessageEvent));
    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [kinds.join(',')]);

  return (
    <div className="rounded-xl border border-metallic-800 bg-metallic-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-metallic-800 bg-metallic-900/60">
        <div className="flex items-center gap-2 text-sm font-semibold text-metallic-100">
          <Radio className={`w-4 h-4 ${connected ? 'text-emerald-400 animate-pulse' : 'text-metallic-500'}`} />
          Live tape
        </div>
        <span className={`text-xs ${connected ? 'text-emerald-400' : 'text-metallic-500'}`}>
          {connected ? 'connected' : 'disconnected'}
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-metallic-800/60">
        {events.length === 0 ? (
          <div className="px-4 py-6 text-sm text-metallic-500 text-center">
            Waiting for new signals, orders and audit events…
          </div>
        ) : (
          events.map((e) => <TapeRow key={e.id} event={e} />)
        )}
      </div>
    </div>
  );
}

function TapeRow({ event }: { event: TapeEvent }) {
  const d = event.data as Record<string, unknown>;
  if (event.kind === 'signal') {
    return (
      <div className="flex items-start gap-3 px-4 py-2.5 text-sm">
        <Activity className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-metallic-100">
            <span className="font-semibold">{String(d.symbol ?? '—')}</span>
            <span className="text-metallic-500 mx-1.5">·</span>
            <span className="text-metallic-300">{String(d.signal_type ?? '').toUpperCase()}</span>
            {d.strength != null && (
              <span className="text-metallic-400 text-xs ml-2">strength {Number(d.strength).toFixed(2)}</span>
            )}
          </div>
          <div className="text-xs text-metallic-500 truncate">{String(d.reason ?? '')}</div>
        </div>
        <Timestamp ts={String(d.created_at ?? event.ts)} />
      </div>
    );
  }
  if (event.kind === 'order') {
    const buy = String(d.side ?? '').toLowerCase() === 'buy';
    return (
      <div className="flex items-start gap-3 px-4 py-2.5 text-sm">
        {buy
          ? <ArrowUpCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          : <ArrowDownCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-metallic-100">
            <span className="font-semibold">{String(d.symbol ?? '—')}</span>
            <span className="text-metallic-500 mx-1.5">·</span>
            <span className={buy ? 'text-emerald-400' : 'text-red-400'}>{String(d.side ?? '').toUpperCase()}</span>
            <span className="text-metallic-300 ml-1.5">{String(d.quantity ?? '')}</span>
            {d.avg_fill_price != null && (
              <span className="text-metallic-400 ml-2">@ {Number(d.avg_fill_price).toFixed(2)}</span>
            )}
          </div>
          <div className="text-xs text-metallic-500">status: {String(d.status ?? '')}</div>
        </div>
        <Timestamp ts={String(d.created_at ?? event.ts)} />
      </div>
    );
  }
  // audit
  return (
    <div className="flex items-start gap-3 px-4 py-2.5 text-sm">
      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-metallic-100 font-medium">{String(d.event_type ?? 'audit')}</div>
        <div className="text-xs text-metallic-500 font-mono truncate">
          {d.payload ? JSON.stringify(d.payload) : ''}
        </div>
      </div>
      <Timestamp ts={String(d.created_at ?? event.ts)} />
    </div>
  );
}

function Timestamp({ ts }: { ts: string }) {
  const date = new Date(ts);
  const s = isNaN(date.getTime()) ? '' : date.toLocaleTimeString();
  return <span className="text-xs text-metallic-600 whitespace-nowrap">{s}</span>;
}
