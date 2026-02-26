'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown,
  Search, Filter, Loader2, RefreshCw, Download,
  Building2, TrendingUp, Gem, BarChart3, Table2, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, Cell, ZAxis
} from 'recharts';
import { getCommodityColor } from '@/lib/subscription-tiers';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_URL = RAILWAY_API_URL;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CompanyRow {
  ticker: string;
  name: string;
  exchange: string;
  company_type: string | null;
  primary_commodity: string | null;
  secondary_commodities: string | null;
  market_cap: number | null;
  market_cap_category: string | null;
  country: string | null;
  is_primary: boolean;
  resources_mt: number | null;
  resources_grade: number | null;
  resources_contained: number | null;
  mi_resources_mt: number | null;
  mi_resources_grade: number | null;
  mi_resources_contained: number | null;
  inferred_mt: number | null;
  inferred_grade: number | null;
  inferred_contained: number | null;
  reserves_mt: number | null;
  reserves_grade: number | null;
  reserves_contained: number | null;
  aisc: number | null;
  c1_cost: number | null;
  npv: number | null;
  irr: number | null;
  capex: number | null;
  annual_production: number | null;
  head_grade: number | null;
  recovery_pct: number | null;
  mine_life_years: number | null;
  study_type: string | null;
  project_stage: string | null;
  ev_per_resource: number | null;
  ownership_pct: number | null;
}

interface CommodityMeta {
  metal_symbol: string;
  unit: string;
  grade_unit: string;
}

interface BreakdownResponse {
  commodity: string;
  meta: CommodityMeta;
  spot_price: number | null;
  total: number;
  companies: CompanyRow[];
}

interface CommoditySummaryItem {
  commodity: string;
  metal_symbol: string;
  unit: string;
  company_count: number;
  producers: number;
  explorers: number;
  developers: number;
}

// ---------------------------------------------------------------------------
// Commodity tabs config (order matters for display)
// ---------------------------------------------------------------------------
const COMMODITY_TABS = [
  { slug: 'gold',        label: 'Gold',        symbol: 'Au' },
  { slug: 'copper',      label: 'Copper',      symbol: 'Cu' },
  { slug: 'iron-ore',    label: 'Iron Ore',    symbol: 'Fe' },
  { slug: 'lithium',     label: 'Lithium',     symbol: 'Li' },
  { slug: 'uranium',     label: 'Uranium',     symbol: 'U'  },
  { slug: 'nickel',      label: 'Nickel',      symbol: 'Ni' },
  { slug: 'zinc',        label: 'Zinc',        symbol: 'Zn' },
  { slug: 'coal',        label: 'Coal',        symbol: 'C'  },
  { slug: 'silver',      label: 'Silver',      symbol: 'Ag' },
  { slug: 'rare-earths', label: 'Rare Earths', symbol: 'REE'},
  { slug: 'cobalt',      label: 'Cobalt',      symbol: 'Co' },
  { slug: 'platinum',    label: 'Platinum',    symbol: 'Pt' },
  { slug: 'manganese',   label: 'Manganese',   symbol: 'Mn' },
  { slug: 'graphite',    label: 'Graphite',    symbol: 'Gr' },
  { slug: 'tin',         label: 'Tin',         symbol: 'Sn' },
  { slug: 'lead',        label: 'Lead',        symbol: 'Pb' },
  { slug: 'potash',      label: 'Potash',      symbol: 'K'  },
  { slug: 'diamonds',    label: 'Diamonds',    symbol: '💎' },
];

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
function fmtNum(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined) return '—';
  if (Math.abs(val) >= 1e9) return `${(val / 1e9).toFixed(decimals)}B`;
  if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(decimals)}M`;
  if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(decimals)}K`;
  return val.toFixed(decimals);
}

function fmtMcap(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  return `$${val.toLocaleString()}`;
}

function fmtGrade(val: number | null | undefined, unit: string): string {
  if (val === null || val === undefined) return '—';
  return `${val.toFixed(2)} ${unit}`;
}

