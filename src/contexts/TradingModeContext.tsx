'use client';

/**
 * TradingMode — workstation-wide PAPER vs LIVE toggle.
 *
 * Stored in localStorage so it survives reloads. Always defaults to "paper"
 * for safety. Components consume the mode + a helper that picks the matching
 * trading_account row out of the user's account list.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { TradingAccount } from '@/services/tradingService';

export type TradingMode = 'paper' | 'live';

const STORAGE_KEY = 'investore.trading.mode';

interface TradingModeContextValue {
  mode: TradingMode;
  setMode: (m: TradingMode) => void;
  /** Returns the first account matching the active mode, or null. */
  pickAccount: (accounts: TradingAccount[]) => TradingAccount | null;
  /** Filter helper — only the accounts that match the active mode. */
  filterAccounts: (accounts: TradingAccount[]) => TradingAccount[];
}

const Ctx = createContext<TradingModeContextValue | null>(null);

export function TradingModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<TradingMode>('paper');

  // Hydrate from localStorage once the client mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'live' || raw === 'paper') setModeState(raw);
  }, []);

  const setMode = useCallback((m: TradingMode) => {
    setModeState(m);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const filterAccounts = useCallback(
    (accounts: TradingAccount[]) =>
      accounts.filter(a => (mode === 'paper' ? a.is_paper : !a.is_paper)),
    [mode],
  );

  const pickAccount = useCallback(
    (accounts: TradingAccount[]) => filterAccounts(accounts)[0] ?? null,
    [filterAccounts],
  );

  const value = useMemo(
    () => ({ mode, setMode, pickAccount, filterAccounts }),
    [mode, setMode, pickAccount, filterAccounts],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTradingMode(): TradingModeContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTradingMode must be inside <TradingModeProvider>');
  return v;
}
