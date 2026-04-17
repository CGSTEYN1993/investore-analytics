'use client';

import { useEffect, useState } from 'react';
import { fetchAuditLog, type AuditEvent } from '@/services/tradingService';
import { FileText, Loader2, RefreshCw } from 'lucide-react';

const EVENT_COLORS: Record<string, string> = {
  kill_switch: 'bg-red-500/15 text-red-300 border-red-500/30',
  strategy_toggle: 'bg-primary-500/15 text-primary-300 border-primary-500/30',
  broker_link: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  legals_accepted: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchAuditLog(200);
      setEvents(r.events);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-metallic-950 text-metallic-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary-400" />
            <h1 className="text-2xl font-bold">Audit log</h1>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-metallic-700 text-sm hover:bg-metallic-800">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
        <p className="text-metallic-400 mb-8 text-sm">
          Every broker link, legal acceptance, strategy toggle, kill-switch activation and order cancellation is recorded here.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-metallic-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : err ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 text-sm">{err}</div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-metallic-800 bg-metallic-900/40 p-8 text-center text-metallic-400">
            No audit events yet.
          </div>
        ) : (
          <div className="rounded-xl border border-metallic-800 bg-metallic-900/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-metallic-800/60 text-metallic-300 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2.5">When</th>
                  <th className="text-left px-4 py-2.5">Event</th>
                  <th className="text-left px-4 py-2.5">Payload</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-t border-metallic-800/60 hover:bg-metallic-800/30">
                    <td className="px-4 py-2.5 text-metallic-400 whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-medium ${EVENT_COLORS[e.event_type] ?? 'bg-metallic-800 text-metallic-300 border-metallic-700'}`}>
                        {e.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-metallic-300 break-all">
                      {e.payload ? JSON.stringify(e.payload) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
