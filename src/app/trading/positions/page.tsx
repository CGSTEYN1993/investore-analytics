'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import UpgradePrompt from '@/components/ui/UpgradePrompt';
import {
  Crosshair, Activity, AlertTriangle, X, RefreshCw, BarChart3,
  Target, History, Bell, Bot, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  fetchPositions,
  fetchAccounts,
  closePosition,
  TradingPosition,
  TradingAccount,
} from '@/services/tradingService';
import TradeDetailModal from '@/components/trading/TradeDetailModal';

const EXCHANGE_CURRENCY: Record<string, string> = {
  JSE: 'R', ASX: 'A$', TSX: 'C$', TSXV: 'C$', LSE: '£', NYSE: '$', NASDAQ: '$', HKEX: 'HK$',
};
function ccy(exchange: string): string { return EXCHANGE_CURRENCY[exchange] || '$'; }

export default function PositionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [accountFilter, setAccountFilter] = useState<number | undefined>(undefined);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [filter, accountFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pos, accts] = await Promise.all([
        fetchPositions({ status: filter, account_id: accountFilter }),
        fetchAccounts(),
      ]);
      setPositions(pos);
      setAccounts(accts);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleClose = async (id: number) => {
    if (!confirm('Close this position at current market price?')) return;
    setClosingId(id);
    try {
      await closePosition(id);
      await loadData();
    } catch { /* ignore */ }
    setClosingId(null);
  };

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-metallic-100">Positions</h1>
          <p className="text-xs text-metallic-500 mt-0.5">Monitor and manage your trading positions</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 bg-metallic-800 hover:bg-metallic-700 text-metallic-300 text-sm rounded-lg transition-colors border border-metallic-700/50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex rounded-lg border border-metallic-700/50 overflow-hidden">
            {(['open', 'closed', 'all'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  filter === s ? 'bg-primary-500/20 text-primary-400' : 'bg-metallic-800 text-metallic-400 hover:text-metallic-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {accounts.length > 1 && (
            <select
              value={accountFilter ?? ''}
              onChange={e => setAccountFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 text-xs rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 focus:border-primary-500 focus:outline-none"
            >
              <option value="">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name}</option>)}
            </select>
          )}
          <span className="text-xs text-metallic-500">{positions.length} position{positions.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="text-center py-20"><Activity className="w-8 h-8 text-primary-400 animate-pulse mx-auto" /></div>
        ) : positions.length === 0 ? (
          <div className="text-center py-20">
            <Crosshair className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-metallic-200 mb-2">No {filter !== 'all' ? filter : ''} Positions</h2>
            <p className="text-metallic-400">Positions will appear here once your strategies execute trades.</p>
          </div>
        ) : (
          <div className="bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-metallic-500 uppercase tracking-wider bg-metallic-800/50">
                    <th className="px-5 py-3">Ticker</th>
                    <th className="px-5 py-3">Side</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3">Entry</th>
                    <th className="px-5 py-3">Current</th>
                    <th className="px-5 py-3">Stop Loss</th>
                    <th className="px-5 py-3">Take Profit</th>
                    <th className="px-5 py-3 text-right">Unrealised P&L</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Opened</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map(pos => {
                    const pnl = pos.unrealised_pnl ?? 0;
                    const isProfit = pnl >= 0;
                    return (
                      <tr key={pos.id} className="border-t border-metallic-800/50 hover:bg-metallic-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setSelectedPositionId(pos.id)}
                            className="text-left group"
                          >
                            <span className="font-semibold text-metallic-100 group-hover:text-primary-400 transition-colors">{pos.ticker}</span>
                            <span className="text-metallic-500 ml-1.5 text-xs">{pos.exchange}</span>
                            <span className="text-metallic-600 ml-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">View &#8599;</span>
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            pos.side === 'long' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {pos.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-metallic-300">{pos.quantity}</td>
                        <td className="px-5 py-3 text-metallic-300">{ccy(pos.exchange)}{pos.entry_price.toFixed(2)}</td>
                        <td className="px-5 py-3 text-metallic-200 font-medium">
                          {pos.current_price ? `${ccy(pos.exchange)}${pos.current_price.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-red-400/70 text-xs">
                          {pos.stop_loss ? `${ccy(pos.exchange)}${pos.stop_loss.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-emerald-400/70 text-xs">
                          {pos.take_profit ? `${ccy(pos.exchange)}${pos.take_profit.toFixed(2)}` : '—'}
                        </td>
                        <td className={`px-5 py-3 text-right font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos.status === 'open' ? (
                            <span className="flex items-center justify-end gap-1">
                              {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {isProfit ? '+' : ''}{ccy(pos.exchange)}{Math.abs(pnl).toFixed(2)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            pos.status === 'open'
                              ? 'bg-primary-500/15 text-primary-400'
                              : 'bg-metallic-700/50 text-metallic-500'
                          }`}>
                            {pos.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-metallic-500 text-xs whitespace-nowrap">
                          {new Date(pos.opened_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          {pos.status === 'open' && (
                            <button
                              onClick={() => handleClose(pos.id)}
                              disabled={closingId === pos.id}
                              className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors disabled:opacity-50"
                            >
                              {closingId === pos.id ? 'Closing...' : 'Close'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Trade Detail Modal */}
      {selectedPositionId && (
        <TradeDetailModal
          positionId={selectedPositionId}
          onClose={() => setSelectedPositionId(null)}
        />
      )}
    </div>
  );
}
