'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import UpgradePrompt from '@/components/ui/UpgradePrompt';
import {
  Bell, Plus, Trash2, Activity, BarChart3, Target, Crosshair,
  History, Bot, RefreshCw, AlertTriangle, Check, X
} from 'lucide-react';
import {
  fetchAlerts,
  createAlert,
  deleteAlert,
  TradingAlert,
} from '@/services/tradingService';

const ALERT_TYPES = [
  { value: 'price_above', label: 'Price Above', desc: 'Trigger when price rises above threshold' },
  { value: 'price_below', label: 'Price Below', desc: 'Trigger when price drops below threshold' },
  { value: 'pnl_threshold', label: 'P&L Threshold', desc: 'Trigger on portfolio P&L threshold' },
  { value: 'position_opened', label: 'Position Opened', desc: 'Alert when a new position is opened' },
  { value: 'position_closed', label: 'Position Closed', desc: 'Alert when a position is closed' },
  { value: 'signal_generated', label: 'Signal Generated', desc: 'Alert on new trading signals' },
  { value: 'daily_summary', label: 'Daily Summary', desc: 'Daily trading summary alert' },
];

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
        const isActive = tab.href === '/trading/alerts';
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

export default function AlertsPage() {
  const { user, isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<TradingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formType, setFormType] = useState(ALERT_TYPES[0].value);
  const [formTicker, setFormTicker] = useState('');
  const [formThreshold, setFormThreshold] = useState('');
  const [creating, setCreating] = useState(false);

  const isEnterprise = user?.subscription_tier === 'enterprise';

  useEffect(() => {
    if (!isAuthenticated || !isEnterprise) { setLoading(false); return; }
    loadData();
  }, [isAuthenticated, isEnterprise]);

  const loadData = async () => {
    setLoading(true);
    try {
      setAlerts(await fetchAlerts());
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const condition: Record<string, unknown> = {};
      if (formTicker) condition.ticker = formTicker.toUpperCase();
      if (formThreshold) condition.threshold = Number(formThreshold);
      await createAlert({ alert_type: formType, condition });
      setShowCreate(false);
      setFormTicker('');
      setFormThreshold('');
      await loadData();
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  };

  if (!isAuthenticated || !isEnterprise) {
    return (
      <div className="min-h-screen bg-metallic-950 p-4 md:p-8">
        <div className="max-w-2xl mx-auto mt-16">
          <UpgradePrompt feature="Trading Alerts" description="Set up custom trading alerts for price movements, positions, and signals. Enterprise plan required." />
        </div>
      </div>
    );
  }

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
              <p className="text-sm text-metallic-400">Manage your trading alerts and notifications</p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> New Alert
            </button>
          </div>
          <TabBar />
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Create Alert */}
        {showCreate && (
          <div className="mb-6 bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-metallic-100 mb-4">Create Alert</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Alert Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                >
                  {ALERT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Ticker (optional)</label>
                <input
                  value={formTicker}
                  onChange={e => setFormTicker(e.target.value)}
                  placeholder="e.g. BHP"
                  className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Threshold (optional)</label>
                <input
                  type="number"
                  value={formThreshold}
                  onChange={e => setFormThreshold(e.target.value)}
                  placeholder="e.g. 45.00"
                  className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-metallic-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create
                </button>
                <button onClick={() => setShowCreate(false)} className="px-3 py-2 text-metallic-400 hover:text-metallic-200 text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20"><Activity className="w-8 h-8 text-primary-400 animate-pulse mx-auto" /></div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-metallic-200 mb-2">No Alerts</h2>
            <p className="text-metallic-400 max-w-lg mx-auto mb-6">
              Set up alerts to get notified about price movements, new signals, position changes, and daily summaries.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Alert
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => {
              const typeInfo = ALERT_TYPES.find(t => t.value === alert.alert_type);
              return (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${alert.is_active ? 'bg-primary-500/10' : 'bg-metallic-800'}`}>
                      <Bell className={`w-5 h-5 ${alert.is_active ? 'text-primary-400' : 'text-metallic-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-metallic-100">{typeInfo?.label || alert.alert_type}</h4>
                      <p className="text-xs text-metallic-500 mt-0.5">{typeInfo?.desc}</p>
                      {Object.keys(alert.condition).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {Object.entries(alert.condition).map(([k, v]) => (
                            <span key={k} className="px-2 py-0.5 rounded text-xs bg-metallic-800 text-metallic-400 border border-metallic-700">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {alert.last_triggered && (
                      <span className="text-xs text-metallic-500">
                        Last: {new Date(alert.last_triggered).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      alert.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-metallic-700/50 text-metallic-500'
                    }`}>
                      {alert.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-1.5 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
