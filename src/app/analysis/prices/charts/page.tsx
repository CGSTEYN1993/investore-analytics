'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Plus,
  X,
  LineChart,
  BarChart3,
  Clock,
  Loader2,
  ChevronDown,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_BASE = RAILWAY_API_URL;

interface PricePoint {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CommodityHistory {
  commodity_id: string;
  name: string;
  symbol: string;
  unit: string;
  currency: string;
  period: string;
  interval: string;
  history: PricePoint[];
  summary: {
    start_price: number;
    end_price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    average: number;
  };
}

interface StockHistory {
  symbol: string;
  name: string;
  commodity: string;
  exchange: string;
  period: string;
  interval: string;
  history: PricePoint[];
  summary: {
    start_price: number;
    end_price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    average: number;
  };
}

interface CommodityOption {
  id: string;
  name: string;
  symbol: string;
  category: string;
}

interface CapitalRaising {
  id: number;
  date: string;
  completion_date: string | null;
  type: string;
  amount: number | null;
  currency: string;
  shares_issued: number | null;
  issue_price: number | null;
  dilution_pct: number | null;
  use_of_funds: string | null;
  purpose: string | null;
}

interface CapitalRaisingsResponse {
  symbol: string;
  period: string;
  capital_raisings: CapitalRaising[];
  count: number;
  source: string;
}

const COMMODITIES: CommodityOption[] = [
  { id: 'gold', name: 'Gold', symbol: 'XAU', category: 'precious_metals' },
  { id: 'silver', name: 'Silver', symbol: 'XAG', category: 'precious_metals' },
  { id: 'platinum', name: 'Platinum', symbol: 'XPT', category: 'precious_metals' },
  { id: 'palladium', name: 'Palladium', symbol: 'XPD', category: 'precious_metals' },
  { id: 'copper', name: 'Copper', symbol: 'HG', category: 'base_metals' },
  { id: 'aluminum', name: 'Aluminum', symbol: 'ALI', category: 'base_metals' },
  { id: 'zinc', name: 'Zinc', symbol: 'ZNC', category: 'base_metals' },
  { id: 'nickel', name: 'Nickel', symbol: 'NI', category: 'base_metals' },
  { id: 'lead', name: 'Lead', symbol: 'PB', category: 'base_metals' },
  { id: 'tin', name: 'Tin', symbol: 'SN', category: 'base_metals' },
  { id: 'iron_ore', name: 'Iron Ore', symbol: 'TIO', category: 'bulk' },
  { id: 'coal', name: 'Thermal Coal', symbol: 'MTF', category: 'bulk' },
  { id: 'coking_coal', name: 'Coking Coal', symbol: 'MCC', category: 'bulk' },
  { id: 'lithium', name: 'Lithium', symbol: 'LI', category: 'battery_metals' },
  { id: 'cobalt', name: 'Cobalt', symbol: 'CO', category: 'battery_metals' },
  { id: 'rare_earths', name: 'Rare Earths', symbol: 'REE', category: 'battery_metals' },
  { id: 'uranium', name: 'Uranium', symbol: 'UX', category: 'energy' },
  { id: 'crude_oil', name: 'Crude Oil', symbol: 'CL', category: 'energy' },
  { id: 'natural_gas', name: 'Natural Gas', symbol: 'NG', category: 'energy' },
];

const PERIODS = [
  { value: '1W', label: '1 Week' },
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' },
  { value: '2Y', label: '2 Years' },
  { value: '5Y', label: '5 Years' },
];

const COLORS = {
  commodity: '#f59e0b', // Amber for commodity
  stock: '#3b82f6', // Blue for stock
  comparison: '#10b981', // Green for comparison
  capitalRaising: '#ef4444', // Red for capital raisings
};

// Capital raising type colors
const RAISING_TYPE_COLORS: Record<string, string> = {
  'Placement': '#ef4444',
  'Rights Issue': '#f97316',
  'SPP': '#eab308',
  'Entitlement Offer': '#84cc16',
  'Convertible Note': '#8b5cf6',
};

export default function CommodityPriceChartsPage() {
  const [selectedCommodity, setSelectedCommodity] = useState<string>('gold');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
  const [commodityData, setCommodityData] = useState<CommodityHistory | null>(null);
  const [stockData, setStockData] = useState<StockHistory | null>(null);
  const [comparisonTicker, setComparisonTicker] = useState<string>('');
  const [tickerInput, setTickerInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommodityDropdown, setShowCommodityDropdown] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [normalizeData, setNormalizeData] = useState(true);
  
  // Capital raisings state
  const [capitalRaisings, setCapitalRaisings] = useState<CapitalRaising[]>([]);
  const [showCapitalRaisings, setShowCapitalRaisings] = useState(true);
  const [capitalRaisingsLoading, setCapitalRaisingsLoading] = useState(false);

  // Fetch commodity history
  const fetchCommodityHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/market/commodities/${selectedCommodity}/history?period=${selectedPeriod}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch commodity data');
      
      const data = await res.json();
      setCommodityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedCommodity, selectedPeriod]);

  // Fetch stock history for comparison
  const fetchStockHistory = useCallback(async (symbol: string) => {
    if (!symbol) {
      setStockData(null);
      setCapitalRaisings([]);
      return;
    }
    
    setStockLoading(true);
    
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/market/stock/${symbol}/history?period=${selectedPeriod}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch stock data');
      
      const data = await res.json();
      setStockData(data);
      
      // Also fetch capital raisings for this stock
      fetchCapitalRaisings(symbol);
    } catch (err) {
      console.error('Stock fetch error:', err);
      setStockData(null);
    } finally {
      setStockLoading(false);
    }
  }, [selectedPeriod]);
  
  // Fetch capital raisings for a stock
  const fetchCapitalRaisings = useCallback(async (symbol: string) => {
    if (!symbol) {
      setCapitalRaisings([]);
      return;
    }
    
    setCapitalRaisingsLoading(true);
    
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/market/stock/${symbol}/capital-raisings?period=${selectedPeriod}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch capital raisings');
      
      const data: CapitalRaisingsResponse = await res.json();
      setCapitalRaisings(data.capital_raisings || []);
    } catch (err) {
      console.error('Capital raisings fetch error:', err);
      setCapitalRaisings([]);
    } finally {
      setCapitalRaisingsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchCommodityHistory();
  }, [fetchCommodityHistory]);

  useEffect(() => {
    if (comparisonTicker) {
      fetchStockHistory(comparisonTicker);
    }
  }, [comparisonTicker, fetchStockHistory]);

  // Handle adding a comparison ticker
  const handleAddTicker = () => {
    if (tickerInput.trim()) {
      setComparisonTicker(tickerInput.trim().toUpperCase());
      setTickerInput('');
    }
  };

  // Remove comparison
  const handleRemoveComparison = () => {
    setComparisonTicker('');
    setStockData(null);
    setCapitalRaisings([]);
  };

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!commodityData?.history) return [];
    
    // Create a map of capital raising dates for quick lookup
    const capitalRaisingDates = new Set(capitalRaisings.map(cr => cr.date));
    
    const data = commodityData.history.map((point, idx) => {
      const entry: Record<string, unknown> = {
        date: point.date,
        commodityPrice: point.price,
        commodityLabel: commodityData.name,
      };
      
      // Add normalized value (percentage change from start)
      if (normalizeData && commodityData.history[0]) {
        const startPrice = commodityData.history[0].price;
        entry.commodityNormalized = ((point.price - startPrice) / startPrice) * 100;
      }
      
      // Add stock data if available
      if (stockData?.history && stockData.history[idx]) {
        entry.stockPrice = stockData.history[idx].price;
        entry.stockLabel = stockData.symbol;
        
        if (normalizeData && stockData.history[0]) {
          const startPrice = stockData.history[0].price;
          entry.stockNormalized = ((stockData.history[idx].price - startPrice) / startPrice) * 100;
        }
        
        // Mark if this date has a capital raising
        if (capitalRaisingDates.has(point.date)) {
          entry.hasCapitalRaising = true;
          const raising = capitalRaisings.find(cr => cr.date === point.date);
          if (raising) {
            entry.capitalRaisingType = raising.type;
            entry.capitalRaisingAmount = raising.amount;
          }
        }
      }
      
      return entry;
    });
    
    return data;
  }, [commodityData, stockData, normalizeData, capitalRaisings]);

  const selectedCommodityInfo = COMMODITIES.find(c => c.id === selectedCommodity);

  // Render price change badge
  const renderChange = (change: number, percent: number) => {
    const isPositive = percent >= 0;
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {isPositive ? '+' : ''}{percent.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/analysis/prices"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <LineChart className="w-6 h-6 text-amber-400" />
                  Commodity Price Charts
                </h1>
                <p className="text-sm text-slate-400">
                  Historical prices with stock comparison
                </p>
              </div>
            </div>
            
            <button
              onClick={fetchCommodityHistory}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls Row */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Commodity Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCommodityDropdown(!showCommodityDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors min-w-[200px]"
            >
              <span className="text-amber-400 font-medium">
                {selectedCommodityInfo?.name || 'Select Commodity'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
            </button>
            
            {showCommodityDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-30 max-h-80 overflow-y-auto">
                {['precious_metals', 'base_metals', 'bulk', 'battery_metals', 'energy'].map(category => (
                  <div key={category}>
                    <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wider bg-slate-900">
                      {category.replace('_', ' ')}
                    </div>
                    {COMMODITIES.filter(c => c.category === category).map(commodity => (
                      <button
                        key={commodity.id}
                        onClick={() => {
                          setSelectedCommodity(commodity.id);
                          setShowCommodityDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors ${
                          selectedCommodity === commodity.id ? 'bg-slate-700 text-amber-400' : 'text-white'
                        }`}
                      >
                        {commodity.name}
                        <span className="ml-2 text-xs text-slate-500">({commodity.symbol})</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Period Selector */}
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {PERIODS.map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {period.value}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-2 text-sm transition-colors ${
                chartType === 'area' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-2 text-sm transition-colors ${
                chartType === 'line' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Line
            </button>
          </div>

          {/* Normalize Toggle */}
          {comparisonTicker && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={normalizeData}
                onChange={(e) => setNormalizeData(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-400">Normalize (% change)</span>
            </label>
          )}
        </div>

        {/* Comparison Ticker Input */}
        <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Compare with Stock</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTicker()}
                placeholder="Enter ticker (e.g., NST, EVN, RRL)"
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <button
              onClick={handleAddTicker}
              disabled={!tickerInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          
          {/* Active comparison */}
          {comparisonTicker && (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Comparing with:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
                  {comparisonTicker}
                  {stockLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <button onClick={handleRemoveComparison} className="ml-1 hover:text-blue-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
                {stockData && (
                  <span className="text-xs text-slate-500">
                    ({stockData.name})
                  </span>
                )}
              </div>
              
              {/* Capital Raisings Toggle */}
              <div className="h-4 w-px bg-slate-700" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCapitalRaisings}
                  onChange={(e) => setShowCapitalRaisings(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-red-400" />
                  Capital Raisings
                  {capitalRaisings.length > 0 && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                      {capitalRaisings.length}
                    </span>
                  )}
                  {capitalRaisingsLoading && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Main Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          {/* Summary Stats */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            {/* Commodity Stats */}
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.commodity }} />
              <div>
                <div className="text-sm text-slate-400">{commodityData?.name || selectedCommodityInfo?.name}</div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-white">
                    ${commodityData?.summary.end_price.toLocaleString()}
                  </span>
                  {commodityData?.summary && renderChange(commodityData.summary.change, commodityData.summary.changePercent)}
                </div>
              </div>
            </div>
            
            {/* Stock Stats */}
            {stockData && (
              <>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.stock }} />
                  <div>
                    <div className="text-sm text-slate-400">{stockData.symbol} ({stockData.name})</div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-white">
                        ${stockData.summary.end_price.toFixed(2)}
                      </span>
                      {renderChange(stockData.summary.change, stockData.summary.changePercent)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chart */}
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="commodityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.commodity} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.commodity} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.stock} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.stock} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return selectedPeriod === '1W' || selectedPeriod === '1M'
                          ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => normalizeData && comparisonTicker ? `${val > 0 ? '+' : ''}${val.toFixed(1)}%` : `$${val.toLocaleString()}`}
                    />
                    {comparisonTicker && !normalizeData && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(val) => `$${val.toFixed(2)}`}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value, name) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        if (normalizeData && comparisonTicker) {
                          return [`${numValue > 0 ? '+' : ''}${numValue.toFixed(2)}%`, name];
                        }
                        return [`$${numValue.toLocaleString()}`, name];
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey={normalizeData && comparisonTicker ? 'commodityNormalized' : 'commodityPrice'}
                      name={commodityData?.name || 'Commodity'}
                      stroke={COLORS.commodity}
                      fill="url(#commodityGradient)"
                      strokeWidth={2}
                    />
                    {stockData && (
                      <Area
                        yAxisId={normalizeData ? 'left' : 'right'}
                        type="monotone"
                        dataKey={normalizeData ? 'stockNormalized' : 'stockPrice'}
                        name={stockData.symbol}
                        stroke={COLORS.stock}
                        fill="url(#stockGradient)"
                        strokeWidth={2}
                      />
                    )}
                    {/* Capital Raising Reference Lines */}
                    {showCapitalRaisings && capitalRaisings.map((raising, idx) => (
                      <ReferenceLine
                        key={`cr-${idx}`}
                        x={raising.date}
                        stroke={RAISING_TYPE_COLORS[raising.type] || COLORS.capitalRaising}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        label={{
                          value: '💰',
                          position: 'top',
                          fill: RAISING_TYPE_COLORS[raising.type] || COLORS.capitalRaising,
                          fontSize: 14,
                        }}
                      />
                    ))}
                  </AreaChart>
                ) : (
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return selectedPeriod === '1W' || selectedPeriod === '1M'
                          ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => normalizeData && comparisonTicker ? `${val > 0 ? '+' : ''}${val.toFixed(1)}%` : `$${val.toLocaleString()}`}
                    />
                    {comparisonTicker && !normalizeData && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(val) => `$${val.toFixed(2)}`}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={normalizeData && comparisonTicker ? 'commodityNormalized' : 'commodityPrice'}
                      name={commodityData?.name || 'Commodity'}
                      stroke={COLORS.commodity}
                      strokeWidth={2}
                      dot={false}
                    />
                    {stockData && (
                      <Line
                        yAxisId={normalizeData ? 'left' : 'right'}
                        type="monotone"
                        dataKey={normalizeData ? 'stockNormalized' : 'stockPrice'}
                        name={stockData.symbol}
                        stroke={COLORS.stock}
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {/* Capital Raising Reference Lines */}
                    {showCapitalRaisings && capitalRaisings.map((raising, idx) => (
                      <ReferenceLine
                        key={`cr-line-${idx}`}
                        x={raising.date}
                        stroke={RAISING_TYPE_COLORS[raising.type] || COLORS.capitalRaising}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        label={{
                          value: '💰',
                          position: 'top',
                          fill: RAISING_TYPE_COLORS[raising.type] || COLORS.capitalRaising,
                          fontSize: 14,
                        }}
                      />
                    ))}
                  </RechartsLineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Period Statistics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Commodity Stats */}
          {commodityData?.summary && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.commodity }} />
                {commodityData.name} Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Period Start</p>
                  <p className="text-lg font-semibold text-white">${commodityData.summary.start_price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Period End</p>
                  <p className="text-lg font-semibold text-white">${commodityData.summary.end_price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Period High</p>
                  <p className="text-lg font-semibold text-green-400">${commodityData.summary.high.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Period Low</p>
                  <p className="text-lg font-semibold text-red-400">${commodityData.summary.low.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Average</p>
                  <p className="text-lg font-semibold text-slate-300">${commodityData.summary.average.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Period Change</p>
                  <p className={`text-lg font-semibold ${commodityData.summary.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {commodityData.summary.changePercent >= 0 ? '+' : ''}{commodityData.summary.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stock Stats */}
          {stockData?.summary && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.stock }} />
                {stockData.symbol} Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Period Start</p>
                  <p className="text-lg font-semibold text-white">${stockData.summary.start_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Period End</p>
                  <p className="text-lg font-semibold text-white">${stockData.summary.end_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Period High</p>
                  <p className="text-lg font-semibold text-green-400">${stockData.summary.high.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Period Low</p>
                  <p className="text-lg font-semibold text-red-400">${stockData.summary.low.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Average</p>
                  <p className="text-lg font-semibold text-slate-300">${stockData.summary.average.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Period Change</p>
                  <p className={`text-lg font-semibold ${stockData.summary.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stockData.summary.changePercent >= 0 ? '+' : ''}{stockData.summary.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Capital Raisings Details */}
        {comparisonTicker && capitalRaisings.length > 0 && showCapitalRaisings && (
          <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-400" />
              Capital Raisings for {comparisonTicker}
              <span className="text-sm font-normal text-slate-400">({capitalRaisings.length} in period)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Date</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Type</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Amount</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Issue Price</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Dilution</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {capitalRaisings.map((raising, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-white">
                        {new Date(raising.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${RAISING_TYPE_COLORS[raising.type] || COLORS.capitalRaising}20`,
                            color: RAISING_TYPE_COLORS[raising.type] || COLORS.capitalRaising,
                          }}
                        >
                          {raising.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-white font-medium">
                        {raising.amount 
                          ? `$${(raising.amount / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {raising.issue_price 
                          ? `$${raising.issue_price.toFixed(3)}`
                          : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-red-400">
                        {raising.dilution_pct 
                          ? `${raising.dilution_pct.toFixed(1)}%`
                          : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-400 max-w-[200px] truncate" title={raising.purpose || ''}>
                        {raising.purpose || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {Object.entries(RAISING_TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
                  <span className="text-slate-400">{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
