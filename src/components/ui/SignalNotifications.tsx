'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Eye, X, ChevronRight,
  Bell, BellOff, RefreshCw
} from 'lucide-react';
import {
  getActiveSignals,
  dismissSignal,
  generateSignals,
  getSignalColor,
  getSignalBgColor,
  InvestmentSignal,
} from '@/services/sentimentSignals';

interface SignalToast {
  signal: InvestmentSignal;
  visible: boolean;
  removing: boolean;
}

/**
 * SignalNotifications — Global notification bell + sliding toast pop-ups
 *
 * Place in the root layout to show investment signal alerts site-wide.
 * Shows a bell icon with unread count badge.
 * On first load (and every 5 minutes), fetches active signals.
 * New signals appear as slide-in toasts from the bottom-right.
 */
export default function SignalNotifications() {
  const [signals, setSignals] = useState<InvestmentSignal[]>([]);
  const [toasts, setToasts] = useState<SignalToast[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const seenIds = useRef<Set<number>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch signals ──
  const fetchSignals = useCallback(async () => {
    try {
      const data = await getActiveSignals(undefined, undefined, undefined, 30);
      setSignals(data.signals);

      // Show toast for new signals (unseen)
      if (!muted) {
        for (const sig of data.signals) {
          if (!seenIds.current.has(sig.id)) {
            seenIds.current.add(sig.id);
            setToasts(prev => [
              ...prev,
              { signal: sig, visible: true, removing: false },
            ]);
          }
        }
      } else {
        // Still mark them seen
        for (const sig of data.signals) {
          seenIds.current.add(sig.id);
        }
      }
    } catch (err) {
      console.debug('Signal fetch failed:', err);
    }
  }, [muted]);

  // Generate + fetch on mount, then poll
  useEffect(() => {
    // Initial: generate new signals then fetch
    (async () => {
      try {
        await generateSignals(30, 2);
      } catch { /* ignore */ }
      fetchSignals();
    })();

    // Poll every 5 minutes
    pollRef.current = setInterval(fetchSignals, 5 * 60 * 1000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSignals]);

  // Auto-remove toasts after 8 seconds
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    toasts.forEach((t) => {
      if (t.visible && !t.removing) {
        const toastId = t.signal.id;
        const timer = setTimeout(() => {
          setToasts(prev =>
            prev.map((toast) =>
              toast.signal.id === toastId ? { ...toast, removing: true } : toast,
            ),
          );
          // Remove from DOM after animation
          const removeTimer = setTimeout(() => {
            setToasts(prev => prev.filter((toast) => toast.signal.id !== toastId));
          }, 400);
          timers.push(removeTimer);
        }, 8000);
        timers.push(timer);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  // ── Handlers ──
  const handleDismiss = async (id: number) => {
    try {
      await dismissSignal(id);
      setSignals(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ }
  };

  const handleDismissToast = (signalId: number) => {
    setToasts(prev =>
      prev.map((t) => (t.signal.id === signalId ? { ...t, removing: true } : t)),
    );
    setTimeout(() => {
      setToasts(prev => prev.filter((t) => t.signal.id !== signalId));
    }, 400);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await generateSignals(30, 2);
      await fetchSignals();
    } catch { /* ignore */ }
    setLoading(false);
  };

  const investCount = signals.filter(s => s.signal_type === 'invest').length;
  const divestCount = signals.filter(s => s.signal_type === 'divest').length;
  const totalActive = signals.length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'invest':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'divest':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Eye className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <>
      {/* ── Bell Button (fixed position) ── */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
        {/* Toast stack */}
        <div className="flex flex-col gap-2 mb-2 max-w-sm w-80">
          {toasts.slice(-3).map((toast) => (
            <div
              key={`toast-${toast.signal.id}`}
              className={`
                border rounded-xl p-3 shadow-2xl backdrop-blur-md
                transform transition-all duration-400 cursor-pointer
                ${getSignalBgColor(toast.signal.signal_type)}
                ${toast.removing
                  ? 'translate-x-full opacity-0'
                  : 'translate-x-0 opacity-100 animate-slide-in-right'}
              `}
              onClick={() => {
                handleDismissToast(toast.signal.id);
                setPanelOpen(true);
              }}
            >
              <div className="flex items-start gap-2">
                {getIcon(toast.signal.signal_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {toast.signal.headline}
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                    {toast.signal.reasoning}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`/company/${toast.signal.ticker}`}
                      className="text-xs text-amber-400 hover:text-amber-300 font-mono"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {toast.signal.ticker} →
                    </a>
                    <span className="text-xs text-slate-500">
                      {toast.signal.signal_strength}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDismissToast(toast.signal.id); }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bell button */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="relative p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full shadow-lg transition-all hover:scale-105"
        >
          {muted ? (
            <BellOff className="w-5 h-5 text-slate-400" />
          ) : (
            <Bell className="w-5 h-5 text-amber-400" />
          )}
          {totalActive > 0 && !muted && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {totalActive > 9 ? '9+' : totalActive}
            </span>
          )}
        </button>
      </div>

      {/* ── Signal Panel (slide-up from bottom-right) ── */}
      {panelOpen && (
        <>
          {/* Click-outside overlay to close panel */}
          <div
            className="fixed inset-0 z-[58]"
            onClick={() => setPanelOpen(false)}
          />
          <div className="fixed bottom-20 right-6 z-[59] w-96 max-h-[70vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Investment Signals
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {investCount} buy • {divestCount} sell • {signals.filter(s => s.signal_type === 'watch').length} watch
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                title="Refresh signals"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setMuted(!muted)}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                title={muted ? 'Unmute notifications' : 'Mute notifications'}
              >
                {muted ? (
                  <BellOff className="w-4 h-4 text-slate-500" />
                ) : (
                  <Bell className="w-4 h-4 text-amber-400" />
                )}
              </button>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Signal List */}
          <div className="overflow-y-auto max-h-[calc(70vh-80px)] divide-y divide-slate-800">
            {signals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No active signals. Check back later.
              </div>
            ) : (
              signals.map(sig => (
                <a
                  key={sig.id}
                  href={`/company/${sig.ticker}`}
                  className={`block p-3 hover:bg-slate-800/50 transition-colors cursor-pointer ${getSignalBgColor(sig.signal_type).replace('border-', 'border-l-2 border-l-')}`}
                >
                  <div className="flex items-start gap-2">
                    {getIcon(sig.signal_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {sig.ticker}
                        </span>
                        <span className="text-xs text-slate-500">{sig.exchange}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          sig.signal_type === 'invest'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : sig.signal_type === 'divest'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {sig.signal_type.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500">{sig.signal_strength}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {sig.reasoning}
                      </p>
                      {sig.triggers && sig.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {sig.triggers.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        {sig.sentiment_score !== null && (
                          <span>Sentiment: {sig.sentiment_score.toFixed(2)}</span>
                        )}
                        {sig.sentiment_shift !== null && (
                          <span className={sig.sentiment_shift > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            Shift: {sig.sentiment_shift > 0 ? '+' : ''}{sig.sentiment_shift.toFixed(2)}
                          </span>
                        )}
                        <span>{sig.news_count_7d} news/7d</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDismiss(sig.id); }}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
        </>
      )}
    </>
  );
}
