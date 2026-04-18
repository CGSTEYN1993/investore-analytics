'use client';

/**
 * Order Ticket — fast manual order entry with hotkeys.
 *
 * Hotkeys (when modal is OPEN):
 *   B / S       toggle side (Buy / Sell)
 *   M / L       toggle order type (Market / Limit)
 *   Enter       submit
 *   Esc         close
 *
 * Hotkeys (when modal is CLOSED) are wired by the parent page via
 * <OrderTicketHotkeys/> below — pressing B or S anywhere on the
 * dashboard pops the ticket pre-filled with that side.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Loader2, AlertCircle } from 'lucide-react';
import {
  submitManualOrder,
  fetchUniverse,
  TradingAccount,
  TradingOrder,
  UniverseItem,
} from '@/services/tradingService';

const EXCHANGES = ['SMART', 'NYSE', 'NASDAQ', 'ASX', 'TSX', 'TSXV', 'LSE', 'JSE', 'HKEX'];

export interface OrderTicketProps {
  open: boolean;
  onClose: () => void;
  accounts: TradingAccount[];
  initialSide?: 'buy' | 'sell';
  initialSymbol?: string;
  initialExchange?: string;
  initialQuantity?: number;
  onSubmitted?: (order: TradingOrder) => void;
}

export function OrderTicket({
  open,
  onClose,
  accounts,
  initialSide = 'buy',
  initialSymbol = '',
  initialExchange = 'SMART',
  initialQuantity = 1,
  onSubmitted,
}: OrderTicketProps) {
  const [accountId, setAccountId] = useState<number | null>(accounts[0]?.id ?? null);
  const [side, setSide] = useState<'buy' | 'sell'>(initialSide);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [exchange, setExchange] = useState(initialExchange);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const symbolRef = useRef<HTMLInputElement>(null);

  // Universe autocomplete (InvestOre-tracked tickers)
  const [universe, setUniverse] = useState<UniverseItem[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Load universe for selected exchange (excludes SMART meta-route)
  useEffect(() => {
    if (!open) return;
    const ex = exchange === 'SMART' ? '' : exchange;
    setSuggestLoading(true);
    fetchUniverse({ exchange: ex, limit: 1000 })
      .then(r => setUniverse(r.items))
      .catch(() => setUniverse([]))
      .finally(() => setSuggestLoading(false));
  }, [open, exchange]);

  const filteredSuggest = universe
    .filter(u => !symbol || u.symbol.startsWith(symbol) || u.name.toLowerCase().includes(symbol.toLowerCase()))
    .slice(0, 8);
  const inUniverse = universe.some(u => u.symbol === symbol);

  // Re-seed when opened
  useEffect(() => {
    if (open) {
      setSide(initialSide);
      setSymbol(initialSymbol);
      setExchange(initialExchange);
      setQuantity(initialQuantity);
      setError(null);
      if (accounts.length && (accountId == null || !accounts.find(a => a.id === accountId))) {
        setAccountId(accounts[0].id);
      }
      // focus symbol after paint
      setTimeout(() => symbolRef.current?.focus(), 30);
    }
  }, [open, initialSide, initialSymbol, initialExchange, initialQuantity, accounts, accountId]);

  const handleSubmit = useCallback(async () => {
    if (!accountId) { setError('Select an account'); return; }
    if (!symbol.trim()) { setError('Symbol required'); return; }
    if (!quantity || quantity <= 0) { setError('Quantity must be > 0'); return; }
    if (orderType === 'limit' && (!limitPrice || Number(limitPrice) <= 0)) {
      setError('Limit price required'); return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await submitManualOrder({
        account_id: accountId,
        symbol: symbol.trim().toUpperCase(),
        exchange,
        side,
        quantity: Math.floor(quantity),
        order_type: orderType,
        limit_price: orderType === 'limit' ? Number(limitPrice) : undefined,
      });
      onSubmitted?.(order);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Order failed');
    } finally {
      setSubmitting(false);
    }
  }, [accountId, symbol, exchange, side, quantity, orderType, limitPrice, onClose, onSubmitted]);

  // Modal-level hotkeys
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept while typing in number/text inputs except Enter/Esc
      const target = e.target as HTMLElement | null;
      const inEditable = target && /^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName);
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'Enter' && !submitting) { e.preventDefault(); handleSubmit(); return; }
      if (inEditable) return;
      if (e.key === 'b' || e.key === 'B') { e.preventDefault(); setSide('buy'); }
      else if (e.key === 's' || e.key === 'S') { e.preventDefault(); setSide('sell'); }
      else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setOrderType('market'); }
      else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); setOrderType('limit'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, handleSubmit, submitting]);

  if (!open) return null;

  const isBuy = side === 'buy';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-metallic-900 border border-metallic-700 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-metallic-800">
          <div className="flex items-center gap-2">
            {isBuy
              ? <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
              : <ArrowDownCircle className="w-5 h-5 text-red-400" />}
            <span className="text-sm font-semibold text-metallic-100">
              New Order — <span className={isBuy ? 'text-emerald-400' : 'text-red-400'}>{side.toUpperCase()}</span>
            </span>
          </div>
          <button onClick={onClose} className="text-metallic-500 hover:text-metallic-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Side toggle */}
          <div className="grid grid-cols-2 rounded-lg border border-metallic-700 overflow-hidden">
            <button
              onClick={() => setSide('buy')}
              className={`py-2 text-sm font-semibold transition-colors ${
                isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-metallic-800 text-metallic-400 hover:text-metallic-200'
              }`}
            >BUY <span className="text-[10px] opacity-60 ml-1">(B)</span></button>
            <button
              onClick={() => setSide('sell')}
              className={`py-2 text-sm font-semibold transition-colors ${
                !isBuy ? 'bg-red-500/20 text-red-400' : 'bg-metallic-800 text-metallic-400 hover:text-metallic-200'
              }`}
            >SELL <span className="text-[10px] opacity-60 ml-1">(S)</span></button>
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs text-metallic-500 uppercase tracking-wider mb-1">Account</label>
            <select
              value={accountId ?? ''}
              onChange={e => setAccountId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-100 focus:border-primary-500 focus:outline-none"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.account_name} · {a.broker}{a.is_paper ? ' (paper)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Symbol + exchange */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-xs text-metallic-500 uppercase tracking-wider mb-1">
                Symbol {symbol && !inUniverse && (
                  <span className="text-amber-400 normal-case ml-1">⚠ not in InvestOre universe</span>
                )}
              </label>
              <input
                ref={symbolRef}
                type="text"
                value={symbol}
                onChange={e => { setSymbol(e.target.value.toUpperCase()); setShowSuggest(true); }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                placeholder={exchange === 'ASX' ? 'BHP' : 'AAPL'}
                className="w-full px-3 py-2 text-sm rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-100 font-mono uppercase focus:border-primary-500 focus:outline-none"
              />
              {showSuggest && filteredSuggest.length > 0 && (
                <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-metallic-700 bg-metallic-900 shadow-lg">
                  {filteredSuggest.map(u => (
                    <button
                      key={u.symbol}
                      type="button"
                      onMouseDown={e => { e.preventDefault(); setSymbol(u.symbol); setShowSuggest(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-metallic-800 border-b border-metallic-800 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-metallic-100">{u.symbol}</span>
                        <span className="text-[10px] text-metallic-500 uppercase">{u.primary_commodity}</span>
                      </div>
                      <div className="text-xs text-metallic-400 truncate">{u.name}</div>
                    </button>
                  ))}
                </div>
              )}
              {suggestLoading && <div className="text-[10px] text-metallic-500 mt-1">loading universe…</div>}
            </div>
            <div>
              <label className="block text-xs text-metallic-500 uppercase tracking-wider mb-1">Exchange</label>
              <select
                value={exchange}
                onChange={e => setExchange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-100 focus:border-primary-500 focus:outline-none"
              >
                {EXCHANGES.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          </div>

          {/* Qty + type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-metallic-500 uppercase tracking-wider mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-100 font-mono focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-metallic-500 uppercase tracking-wider mb-1">Type</label>
              <div className="grid grid-cols-2 rounded-lg border border-metallic-700 overflow-hidden">
                <button
                  onClick={() => setOrderType('market')}
                  className={`py-2 text-xs font-semibold transition-colors ${
                    orderType === 'market' ? 'bg-primary-500/20 text-primary-400' : 'bg-metallic-800 text-metallic-400'
                  }`}
                >MKT</button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`py-2 text-xs font-semibold transition-colors ${
                    orderType === 'limit' ? 'bg-primary-500/20 text-primary-400' : 'bg-metallic-800 text-metallic-400'
                  }`}
                >LMT</button>
              </div>
            </div>
          </div>

          {/* Limit price */}
          {orderType === 'limit' && (
            <div>
              <label className="block text-xs text-metallic-500 uppercase tracking-wider mb-1">Limit price</label>
              <input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-100 font-mono focus:border-primary-500 focus:outline-none"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span className="text-xs text-red-300">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-metallic-800 bg-metallic-900/50">
          <div className="text-[10px] text-metallic-600 font-mono">
            B/S · M/L · Enter · Esc
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
              isBuy
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Submitting…' : `Send ${side.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Global hotkey listener — mount once per page that wants B/S to pop the ticket.
 * Only fires when no input/textarea/select is focused.
 */
export function useOrderTicketHotkeys(onOpen: (side: 'buy' | 'sell') => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'b' || e.key === 'B') { e.preventDefault(); onOpen('buy'); }
      else if (e.key === 's' || e.key === 'S') { e.preventDefault(); onOpen('sell'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, onOpen]);
}
