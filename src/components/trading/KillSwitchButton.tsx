'use client';

import { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { killSwitch } from '@/services/tradingService';

export function KillSwitchButton() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ paused_strategies: number; cancelled_orders: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setErr(null);
    try {
      const r = await killSwitch();
      setResult({ paused_strategies: r.paused_strategies, cancelled_orders: r.cancelled_orders });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setResult(null); setErr(null); }}
        title="Emergency stop: pauses all strategies and cancels open orders"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold shadow-sm"
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Kill</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="max-w-md w-full rounded-xl border border-red-500/40 bg-metallic-900 p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-metallic-100">Emergency stop</h3>
            </div>

            {!result && !err && (
              <>
                <p className="text-sm text-metallic-300 mb-5">
                  This will:
                </p>
                <ul className="text-sm text-metallic-300 list-disc pl-5 space-y-1 mb-5">
                  <li>Pause <b>all active strategies</b> on your account</li>
                  <li>Cancel <b>every open order</b> (paper and live)</li>
                  <li>Leave open positions untouched (close them manually if needed)</li>
                </ul>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-metallic-700 text-metallic-200 hover:bg-metallic-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={run}
                    disabled={running}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium"
                  >
                    {running && <Loader2 className="w-4 h-4 animate-spin" />}
                    Stop everything
                  </button>
                </div>
              </>
            )}

            {result && (
              <>
                <p className="text-sm text-emerald-300 mb-4">
                  Executed. Paused {result.paused_strategies} strateg{result.paused_strategies === 1 ? 'y' : 'ies'} and cancelled {result.cancelled_orders} order{result.cancelled_orders === 1 ? '' : 's'}.
                </p>
                <div className="flex justify-end">
                  <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-400 text-white">
                    Close
                  </button>
                </div>
              </>
            )}

            {err && (
              <>
                <p className="text-sm text-red-300 mb-4">{err}</p>
                <div className="flex justify-end">
                  <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-metallic-700 text-metallic-200">
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
