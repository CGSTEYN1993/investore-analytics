'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute, getTokens } from '@/components/providers/AuthProvider';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API = `${RAILWAY_API_URL}/api/v1/extraction`;

type Status = 'pending' | 'approved' | 'auto_approved' | 'rejected' | 'all';

interface QueueEntry {
  id: number;
  document_id: string;
  symbol: string | null;
  project_id: number | null;
  document_type: string | null;
  overall_confidence: number;
  status: string;
  model_id: string | null;
  prompt_version: string | null;
  reviewer_email: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  merged_at: string | null;
  created_at: string;
  payload: Record<string, unknown>;
}

interface QueueListResponse {
  items: QueueEntry[];
  total: number;
  pending: number;
  auto_approved_today: number;
  rejected_today: number;
}

interface Metrics {
  window_hours: number;
  model_id: string;
  prompt_version: string;
  daily_budget_usd: number;
  auto_approve_threshold: number;
  spend_today_usd: number;
  budget_remaining_usd: number;
  calls_total: number;
  calls_success: number;
  calls_failed: number;
  p50_latency_ms: number | null;
  p95_latency_ms: number | null;
  avg_input_tokens: number | null;
  avg_output_tokens: number | null;
  avg_cost_usd: number | null;
  queue_pending: number;
  queue_auto_approved: number;
  queue_approved: number;
  queue_rejected: number;
  approval_rate_pct: number | null;
}

function authHeaders(): HeadersInit {
  const { accessToken } = getTokens();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === 'pending' ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
      : status === 'approved' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
      : status === 'auto_approved' ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
      : status === 'rejected' ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
      : 'bg-slate-500/15 text-slate-300 border-slate-500/40';
  return (
    <span className={`px-2 py-0.5 text-xs uppercase tracking-wide rounded border ${color}`}>
      {status}
    </span>
  );
}

function MetricsBar({ m }: { m: Metrics | null }) {
  if (!m) return null;
  const tiles: Array<[string, string]> = [
    ['Spend today', `$${m.spend_today_usd.toFixed(4)} / $${m.daily_budget_usd.toFixed(2)}`],
    ['Budget remaining', `$${m.budget_remaining_usd.toFixed(4)}`],
    ['Auto-approve ≥', `${(m.auto_approve_threshold * 100).toFixed(0)}%`],
    ['Calls 24h', `${m.calls_total} (${m.calls_failed} failed)`],
    ['P50 / P95 latency', `${m.p50_latency_ms ?? '—'} / ${m.p95_latency_ms ?? '—'} ms`],
    ['Avg cost / call', m.avg_cost_usd !== null ? `$${m.avg_cost_usd.toFixed(4)}` : '—'],
    ['Pending', String(m.queue_pending)],
    ['Approval rate', m.approval_rate_pct !== null ? `${m.approval_rate_pct}%` : '—'],
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {tiles.map(([label, value]) => (
        <div key={label} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
          <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
        </div>
      ))}
      <div className="col-span-2 md:col-span-4 lg:col-span-8 text-xs text-slate-500">
        Model: <span className="text-slate-300">{m.model_id}</span> · Prompt: {m.prompt_version}
      </div>
    </div>
  );
}

