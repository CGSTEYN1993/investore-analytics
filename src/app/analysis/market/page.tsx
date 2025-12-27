'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, ChevronDown, ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, BarChart3, DollarSign, Percent,
  Activity, Volume2, PieChart, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Mock market data
const marketOverview = {
  totalMarketCap: '$2.85T',
  totalVolume24h: '$48.2B',
  avgChange: 1.42,
  gainers: 3421,
  losers: 1876,
  unchanged: 234,
};

const topGainers = [
  { ticker: 'LIT', name: 'Lithium Americas', commodity: 'Li', price: 12.45, change: 15.8, volume: '45.2M', marketCap: '$4.2B' },
  { ticker: 'URN', name: 'Uranium Energy', commodity: 'U', price: 8.32, change: 12.3, volume: '28.7M', marketCap: '$2.1B' },
  { ticker: 'GSR', name: 'Goldstrike Res', commodity: 'Au', price: 3.45, change: 11.5, volume: '12.8M', marketCap: '$890M' },
  { ticker: 'COP', name: 'Copper Mountain', commodity: 'Cu', price: 18.90, change: 9.8, volume: '8.4M', marketCap: '$1.8B' },
  { ticker: 'NKL', name: 'Nickel North', commodity: 'Ni', price: 5.67, change: 8.9, volume: '15.2M', marketCap: '$1.2B' },
];

const topLosers = [
  { ticker: 'IRM', name: 'Iron Mountain', commodity: 'Fe', price: 24.12, change: -8.5, volume: '32.1M', marketCap: '$3.4B' },
  { ticker: 'ZNC', name: 'Zinc Corp', commodity: 'Zn', price: 4.23, change: -6.2, volume: '9.8M', marketCap: '$650M' },
  { ticker: 'SLV', name: 'Silver Range', commodity: 'Ag', price: 6.78, change: -5.4, volume: '18.3M', marketCap: '$1.1B' },
  { ticker: 'PLT', name: 'Platinum Metals', commodity: 'Pt', price: 15.45, change: -4.8, volume: '6.7M', marketCap: '$980M' },
  { ticker: 'COB', name: 'Cobalt Blue', commodity: 'Co', price: 2.34, change: -4.1, volume: '22.4M', marketCap: '$456M' },
];

const sectorPerformance = [
  { name: 'Precious Metals', change: 2.4, marketCap: '$1.2T', volume: '$18.5B' },
  { name: 'Battery Metals', change: 4.8, marketCap: '$520B', volume: '$12.3B' },
  { name: 'Base Metals', change: -0.8, marketCap: '$680B', volume: '$9.8B' },
  { name: 'Bulk Commodities', change: -1.2, marketCap: '$340B', volume: '$5.4B' },
  { name: 'Specialty Metals', change: 1.5, marketCap: '$110B', volume: '$2.2B' },
];

function MarketCard({ company }: { 
  company: typeof topGainers[0] 
}) {
  const isPositive = company.change >= 0;
  const commodityColor = getCommodityColor(company.commodity);

  return (
    <Link
      href={`/company/${company.ticker}`}
      className="flex items-center justify-between p-4 bg-metallic-900 border border-metallic-800 rounded-lg hover:border-primary-500/50 transition-all"
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: commodityColor }}
        >
          {company.commodity}
        </div>
        <div>
          <div className="font-medium text-metallic-100">{company.ticker}</div>
          <div className="text-xs text-metallic-500">{company.name}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-medium text-metallic-100">${company.price.toFixed(2)}</div>
        <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isPositive ? '+' : ''}{company.change.toFixed(1)}%
        </div>
      </div>
    </Link>
  );
}

function SectorRow({ sector }: { sector: typeof sectorPerformance[0] }) {
  const isPositive = sector.change >= 0;

  return (
    <div className="flex items-center justify-between p-4 border-b border-metallic-800 last:border-b-0">
      <div className="flex-1">
        <div className="font-medium text-metallic-100">{sector.name}</div>
        <div className="text-xs text-metallic-500">Market Cap: {sector.marketCap}</div>
      </div>
      <div className="text-right">
        <div className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{sector.change}%
        </div>
        <div className="text-xs text-metallic-500">Vol: {sector.volume}</div>
      </div>
    </div>
  );
}

