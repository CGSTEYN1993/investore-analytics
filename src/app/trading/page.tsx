'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import UpgradePrompt from '@/components/ui/UpgradePrompt';
import {
  Activity, TrendingUp, TrendingDown, DollarSign, BarChart3,
  Zap, Target, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Play, Pause, Settings, Plus, RefreshCw, Bot, Shield, PieChart,
  Crosshair, History, Bell
} from 'lucide-react';
import {
  fetchDashboard,
  fetchEngineStatus,
  TradingDashboard,
  EngineStatus,
} from '@/services/tradingService';
import TradeDetailModal from '@/components/trading/TradeDetailModal';
import StatCard from '@/components/ui/StatCard';

const EXCHANGE_CURRENCY: Record<string, string> = {
  JSE: 'R', ASX: 'A$', TSX: 'C$', TSXV: 'C$', LSE: '£', NYSE: '$', NASDAQ: '$', HKEX: 'HK$',
};
function ccy(exchange: string): string { return EXCHANGE_CURRENCY[exchange] || '$'; }

function EngineStatusBadge({ status }: { status: EngineStatus | null }) {
  if (!status) return null;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      status.is_running
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        : 'bg-red-500/15 text-red-400 border border-red-500/30'
    }`}>
      <span className={`w-2 h-2 rounded-full ${status.is_running ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      {status.is_running ? 'Engine Running' : 'Engine Stopped'}
    </div>
  );
}