function fmtCost(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  return `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  return `${val.toFixed(1)}%`;
}

// Exchange flags
const exchangeFlags: Record<string, string> = {
  'ASX': '🇦🇺', 'TSX': '🇨🇦', 'TSXV': '🇨🇦', 'CSE': '🇨🇦',
  'JSE': '🇿🇦', 'NYSE': '🇺🇸', 'LSE': '🇬🇧', 'NASDAQ': '🇺🇸', 'HKEX': '🇭🇰',
};

// ---------------------------------------------------------------------------
// Sortable Header Cell component
// ---------------------------------------------------------------------------
function SortHeader({
  label, field, currentSort, currentDir, onSort, className = ''
}: {
  label: string; field: string; currentSort: string; currentDir: string;
  onSort: (f: string) => void; className?: string;
}) {
  const active = currentSort === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-primary-400 transition-colors whitespace-nowrap select-none ${
        active ? 'text-primary-400' : 'text-metallic-400'
      } ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          currentDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );
}

// ---------------------------------------------------------------------------
// CSV export helper
// ---------------------------------------------------------------------------
function exportCSV(data: CompanyRow[], commodity: string, meta: CommodityMeta) {
  const headers = [
    'Ticker', 'Name', 'Exchange', 'Type', 'Country', 'Primary',
    `M+I Resources (Mt)`, `M+I Grade (${meta.grade_unit})`, `M+I Contained (${meta.unit})`,
    `Inferred (Mt)`, `Inferred Contained (${meta.unit})`,
    `Total Resources (Mt)`, `Total Contained (${meta.unit})`,
    `Reserves (Mt)`, `Reserves Contained (${meta.unit})`,
    `AISC ($/${meta.unit})`, 'C1 Cost', 'NPV ($M)', 'IRR (%)',
    'Annual Production', 'Head Grade', 'Recovery (%)',
    'Mine Life (yrs)', 'Study', 'Market Cap ($)',
    `EV/Resource ${meta.unit}`, 'Stage'
  ];

  const rows = data.map(c => [
    c.ticker, c.name, c.exchange, c.company_type || '', c.country || '',
    c.is_primary ? 'Yes' : 'No',
    c.mi_resources_mt ?? '', c.mi_resources_grade ?? '', c.mi_resources_contained ?? '',
    c.inferred_mt ?? '', c.inferred_contained ?? '',
    c.resources_mt ?? '', c.resources_contained ?? '',
    c.reserves_mt ?? '', c.reserves_contained ?? '',
    c.aisc ?? '', c.c1_cost ?? '', c.npv ?? '', c.irr ?? '',
    c.annual_production ?? '', c.head_grade ?? '', c.recovery_pct ?? '',
    c.mine_life_years ?? '', c.study_type ?? '', c.market_cap ?? '',
    c.ev_per_resource ?? '', c.project_stage ?? ''
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${commodity.toLowerCase().replace(/\s+/g, '_')}_breakdown.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Resource Bar Chart
// ---------------------------------------------------------------------------
function ResourceBarChart({ data, meta }: { data: CompanyRow[]; meta: CommodityMeta }) {
  const chartData = data
    .filter(c => c.resources_contained && c.resources_contained > 0)
    .sort((a, b) => (b.resources_contained || 0) - (a.resources_contained || 0))
    .slice(0, 20)
    .map(c => ({
      ticker: c.ticker,
      mi: c.mi_resources_contained || 0,
      inferred: c.inferred_contained || 0,
      reserves: c.reserves_contained || 0,
    }));

  if (chartData.length === 0) return <div className="text-metallic-500 text-center py-8">No resource data available</div>;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="ticker" angle={-45} textAnchor="end" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => fmtNum(v, 1)} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6' }}
          formatter={(value: any) => [fmtNum(value as number, 2) + ` ${meta.unit}`, '']}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
        <Bar dataKey="reserves" stackId="a" fill="#f59e0b" name="Reserves" radius={[0, 0, 0, 0]} />
        <Bar dataKey="mi" stackId="a" fill="#3b82f6" name="M+I Resources" radius={[0, 0, 0, 0]} />
        <Bar dataKey="inferred" stackId="a" fill="#6366f1" name="Inferred" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// EV vs Resource Scatter
// ---------------------------------------------------------------------------
function EVResourceScatter({ data, meta }: { data: CompanyRow[]; meta: CommodityMeta }) {
  const chartData = data
    .filter(c => c.market_cap && c.resources_contained && c.resources_contained > 0 && c.market_cap > 0)
    .map(c => ({
      ticker: c.ticker,
      x: c.resources_contained!,
      y: c.market_cap!,
      z: c.resources_grade || 1,
      type: c.company_type || 'unknown',
    }));

  if (chartData.length === 0) return <div className="text-metallic-500 text-center py-8">Insufficient data for scatter plot</div>;

  const typeColors: Record<string, string> = {
    producer: '#10b981', explorer: '#3b82f6', developer: '#f59e0b',
    diversified: '#8b5cf6', royalty: '#ec4899', unknown: '#6b7280'
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          type="number" dataKey="x" name={`Resources (${meta.unit})`}
          tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => fmtNum(v, 1)}
          label={{ value: `Contained Metal (${meta.unit})`, position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 12 }}
        />
        <YAxis
          type="number" dataKey="y" name="Market Cap ($)"
          tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => fmtMcap(v)}
          label={{ value: 'Market Cap', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
        />
        <ZAxis type="number" dataKey="z" range={[40, 400]} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6' }}
          formatter={(value: any, name?: string) => {
            const v = value as number;
            if (name === `Resources (${meta.unit})`) return [fmtNum(v, 2) + ` ${meta.unit}`, 'Resources'];
            if (name === 'Market Cap ($)') return [fmtMcap(v), 'Market Cap'];
            return [v, name || ''];
          }}
          labelFormatter={(_, payload) => {
            if (payload && payload.length > 0) return (payload[0].payload as any).ticker;
            return '';
          }}
        />
        <Scatter data={chartData}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={typeColors[entry.type] || typeColors.unknown} fillOpacity={0.8} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================
export default function CommodityBreakdownPage() {
  // State
  const [selectedCommodity, setSelectedCommodity] = useState('gold');
  const [data, setData] = useState<BreakdownResponse | null>(null);
  const [summary, setSummary] = useState<CommoditySummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExchange, setFilterExchange] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('market_cap');
  const [sortDir, setSortDir] = useState('desc');
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');
  const [basisMode, setBasisMode] = useState<'100pct' | 'attributable'>('100pct');

  // Fetch summary once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/commodity-breakdown/summary`);
        if (res.ok) {
          const d = await res.json();
          setSummary(d.commodities || []);
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // Fetch breakdown on commodity or sort change
  const fetchBreakdown = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      if (filterExchange !== 'all') params.set('exchange', filterExchange);
      if (filterType !== 'all') params.set('stage', filterType);

      const res = await fetch(`${API_URL}/api/v1/commodity-breakdown/${selectedCommodity}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch breakdown');
      const d: BreakdownResponse = await res.json();
      setData(d);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [selectedCommodity, sortBy, sortDir, filterExchange, filterType]);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  // Filter companies locally (search)
  const filteredCompanies = useMemo(() => {
    if (!data?.companies) return [];
    return data.companies.filter(c =>
      c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Unique exchanges for filter
  const exchanges = useMemo(() => {
    if (!data?.companies) return [];
    return Array.from(new Set(data.companies.map(c => c.exchange))).sort();
  }, [data]);

  // Stats
  const stats = useMemo(() => {
    if (!data?.companies) return { total: 0, withResources: 0, withReserves: 0, withProduction: 0 };
    return {
      total: data.total,
      withResources: data.companies.filter(c => c.resources_contained).length,
      withReserves: data.companies.filter(c => c.reserves_contained).length,
      withProduction: data.companies.filter(c => c.annual_production).length,
    };
  }, [data]);

  const selectedTab = COMMODITY_TABS.find(t => t.slug === selectedCommodity);
  const color = selectedTab ? getCommodityColor(selectedTab.symbol) : '#6366f1';
  const meta = data?.meta || { metal_symbol: '?', unit: 't', grade_unit: '%' };

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* ---- Header ---- */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link
            href="/analysis"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-xl"
                style={{ backgroundColor: color }}
              >
                {meta.metal_symbol}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-metallic-100">Commodity Breakdown</h1>
                <p className="text-metallic-400 text-sm">
                  Peer benchmarking · Resources & Reserves · AISC · Production · Valuation
                  {data?.spot_price && (
                    <span className="ml-2 text-accent-gold">
                      Spot: ${data.spot_price.toLocaleString()}/{meta.unit}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Basis toggle */}
              <div className="hidden sm:flex items-center bg-metallic-800 border border-metallic-700 rounded-lg overflow-hidden text-xs">
                <button
                  onClick={() => setBasisMode('100pct')}
                  className={`px-3 py-1.5 transition-colors ${basisMode === '100pct' ? 'bg-primary-500 text-white' : 'text-metallic-400 hover:text-metallic-200'}`}
                >
                  100% Basis
                </button>
                <button
                  onClick={() => setBasisMode('attributable')}
                  className={`px-3 py-1.5 transition-colors ${basisMode === 'attributable' ? 'bg-primary-500 text-white' : 'text-metallic-400 hover:text-metallic-200'}`}
                >
                  Attributable
                </button>
              </div>
              {/* View toggle */}
              <div className="flex items-center bg-metallic-800 border border-metallic-700 rounded-lg overflow-hidden text-xs">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${viewMode === 'table' ? 'bg-primary-500 text-white' : 'text-metallic-400 hover:text-metallic-200'}`}
                >
                  <Table2 className="w-3.5 h-3.5" /> Table
                </button>
                <button
                  onClick={() => setViewMode('charts')}
                  className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${viewMode === 'charts' ? 'bg-primary-500 text-white' : 'text-metallic-400 hover:text-metallic-200'}`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Charts
                </button>
              </div>
              {/* Export */}
              <button
                onClick={() => data && exportCSV(filteredCompanies, data.commodity, meta)}
                disabled={!data}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800 hover:bg-metallic-700 border border-metallic-700 rounded-lg text-xs text-metallic-300 hover:text-metallic-100 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={fetchBreakdown}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800 hover:bg-metallic-700 border border-metallic-700 rounded-lg text-xs text-metallic-300 hover:text-metallic-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>

          {/* ---- Commodity Tabs ---- */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-metallic-700">
            {COMMODITY_TABS.map(tab => {
              const isActive = tab.slug === selectedCommodity;
              const tabColor = getCommodityColor(tab.symbol);
              const summaryItem = summary.find(s => s.commodity === tab.label);
              return (
                <button
                  key={tab.slug}
                  onClick={() => { setSelectedCommodity(tab.slug); setSearchTerm(''); setFilterExchange('all'); setFilterType('all'); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'bg-metallic-800/60 text-metallic-400 hover:bg-metallic-800 hover:text-metallic-200'
                  }`}
                  style={isActive ? { backgroundColor: tabColor } : undefined}
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-metallic-700'}`}
                    style={!isActive ? {} : { color: '#fff' }}
                  >
                    {tab.symbol.slice(0, 2)}
                  </span>
                  {tab.label}
                  {summaryItem && (
                    <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-metallic-500'}`}>
                      ({summaryItem.company_count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ---- Search & Filters ---- */}
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
              <input
                type="text"
                placeholder="Search by ticker or company name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-sm text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterExchange}
              onChange={e => setFilterExchange(e.target.value)}
              className="px-3 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-sm text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Exchanges</option>
              {exchanges.map(ex => (
                <option key={ex} value={ex}>{exchangeFlags[ex] || ''} {ex}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-sm text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Stages</option>
              <option value="producer">Producers</option>
              <option value="developer">Developers</option>
              <option value="explorer">Explorers</option>
              <option value="diversified">Diversified</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---- Stats bar ---- */}
      <div className="bg-metallic-900/30 border-b border-metallic-800/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-6 text-xs text-metallic-400 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-metallic-100 font-semibold">{stats.total}</span> Companies
          </div>
          <div className="flex items-center gap-1.5">
            <Gem className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-metallic-100 font-semibold">{stats.withResources}</span> with Resources
          </div>
          <div className="flex items-center gap-1.5">
            <Gem className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-metallic-100 font-semibold">{stats.withReserves}</span> with Reserves
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <span className="text-metallic-100 font-semibold">{stats.withProduction}</span> with Production
          </div>
          {data?.spot_price && (
            <div className="flex items-center gap-1.5 ml-auto text-accent-gold font-semibold">
              Spot ${data.spot_price.toLocaleString()}/{meta.unit}
            </div>
          )}
        </div>
      </div>

      {/* ---- Main Content ---- */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-metallic-400">Loading {selectedTab?.label || ''} company data…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchBreakdown} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
              Try Again
            </button>
          </div>
        ) : viewMode === 'charts' ? (
          /* ---- Charts View ---- */
          <div className="space-y-8">
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">Resources & Reserves — Top 20 by Contained Metal</h2>
              <ResourceBarChart data={filteredCompanies} meta={meta} />
            </div>
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">Market Cap vs Resources (bubble = grade)</h2>
              <p className="text-xs text-metallic-500 mb-3">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" /> Producer
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-3 mr-1" /> Explorer
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 ml-3 mr-1" /> Developer
                <span className="inline-block w-2 h-2 rounded-full bg-purple-500 ml-3 mr-1" /> Diversified
              </p>
              <EVResourceScatter data={filteredCompanies} meta={meta} />
            </div>
          </div>
        ) : (
          /* ---- Table View ---- */
          <div className="overflow-x-auto rounded-xl border border-metallic-800 bg-metallic-900/50">
            <table className="min-w-full divide-y divide-metallic-800">
              <thead className="bg-metallic-900">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-metallic-400 uppercase tracking-wider sticky left-0 bg-metallic-900 z-10">#</th>
                  <SortHeader label="Ticker" field="ticker" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} className="sticky left-8 bg-metallic-900 z-10" />
                  <SortHeader label="Name" field="name" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-metallic-400 uppercase tracking-wider">Exch</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-metallic-400 uppercase tracking-wider">Type</th>
                  <SortHeader label="Mkt Cap" field="market_cap" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label={`M+I (${meta.unit})`} field="mi_resources_contained" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label={`Inf (${meta.unit})`} field="inferred_contained" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortHeader label={`Total (${meta.unit})`} field="resources_contained" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Grade" field="resources_grade" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label={`Reserves (${meta.unit})`} field="reserves_contained" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="AISC" field="aisc" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="NPV" field="npv" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} className="hidden xl:table-cell" />
                  <SortHeader label="IRR" field="irr" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} className="hidden xl:table-cell" />
                  <SortHeader label="Production" field="annual_production" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Head Grade" field="head_grade" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortHeader label={`EV/${meta.unit}`} field="ev_per_resource" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-metallic-400 uppercase tracking-wider hidden xl:table-cell">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-metallic-800/50">
                {filteredCompanies.length === 0 ? (
                  <tr><td colSpan={18} className="text-center py-12 text-metallic-500">No companies found</td></tr>
                ) : (
                  filteredCompanies.map((c, idx) => {
                    const ownershipMult = basisMode === 'attributable' && c.ownership_pct ? c.ownership_pct / 100 : 1;
                    return (
                      <tr key={`${c.exchange}-${c.ticker}`} className="hover:bg-metallic-800/40 transition-colors">
                        <td className="px-3 py-2.5 text-xs text-metallic-500 sticky left-0 bg-metallic-900/80">{idx + 1}</td>
                        <td className="px-3 py-2.5 sticky left-8 bg-metallic-900/80 z-10">
                          <Link href={`/company/${c.ticker}`} className="text-sm font-semibold text-primary-400 hover:text-primary-300 hover:underline">
                            {c.ticker}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-metallic-200 max-w-[200px] truncate">{c.name}</td>
                        <td className="px-3 py-2.5 text-xs text-metallic-400">{exchangeFlags[c.exchange] || ''} {c.exchange}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                            c.company_type === 'producer' ? 'bg-green-500/20 text-green-400' :
                            c.company_type === 'developer' ? 'bg-amber-500/20 text-amber-400' :
                            c.company_type === 'explorer' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {c.company_type || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-metallic-100 font-medium">{fmtMcap(c.market_cap)}</td>
                        <td className="px-3 py-2.5 text-sm text-blue-300">{fmtNum(c.mi_resources_contained ? c.mi_resources_contained * ownershipMult : null)}</td>
                        <td className="px-3 py-2.5 text-sm text-indigo-300 hidden lg:table-cell">{fmtNum(c.inferred_contained ? c.inferred_contained * ownershipMult : null)}</td>
                        <td className="px-3 py-2.5 text-sm text-metallic-100 font-medium">{fmtNum(c.resources_contained ? c.resources_contained * ownershipMult : null)}</td>
                        <td className="px-3 py-2.5 text-sm text-metallic-300">{fmtGrade(c.resources_grade, meta.grade_unit)}</td>
                        <td className="px-3 py-2.5 text-sm text-amber-300">{fmtNum(c.reserves_contained ? c.reserves_contained * ownershipMult : null)}</td>
                        <td className="px-3 py-2.5 text-sm text-metallic-100">{fmtCost(c.aisc)}</td>
                        <td className="px-3 py-2.5 text-sm text-metallic-300 hidden xl:table-cell">{c.npv ? `$${fmtNum(c.npv)}` : '—'}</td>
                        <td className="px-3 py-2.5 text-sm text-metallic-300 hidden xl:table-cell">{fmtPct(c.irr)}</td>
                        <td className="px-3 py-2.5 text-sm text-green-300">{fmtNum(c.annual_production ? c.annual_production * ownershipMult : null)}</td>
                        <td className="px-3 py-2.5 text-sm text-metallic-300 hidden lg:table-cell">{fmtGrade(c.head_grade, meta.grade_unit)}</td>
                        <td className="px-3 py-2.5 text-sm text-metallic-100">{c.ev_per_resource ? `$${fmtNum(c.ev_per_resource)}` : '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-metallic-400 capitalize hidden xl:table-cell">{c.project_stage || c.study_type || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Footer info ---- */}
        {!loading && data && (
          <div className="mt-4 flex items-center justify-between text-xs text-metallic-500">
            <p>
              Showing {filteredCompanies.length} of {data.total} companies •
              Data sourced from ASX, TSX, JSE, NYSE & LSE filings
            </p>
            <p>
              {basisMode === 'attributable' ? '⚠ Attributable basis (ownership-adjusted)' : '100% project basis'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
