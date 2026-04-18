'use client';

/**
 * TradingModeSwitch — pill toggle for PAPER ⇄ LIVE.
 *
 * Live mode requires a typed-confirmation modal so users can't accidentally
 * route a market order at their real money. Also surfaces:
 *   • whether a trading_account exists for the requested mode
 *   • whether the IB Gateway behind that account is currently reachable
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, FlaskConical, Zap, Plus, X, CheckCircle2, XCircle } from 'lucide-react';
import { useTradingMode } from '@/contexts/TradingModeContext';
import {
  TradingAccount,
  BrokerStatus,
  fetchBrokerStatus,
  createAccount,
} from '@/services/tradingService';

interface Props {
  accounts: TradingAccount[];
  onAccountCreated?: () => void;
}

export function TradingModeSwitch({ accounts, onAccountCreated }: Props) {
  const { mode, setMode, pickAccount } = useTradingMode();
  const [confirmLive, setConfirmLive] = useState(false);
  const [createMissing, setCreateMissing] = useState<'paper' | 'live' | null>(null);
  const [status, setStatus] = useState<BrokerStatus | null>(null);

  const activeAccount = pickAccount(accounts);

  // Poll the broker status for the active account every 15s.
  useEffect(() => {
    setStatus(null);
    if (!activeAccount) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const s = await fetchBrokerStatus(activeAccount.id);
        if (!cancelled) setStatus(s);
      } catch {
        if (!cancelled) setStatus(null);
      }
    };
    tick();
    const t = setInterval(tick, 15_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [activeAccount?.id]);

  const handleSwitch = (target: 'paper' | 'live') => {
    if (target === mode) return;
    if (target === 'live') {
      setConfirmLive(true);
    } else {
      setMode('paper');
    }
  };

  const isPaper = mode === 'paper';
  const hasAccountForMode = !!activeAccount;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {/* Toggle */}
        <div className="flex rounded-lg border border-metallic-700 overflow-hidden">
          <button
            onClick={() => handleSwitch('paper')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-colors ${
              isPaper
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-metallic-800 text-metallic-400 hover:text-metallic-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            PAPER
          </button>
          <button
            onClick={() => handleSwitch('live')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-colors ${
              !isPaper
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-metallic-800 text-metallic-400 hover:text-metallic-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            LIVE
          </button>
        </div>

        {/* Status pill */}
        {hasAccountForMode ? (
          <div className="flex items-center gap-2 text-[11px] text-metallic-400">
            {status?.reachable ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : status === null ? (
              <span className="w-2 h-2 rounded-full bg-metallic-600 animate-pulse" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="font-mono">
              {activeAccount?.account_name} · {activeAccount?.broker}
              {status?.host && status?.port ? ` · ${status.host}:${status.port}` : ''}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setCreateMissing(mode)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] rounded border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add {mode.toUpperCase()} account
          </button>
        )}

        {/* Reachability warning */}
        {hasAccountForMode && status && !status.reachable && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded bg-red-500/10 text-red-300 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span className="max-w-md truncate" title={status.message}>{status.message}</span>
          </div>
        )}
      </div>

      {/* LIVE confirm */}
      {confirmLive && (
        <ConfirmLiveModal
          onCancel={() => setConfirmLive(false)}
          onConfirm={() => { setMode('live'); setConfirmLive(false); }}
        />
      )}

      {/* Create-missing modal */}
      {createMissing && (
        <CreateAccountModal
          mode={createMissing}
          onClose={() => setCreateMissing(null)}
          onCreated={() => { setCreateMissing(null); onAccountCreated?.(); }}
        />
      )}
    </>
  );
}

// ─── Confirm-live modal ────────────────────────────────────────────────────

function ConfirmLiveModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [typed, setTyped] = useState('');
  const ok = typed.trim().toUpperCase() === 'GO LIVE';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-metallic-900 border border-emerald-500/40 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-metallic-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-metallic-100">Switch to LIVE trading</span>
          </div>
          <button onClick={onCancel} className="text-metallic-500 hover:text-metallic-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-200 leading-relaxed">
              Orders placed in this workstation will be routed to your <b>real</b> IBKR account
              and use real money. Hotkey trades are still active.
              <br />
              Make sure your IB Gateway is logged in to your <b>live</b> account
              (default port <code className="font-mono">4001</code>).
            </div>
          </div>
          <label className="block text-xs text-metallic-400">
            Type <code className="font-mono text-metallic-200">GO LIVE</code> to confirm:
          </label>
          <input
            autoFocus
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && ok) onConfirm(); }}
            className="w-full px-3 py-2 text-sm rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-100 font-mono focus:border-emerald-500 focus:outline-none"
            placeholder="GO LIVE"
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-metallic-800">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-lg bg-metallic-800 text-metallic-300 hover:bg-metallic-700 transition-colors"
          >Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!ok}
            className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >Go live</button>
        </div>
      </div>
    </div>
  );
}