export default function TradingDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [dashboard, setDashboard] = useState<TradingDashboard | null>(null);
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, engine] = await Promise.all([
        fetchDashboard(),
        fetchEngineStatus(),
      ]);
      setDashboard(dash);
      setEngineStatus(engine);
    } catch (err) {
      // If not authenticated, just show empty state
      console.log('Trading API:', err instanceof Error ? err.message : 'Failed to load');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Activity className="w-8 h-8 text-primary-400 animate-pulse mx-auto mb-3" />
          <p className="text-metallic-400 text-sm">Loading trading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-metallic-800 hover:bg-metallic-700 text-metallic-200 text-sm rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasAccounts = dashboard && dashboard.accounts.length > 0;
  const totalPnl = dashboard?.total_pnl ?? 0;
  const pnlPositive = totalPnl >= 0;

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
            Dashboard <EngineStatusBadge status={engineStatus} />
          </h1>
          <p className="text-xs text-metallic-500 mt-0.5">
            Automated mining stock trading with rule-based strategies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 bg-metallic-800 hover:bg-metallic-700 text-metallic-300 text-sm rounded-lg transition-colors border border-metallic-700/50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {!hasAccounts && (
            <Link
              href="/trading/accounts"
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Account
            </Link>
          )}
        </div>
      </div>

      <div>
        {!hasAccounts ? (
          /* Empty State */
          <div className="text-center py-20">
            <Bot className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-metallic-200 mb-2">Get Started with Trading</h2>
            <p className="text-metallic-400 max-w-lg mx-auto mb-6">
              Create a paper trading account to start building and testing automated mining stock strategies with zero risk.
            </p>
            <Link
              href="/trading/accounts"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Paper Trading Account
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Portfolio Value"
                value={`$${(dashboard?.total_portfolio_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<DollarSign className="w-5 h-5 text-primary-400" />}
              />
              <StatCard
                label="Total P&L"
                value={`${pnlPositive ? '+' : ''}$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={pnlPositive ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                positive={pnlPositive}
              />
              <StatCard
                label="Open Positions"
                value={String(dashboard?.open_positions?.length ?? 0)}
                icon={<Crosshair className="w-5 h-5 text-amber-400" />}
              />
              <StatCard
                label="Active Strategies"
                value={String(dashboard?.active_strategies ?? 0)}
                icon={<Target className="w-5 h-5 text-diamond-400" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Open Positions */}
              <div className="lg:col-span-2 bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-metallic-700/30">
                  <h3 className="text-sm font-semibold text-metallic-200 uppercase tracking-wider">Open Positions</h3>
                  <Link href="/trading/positions" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    View All →
                  </Link>
                </div>
                <div className="p-5">
                  {dashboard?.open_positions && dashboard.open_positions.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.open_positions.slice(0, 8).map((pos) => {
                        const pnl = pos.unrealised_pnl ?? 0;
                        const isProfit = pnl >= 0;
                        return (
                          <button
                            key={pos.id}
                            onClick={() => setSelectedPositionId(pos.id)}
                            className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-700/50 transition-colors text-left group"
                          >
                            <div>
                              <span className="text-sm font-semibold text-metallic-100 group-hover:text-primary-400 transition-colors">{pos.ticker}</span>
                              <span className="text-xs text-metallic-500 ml-2">{pos.exchange}</span>
                              <span className="text-metallic-600 ml-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">View &#8599;</span>
                              <div className="text-xs text-metallic-400 mt-0.5">
                                {pos.quantity} shares @ {ccy(pos.exchange)}{pos.entry_price.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isProfit ? '+' : ''}{ccy(pos.exchange)}{Math.abs(pnl).toFixed(2)}
                              </div>
                              {pos.current_price && (
                                <div className="text-xs text-metallic-500">
                                  {ccy(pos.exchange)}{pos.current_price.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crosshair className="w-8 h-8 text-metallic-600 mx-auto mb-2" />
                      <p className="text-sm text-metallic-500">No open positions</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Engine Status */}
                <div className="bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-metallic-200 uppercase tracking-wider mb-4">Engine Status</h3>
                  {engineStatus && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-metallic-400">Status</span>
                        <span className={engineStatus.is_running ? 'text-emerald-400' : 'text-red-400'}>
                          {engineStatus.is_running ? 'Running' : 'Stopped'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-metallic-400">Last Cycle</span>
                        <span className="text-metallic-200">
                          {engineStatus.last_cycle_at
                            ? new Date(engineStatus.last_cycle_at).toLocaleTimeString()
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-metallic-400">Signals Today</span>
                        <span className="text-metallic-200">{engineStatus.signals_today}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-metallic-400">Orders Today</span>
                        <span className="text-metallic-200">{engineStatus.orders_today}</span>
                      </div>
                      {engineStatus.errors_today > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-metallic-400">Errors</span>
                          <span className="text-red-400">{engineStatus.errors_today}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Today's Activity */}
                <div className="bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-metallic-200 uppercase tracking-wider mb-4">Today&apos;s Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary-500/10">
                        <Zap className="w-4 h-4 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-metallic-200">{dashboard?.todays_signals ?? 0} Signals</p>
                        <p className="text-xs text-metallic-500">Generated today</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-metallic-200">{dashboard?.todays_orders ?? 0} Orders</p>
                        <p className="text-xs text-metallic-500">Executed today</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Bell className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-metallic-200">{dashboard?.alerts?.length ?? 0} Alerts</p>
                        <p className="text-xs text-metallic-500">Active alerts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="mt-6 bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-metallic-700/30">
                <h3 className="text-sm font-semibold text-metallic-200 uppercase tracking-wider">Recent Trades</h3>
                <Link href="/trading/history" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  View All →
                </Link>
              </div>
              <div className="p-5">
                {dashboard?.recent_trades && dashboard.recent_trades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-metallic-500 uppercase tracking-wider">
                          <th className="pb-3 pr-4">Ticker</th>
                          <th className="pb-3 pr-4">Side</th>
                          <th className="pb-3 pr-4">Entry</th>
                          <th className="pb-3 pr-4">Exit</th>
                          <th className="pb-3 pr-4">Qty</th>
                          <th className="pb-3 pr-4 text-right">P&L</th>
                          <th className="pb-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.recent_trades.slice(0, 10).map((trade) => {
                          const isProfit = trade.pnl >= 0;
                          return (
                            <tr key={trade.id} className="border-t border-metallic-800/50">
                              <td className="py-3 pr-4">
                                <span className="font-medium text-metallic-100">{trade.ticker}</span>
                                <span className="text-metallic-500 ml-1 text-xs">{trade.exchange}</span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  trade.side === 'buy'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-red-500/15 text-red-400'
                                }`}>
                                  {trade.side.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-metallic-300">${trade.entry_price.toFixed(2)}</td>
                              <td className="py-3 pr-4 text-metallic-300">${trade.exit_price.toFixed(2)}</td>
                              <td className="py-3 pr-4 text-metallic-300">{trade.quantity}</td>
                              <td className={`py-3 pr-4 text-right font-medium ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                                <span className="text-xs ml-1">({isProfit ? '+' : ''}{trade.pnl_pct.toFixed(1)}%)</span>
                              </td>
                              <td className="py-3 text-right text-metallic-500 text-xs">
                                {new Date(trade.closed_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-8 h-8 text-metallic-600 mx-auto mb-2" />
                    <p className="text-sm text-metallic-500">No trade history yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Accounts Overview */}
            <div className="mt-6 bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-metallic-700/30">
                <h3 className="text-sm font-semibold text-metallic-200 uppercase tracking-wider">Accounts</h3>
                <Link href="/trading/accounts" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Manage →
                </Link>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboard?.accounts.map((acct) => (
                    <div key={acct.id} className="p-4 rounded-lg bg-metallic-800/50 border border-metallic-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-metallic-100">{acct.account_name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          acct.is_paper
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {acct.is_paper ? 'PAPER' : 'LIVE'}
                        </span>
                      </div>
                      <div className="text-xs text-metallic-500 mb-3">{acct.broker} · {acct.base_currency}</div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-metallic-500">Balance</p>
                          <p className="text-sm font-medium text-metallic-200">
                            ${acct.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-metallic-500">Status</p>
                          <p className={`text-sm font-medium ${acct.is_active ? 'text-emerald-400' : 'text-metallic-500'}`}>
                            {acct.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
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
