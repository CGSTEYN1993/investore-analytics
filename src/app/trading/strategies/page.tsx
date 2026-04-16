'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import UpgradePrompt from '@/components/ui/UpgradePrompt';
import {
  Target, Plus, Trash2, Play, Pause, Settings, AlertTriangle, Activity,
  BarChart3, Crosshair, History, Bell, Bot, ChevronDown, ChevronUp,
  Zap, Shield, RefreshCw, Check, X
} from 'lucide-react';
import {
  fetchStrategies,
  fetchAccounts,
  createStrategy,
  toggleStrategy,
  runStrategy,
  deleteStrategy,
  fetchRuleTemplates,
  TradingStrategy,
  TradingAccount,
  RuleTemplate,
  RuleConfig,
} from '@/services/tradingService';

const EXCHANGES = ['ASX', 'TSX', 'TSXV', 'LSE', 'JSE', 'NYSE', 'NASDAQ', 'HKEX', 'CSE'];
const COMMODITIES = ['Gold', 'Copper', 'Lithium', 'Zinc', 'Nickel', 'Iron Ore', 'Uranium', 'Silver', 'Cobalt', 'PGE', 'Rare Earths'];

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
        const isActive = tab.href === '/trading/strategies';
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? 'text-primary-400 border-primary-400 bg-metallic-800/50'
                : 'text-metallic-400 border-transparent hover:text-metallic-200 hover:border-metallic-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function RuleSelector({ templates, selected, onChange, category }: {
  templates: RuleTemplate[];
  selected: RuleConfig[];
  onChange: (rules: RuleConfig[]) => void;
  category: string;
}) {
  const filtered = templates.filter(t => t.category === category);

  const addRule = (template: RuleTemplate) => {
    const defaults: Record<string, unknown> = {};
    for (const [key, spec] of Object.entries(template.params)) {
      defaults[key] = spec.default;
    }
    onChange([...selected, { type: template.type, params: defaults }]);
  };

  const removeRule = (index: number) => {
    onChange(selected.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, key: string, value: unknown) => {
    const updated = [...selected];
    updated[index] = { ...updated[index], params: { ...updated[index].params, [key]: value } };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {selected.map((rule, i) => {
        const tmpl = templates.find(t => t.type === rule.type);
        return (
          <div key={i} className="p-3 rounded-lg bg-metallic-800/50 border border-metallic-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-metallic-200">{tmpl?.name || rule.type}</span>
              <button onClick={() => removeRule(i)} className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {tmpl?.description && (
              <p className="text-xs text-metallic-500 mb-2">{tmpl.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(rule.params).map(([key, val]) => {
                const spec = tmpl?.params[key];
                return (
                  <div key={key}>
                    <label className="text-xs text-metallic-400 block mb-1">{spec?.description || key}</label>
                    <input
                      type={typeof val === 'number' ? 'number' : 'text'}
                      value={String(val)}
                      onChange={(e) => updateParam(i, key, typeof val === 'number' ? Number(e.target.value) : e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded bg-metallic-900 border border-metallic-700 text-metallic-200 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add Rule Dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/15 rounded-lg border border-primary-500/20 transition-colors w-full justify-center">
          <Plus className="w-3.5 h-3.5" />
          Add {category === 'entry' ? 'Entry' : 'Exit'} Rule
        </button>
        <div className="hidden group-hover:block absolute top-full left-0 right-0 mt-1 bg-metallic-800/95 backdrop-blur-md rounded-lg border border-metallic-700/50 shadow-xl z-20 max-h-60 overflow-y-auto">
          {filtered.map((t) => (
            <button
              key={t.type}
              onClick={() => addRule(t)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-metallic-700/50 transition-colors"
            >
              <span className="text-metallic-200 font-medium">{t.name}</span>
              <span className="text-metallic-500 block">{t.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StrategiesPage() {
  const { user, isAuthenticated } = useAuth();
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAccountId, setFormAccountId] = useState<number | null>(null);
  const [formEntryRules, setFormEntryRules] = useState<RuleConfig[]>([]);
  const [formExitRules, setFormExitRules] = useState<RuleConfig[]>([]);
  const [formEntryLogic, setFormEntryLogic] = useState<'AND' | 'OR'>('OR');
  const [formExchanges, setFormExchanges] = useState<string[]>(['ASX']);
  const [formCommodities, setFormCommodities] = useState<string[]>([]);
  const [formSizing, setFormSizing] = useState('fixed_pct');
  const [formMaxPosPct, setFormMaxPosPct] = useState(5);
  const [formMaxPositions, setFormMaxPositions] = useState(20);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [strats, accts, tmpls] = await Promise.all([
        fetchStrategies(),
        fetchAccounts(),
        fetchRuleTemplates(),
      ]);
      setStrategies(strats);
      setAccounts(accts);
      setTemplates(tmpls);
      if (accts.length > 0 && !formAccountId) setFormAccountId(accts[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formName || !formAccountId || formEntryRules.length === 0) return;
    setCreating(true);
    try {
      await createStrategy({
        account_id: formAccountId,
        name: formName,
        description: formDesc || undefined,
        entry_rules: formEntryRules,
        exit_rules: formExitRules.length > 0 ? formExitRules : [{ type: 'stop_loss', params: { pct: 8 } }, { type: 'take_profit', params: { pct: 20 } }],
        entry_logic: formEntryLogic,
        position_sizing: formSizing,
        max_position_pct: formMaxPosPct,
        max_positions: formMaxPositions,
        exchanges: formExchanges,
        commodities: formCommodities.length > 0 ? formCommodities : undefined,
      });
      setShowCreate(false);
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create strategy');
    }
    setCreating(false);
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormEntryRules([]);
    setFormExitRules([]);
    setFormEntryLogic('OR');
    setFormExchanges(['ASX']);
    setFormCommodities([]);
    setFormSizing('fixed_pct');
    setFormMaxPosPct(5);
    setFormMaxPositions(20);
  };

  const handleToggle = async (id: number, active: boolean) => {
    try {
      await toggleStrategy(id, !active);
      setStrategies(prev => prev.map(s => s.id === id ? { ...s, is_active: !active } : s));
    } catch { /* ignore */ }
  };

  const handleRun = async (id: number) => {
    setRunningId(id);
    try {
      await runStrategy(id);
      await loadData();
    } catch { /* ignore */ }
    setRunningId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this strategy?')) return;
    try {
      await deleteStrategy(id);
      setStrategies(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-metallic-950 flex items-center justify-center">
        <Activity className="w-8 h-8 text-primary-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metallic-950 pb-12">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Bot className="w-7 h-7 text-primary-400" />
                <h1 className="text-2xl font-bold text-metallic-100">Trading Platform</h1>
              </div>
              <p className="text-sm text-metallic-400">Build and manage automated trading strategies</p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Strategy
            </button>
          </div>
          <TabBar />
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Strategy Builder */}
        {showCreate && (
          <div className="mb-6 bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-metallic-100 mb-4">Create New Strategy</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Strategy Name</label>
                  <input
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Gold Sentiment + RSI"
                    className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Description</label>
                  <textarea
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    rows={2}
                    placeholder="Optional description..."
                    className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Account</label>
                  <select
                    value={formAccountId ?? ''}
                    onChange={e => setFormAccountId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.account_name} ({a.is_paper ? 'Paper' : 'Live'})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Entry Logic</label>
                    <select
                      value={formEntryLogic}
                      onChange={e => setFormEntryLogic(e.target.value as 'AND' | 'OR')}
                      className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                    >
                      <option value="OR">OR (any rule)</option>
                      <option value="AND">AND (all rules)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Position Sizing</label>
                    <select
                      value={formSizing}
                      onChange={e => setFormSizing(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none"
                    >
                      <option value="fixed_pct">Fixed % of Portfolio</option>
                      <option value="equal_weight">Equal Weight</option>
                      <option value="risk_based">Risk-Based (ATR)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Max Position %</label>
                    <input type="number" value={formMaxPosPct} onChange={e => setFormMaxPosPct(Number(e.target.value))} min={1} max={25}
                      className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Max Positions</label>
                    <input type="number" value={formMaxPositions} onChange={e => setFormMaxPositions(Number(e.target.value))} min={1} max={100}
                      className="w-full px-3 py-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-200 text-sm focus:border-primary-500 focus:outline-none" />
                  </div>
                </div>

                {/* Exchanges */}
                <div>
                  <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Exchanges</label>
                  <div className="flex flex-wrap gap-2">
                    {EXCHANGES.map(ex => (
                      <button
                        key={ex}
                        onClick={() => setFormExchanges(prev => prev.includes(ex) ? prev.filter(e => e !== ex) : [...prev, ex])}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          formExchanges.includes(ex)
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'bg-metallic-800 text-metallic-400 border border-metallic-700 hover:border-metallic-600'
                        }`}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commodities */}
                <div>
                  <label className="text-xs font-medium text-metallic-400 uppercase tracking-wider block mb-1.5">Commodities (empty = all)</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMODITIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setFormCommodities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          formCommodities.includes(c)
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-metallic-800 text-metallic-400 border border-metallic-700 hover:border-metallic-600'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Rules */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-metallic-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" /> Entry Rules
                  </h4>
                  <RuleSelector templates={templates} selected={formEntryRules} onChange={setFormEntryRules} category="entry" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-metallic-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" /> Exit Rules
                  </h4>
                  <RuleSelector templates={templates} selected={formExitRules} onChange={setFormExitRules} category="exit" />
                  {formExitRules.length === 0 && (
                    <p className="text-xs text-metallic-500 mt-2">Default: 8% stop loss + 20% take profit</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-metallic-700/30">
              <button
                onClick={handleCreate}
                disabled={creating || !formName || !formAccountId || formEntryRules.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-metallic-700 disabled:text-metallic-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Strategy
              </button>
              <button
                onClick={() => { setShowCreate(false); resetForm(); }}
                className="px-4 py-2.5 text-metallic-400 hover:text-metallic-200 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Strategy List */}
        {strategies.length === 0 && !showCreate ? (
          <div className="text-center py-20">
            <Target className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-metallic-200 mb-2">No Strategies Yet</h2>
            <p className="text-metallic-400 max-w-lg mx-auto mb-6">
              Create your first automated trading strategy using mining-specific signals like sentiment analysis, drill results, and technical indicators.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Strategy
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {strategies.map((strat) => (
              <div key={strat.id} className="bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-metallic-100">{strat.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        strat.is_active
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-metallic-700/50 text-metallic-500'
                      }`}>
                        {strat.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    {strat.description && (
                      <p className="text-sm text-metallic-400 mt-1">{strat.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-metallic-500">
                      <span>{strat.entry_rules.length} entry rules ({strat.entry_logic})</span>
                      <span>·</span>
                      <span>{strat.exit_rules.length} exit rules</span>
                      <span>·</span>
                      <span>{strat.exchanges.join(', ')}</span>
                      {strat.commodities.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{strat.commodities.join(', ')}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{strat.position_sizing} sizing</span>
                      <span>·</span>
                      <span>Max {strat.max_positions} positions @ {strat.max_position_pct}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRun(strat.id)}
                      disabled={runningId === strat.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-xs font-medium rounded-lg border border-primary-500/20 transition-colors disabled:opacity-50"
                    >
                      {runningId === strat.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      Run Now
                    </button>
                    <button
                      onClick={() => handleToggle(strat.id, strat.is_active)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        strat.is_active
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {strat.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {strat.is_active ? 'Pause' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(strat.id)}
                      className="p-1.5 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rule Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {strat.entry_rules.map((r, i) => (
                    <span key={`e-${i}`} className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {(r as RuleConfig).type.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {strat.exit_rules.map((r, i) => (
                    <span key={`x-${i}`} className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                      {(r as RuleConfig).type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