// ─── Create paper/live account modal ───────────────────────────────────────

function CreateAccountModal({
  mode, onClose, onCreated,
}: { mode: 'paper' | 'live'; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState(mode === 'paper' ? 'IB Paper' : 'IB Live');
  const [broker, setBroker] = useState<'ib_native' | 'ib_agent' | 'paper'>(
    mode === 'paper' ? 'ib_native' : 'ib_native',
  );
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState<number>(mode === 'paper' ? 4002 : 4001);
  const [clientId, setClientId] = useState<number>(11);
  const [ibAccount, setIbAccount] = useState('');
  const [agentId, setAgentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createAccount({
        account_name: name,
        broker,
        is_paper: mode === 'paper',
        initial_balance: 100_000,
        base_currency: 'USD',
        ...(broker !== 'paper' ? {
          broker_host: host,
          broker_port: port,
          broker_client_id: clientId,
          broker_account_id: ibAccount || undefined,
        } : {}),
        ...(broker === 'ib_agent' ? { broker_agent_id: agentId } : {}),
      // createAccount accepts a permissive body shape via the spread above
      // even though its TypeScript signature is narrower.
      } as Parameters<typeof createAccount>[0]);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-metallic-900 border border-metallic-700 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-metallic-800">
          <div className="flex items-center gap-2">
            {mode === 'paper'
              ? <FlaskConical className="w-5 h-5 text-amber-400" />
              : <Zap className="w-5 h-5 text-emerald-400" />}
            <span className="text-sm font-semibold text-metallic-100">
              Add {mode.toUpperCase()} account
            </span>
          </div>
          <button onClick={onClose} className="text-metallic-500 hover:text-metallic-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Name">
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Broker">
            <select value={broker} onChange={e => setBroker(e.target.value as typeof broker)} className={inputCls}>
              <option value="ib_native">IB native (local Gateway)</option>
              <option value="ib_agent">IB via agent (cloud relay)</option>
              <option value="paper">Internal paper trader</option>
            </select>
          </Field>

          {broker !== 'paper' && (
            <>
              <Field label="IB account #">
                <input
                  value={ibAccount}
                  onChange={e => setIbAccount(e.target.value.toUpperCase())}
                  placeholder={mode === 'paper' ? 'DUxxxxxx' : 'Uxxxxxx'}
                  className={`${inputCls} font-mono uppercase`}
                />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Host"><input value={host} onChange={e => setHost(e.target.value)} className={inputCls} /></Field>
                <Field label="Port"><input type="number" value={port} onChange={e => setPort(Number(e.target.value))} className={`${inputCls} font-mono`} /></Field>
                <Field label="Client id"><input type="number" value={clientId} onChange={e => setClientId(Number(e.target.value))} className={`${inputCls} font-mono`} /></Field>
              </div>
              <p className="text-[10px] text-metallic-500">
                IB Gateway default ports: <code className="font-mono">4002</code> paper · <code className="font-mono">4001</code> live.
                TWS: <code className="font-mono">7497</code> / <code className="font-mono">7496</code>.
              </p>
            </>
          )}

          {broker === 'ib_agent' && (
            <Field label="Agent id">
              <input value={agentId} onChange={e => setAgentId(e.target.value)} placeholder="my-trading-pc" className={inputCls} />
            </Field>
          )}

          {error && (
            <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded p-2">{error}</div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-metallic-800">
          <button onClick={onClose} className="px-4 py-1.5 text-sm rounded-lg bg-metallic-800 text-metallic-300 hover:bg-metallic-700">Cancel</button>
          <button onClick={submit} disabled={submitting} className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50">
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-3 py-1.5 text-sm rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-100 focus:border-primary-500 focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-metallic-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
