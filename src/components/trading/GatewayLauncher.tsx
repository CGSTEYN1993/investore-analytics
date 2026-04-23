'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, AlertCircle, Loader2, Power, CheckCircle2, Settings } from 'lucide-react';
import {
  fetchGatewayStatus, startGateway, GatewayStatus,
} from '@/services/tradingService';

/**
 * Banner that auto-launches IB Gateway when the user enters the Trading
 * platform. Polls status; if the agent is connected and the gateway port
 * isn't open, offers a one-click start button (or auto-clicks it when
 * `auto_launch` is enabled in the agent's local config).
 */
export function GatewayLauncher() {
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [agentOffline, setAgentOffline] = useState(false);
  const autoTriggered = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const s = await fetchGatewayStatus();
      setStatus(s);
      setAgentOffline(false);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Status check failed';
      setStatus(null);
      setAgentOffline(/not connected|503/i.test(msg));
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const launch = useCallback(async () => {
    setLaunching(true);
    setError(null);
    try {
      const res = await startGateway();
      if (!res.ok) setError(res.error || 'Launch failed');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Launch failed');
    } finally {
      setLaunching(false);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  // Auto-launch once per page load if configured.
  useEffect(() => {
    if (autoTriggered.current) return;
    if (!status) return;
    if (status.port_open) return;
    if (!status.auto_launch) return;
    if (!status.configured) return;
    autoTriggered.current = true;
    launch();
  }, [status, launch]);

  // Don't render anything if gateway is up and happy.
  if (status?.port_open) return null;

  if (agentOffline) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 flex-wrap">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">
            Local trading agent is not connected. Start the agent on your computer to enable IB Gateway control.
          </span>
          <Link href="/trading/accounts" className="underline hover:text-amber-100">
            Agent setup
          </Link>
        </div>
      </div>
    );
  }

  if (!status) {
    return loading ? (
      <div className="bg-metallic-900/60 border-b border-metallic-800/50 text-metallic-400 text-xs">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Checking IB Gateway status…
        </div>
      </div>
    ) : null;
  }

  if (!status.configured) {
    return (
      <div className="bg-primary-500/10 border-b border-primary-500/30 text-primary-100 text-xs">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 flex-wrap">
          <Bot className="w-4 h-4 shrink-0" />
          <span className="flex-1">
            IB Gateway auto-launch isn&apos;t configured yet. Add your IBKR credentials to launch Gateway with one click.
          </span>
          <Link
            href="/trading/gateway"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Configure
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-metallic-900/80 border-b border-metallic-800/70 text-metallic-200 text-xs">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 flex-wrap">
        <Power className={`w-4 h-4 shrink-0 ${launching ? 'animate-pulse text-primary-400' : 'text-metallic-500'}`} />
        <span className="flex-1">
          IB Gateway is not running on {status.ib_host}:{status.ib_port} ({status.trading_mode}).
          {error && <span className="ml-2 text-red-400">— {error}</span>}
        </span>
        <button
          onClick={launch}
          disabled={launching}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold transition-colors"
        >
          {launching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Launching… (~60s)
            </>
          ) : (
            <>
              <Power className="w-3.5 h-3.5" /> Launch Gateway
            </>
          )}
        </button>
        <Link
          href="/trading/gateway"
          className="inline-flex items-center gap-1 text-metallic-400 hover:text-metallic-200"
        >
          <Settings className="w-3.5 h-3.5" /> Settings
        </Link>
      </div>
    </div>
  );
}
