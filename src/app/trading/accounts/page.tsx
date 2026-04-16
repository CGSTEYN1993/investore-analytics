'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import UpgradePrompt from '@/components/ui/UpgradePrompt';
import {
  Wallet, Plus, Trash2, Activity, BarChart3, Target, Crosshair,
  History, Bell, Bot, RefreshCw, Check, X, AlertTriangle
} from 'lucide-react';
import {
  fetchAccounts,
  createAccount,
  deleteAccount,
  TradingAccount,
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
      ].map((tab) => (
        <Link key={tab.href} href={tab.href}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 text-metallic-400 border-transparent hover:text-metallic-200 hover:border-metallic-600 transition-colors whitespace-nowrap">
          {tab.icon}{tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const { user, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formMode, setFormMode] = useState<'paper' | 'live'>('paper');
  const [formBalance, setFormBalance] = useState(100000);
  const [formCurrency, setFormCurrency] = useState('AUD');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try { setAccounts(await fetchAccounts()); } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formName) return;
    setCreating(true);
    setError(null);
    try {
      await createAccount({
        account_name: formName,
        is_paper: formMode === 'paper',
        initial_balance: formBalance,
        base_currency: formCurrency,
      });
      setShowCreate(false);
      setFormName('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this trading account? All associated strategies and positions will be removed.')) return;
    try {
      await deleteAccount(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  };

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
              <p className="text-sm text-metallic-400">Manage your trading accounts</p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> New Account
            </button>
          </div>
          <TabBar />
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {showCreate && (
          <div className="mb-6 bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-metallic-100 mb-4">Create Trading Account</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Account Name</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Paper Trading - ASX"
                  className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Mode</label>
                <select
                  value={formMode}
                  onChange={e => setFormMode(e.target.value as 'paper' | 'live')}
                  className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="paper">Paper Trading (Simulated)</option>
                  <option value="live">Live Trading (IB)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Initial Balance</label>
                <input
                  type="number"
                  value={formBalance}
                  onChange={e => setFormBalance(Number(e.target.value))}
                  min={1000}
                  className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Currency</label>
                <select
                  value={formCurrency}
                  onChange={e => setFormCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="AUD">AUD</option>
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                  <option value="GBP">GBP</option>
                  <option value="ZAR">ZAR</option>
                </select>
              </div>
            </div>
            {formMode === 'live' && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Live trading requires Interactive Brokers TWS/Gateway running. Start with paper trading to test your strategies first.
              </div>
            )}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleCreate}
                disabled={creating || !formName}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-metallic-700 disabled:text-metallic-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Account
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-metallic-400 hover:text-metallic-200 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20"><Activity className="w-8 h-8 text-primary-400 animate-pulse mx-auto" /></div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-metallic-200 mb-2">No Trading Accounts</h2>
            <p className="text-metallic-400 max-w-lg mx-auto mb-6">
              Create a paper trading account to start testing automated strategies with simulated funds.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acct => (
              <div key={acct.id} className="bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-metallic-100">{acct.account_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        acct.is_paper ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {acct.is_paper ? 'PAPER' : 'LIVE'}
                      </span>
                      <span className="text-xs text-metallic-500">{acct.broker}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(acct.id)}
                    className="p-1.5 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-metallic-400">Initial Balance</span>
                    <span className="text-sm text-metallic-200">${acct.initial_balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-metallic-400">Current Balance</span>
                    <span className="text-sm font-semibold text-metallic-100">${acct.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-metallic-400">P&L</span>
                    <span className={`text-sm font-semibold ${acct.current_balance >= acct.initial_balance ? 'text-emerald-400' : 'text-red-400'}`}>
                      {acct.current_balance >= acct.initial_balance ? '+' : ''}
                      ${(acct.current_balance - acct.initial_balance).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-metallic-400">Currency</span>
                    <span className="text-sm text-metallic-200">{acct.base_currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-metallic-400">Status</span>
                    <span className={`text-sm ${acct.is_active ? 'text-emerald-400' : 'text-metallic-500'}`}>
                      {acct.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-metallic-400">Created</span>
                    <span className="text-xs text-metallic-500">{new Date(acct.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
