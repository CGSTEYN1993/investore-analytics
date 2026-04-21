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
  // accountId === 'all' means: aggregate across all visible accounts.
  type Selection = number | 'all';
  const [accountId, setAccountId] = useState<Selection>(
    accounts.length > 1 ? 'all' : (accounts[0]?.id ?? 0),
  );
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [aggregate, setAggregate] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTick, setLastTick] = useState<Date | null>(null);

  const account = useMemo(
    () => (accountId === 'all' ? null : accounts.find(a => a.id === accountId) ?? null),
    [accounts, accountId],
  );

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      if (accountId === 'all') {
        // Aggregate across every visible account
        const parts = await Promise.all(
          accounts.map(a => fetchAccountSummary(a.id).catch(() => null)),
        );
        const fields: Record<string, number> = {};
        const TAGS = [
          'NetLiquidation', 'TotalCashValue', 'BuyingPower',
          'AvailableFunds', 'GrossPositionValue', 'UnrealizedPnL',
        ];
        for (const tag of TAGS) fields[tag] = 0;
        let ccy: string | null = null;
        for (const s of parts) {
          if (!s) continue;
          ccy = ccy ?? s.currency ?? null;
          const f = (s.fields ?? {}) as Record<string, unknown>;
          for (const tag of TAGS) {
            const v = f[tag] ?? f[`${tag}Value`];
            const n = typeof v === 'number' ? v : Number(v);
            if (Number.isFinite(n)) fields[tag] += n;
          }
        }
        setAggregate({
          account_id: 0,
          broker: 'aggregate',
          currency: ccy ?? accounts[0]?.base_currency ?? 'USD',
          is_live: false,
          fields,
        } as AccountSummary);
        setSummary(null);
      } else {
        const s = await fetchAccountSummary(accountId);
        setSummary(s);
        setAggregate(null);
      }
      setLastTick(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Summary failed');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [accountId, accounts]);

  useEffect(() => {
    load(true);
    const t = setInterval(() => load(false), POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  if (accounts.length === 0) return null;

  const view = accountId === 'all' ? aggregate : summary;
  const f = view?.fields ?? {};
  const ccy = view?.currency || account?.base_currency || accounts[0]?.base_currency || 'USD';
  const isPaperOnly = accounts.every(a => a.is_paper);
  const accountLabel =
    accountId === 'all'
      ? `All ${accounts.length} ${isPaperOnly ? 'paper ' : ''}accounts`
      : (account?.account_name ?? '—');
  const brokerLabel = accountId === 'all' ? 'aggregate' : (account?.broker ?? '—');
  const showLiveBadge = accountId !== 'all' && account && !account.is_paper;

  return (
    <div className="rounded-xl border border-metallic-700/50 bg-gradient-to-b from-metallic-900/80 to-metallic-900/40 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-metallic-800">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary-400" />
          {accounts.length > 1 ? (
            <select
              value={String(accountId)}
              onChange={e => {
                const v = e.target.value;
                setAccountId(v === 'all' ? 'all' : Number(v));
              }}
              className="px-2 py-1 text-sm bg-transparent text-metallic-100 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-metallic-900">All accounts ({accounts.length})</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id} className="bg-metallic-900">
                  {a.account_name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-semibold text-metallic-100">{accountLabel}</span>
          )}
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-metallic-800 text-metallic-400">
            {brokerLabel}
          </span>
          {accountId !== 'all' && (
            account?.is_paper ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-amber-500/15 text-amber-400">paper</span>
            ) : showLiveBadge ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-500/15 text-emerald-400">live</span>
            ) : null
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
          value={fmt(
            f.NetLiquidation ?? f.NetLiquidationValue ?? (account?.current_balance ?? 0),
            2,
          )}
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