export default function MarketPage() {
  const [timeframe, setTimeframe] = useState('1D');
  const [sortBy, setSortBy] = useState<'change' | 'volume' | 'marketCap'>('change');

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'YTD'];

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
              <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
              <span>/</span>
              <span className="text-metallic-300">Market Data</span>
            </div>
            <h1 className="text-2xl font-bold text-metallic-100">Market Overview</h1>
            <p className="text-metallic-400 text-sm">Real-time market data and trading metrics</p>
          </div>

          {/* Market Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-xs mb-1">
                <DollarSign className="w-3 h-3" />
                Total Market Cap
              </div>
              <p className="text-xl font-bold text-metallic-100">{marketOverview.totalMarketCap}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-xs mb-1">
                <Activity className="w-3 h-3" />
                24h Volume
              </div>
              <p className="text-xl font-bold text-metallic-100">{marketOverview.totalVolume24h}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-xs mb-1">
                <Percent className="w-3 h-3" />
                Avg Change
              </div>
              <p className={`text-xl font-bold ${marketOverview.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketOverview.avgChange >= 0 ? '+' : ''}{marketOverview.avgChange}%
              </p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
                <ArrowUp className="w-3 h-3" />
                Gainers
              </div>
              <p className="text-xl font-bold text-metallic-100">{marketOverview.gainers.toLocaleString()}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 text-xs mb-1">
                <ArrowDown className="w-3 h-3" />
                Losers
              </div>
              <p className="text-xl font-bold text-metallic-100">{marketOverview.losers.toLocaleString()}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-xs mb-1">
                <Minus className="w-3 h-3" />
                Unchanged
              </div>
              <p className="text-xl font-bold text-metallic-100">{marketOverview.unchanged}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timeframe Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === tf 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-metallic-900 text-metallic-400 hover:bg-metallic-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none pl-4 pr-10 py-2 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="change">Sort by Change</option>
              <option value="volume">Sort by Volume</option>
              <option value="marketCap">Sort by Market Cap</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Gainers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top Gainers
                </h2>
                <Link href="/analysis/market/gainers" className="text-sm text-primary-400 hover:text-primary-300">
                  View all →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {topGainers.slice(0, 4).map((company) => (
                  <MarketCard key={company.ticker} company={company} />
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Top Losers
                </h2>
                <Link href="/analysis/market/losers" className="text-sm text-primary-400 hover:text-primary-300">
                  View all →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {topLosers.slice(0, 4).map((company) => (
                  <MarketCard key={company.ticker} company={company} />
                ))}
              </div>
            </div>

            {/* Volume Leaders */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Volume Leaders
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-metallic-500 border-b border-metallic-800">
                      <th className="text-left py-3 px-2">Company</th>
                      <th className="text-right py-3 px-2">Price</th>
                      <th className="text-right py-3 px-2">Change</th>
                      <th className="text-right py-3 px-2">Volume</th>
                      <th className="text-right py-3 px-2">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...topGainers, ...topLosers].sort((a, b) => 
                      parseFloat(b.volume.replace('M', '')) - parseFloat(a.volume.replace('M', ''))
                    ).slice(0, 5).map((company) => (
                      <tr key={company.ticker} className="border-b border-metallic-800/50 last:border-b-0">
                        <td className="py-3 px-2">
                          <Link href={`/company/${company.ticker}`} className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: getCommodityColor(company.commodity) }}
                            >
                              {company.commodity}
                            </div>
                            <div>
                              <div className="font-medium text-metallic-100">{company.ticker}</div>
                              <div className="text-xs text-metallic-500">{company.name}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="text-right py-3 px-2 text-metallic-100">${company.price.toFixed(2)}</td>
                        <td className={`text-right py-3 px-2 ${company.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {company.change >= 0 ? '+' : ''}{company.change}%
                        </td>
                        <td className="text-right py-3 px-2 text-metallic-300">{company.volume}</td>
                        <td className="text-right py-3 px-2 text-metallic-300">{company.marketCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sector Performance */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-metallic-800">
                <h3 className="font-semibold text-metallic-100 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Sector Performance
                </h3>
              </div>
              {sectorPerformance.map((sector) => (
                <SectorRow key={sector.name} sector={sector} />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h3 className="font-semibold text-metallic-100 mb-4">Market Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">52-Week Highs</span>
                  <span className="font-medium text-green-400">124</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">52-Week Lows</span>
                  <span className="font-medium text-red-400">56</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">Above 50 DMA</span>
                  <span className="font-medium text-metallic-100">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">Below 50 DMA</span>
                  <span className="font-medium text-metallic-100">1,684</span>
                </div>
              </div>
            </div>

            {/* Compare Tool Promo */}
            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-xl p-6">
              <BarChart3 className="w-8 h-8 text-primary-400 mb-3" />
              <h3 className="font-semibold text-metallic-100 mb-2">Compare Companies</h3>
              <p className="text-sm text-metallic-400 mb-4">
                Side-by-side comparison of metrics, valuations, and performance
              </p>
              <Link
                href="/analysis/compare"
                className="block text-center py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                Open Comparison Tool
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
