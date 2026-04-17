'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, Globe, Building2,
  BarChart3, ChevronDown, ExternalLink, ArrowLeft
} from 'lucide-react';
import { SkeletonCard } from '@/components/ui/skeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

// Display metadata keyed by exchange code. Market-cap / volume / % change are NOT
// hardcoded any more — we show N/A until a real market-data source is wired up.
const EXCHANGE_META: Record<string, { name: string; country: string; flag: string; color: string }> = {
  TSX:    { name: 'Toronto Stock Exchange',          country: 'Canada',         flag: '🇨🇦', color: '#E31837' },
  TSXV:   { name: 'TSX Venture Exchange',            country: 'Canada',         flag: '🇨🇦', color: '#E31837' },
  'TSX-V':{ name: 'TSX Venture Exchange',            country: 'Canada',         flag: '🇨🇦', color: '#E31837' },
  ASX:    { name: 'Australian Securities Exchange',  country: 'Australia',      flag: '🇦🇺', color: '#012169' },
  LSE:    { name: 'London Stock Exchange',           country: 'United Kingdom', flag: '🇬🇧', color: '#00205B' },
  JSE:    { name: 'Johannesburg Stock Exchange',     country: 'South Africa',   flag: '🇿🇦', color: '#007749' },
  NYSE:   { name: 'New York Stock Exchange',         country: 'United States',  flag: '🇺🇸', color: '#002868' },
  NASDAQ: { name: 'NASDAQ',                          country: 'United States',  flag: '🇺🇸', color: '#002868' },
  HKEX:   { name: 'Hong Kong Stock Exchange',        country: 'Hong Kong',      flag: '🇭🇰', color: '#C8102E' },
  CSE:    { name: 'Canadian Securities Exchange',    country: 'Canada',         flag: '🇨🇦', color: '#E31837' },
};

interface ApiExchange {
  exchange: string;
  total_companies: number;
  producers: number;
  explorers: number;
  developers: number;
  diversified: number;
  commodities: string[];
  countries: string[];
}

interface UIExchange {
  code: string;
  name: string;
  country: string;
  flag: string;
  color: string;
  companies: number;
  producers: number;
  topCommodities: string[];
}

function ExchangeCard({ exchange }: { exchange: UIExchange }) {
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
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-metallic-500 mb-1">Mining Companies</p>
          <p className="text-lg font-bold text-metallic-100">{exchange.companies.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Producers</p>
          <p className="text-lg font-bold text-metallic-100">{exchange.producers.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Market Cap</p>
          <p className="text-sm text-metallic-500">N/A</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Top Commodities</p>
          <div className="flex flex-wrap gap-1">
            {exchange.topCommodities.length > 0 ? exchange.topCommodities.map((c) => (
              <span key={c} className="px-1.5 py-0.5 bg-metallic-800 rounded text-xs text-metallic-300">
                {c}
              </span>
            )) : <span className="text-xs text-metallic-500">N/A</span>}
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

export default function ExchangesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'companies' | 'producers'>('companies');
  const [exchanges, setExchanges] = useState<UIExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/spatial/exchanges`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rows: ApiExchange[] = data.exchanges || [];
        const mapped: UIExchange[] = rows.map((r) => {
          const meta = EXCHANGE_META[r.exchange.toUpperCase()] || {
            name: r.exchange, country: r.countries?.[0] || 'Unknown', flag: '🌐', color: '#64748b',
          };
          return {
            code: r.exchange,
            name: meta.name,
            country: meta.country,
            flag: meta.flag,
            color: meta.color,
            companies: r.total_companies || 0,
            producers: r.producers || 0,
            topCommodities: (r.commodities || []).slice(0, 3),
          };
        });
        setExchanges(mapped);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load exchanges');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredExchanges = exchanges
    .filter(e =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.country.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => sortBy === 'producers' ? b.producers - a.producers : b.companies - a.companies);

  const totalCompanies = exchanges.reduce((sum, e) => sum + e.companies, 0);
  const totalProducers = exchanges.reduce((sum, e) => sum + e.producers, 0);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <Globe className="w-4 h-4" /> Exchanges Tracked
              </div>
              <p className="text-2xl font-bold text-metallic-100">
                {loading ? '—' : exchanges.length}
              </p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <Building2 className="w-4 h-4" /> Total Companies
              </div>
              <p className="text-2xl font-bold text-metallic-100">
                {loading ? '—' : totalCompanies.toLocaleString()}
              </p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <BarChart3 className="w-4 h-4" /> Total Producers
              </div>
              <p className="text-2xl font-bold text-metallic-100">
                {loading ? '—' : totalProducers.toLocaleString()}
              </p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <BarChart3 className="w-4 h-4" /> Avg. Change
              </div>
              <p className="text-2xl font-bold text-metallic-500">N/A</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="companies">Most Companies</option>
              <option value="producers">Most Producers</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
          </div>
        </div>

        {/* Exchange Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} className="h-52" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-metallic-900 border border-red-900/50 rounded-xl p-12 text-center">
            <p className="text-red-400">Failed to load exchanges: {error}</p>
          </div>
        ) : filteredExchanges.length === 0 ? (
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-12 text-center">
            <p className="text-metallic-400">No exchanges match your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredExchanges.map((exchange) => (
              <ExchangeCard key={exchange.code} exchange={exchange} />
            ))}
          </div>
        )}

        {/* Top Performers — N/A until real market data source wired up */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-metallic-100 mb-6">Top Daily Performers by Exchange</h2>
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-8 text-center">
            <p className="text-metallic-500">N/A — live intraday performance data is not yet connected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