function PayloadView({ payload }: { payload: Record<string, unknown> }) {
  return (
    <pre className="text-xs text-slate-200 bg-slate-900/80 border border-slate-700 rounded p-3 overflow-auto max-h-[500px]">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}

function ExtractionsInner() {
  const [statusFilter, setStatusFilter] = useState<Status>('pending');
  const [symbol, setSymbol] = useState('');
  const [list, setList] = useState<QueueListResponse | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [selected, setSelected] = useState<QueueEntry | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setError(null);
    try {
      const params = new URLSearchParams({ status: statusFilter, limit: '100' });
      if (symbol.trim()) params.set('symbol', symbol.trim().toUpperCase());
      const r = await fetch(`${API}/queue?${params}`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      setList(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [statusFilter, symbol]);

  const loadMetrics = useCallback(async () => {
    try {
      const r = await fetch(`${API}/metrics?hours=24`, { headers: authHeaders() });
      if (r.ok) setMetrics(await r.json());
    } catch {
      /* non-critical */
    }
  }, []);

  useEffect(() => {
    loadList();
    loadMetrics();
  }, [loadList, loadMetrics]);

  const approve = async (id: number) => {
    setBusy(true); setError(null);
    try {
      const r = await fetch(`${API}/queue/${id}/approve`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || null }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      setSelected(null); setNotes('');
      await loadList(); await loadMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const reject = async (id: number) => {
    if (!notes.trim()) { setError('Add notes explaining the rejection.'); return; }
    setBusy(true); setError(null);
    try {
      const r = await fetch(`${API}/queue/${id}/reject`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      setSelected(null); setNotes('');
      await loadList(); await loadMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const rowSummary = useMemo(() => (e: QueueEntry) => {
    const p = e.payload as Record<string, unknown>;
    const res = Array.isArray(p.resources) ? (p.resources as unknown[]).length : 0;
    const rsv = Array.isArray(p.reserves) ? (p.reserves as unknown[]).length : 0;
    const econ = p.economics ? 1 : 0;
    return `${res} res · ${rsv} rsv · ${econ} econ`;
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">LLM Extraction Review</h1>
          <p className="text-sm text-slate-400">
            Claude Opus extractions awaiting approval before merging into <code>extracted_*</code> tables.
          </p>
        </div>
        <button
          onClick={() => { loadList(); loadMetrics(); }}
          className="px-3 py-1.5 text-xs border border-slate-600 rounded hover:bg-slate-800"
        >
          Refresh
        </button>
      </header>

      <MetricsBar m={metrics} />

      <div className="flex flex-wrap gap-2 items-center mb-4">
        {(['pending', 'auto_approved', 'approved', 'rejected', 'all'] as Status[]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded border ${
              statusFilter === s
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          placeholder="symbol filter (e.g. BHP.AX)"
          className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
        />
        <button
          onClick={loadList}
          className="px-3 py-1.5 text-xs border border-slate-700 rounded hover:bg-slate-800"
        >
          Apply
        </button>
        {list && (
          <span className="text-xs text-slate-500 ml-auto">
            Showing {list.items.length} · {list.pending} pending · {list.auto_approved_today} auto today
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-900/30 border border-rose-700 rounded text-rose-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="text-left px-3 py-2">Symbol / Doc</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-right px-3 py-2">Conf</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {list?.items.map(e => (
                <tr
                  key={e.id}
                  onClick={() => { setSelected(e); setNotes(''); }}
                  className={`border-t border-slate-800 cursor-pointer hover:bg-slate-800/50 ${
                    selected?.id === e.id ? 'bg-slate-800/70' : ''
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-100">{e.symbol || '—'}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[260px]" title={e.document_id}>
                      {e.document_id}
                    </div>
                    <div className="text-[10px] text-slate-600">{rowSummary(e)}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-300">{e.document_type || '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {(e.overall_confidence * 100).toFixed(0)}%
                  </td>
                  <td className="px-3 py-2"><StatusPill status={e.status} /></td>
                </tr>
              ))}
              {list?.items.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">No entries.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <h2 className="font-semibold">
                    {selected.symbol || '—'} <span className="text-xs text-slate-500">#{selected.id}</span>
                  </h2>
                  <div className="text-xs text-slate-500">
                    {selected.document_type} · created {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <PayloadView payload={selected.payload} />

              {selected.status === 'pending' && (
                <div className="mt-4">
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Reviewer notes (required for reject)"
                    rows={2}
                    className="w-full text-sm bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      disabled={busy}
                      onClick={() => approve(selected.id)}
                      className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded text-white disabled:opacity-50"
                    >
                      Approve & merge
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => reject(selected.id)}
                      className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-500 rounded text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {selected.reviewer_email && (
                <div className="mt-4 text-xs text-slate-500">
                  Reviewed by {selected.reviewer_email}
                  {selected.reviewed_at && ` · ${new Date(selected.reviewed_at).toLocaleString()}`}
                  {selected.reviewer_notes && <div className="mt-1 italic">{selected.reviewer_notes}</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
              Select an entry on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExtractionsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ExtractionsInner />
    </ProtectedRoute>
  );
}
