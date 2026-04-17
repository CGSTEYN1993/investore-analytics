'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Target, Crosshair, History, Bell, Wallet,
  RefreshCw, Search, X, CornerDownLeft,
} from 'lucide-react';

interface CommandAction {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
  keywords?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function CommandPalette({ open, onClose, onRefresh }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  const actions = useMemo<CommandAction[]>(
    () => [
      { id: 'nav-dashboard', label: 'Go to Dashboard', hint: '/trading', icon: <BarChart3 className="w-4 h-4" />, run: () => router.push('/trading'), keywords: 'dashboard home overview' },
      { id: 'nav-strategies', label: 'Go to Strategies', hint: '/trading/strategies', icon: <Target className="w-4 h-4" />, run: () => router.push('/trading/strategies'), keywords: 'strategies rules algos' },
      { id: 'nav-positions', label: 'Go to Positions', hint: '/trading/positions', icon: <Crosshair className="w-4 h-4" />, run: () => router.push('/trading/positions'), keywords: 'positions open trades portfolio' },
      { id: 'nav-history', label: 'Go to History', hint: '/trading/history', icon: <History className="w-4 h-4" />, run: () => router.push('/trading/history'), keywords: 'history trades past performance' },
      { id: 'nav-alerts', label: 'Go to Alerts', hint: '/trading/alerts', icon: <Bell className="w-4 h-4" />, run: () => router.push('/trading/alerts'), keywords: 'alerts notifications' },
      { id: 'nav-accounts', label: 'Go to Accounts', hint: '/trading/accounts', icon: <Wallet className="w-4 h-4" />, run: () => router.push('/trading/accounts'), keywords: 'accounts paper live brokers' },
      { id: 'nav-analysis', label: 'Open Market Analysis', hint: '/analysis', icon: <BarChart3 className="w-4 h-4" />, run: () => router.push('/analysis'), keywords: 'analysis market explorer research' },
      { id: 'nav-screener', label: 'Open Screener', hint: '/screener', icon: <Search className="w-4 h-4" />, run: () => router.push('/screener'), keywords: 'screener filter universe' },
      ...(onRefresh
        ? [{ id: 'refresh', label: 'Refresh current page', hint: 'F5', icon: <RefreshCw className="w-4 h-4" />, run: () => onRefresh(), keywords: 'refresh reload' } as CommandAction]
        : []),
    ],
    [router, onRefresh],
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return actions;
    const needle = q.toLowerCase();
    return actions.filter(a =>
      a.label.toLowerCase().includes(needle)
      || (a.keywords || '').toLowerCase().includes(needle)
      || (a.hint || '').toLowerCase().includes(needle),
    );
  }, [actions, q]);

  useEffect(() => { setActive(0); }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(filtered.length - 1, i + 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(0, i - 1)); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        const chosen = filtered[active];
        if (chosen) { chosen.run(); onClose(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, active, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-metallic-900 border border-metallic-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-metallic-700/60">
          <Search className="w-4 h-4 text-metallic-500" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent text-sm text-metallic-100 placeholder-metallic-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-metallic-500 hover:text-metallic-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-metallic-500">No matches</div>
          ) : (
            filtered.map((a, i) => (
              <button
                key={a.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => { a.run(); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  i === active
                    ? 'bg-primary-500/15 text-metallic-100'
                    : 'text-metallic-300 hover:bg-metallic-800/60'
                }`}
              >
                <span className={`${i === active ? 'text-primary-400' : 'text-metallic-500'}`}>{a.icon}</span>
                <span className="flex-1">{a.label}</span>
                {a.hint && (
                  <span className="text-[11px] font-mono text-metallic-500">{a.hint}</span>
                )}
                {i === active && <CornerDownLeft className="w-3.5 h-3.5 text-metallic-500" />}
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-metallic-700/60 flex items-center justify-between text-[11px] text-metallic-500">
          <span>↑↓ navigate · ↵ select · esc close</span>
          <span className="font-mono">{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}
