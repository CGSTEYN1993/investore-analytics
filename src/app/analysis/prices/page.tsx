'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  Gem,
  Fuel,
  Zap,
  Factory,
  BarChart3,
  Clock,
  Filter
} from 'lucide-react';

import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_BASE = RAILWAY_API_URL;

interface CommodityPrice {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  currency: string;
  category: string;
  timestamp: string;
}

interface CommodityOverview {
  summary: {
    totalCommodities: number;
    gainers: number;
    losers: number;
    averageChange: number;
  };
  byCategory: Record<string, CommodityPrice[]>;
  movers: {
    gainers: CommodityPrice[];
    losers: CommodityPrice[];
  };
  timestamp: string;
}

const CATEGORY_INFO: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  precious_metals: { icon: Gem, label: 'Precious Metals', color: 'from-yellow-500 to-amber-600' },
  base_metals: { icon: Factory, label: 'Base Metals', color: 'from-slate-500 to-zinc-600' },
  battery_metals: { icon: Zap, label: 'Battery Metals', color: 'from-green-500 to-emerald-600' },
  bulk: { icon: BarChart3, label: 'Bulk Commodities', color: 'from-orange-500 to-red-600' },
  energy: { icon: Fuel, label: 'Energy', color: 'from-blue-500 to-indigo-600' },
};

export default function CommodityPricesPage() {
  const [overview, setOverview] = useState<CommodityOverview | null>(null);
  const [allCommodities, setAllCommodities] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [overviewRes, allRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/market/commodities/overview`),
        fetch(`${API_BASE}/api/v1/market/commodities`),
      ]);
      
      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data);
      }
      
      if (allRes.ok) {
        const data = await allRes.json();
        setAllCommodities(data.commodities || []);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commodity data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredCommodities = selectedCategory
    ? allCommodities.filter(c => c.category === selectedCategory)
    : allCommodities;

  const formatPrice = (price: number, unit: string) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/analysis"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                  Commodity Spot Prices
                </h1>
                <p className="text-sm text-slate-400">Real-time prices for mining commodities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="text-2xl font-bold text-white">{overview.summary.totalCommodities}</div>
              <div className="text-sm text-slate-400">Commodities Tracked</div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="text-2xl font-bold text-green-400">{overview.summary.gainers}</div>
              <div className="text-sm text-green-400/70">Gainers</div>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="text-2xl font-bold text-red-400">{overview.summary.losers}</div>
              <div className="text-sm text-red-400/70">Losers</div>
            </div>
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className={`text-2xl font-bold ${overview.summary.averageChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {overview.summary.averageChange >= 0 ? '+' : ''}{overview.summary.averageChange.toFixed(2)}%
              </div>
              <div className="text-sm text-slate-400">Avg Change</div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
            }`}
          >
            All Commodities
          </button>
          {Object.entries(CATEGORY_INFO).map(([key, { icon: Icon, label }]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === key
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Top Movers */}
        {overview && !selectedCategory && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Top Gainers */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Top Gainers
              </h3>
              <div className="space-y-3">
                {overview.movers.gainers.slice(0, 5).map((commodity) => (
                  <div key={commodity.id} className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{commodity.name}</div>
                      <div className="text-xs text-slate-500">{commodity.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white">{formatPrice(commodity.price, commodity.unit)}<span className="text-slate-500 text-xs">/{commodity.unit}</span></div>
                      <div className="text-green-400 text-sm font-medium">+{commodity.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Top Losers
              </h3>
              <div className="space-y-3">
                {overview.movers.losers.slice(0, 5).map((commodity) => (
                  <div key={commodity.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{commodity.name}</div>
                      <div className="text-xs text-slate-500">{commodity.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white">{formatPrice(commodity.price, commodity.unit)}<span className="text-slate-500 text-xs">/{commodity.unit}</span></div>
                      <div className="text-red-400 text-sm font-medium">{commodity.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Commodities Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              {selectedCategory ? CATEGORY_INFO[selectedCategory]?.label : 'All Commodities'}
              <span className="text-sm text-slate-500 font-normal">({filteredCommodities.length})</span>
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-500" />
              <div className="text-slate-500">Loading prices...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Commodity</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Price</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Change</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">% Change</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCommodities.map((commodity) => {
                    const isPositive = commodity.changePercent >= 0;
                    const CategoryIcon = CATEGORY_INFO[commodity.category]?.icon || BarChart3;
                    
                    return (
                      <tr key={commodity.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_INFO[commodity.category]?.color || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                              <CategoryIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-white">{commodity.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-400">{commodity.symbol}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-mono font-medium text-white">
                            {formatPrice(commodity.price, commodity.unit)}
                          </span>
                          <span className="text-slate-500 text-xs ml-1">/{commodity.unit}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{commodity.change.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                            isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPositive ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs text-slate-500 capitalize">
                            {commodity.category.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Data Source Note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Prices are indicative and updated periodically. For trading purposes, please verify with your broker.
        </div>
      </div>
    </div>
  );
}
