'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot, BarChart3, Target, Crosshair, History, Bell, Wallet,
  Command as CommandIcon, Activity, Zap, ArrowUpRight, AlertTriangle,
  CandlestickChart,
} from 'lucide-react';
import CommandPalette from '@/components/trading/CommandPalette';
import { fetchEngineStatus, EngineStatus } from '@/services/tradingService';

const TABS = [
  { href: '/trading', label: 'Dashboard', icon: BarChart3 },
  { href: '/trading/chart', label: 'Charts', icon: CandlestickChart },
  { href: '/trading/strategies', label: 'Strategies', icon: Target },
  { href: '/trading/positions', label: 'Positions', icon: Crosshair },
  { href: '/trading/history', label: 'History', icon: History },
  { href: '/trading/alerts', label: 'Alerts', icon: Bell },
  { href: '/trading/accounts', label: 'Accounts', icon: Wallet },
] as const;

function useIsMac() {
  const [mac, setMac] = useState(false);
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform));
    }
  }, []);
  return mac;
}

function useClock() {
  const [time, setTime] = useState<string>('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      const ss = String(d.getUTCSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/trading';
  const isMac = useIsMac();
  const clock = useClock();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [engine, setEngine] = useState<EngineStatus | null>(null);
  const [engineErr, setEngineErr] = useState(false);

  const loadEngine = useCallback(async () => {
    try {
      const s = await fetchEngineStatus();
      setEngine(s);
      setEngineErr(false);
    } catch {
      setEngineErr(true);
    }
  }, []);

  useEffect(() => {
    loadEngine();
    const id = setInterval(loadEngine, 30_000);
    return () => clearInterval(id);
  }, [loadEngine]);

  // Global Cmd/Ctrl+K shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const running = engine?.is_running === true;

  return (
    <div className="min-h-screen bg-metallic-950 flex flex-col">
      {/* ── Top toolbar ─────────────────────────────────────────── */}
      <header className="bg-metallic-900/80 backdrop-blur-sm border-b border-metallic-800/70 sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-4">
          <Link href="/trading" className="flex items-center gap-2 shrink-0 group">
            <Bot className="w-5 h-5 text-primary-400 group-hover:text-primary-300 transition-colors" />
            <span className="text-sm font-semibold text-metallic-100 tracking-wide">
              Trading Workstation
            </span>
          </Link>

          {/* Status pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border ${
              engineErr
                ? 'bg-metallic-800/60 text-metallic-500 border-metallic-700/50'
                : running
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                engineErr ? 'bg-metallic-500' : running ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            {engineErr ? 'Engine: offline' : running ? 'Engine: running' : 'Engine: stopped'}
          </div>

          <div className="flex-1" />

          <span className="hidden md:inline text-[11px] font-mono text-metallic-500">{clock}</span>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-metallic-800 hover:bg-metallic-700 border border-metallic-700/60 text-[11px] text-metallic-400 hover:text-metallic-200 transition-colors"
            aria-label="Open command palette"
          >
            <CommandIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <span className="font-mono px-1 py-0.5 rounded bg-metallic-900 text-metallic-500 border border-metallic-700/40">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </span>
          </button>
        </div>

        {/* ── Module tabs ───────────────────────────────────────── */}
        <div className="border-t border-metallic-800/50">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto">
            {TABS.map(({ href, label, icon: Icon }) => {
              const active = href === '/trading'
                ? pathname === '/trading'
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'text-primary-400 border-primary-400'
                      : 'text-metallic-400 border-transparent hover:text-metallic-200 hover:border-metallic-600/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────── */}
      <main className="flex-1 pb-10">{children}</main>

      {/* ── Bottom status bar ──────────────────────────────────── */}
      <footer className="sticky bottom-0 z-30 bg-metallic-900/95 backdrop-blur-sm border-t border-metallic-800/70">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-7 flex items-center gap-5 text-[11px] text-metallic-500">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                engineErr ? 'bg-metallic-500' : running ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            <span className="text-metallic-400">
              {engineErr ? 'offline' : running ? 'connected' : 'idle'}
            </span>
          </span>
          {engine?.last_cycle_at && (
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              last cycle <span className="text-metallic-300">{new Date(engine.last_cycle_at).toLocaleTimeString()}</span>
            </span>
          )}
          {engine && (
            <>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> signals <span className="text-metallic-300">{engine.signals_today}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3 h-3" /> orders <span className="text-metallic-300">{engine.orders_today}</span>
              </span>
              {engine.errors_today > 0 && (
                <span className="flex items-center gap-1.5 text-red-400">
                  <AlertTriangle className="w-3 h-3" /> errors {engine.errors_today}
                </span>
              )}
            </>
          )}
          <span className="flex-1" />
          <span className="hidden md:inline font-mono">{clock}</span>
        </div>
      </footer>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onRefresh={() => window.location.reload()}
      />
    </div>
  );
}
