'use client';

/**
 * AccountHeader — live broker account summary bar.
 *
 * Polls /accounts/{id}/summary every 10s for the selected account
 * and surfaces NetLiquidation, BuyingPower, AvailableFunds, GrossPositionValue
 * + a tiny live indicator. Lets the user switch accounts inline.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Briefcase, DollarSign, TrendingUp, Wallet, Zap } from 'lucide-react';
import { fetchAccountSummary, AccountSummary, TradingAccount } from '@/services/tradingService';

const POLL_MS = 10_000;

function fmt(n: number | string | null | undefined, digits = 0): string {
  if (n == null || n === '') return '—';
  const v = typeof n === 'number' ? n : Number(n);
  if (!isFinite(v)) return '—';
  return v.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function AccountHeader({ accounts }: { accounts: TradingAccount[] }) {
  const [accountId, setAccountId] = useState<number | null>(accounts[0]?.id ?? null);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTick, setLastTick] = useState<Date | null>(null);

  const account = useMemo(
    () => accounts.find(a => a.id === accountId) ?? null,
    [accounts, accountId],
  );

  const load = useCallback(async (showSpinner = false) => {
    if (accountId == null) return;
    if (showSpinner) setLoading(true);
    try {
      const s = await fetchAccountSummary(accountId);
      setSummary(s);
      setLastTick(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Summary failed');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    load(true);
    const t = setInterval(() => load(false), POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  if (!account) return null;

  const f = summary?.fields ?? {};
  const ccy = summary?.currency || account.base_currency || 'USD';

  return (
    <div className="rounded-xl border border-metallic-700/50 bg-gradient-to-b from-metallic-900/80 to-metallic-900/40 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-metallic-800">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary-400" />
          {accounts.length > 1 ? (
            <select
              value={accountId ?? ''}
              onChange={e => setAccountId(Number(e.target.value))}
              className="px-2 py-1 text-sm bg-transparent text-metallic-100 font-semibold focus:outline-none cursor-pointer"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id} className="bg-metallic-900">
                  {a.account_name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-semibold text-metallic-100">{account.account_name}</span>
          )}
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-metallic-800 text-metallic-400">
            {account.broker}
          </span>
          {account.is_paper ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-amber-500/15 text-amber-400">paper</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-500/15 text-emerald-400">live</span>
          )}
          <span className="text-[10px] text-metallic-500 font-mono">{ccy}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-metallic-500">
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <>
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{lastTick ? `updated ${lastTick.toLocaleTimeString()}` : 'connecting…'}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-metallic-800/50">
        <Cell
          icon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
          label="Net Liquidation"
          value={fmt(f.NetLiquidation ?? f.NetLiquidationValue ?? account.current_balance, 2)}
          ccy={ccy}
          large
        />
        <Cell
          icon={<Zap className="w-3.5 h-3.5 text-primary-400" />}
          label="Buying Power"
          value={fmt(f.BuyingPower, 0)}
          ccy={ccy}
        />
        <Cell
          icon={<Wallet className="w-3.5 h-3.5 text-amber-400" />}
          label="Available Funds"
          value={fmt(f.AvailableFunds ?? f.TotalCashValue, 0)}
          ccy={ccy}
        />
        <Cell
          icon={<TrendingUp className="w-3.5 h-3.5 text-diamond-400" />}
          label="Gross Position"
          value={fmt(f.GrossPositionValue, 0)}
          ccy={ccy}
        />
      </div>
    </div>
  );
}

function Cell({
  icon, label, value, ccy, large,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ccy: string;
  large?: boolean;
}) {
  return (
    <div className="px-4 py-3 bg-metallic-900/60 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-metallic-500">
        {icon}
        {label}
      </div>
      <div className={`font-mono font-semibold text-metallic-100 ${large ? 'text-lg' : 'text-sm'}`}>
        {value === '—' ? <span className="text-metallic-600">—</span> : (
          <>
            <span className="text-metallic-500 mr-1 text-[10px] font-normal">{ccy}</span>
            {value}
          </>
        )}
      </div>
    </div>
  );
}
