'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Search, Plus, X, BarChart3, Building2, DollarSign,
  TrendingUp, TrendingDown, Scale, ArrowLeft, Loader2, LineChart
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const API_BASE = RAILWAY_API_URL;

interface ChartCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartData {
  symbol: string;
  name: string;
  exchange: string;
  period: string;
  candles: ChartCandle[];
  count: number;
  source: string;
}

interface CapitalRaising {
  id: number;
  announcement_date: string;
  raising_type: string;
  amount_raised: number | null;
  price_per_share: number | null;
  shares_issued: number | null;
  discount_percent: number | null;
}

interface CompanySearchResult {
  symbol: string;
  name: string;
  exchange: string;
  primary_commodity: string;
}

interface ComparisonStock {
  symbol: string;
  name: string;
  exchange: string;
  commodity: string;
  chartData: ChartData | null;
  capitalRaisings: CapitalRaising[];
  loading: boolean;
  color: string;
}

const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

const PERIODS = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
];

export default function ComparePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stocks, setStocks] = useState<ComparisonStock[]>([]);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [normalizeData, setNormalizeData] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [showCapitalRaisings, setShowCapitalRaisings] = useState(true);

  // Search companies
  const searchCompanies = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/spatial/companies?search=${encodeURIComponent(query)}&page_size=10`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.companies || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchCompanies(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCompanies]);

  // Fetch chart data for a stock
  const fetchChartData = async (symbol: string): Promise<ChartData | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/market/chart/${symbol}?period=${selectedPeriod}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error(`Error fetching chart for ${symbol}:`, err);
    }
    return null;
  };

  // Fetch capital raisings for a stock
  const fetchCapitalRaisings = async (symbol: string): Promise<CapitalRaising[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/market/stock/${symbol}/capital-raisings?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        return data.capital_raisings || [];
      }
    } catch (err) {
      console.error(`Error fetching capital raisings for ${symbol}:`, err);
    }
    return [];
  };

  // Add a stock to comparison
  const addStock = async (company: CompanySearchResult) => {
    // Don't add if already in list or max 5 companies
    if (stocks.some(s => s.symbol === company.symbol) || stocks.length >= 5) {
      setShowAddModal(false);
      setSearchQuery('');
      return;
    }
    
    const colorIndex = stocks.length % CHART_COLORS.length;
    const newStock: ComparisonStock = {
      symbol: company.symbol,
      name: company.name,
      exchange: company.exchange,
      commodity: company.primary_commodity || '',
      chartData: null,
      capitalRaisings: [],
      loading: true,
      color: CHART_COLORS[colorIndex],
    };
    
    setStocks(prev => [...prev, newStock]);
    setShowAddModal(false);
    setSearchQuery('');
    
    // Fetch data
    const [chartData, capitalRaisings] = await Promise.all([
      fetchChartData(company.symbol),
      fetchCapitalRaisings(company.symbol),
    ]);
    
    setStocks(prev => prev.map(s => 
      s.symbol === company.symbol 
        ? { ...s, chartData, capitalRaisings, loading: false }
        : s
    ));
  };

  // Remove a stock from comparison
  const removeStock = (symbol: string) => {
    setStocks(prev => {
      const remaining = prev.filter(s => s.symbol !== symbol);
      // Reassign colors
      return remaining.map((s, idx) => ({ ...s, color: CHART_COLORS[idx % CHART_COLORS.length] }));
    });
  };

  // Refresh all stocks when period changes
  useEffect(() => {
    const refreshAllStocks = async () => {
      if (stocks.length === 0) return;
      
      // Mark all as loading
      setStocks(prev => prev.map(s => ({ ...s, loading: true })));
      
      // Fetch all data in parallel
      const updates = await Promise.all(
        stocks.map(async (stock) => {
          const [chartData, capitalRaisings] = await Promise.all([
            fetchChartData(stock.symbol),
            fetchCapitalRaisings(stock.symbol),
          ]);
          return { symbol: stock.symbol, chartData, capitalRaisings };
        })
      );
      
      setStocks(prev => prev.map(s => {
        const update = updates.find(u => u.symbol === s.symbol);
        if (update) {
          return { ...s, chartData: update.chartData, capitalRaisings: update.capitalRaisings, loading: false };
        }
        return s;
      }));
    };
    
    refreshAllStocks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  // Prepare normalized chart data
  const plotTraces = useMemo(() => {
    const traces: any[] = [];
    
    stocks.forEach(stock => {
      if (!stock.chartData?.candles || stock.chartData.candles.length === 0) return;
      
      const candles = stock.chartData.candles;
      const dates = candles.map(c => c.timestamp);
      const closes = candles.map(c => c.close);
      const volumes = candles.map(c => c.volume);
      
      // Normalize to percentage change if enabled
      let yValues: number[];
      if (normalizeData) {
        const startPrice = closes[0];
        yValues = closes.map(c => ((c - startPrice) / startPrice) * 100);
      } else {
        yValues = closes;
      }
      
      // Main price trace
      if (chartType === 'candlestick' && stocks.length === 1) {
        traces.push({
          x: dates,
          open: candles.map(c => c.open),
          high: candles.map(c => c.high),
          low: candles.map(c => c.low),
          close: closes,
          type: 'candlestick',
          name: stock.symbol,
          increasing: { line: { color: '#22c55e' } },
          decreasing: { line: { color: '#ef4444' } },
          yaxis: 'y2',
        });
      } else {
        traces.push({
          x: dates,
          y: yValues,
          type: 'scatter',
          mode: 'lines',
          name: stock.symbol,
          line: { color: stock.color, width: 2 },
          hovertemplate: normalizeData 
            ? `${stock.symbol}<br>%{x}<br>%{y:.2f}%<extra></extra>`
            : `${stock.symbol}<br>%{x}<br>$%{y:.4f}<extra></extra>`,
          yaxis: 'y2',
        });
      }
      
      // Volume bars
      if (showVolume) {
        traces.push({
          x: dates,
          y: volumes,
          type: 'bar',
          name: `${stock.symbol} Vol`,
          marker: { 
            color: stock.color,
            opacity: 0.3,
          },
          yaxis: 'y',
          hovertemplate: `${stock.symbol} Vol<br>%{x}<br>%{y:,.0f}<extra></extra>`,
        });
      }
      
      // Capital raisings markers
      if (showCapitalRaisings && stock.capitalRaisings.length > 0) {
        const crDates: string[] = [];
        const crValues: number[] = [];
        const crTexts: string[] = [];
        
        stock.capitalRaisings.forEach(cr => {
          const crDate = cr.announcement_date.split('T')[0];
          const idx = dates.findIndex(d => d.startsWith(crDate));
          
          if (idx >= 0) {
            crDates.push(dates[idx]);
            crValues.push(yValues[idx]);
            crTexts.push(`${cr.raising_type}${cr.amount_raised ? ` $${(cr.amount_raised / 1e6).toFixed(1)}M` : ''}`);
          }
        });
        
        if (crDates.length > 0) {
          traces.push({
            x: crDates,
            y: crValues,
            type: 'scatter',
            mode: 'markers',
            name: `${stock.symbol} Raisings`,
            marker: {
              symbol: 'triangle-down',
              size: 12,
              color: '#f59e0b',
              line: { color: '#ffffff', width: 1 },
            },
            text: crTexts,
            hovertemplate: `${stock.symbol}<br>%{text}<br>%{x}<extra>Capital Raising</extra>`,
            yaxis: 'y2',
          });
        }
      }
    });
    
    return traces;
  }, [stocks, normalizeData, showVolume, showCapitalRaisings, chartType]);

  // Calculate summary statistics for each stock
  const stockStats = useMemo(() => {
    return stocks.map(stock => {
      if (!stock.chartData?.candles || stock.chartData.candles.length === 0) {
        return { ...stock, stats: null };
      }
      
      const candles = stock.chartData.candles;
      const closes = candles.map(c => c.close);
      const startPrice = closes[0];
      const endPrice = closes[closes.length - 1];
      const change = endPrice - startPrice;
      const changePercent = (change / startPrice) * 100;
      const high = Math.max(...candles.map(c => c.high));
      const low = Math.min(...candles.map(c => c.low));
      const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
      
      return {
        ...stock,
        stats: {
          startPrice,
          endPrice,
          change,
          changePercent,
          high,
          low,
          avgVolume,
          source: stock.chartData.source,
        },
      };
    });
  }, [stocks]);

  const anyLoading = stocks.some(s => s.loading);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
                <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
                <span>/</span>
                <span className="text-metallic-300">Compare</span>
              </div>
              <h1 className="text-2xl font-bold text-metallic-100">Company Comparison</h1>
              <p className="text-metallic-400 text-sm">Compare mining companies with real market data</p>
            </div>
            
            {/* Period selector */}
            <div className="flex items-center gap-1 bg-metallic-800/50 rounded-lg p-1">
              {PERIODS.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-primary-500 text-white'
                      : 'text-metallic-400 hover:text-white hover:bg-metallic-700'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Companies */}
          <div className="flex flex-wrap items-center gap-3">
            {stocks.map((stock) => (
              <div 
                key={stock.symbol}
                className="flex items-center gap-3 px-4 py-3 bg-metallic-800/50 rounded-lg"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stock.color }}
                />
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: getCommodityColor(stock.commodity) }}
                >
                  {stock.commodity?.slice(0, 2) || '?'}
                </div>
                <div>
                  <Link 
                    href={`/company/${stock.symbol}`}
                    className="font-medium text-metallic-100 hover:text-primary-400 transition-colors"
                  >
                    {stock.symbol}
                  </Link>
                  <div className="text-xs text-metallic-500">{stock.name}</div>
                </div>
                {stock.loading ? (
                  <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                ) : stock.chartData ? (
                  <div className={`text-sm ${
                    stockStats.find(s => s.symbol === stock.symbol)?.stats?.changePercent ?? 0 >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {(() => {
                      const stat = stockStats.find(s => s.symbol === stock.symbol)?.stats;
                      if (!stat) return '-';
                      return `${stat.changePercent >= 0 ? '+' : ''}${stat.changePercent.toFixed(1)}%`;
                    })()}
                  </div>
                ) : null}
                <button
                  onClick={() => removeStock(stock.symbol)}
                  className="p-1 rounded hover:bg-metallic-700 text-metallic-500 hover:text-metallic-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {stocks.length < 5 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-metallic-700 rounded-lg text-metallic-500 hover:border-primary-500 hover:text-primary-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Company
              </button>
            )}
          </div>
          
          {/* Chart options */}
          {stocks.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-metallic-800">
              {stocks.length === 1 && (
                <div className="flex items-center gap-1 bg-metallic-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                      chartType === 'line'
                        ? 'bg-primary-500 text-white'
                        : 'text-metallic-400 hover:text-white hover:bg-metallic-700'
                    }`}
                  >
                    <LineChart className="w-4 h-4" />
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('candlestick')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                      chartType === 'candlestick'
                        ? 'bg-primary-500 text-white'
                        : 'text-metallic-400 hover:text-white hover:bg-metallic-700'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Candle
                  </button>
                </div>
              )}
              
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={normalizeData}
                  onChange={(e) => setNormalizeData(e.target.checked)}
                  className="rounded bg-metallic-800 border-metallic-700 text-primary-500"
                />
                <span className="text-metallic-400">Normalize %</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={showVolume}
                  onChange={(e) => setShowVolume(e.target.checked)}
                  className="rounded bg-metallic-800 border-metallic-700 text-primary-500"
                />
                <span className="text-metallic-400">Volume</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={showCapitalRaisings}
                  onChange={(e) => setShowCapitalRaisings(e.target.checked)}
                  className="rounded bg-metallic-800 border-metallic-700 text-primary-500"
                />
                <span className="text-metallic-400">Capital Raisings</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stocks.length === 0 ? (
          <div className="text-center py-16">
            <Scale className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-metallic-100 mb-2">No companies selected</h2>
            <p className="text-metallic-400 mb-6">Add companies to compare their stock performance</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add Companies
            </button>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 mb-8">
              <div className={showVolume ? "h-[500px]" : "h-[400px]"}>
                {anyLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : plotTraces.length > 0 ? (
                  <Plot
                    data={plotTraces}
                    layout={{
                      autosize: true,
                      margin: { l: 60, r: 20, t: 40, b: 60 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      title: {
                        text: normalizeData ? 'Performance Comparison (% Change)' : 'Price Comparison',
                        font: { color: '#e2e8f0', size: 14 },
                        x: 0.5,
                      },
                      xaxis: {
                        showgrid: false,
                        color: '#64748b',
                        tickformat: selectedPeriod === '1D' ? '%H:%M' : '%b %d',
                      },
                      yaxis: {
                        showgrid: false,
                        color: '#64748b',
                        domain: showVolume ? [0, 0.2] : [0, 0],
                        showticklabels: showVolume,
                        title: showVolume ? { text: 'Volume', font: { size: 10, color: '#64748b' } } : undefined,
                      },
                      yaxis2: {
                        showgrid: true,
                        gridcolor: 'rgba(100, 116, 139, 0.2)',
                        color: '#64748b',
                        domain: showVolume ? [0.25, 1] : [0, 1],
                        side: 'left',
                        ticksuffix: normalizeData ? '%' : '',
                        tickprefix: normalizeData ? '' : '$',
                        zeroline: normalizeData,
                        zerolinecolor: 'rgba(100, 116, 139, 0.5)',
                      },
                      hovermode: 'x unified',
                      hoverlabel: {
                        bgcolor: '#1e293b',
                        bordercolor: '#334155',
                        font: { color: '#f1f5f9' },
                      },
                      legend: {
                        x: 0,
                        y: 1.15,
                        orientation: 'h',
                        font: { color: '#94a3b8', size: 11 },
                      },
                      showlegend: stocks.length > 1,
                    }}
                    config={{
                      displayModeBar: false,
                      responsive: true,
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-metallic-500">No chart data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            {stockStats.filter(s => s.stats).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {stockStats.map(stock => stock.stats && (
                  <div 
                    key={stock.symbol}
                    className="bg-metallic-900 border border-metallic-800 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: stock.color }}
                      />
                      <Link
                        href={`/company/${stock.symbol}`}
                        className="text-lg font-semibold text-metallic-100 hover:text-primary-400 transition-colors"
                      >
                        {stock.symbol}
                      </Link>
                      <span className="text-sm text-metallic-500 truncate">{stock.name}</span>
                      <span className="ml-auto text-xs px-2 py-0.5 bg-metallic-800 rounded text-metallic-400">
                        {stock.stats.source}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-metallic-500">Start</p>
                        <p className="font-semibold text-metallic-100">${stock.stats.startPrice.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-metallic-500">End</p>
                        <p className="font-semibold text-metallic-100">${stock.stats.endPrice.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-metallic-500">High</p>
                        <p className="font-semibold text-green-400">${stock.stats.high.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-metallic-500">Low</p>
                        <p className="font-semibold text-red-400">${stock.stats.low.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-metallic-500">Avg Volume</p>
                        <p className="font-semibold text-metallic-300">
                          {stock.stats.avgVolume >= 1e6 
                            ? `${(stock.stats.avgVolume / 1e6).toFixed(1)}M`
                            : stock.stats.avgVolume >= 1e3
                            ? `${(stock.stats.avgVolume / 1e3).toFixed(0)}K`
                            : stock.stats.avgVolume.toFixed(0)
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-metallic-500">Change</p>
                        <p className={`font-semibold flex items-center gap-1 ${
                          stock.stats.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {stock.stats.changePercent >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {stock.stats.changePercent >= 0 ? '+' : ''}{stock.stats.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Capital raisings count */}
                    {stock.capitalRaisings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-metallic-800">
                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                          <DollarSign className="w-4 h-4" />
                          {stock.capitalRaisings.length} capital raising{stock.capitalRaisings.length > 1 ? 's' : ''} in period
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Capital Raisings Table */}
            {showCapitalRaisings && stocks.some(s => s.capitalRaisings.length > 0) && (
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  Capital Raisings
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-metallic-700">
                        <th className="text-left py-2 px-3 text-metallic-400 font-medium">Company</th>
                        <th className="text-left py-2 px-3 text-metallic-400 font-medium">Date</th>
                        <th className="text-left py-2 px-3 text-metallic-400 font-medium">Type</th>
                        <th className="text-right py-2 px-3 text-metallic-400 font-medium">Amount</th>
                        <th className="text-right py-2 px-3 text-metallic-400 font-medium">Price/Share</th>
                        <th className="text-right py-2 px-3 text-metallic-400 font-medium">Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.flatMap(stock => 
                        stock.capitalRaisings.map((cr, idx) => (
                          <tr key={`${stock.symbol}-${idx}`} className="border-b border-metallic-800 hover:bg-metallic-800/50">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stock.color }} />
                                <span className="text-metallic-100 font-medium">{stock.symbol}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-metallic-300">
                              {cr.announcement_date.split('T')[0]}
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                                {cr.raising_type}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right text-metallic-100 font-medium">
                              {cr.amount_raised ? `$${(cr.amount_raised / 1e6).toFixed(1)}M` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-metallic-300">
                              {cr.price_per_share ? `$${cr.price_per_share.toFixed(4)}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-red-400">
                              {cr.discount_percent ? `-${cr.discount_percent.toFixed(1)}%` : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-metallic-800">
              <h3 className="font-semibold text-metallic-100">Add Company</h3>
              <button
                onClick={() => { setShowAddModal(false); setSearchQuery(''); }}
                className="p-1 rounded hover:bg-metallic-800 text-metallic-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                <input
                  type="text"
                  placeholder="Search by ticker or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-400 animate-spin" />
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchResults.length === 0 && searchQuery && !searchLoading ? (
                  <div className="text-center py-8 text-metallic-500">
                    No companies found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchResults.map((company) => (
                    <button
                      key={company.symbol}
                      onClick={() => addStock(company)}
                      disabled={stocks.some(s => s.symbol === company.symbol)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        stocks.some(s => s.symbol === company.symbol)
                          ? 'opacity-50 cursor-not-allowed bg-metallic-800/50'
                          : 'hover:bg-metallic-800'
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-metallic-500" />
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: getCommodityColor(company.primary_commodity) }}
                      >
                        {company.primary_commodity?.slice(0, 2) || '?'}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-metallic-100">{company.symbol}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-metallic-700 rounded text-metallic-400">
                            {company.exchange}
                          </span>
                        </div>
                        <div className="text-sm text-metallic-500 truncate">{company.name}</div>
                      </div>
                    </button>
                  ))
                )}
                {!searchQuery && (
                  <div className="text-center py-8 text-metallic-500">
                    Start typing to search companies...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
