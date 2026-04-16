'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import UpgradePrompt from '@/components/ui/UpgradePrompt';
import {
  History, Activity, BarChart3, Target, Crosshair, Bell, Bot,
  TrendingUp, TrendingDown, RefreshCw, Download
} from 'lucide-react';
import {
  fetchTradeHistory,
  fetchAccounts,
  fetchPerformance,
  TradeHistory,
  TradingAccount,
  PerformanceSnapshot,
} from '@/services/tradingService';

function TabBar() {
  return (
    <div className="flex items-center gap-1 mt-6 -mb-px overflow-x-auto">
      {[
        { href: '/trading', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
        { href: '/trading/strategies', label: 'Strategies', icon: <Target className="w-4 h-4" /> },
        { href: '/trading/positions', label: 'Positions', icon: <Crosshair className="w-4 h-4" /> },
        { href: '/trading/history', label: 'History', icon: <History className="w-4 h-4" /> },
        { href: '/trading/alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
      ].map((tab) => {
        const isActive = tab.href === '/trading/history';
        return (
          <Link key={tab.href} href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              isActive ? 'text-primary-400 border-primary-400 bg-metallic-800/50' : 'text-metallic-400 border-transparent hover:text-metallic-200 hover:border-metallic-600'
            }`}>
            {tab.icon}{tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function TradeHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [trades, setTrades] = useState<TradeHistory[]>([]);
  const [performance, setPerformance] = useState<PerformanceSnapshot[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState<number | undefined>(undefined);
  const [tickerFilter, setTickerFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [accountFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, p, a] = await Promise.all([
        fetchTradeHistory({ account_id: accountFilter, limit: 100 }),
        fetchPerformance(accountFilter, 30),
        fetchAccounts(),
      ]);
      setTrades(t);
      setPerformance(p);
      setAccounts(a);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const filteredTrades = tickerFilter
    ? trades.filter(t => t.ticker.toLowerCase().includes(tickerFilter.toLowerCase()))
    : trades;

  const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
  const winCount = filteredTrades.filter(t => t.pnl > 0).length;
  const winRate = filteredTrades.length > 0 ? (winCount / filteredTrades.length * 100).toFixed(1) : '0';
  const avgPnl = filteredTrades.length > 0 ? totalPnl / filteredTrades.length : 0;

  return (
    <div className="min-h-screen bg-metallic-950 pb-12">
      <div className="bg-metallic-900/50 border-b border-metallic-800/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Bot className="w-7 h-7 text-primary-400" />
                <h1 className="text-2xl font-bold text-metallic-100">Trading Platform</h1>
              </div>
              <p className="text-sm text-metallic-400">Trade history and performance analytics</p>
            </div>
            <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 bg-metallic-800 hover:bg-metallic-700 text-metallic-300 text-sm rounded-lg transition-colors border border-metallic-700/50">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <TabBar />
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Performance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-metallic-500">Total P&L</p>
            <p className={`text-2xl font-bold mt-1 ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </p>
          </div>
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-metallic-500">Win Rate</p>
            <p className="text-2xl font-bold text-metallic-100 mt-1">{winRate}%</p>
            <p className="text-xs text-metallic-500 mt-1">{winCount}/{filteredTrades.length} trades</p>
          </div>
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-metallic-500">Avg P&L / Trade</p>
            <p className={`text-2xl font-bold mt-1 ${avgPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {avgPnl >= 0 ? '+' : ''}${avgPnl.toFixed(2)}
            </p>
          </div>
          <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-metallic-500">Total Trades</p>
            <p className="text-2xl font-bold text-metallic-100 mt-1">{filteredTrades.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            value={tickerFilter}
            onChange={e => setTickerFilter(e.target.value)}
            placeholder="Filter by ticker..."
            className="px-3 py-2 text-xs rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 focus:border-primary-500 focus:outline-none w-40"
          />
          {accounts.length > 1 && (
            <select
              value={accountFilter ?? ''}
              onChange={e => setAccountFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 text-xs rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 focus:border-primary-500 focus:outline-none"
            >
              <option value="">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20"><Activity className="w-8 h-8 text-primary-400 animate-pulse mx-auto" /></div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-20">
            <History className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-metallic-200 mb-2">No Trade History</h2>
            <p className="text-metallic-400">Completed trades will appear here with full P&L analysis.</p>
          </div>
        ) : (
          <div className="bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-metallic-500 uppercase tracking-wider bg-metallic-800/50">
                    <th className="px-5 py-3">Ticker</th>
                    <th className="px-5 py-3">Side</th>
                    <th className="px-5 py-3">Entry</th>
                    <th className="px-5 py-3">Exit</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3 text-right">P&L</th>
                    <th className="px-5 py-3 text-right">P&L %</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Exit Reason</th>
                    <th className="px-5 py-3">Strategy</th>
                    <th className="px-5 py-3">Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map(trade => {
                    const isProfit = trade.pnl >= 0;
                    const hours = trade.hold_duration_hours;
                    const duration = hours ? (hours >= 24 ? `${Math.round(hours / 24)}d` : `${Math.round(hours)}h`) : '—';
                    return (
                      <tr key={trade.id} className="border-t border-metallic-800/50 hover:bg-metallic-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-semibold text-metallic-100">{trade.ticker}</span>
                          <span className="text-metallic-500 ml-1.5 text-xs">{trade.exchange}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            trade.side === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {trade.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-metallic-300">${trade.entry_price.toFixed(2)}</td>
                        <td className="px-5 py-3 text-metallic-300">${trade.exit_price.toFixed(2)}</td>
                        <td className="px-5 py-3 text-metallic-300">{trade.quantity}</td>
                        <td className={`px-5 py-3 text-right font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                        </td>
                        <td className={`px-5 py-3 text-right ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{trade.pnl_pct.toFixed(1)}%
                        </td>
                        <td className="px-5 py-3 text-metallic-400 text-xs">{duration}</td>
                        <td className="px-5 py-3 text-metallic-400 text-xs">{trade.exit_reason || '—'}</td>
                        <td className="px-5 py-3 text-metallic-400 text-xs">{trade.strategy_name || '—'}</td>
                        <td className="px-5 py-3 text-metallic-500 text-xs whitespace-nowrap">
                          {new Date(trade.closed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Over Time */}
        {performance.length > 0 && (
          <div className="mt-6 bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-metallic-200 uppercase tracking-wider mb-4">Daily Performance (Last 30 Days)</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-1 items-end h-32 min-w-[600px]">
                {performance.map((p, i) => {
                  const maxVal = Math.max(...performance.map(x => Math.abs(x.daily_pnl)), 1);
                  const height = Math.max(Math.abs(p.daily_pnl) / maxVal * 100, 2);
                  const isProfit = p.daily_pnl >= 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end" title={`${p.date}: ${isProfit ? '+' : ''}$${p.daily_pnl.toFixed(2)}`}>
                      <div
                        className={`w-full rounded-t ${isProfit ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                        style={{ height: `${height}%`, minHeight: '2px' }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-metallic-600">
                <span>{performance[0]?.date}</span>
                <span>{performance[performance.length - 1]?.date}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
