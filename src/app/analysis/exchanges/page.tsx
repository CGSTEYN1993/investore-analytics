'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Globe, TrendingUp, TrendingDown, Building2,
  ArrowUpRight, ArrowDownRight, BarChart3, ChevronDown, ExternalLink
} from 'lucide-react';

// Stock exchange data with mining company focus
const exchanges = [
  {
    code: 'TSX',
    name: 'Toronto Stock Exchange',
    country: 'Canada',
    flag: '🇨🇦',
    companies: 1247,
    marketCap: '$512B',
    volume24h: '$3.2B',
    change: 1.85,
    topCommodities: ['Au', 'Cu', 'Li'],
    color: '#E31837',
  },
  {
    code: 'TSX-V',
    name: 'TSX Venture Exchange',
    country: 'Canada',
    flag: '🇨🇦',
    companies: 1589,
    marketCap: '$52B',
    volume24h: '$420M',
    change: 2.34,
    topCommodities: ['Au', 'Cu', 'Ag'],
    color: '#E31837',
  },
  {
    code: 'ASX',
    name: 'Australian Securities Exchange',
    country: 'Australia',
    flag: '🇦🇺',
    companies: 892,
    marketCap: '$425B',
    volume24h: '$2.8B',
    change: -0.52,
    topCommodities: ['Au', 'Fe', 'Li'],
    color: '#012169',
  },
  {
    code: 'LSE',
    name: 'London Stock Exchange',
    country: 'United Kingdom',
    flag: '🇬🇧',
    companies: 456,
    marketCap: '$380B',
    volume24h: '$1.9B',
    change: 0.78,
    topCommodities: ['Au', 'Cu', 'Pt'],
    color: '#00205B',
  },
  {
    code: 'JSE',
    name: 'Johannesburg Stock Exchange',
    country: 'South Africa',
    flag: '🇿🇦',
    companies: 312,
    marketCap: '$285B',
    volume24h: '$980M',
    change: -1.23,
    topCommodities: ['Au', 'Pt', 'Pd'],
    color: '#007749',
  },
  {
    code: 'NYSE',
    name: 'New York Stock Exchange',
    country: 'United States',
    flag: '🇺🇸',
    companies: 234,
    marketCap: '$320B',
    volume24h: '$2.1B',
    change: 1.12,
    topCommodities: ['Au', 'Cu', 'U'],
    color: '#002868',
  },
  {
    code: 'HKEx',
    name: 'Hong Kong Stock Exchange',
    country: 'Hong Kong',
    flag: '🇭🇰',
    companies: 178,
    marketCap: '$145B',
    volume24h: '$650M',
    change: -0.89,
    topCommodities: ['Au', 'Cu', 'Fe'],
    color: '#C8102E',
  },
  {
    code: 'BVL',
    name: 'Lima Stock Exchange',
    country: 'Peru',
    flag: '🇵🇪',
    companies: 89,
    marketCap: '$42B',
    volume24h: '$120M',
    change: 3.45,
    topCommodities: ['Cu', 'Ag', 'Zn'],
    color: '#D91023',
  },
];

// Top performers by exchange
const topPerformers = {
  'TSX': [
    { ticker: 'ABX', name: 'Barrick Gold', change: 4.25, price: 22.45 },
    { ticker: 'NTR', name: 'Nutrien Ltd', change: 3.12, price: 64.80 },
    { ticker: 'TECK.B', name: 'Teck Resources', change: 2.89, price: 48.32 },
  ],
  'ASX': [
    { ticker: 'BHP', name: 'BHP Group', change: 2.15, price: 45.20 },
    { ticker: 'RIO', name: 'Rio Tinto', change: 1.98, price: 118.50 },
    { ticker: 'FMG', name: 'Fortescue', change: 1.45, price: 22.85 },
  ],
  'LSE': [
    { ticker: 'GLEN', name: 'Glencore', change: 3.21, price: 4.85 },
    { ticker: 'AAL', name: 'Anglo American', change: 2.56, price: 24.32 },
    { ticker: 'ANTO', name: 'Antofagasta', change: 1.78, price: 17.90 },
  ],
};

