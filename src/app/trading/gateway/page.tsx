'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bot, Save, Trash2, Power, Loader2, AlertCircle, CheckCircle2, FolderOpen, Lock, Eye, EyeOff } from 'lucide-react';
import {
  fetchGatewayConfig, fetchGatewayStatus, updateGatewayConfig,
  startGateway, clearGatewayCredentials,
  GatewayConfig, GatewayStatus,
} from '@/services/tradingService';

export default function GatewaySettingsPage() {
  const [cfg, setCfg] = useState<GatewayConfig | null>(null);
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [agentOffline, setAgentOffline] = useState(false);

  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setAgentOffline(false);
    try {
      const [c, s] = await Promise.all([fetchGatewayConfig(), fetchGatewayStatus()]);
      setCfg(c);
      setStatus(s);
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Failed to reach agent';
      setAgentOffline(/not connected|503/i.test(m));
      setMsg({ kind: 'err', text: m });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!cfg) return;
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ibc_path: cfg.ibc_path,
        gateway_path: cfg.gateway_path,
        trading_mode: cfg.trading_mode,
        username: cfg.username,
        ib_host: cfg.ib_host,
        ib_port: cfg.ib_port,
        auto_launch: cfg.auto_launch,
        ...(password ? { password } : {}),
      };
      await updateGatewayConfig(payload);
      setMsg({ kind: 'ok', text: 'Saved.' });
      setPassword('');
      await load();
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const launch = async () => {
    setLaunching(true);
    setMsg(null);
    try {
      const r = await startGateway();
      setMsg(r.ok
        ? { kind: 'ok', text: r.message || 'Gateway launched.' }
        : { kind: 'err', text: r.error || 'Launch failed' });
      await load();
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Launch failed' });
    } finally {
      setLaunching(false);
    }
  };

  const clearCreds = async () => {
    if (!confirm('Remove stored IBKR credentials from this computer?')) return;
    try {
      await clearGatewayCredentials();
      setPassword('');
      await load();
      setMsg({ kind: 'ok', text: 'Credentials cleared.' });
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Clear failed' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-metallic-400 flex items-center gap-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading agent settings…
      </div>
    );
  }

  if (agentOffline || !cfg) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5 text-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">Local trading agent is not connected.</p>
              <p className="text-sm text-amber-200/80">
                Start the <code className="font-mono bg-amber-900/30 px-1 rounded">investore-agent</code> process on the
                Windows machine where IB Gateway is installed, then refresh this page.
              </p>
              {msg && <p className="text-xs mt-2 text-amber-300">{msg.text}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fieldCls =
    'w-full px-3 py-2 bg-metallic-900 border border-metallic-700 rounded-md text-sm text-metallic-100 placeholder-metallic-600 focus:border-primary-500 focus:outline-none';
  const labelCls = 'text-xs font-semibold uppercase tracking-wider text-metallic-400 mb-1.5 block';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Bot className="w-6 h-6 text-primary-400" />
        <h1 className="text-2xl font-bold text-metallic-100">IB Gateway</h1>
      </div>
      <p className="text-sm text-metallic-400 mb-6">
        Auto-launch Interactive Brokers Gateway from this app and store your IBKR credentials encrypted on your local
        machine. Credentials never leave your computer.
      </p>

      {/* ── Status card ──────────────────────────────────────────── */}
      <div className="bg-metallic-900/60 border border-metallic-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-metallic-100">Status</h2>
          <span className={`text-xs px-2 py-1 rounded font-mono ${
            status?.port_open ? 'bg-emerald-500/15 text-emerald-300' : 'bg-metallic-800 text-metallic-400'
          }`}>
            {status?.port_open ? `CONNECTED · ${status.ib_host}:${status.ib_port}` : 'DISCONNECTED'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <StatRow label="API port reachable" ok={!!status?.port_open} />
          <StatRow label="Gateway process running" ok={!!status?.process_running} />
          <StatRow label="Credentials stored" ok={!!status?.has_password && !!status?.has_username} />
          <StatRow label="IBC path configured" ok={!!status?.ibc_path} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={launch}
            disabled={launching || !status?.configured}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
          >
            {launching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
            {launching ? 'Launching…' : 'Launch Gateway'}
          </button>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-metallic-800 hover:bg-metallic-700 text-metallic-200 text-xs font-semibold transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ── Settings form ────────────────────────────────────────── */}
      <div className="bg-metallic-900/60 border border-metallic-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-metallic-100">Configuration</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Trading mode</label>
            <select
              value={cfg.trading_mode}
              onChange={e => setCfg({ ...cfg, trading_mode: e.target.value as 'paper' | 'live' })}
              className={fieldCls}
            >
              <option value="paper">Paper</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Auto-launch on Trading entry</label>
            <select
              value={cfg.auto_launch ? 'on' : 'off'}
              onChange={e => setCfg({ ...cfg, auto_launch: e.target.value === 'on' })}
              className={fieldCls}
            >
              <option value="on">Enabled</option>
              <option value="off">Disabled</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            <FolderOpen className="w-3.5 h-3.5 inline mr-1" /> IBC install folder
          </label>
          <input
            type="text"
            value={cfg.ibc_path}
            onChange={e => setCfg({ ...cfg, ibc_path: e.target.value })}
            placeholder="C:\\IBC"
            className={fieldCls + ' font-mono'}
          />
          <p className="text-xs text-metallic-500 mt-1">
            Folder containing <code>StartGateway.bat</code>. Install IBC from{' '}
            <a href="https://github.com/IbcAlpha/IBC/releases" target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">
              IbcAlpha/IBC
            </a>
            .
          </p>
        </div>

        <div>
          <label className={labelCls}>
            <FolderOpen className="w-3.5 h-3.5 inline mr-1" /> IB Gateway folder (optional)
          </label>
          <input
            type="text"
            value={cfg.gateway_path}
            onChange={e => setCfg({ ...cfg, gateway_path: e.target.value })}
            placeholder="C:\\Jts\\ibgateway\\1019"
            className={fieldCls + ' font-mono'}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>IB API host</label>
            <input
              type="text"
              value={cfg.ib_host}
              onChange={e => setCfg({ ...cfg, ib_host: e.target.value })}
              className={fieldCls + ' font-mono'}
            />
          </div>
          <div>
            <label className={labelCls}>IB API port</label>
            <input
              type="number"
              value={cfg.ib_port}
              onChange={e => setCfg({ ...cfg, ib_port: parseInt(e.target.value || '0', 10) })}
              className={fieldCls + ' font-mono'}
            />
            <p className="text-xs text-metallic-500 mt-1">4002 = paper, 4001 = live.</p>
          </div>
        </div>

        <hr className="border-metallic-800" />

        <div className="flex items-center gap-2 text-xs text-metallic-400">
          <Lock className="w-3.5 h-3.5" /> Credentials are encrypted with a key stored only on this machine.
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>IBKR username</label>
            <input
              type="text"
              value={cfg.username}
              onChange={e => setCfg({ ...cfg, username: e.target.value })}
              autoComplete="off"
              className={fieldCls + ' font-mono'}
            />
          </div>
          <div>
            <label className={labelCls}>
              IBKR password {cfg.has_password && <span className="text-emerald-400 font-normal">· stored</span>}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={cfg.has_password ? '•••••••• (leave blank to keep)' : 'Enter password'}
                autoComplete="new-password"
                className={fieldCls + ' font-mono pr-9'}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-metallic-500 hover:text-metallic-200"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {msg && (
          <div className={`text-sm rounded px-3 py-2 ${
            msg.kind === 'ok'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-300 border border-red-500/30'
          }`}>
            {msg.text}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={clearCreds}
            disabled={!cfg.has_password && !cfg.username}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 text-red-300 text-xs font-semibold transition-colors border border-red-500/30"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear credentials
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between bg-metallic-900/40 border border-metallic-800 rounded px-3 py-2">
      <span className="text-metallic-300">{label}</span>
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-metallic-600" />
      )}
    </div>
  );
}