function ExchangeCard({ exchange }: { exchange: typeof exchanges[0] }) {
  const isPositive = exchange.change >= 0;

  return (
    <Link
      href={`/analysis/exchanges/${exchange.code.toLowerCase()}`}
      className="group bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{exchange.flag}</span>
          <div>
            <h3 className="font-bold text-metallic-100 group-hover:text-primary-400 transition-colors">
              {exchange.code}
            </h3>
            <p className="text-xs text-metallic-500">{exchange.name}</p>
          </div>
        </div>
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isPositive ? '+' : ''}{exchange.change}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-metallic-500 mb-1">Mining Companies</p>
          <p className="text-lg font-bold text-metallic-100">{exchange.companies.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Market Cap</p>
          <p className="text-lg font-bold text-metallic-100">{exchange.marketCap}</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">24h Volume</p>
          <p className="text-sm text-metallic-300">{exchange.volume24h}</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Top Commodities</p>
          <div className="flex gap-1">
            {exchange.topCommodities.map((c) => (
              <span key={c} className="px-1.5 py-0.5 bg-metallic-800 rounded text-xs text-metallic-300">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-metallic-800">
        <span className="text-sm text-metallic-400">{exchange.country}</span>
        <span className="text-xs text-primary-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          View details <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function TopPerformersTable({ exchangeCode }: { exchangeCode: string }) {
  const performers = topPerformers[exchangeCode as keyof typeof topPerformers] || [];
  
  if (performers.length === 0) return null;

  return (
    <div className="space-y-2">
      {performers.map((company) => (
        <Link
          key={company.ticker}
          href={`/company/${company.ticker}`}
          className="flex items-center justify-between p-3 bg-metallic-800/50 rounded-lg hover:bg-metallic-800 transition-colors"
        >
          <div>
            <span className="font-medium text-metallic-100">{company.ticker}</span>
            <span className="text-xs text-metallic-500 ml-2">{company.name}</span>
          </div>
          <div className="text-right">
            <span className="text-sm text-metallic-300">${company.price.toFixed(2)}</span>
            <span className="text-xs text-green-400 ml-2">+{company.change.toFixed(2)}%</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ExchangesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'companies' | 'marketCap' | 'volume' | 'change'>('companies');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = ['all', 'North America', 'Europe', 'Asia Pacific', 'Africa', 'South America'];

  const filteredExchanges = exchanges
    .filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.country.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'companies') return b.companies - a.companies;
      if (sortBy === 'change') return b.change - a.change;
      return 0;
    });

  const totalCompanies = exchanges.reduce((sum, e) => sum + e.companies, 0);
  const avgChange = (exchanges.reduce((sum, e) => sum + e.change, 0) / exchanges.length).toFixed(2);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
                <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
                <span>/</span>
                <span className="text-metallic-300">Exchanges</span>
              </div>
              <h1 className="text-2xl font-bold text-metallic-100">Mining Stock Exchanges</h1>
              <p className="text-metallic-400 text-sm">Browse mining companies by stock exchange</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <Globe className="w-4 h-4" />
                Exchanges Tracked
              </div>
              <p className="text-2xl font-bold text-metallic-100">{exchanges.length}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <Building2 className="w-4 h-4" />
                Total Companies
              </div>
              <p className="text-2xl font-bold text-metallic-100">{totalCompanies.toLocaleString()}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <BarChart3 className="w-4 h-4" />
                Avg. Change
              </div>
              <p className={`text-2xl font-bold ${Number(avgChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Number(avgChange) >= 0 ? '+' : ''}{avgChange}%
              </p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Best Performer
              </div>
              <p className="text-2xl font-bold text-green-400">BVL +3.45%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
            <input
              type="text"
              placeholder="Search exchanges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="companies">Most Companies</option>
                <option value="marketCap">Market Cap</option>
                <option value="volume">24h Volume</option>
                <option value="change">Performance</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Exchange Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredExchanges.map((exchange) => (
            <ExchangeCard key={exchange.code} exchange={exchange} />
          ))}
        </div>

        {/* Top Performers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-metallic-100 mb-6">Top Daily Performers by Exchange</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['TSX', 'ASX', 'LSE'].map((code) => (
              <div key={code} className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">
                    {exchanges.find(e => e.code === code)?.flag}
                  </span>
                  <h3 className="font-semibold text-metallic-100">{code}</h3>
                </div>
                <TopPerformersTable exchangeCode={code} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
