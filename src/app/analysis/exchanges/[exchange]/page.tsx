'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, Globe, ExternalLink, Search, Filter, Loader2, RefreshCw, ChevronDown, MapPin, Gem, TrendingUp, TrendingDown } from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

interface Company {
  ticker: string;
  name: string;
  exchange: string;
  primary_commodity: string | null;
  secondary_commodities: string | null;
  market_cap: number | null;
  market_cap_category: string | null;
  company_type: string | null;
  country: string | null;
  website: string | null;
}

// Exchange info mapping
const exchangeInfo: { [key: string]: { name: string; country: string; flag: string; color: string } } = {
  'asx': { name: 'Australian Securities Exchange', country: 'Australia', flag: '🇦🇺', color: '#012169' },
  'tsx': { name: 'Toronto Stock Exchange', country: 'Canada', flag: '🇨🇦', color: '#E31837' },
  'tsx-v': { name: 'TSX Venture Exchange', country: 'Canada', flag: '🇨🇦', color: '#E31837' },
  'tsxv': { name: 'TSX Venture Exchange', country: 'Canada', flag: '🇨🇦', color: '#E31837' },
  'cse': { name: 'Canadian Securities Exchange', country: 'Canada', flag: '🇨🇦', color: '#E31837' },
  'jse': { name: 'Johannesburg Stock Exchange', country: 'South Africa', flag: '🇿🇦', color: '#007749' },
  'lse': { name: 'London Stock Exchange', country: 'United Kingdom', flag: '🇬🇧', color: '#00205B' },
  'nyse': { name: 'New York Stock Exchange', country: 'United States', flag: '🇺🇸', color: '#002868' },
  'nasdaq': { name: 'NASDAQ', country: 'United States', flag: '🇺🇸', color: '#0091CD' },
  'hkex': { name: 'Hong Kong Stock Exchange', country: 'Hong Kong', flag: '🇭🇰', color: '#C8102E' },
  'bvl': { name: 'Lima Stock Exchange', country: 'Peru', flag: '🇵🇪', color: '#D91023' },
};

function formatMarketCap(value: number | null, category: string | null): string {
  if (value) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  }
  // Show category label if no numeric value
  if (category) {
    const labels: Record<string, string> = {
      'large_cap': 'Large Cap',
      'mid_cap': 'Mid Cap',
      'small_cap': 'Small Cap',
      'micro_cap': 'Micro Cap',
    };
    return labels[category] || category;
  }
  return '-';
}

function CompanyCard({ company }: { company: Company }) {
  const color = getCommodityColor(company.primary_commodity || 'Au');
  
  return (
    <Link 
      href={`/company/${company.ticker}`}
      className="block bg-metallic-900 border border-metallic-800 rounded-xl p-4 hover:border-primary-500/50 hover:bg-metallic-900/80 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ backgroundColor: color }}
          >
            {company.ticker.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-metallic-100">{company.ticker}</h3>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                company.company_type === 'producer' ? 'bg-green-500/20 text-green-400' :
                company.company_type === 'developer' ? 'bg-blue-500/20 text-blue-400' :
                'bg-metallic-700 text-metallic-400'
              }`}>
                {company.company_type || 'explorer'}
              </span>
            </div>
            <p className="text-sm text-metallic-400 line-clamp-1">{company.name}</p>
          </div>
        </div>
      </div>
      
      {/* Commodities */}
      {(company.primary_commodity || company.secondary_commodities) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {company.primary_commodity && (
            <span 
              className="px-2 py-1 text-xs font-medium rounded-md text-white"
              style={{ backgroundColor: getCommodityColor(company.primary_commodity) }}
            >
              {company.primary_commodity}
            </span>
          )}
          {company.secondary_commodities?.split(',').slice(0, 3).map((comm, i) => (
            <span 
              key={i}
              className="px-2 py-1 text-xs rounded-md bg-metallic-700 text-metallic-300"
            >
              {comm.trim()}
            </span>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-metallic-500">Market Cap</p>
          <p className="text-metallic-100 font-medium">{formatMarketCap(company.market_cap, company.market_cap_category)}</p>
        </div>
        <div>
          <p className="text-metallic-500">Type</p>
          <p className="text-metallic-100 font-medium capitalize">{company.company_type || 'explorer'}</p>
        </div>
      </div>
      
      {company.country && (
        <div className="flex items-center gap-1 mt-3 text-xs text-metallic-500">
          <MapPin className="w-3 h-3" />
          {company.country}
        </div>
      )}
    </Link>
  );
}

export default function ExchangeDetailPage() {
  const params = useParams();
  const exchange = params.exchange as string;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'producer' | 'developer' | 'explorer'>('all');
  const [filterCommodity, setFilterCommodity] = useState<string>('all');
  
  const info = exchangeInfo[exchange?.toLowerCase()] || { 
    name: exchange?.toUpperCase() || 'Exchange', 
    country: 'Unknown',
    flag: '🏦',
    color: '#6B7280'
  };

  const fetchCompanies = async () => {
    if (!exchange) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/spatial/exchanges/${exchange.toUpperCase()}/companies?limit=500`);
      if (!response.ok) throw new Error('Failed to fetch companies');
      
      const result = await response.json();
      setCompanies(result.companies || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Unable to fetch company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [exchange]);

  // Get unique commodities for filter
  const commodities = Array.from(new Set(
    companies
      .map(c => c.primary_commodity)
      .filter(Boolean)
  )).sort() as string[];

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || company.company_type === filterType;
    
    const matchesCommodity = 
      filterCommodity === 'all' || company.primary_commodity === filterCommodity;
    
    return matchesSearch && matchesType && matchesCommodity;
  });

  // Stats
  const producerCount = companies.filter(c => c.company_type === 'producer').length;
  const developerCount = companies.filter(c => c.company_type === 'developer').length;
  const explorerCount = companies.filter(c => c.company_type === 'explorer' || !c.company_type).length;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/analysis/exchanges"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Exchanges</span>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: info.color }}
              >
                {info.flag}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-metallic-100">{info.name}</h1>
                <p className="text-metallic-400 text-sm">
                  {companies.length.toLocaleString()} mining companies • {info.country}
                </p>
              </div>
            </div>
            <button
              onClick={fetchCompanies}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-metallic-800 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
              <input
                type="text"
                placeholder="Search by ticker or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="producer">Producers</option>
              <option value="developer">Developers</option>
              <option value="explorer">Explorers</option>
            </select>
            
            {/* Commodity filter */}
            <select
              value={filterCommodity}
              onChange={(e) => setFilterCommodity(e.target.value)}
              className="px-3 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Commodities</option>
              {commodities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-metallic-400">Loading companies from {info.name}...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchCompanies}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                  <Building2 className="w-4 h-4" />
                  Total Companies
                </div>
                <p className="text-2xl font-bold text-metallic-100">{companies.length.toLocaleString()}</p>
              </div>
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Producers
                </div>
                <p className="text-2xl font-bold text-metallic-100">{producerCount}</p>
                <p className="text-xs text-metallic-500">Operating mines</p>
              </div>
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                  <Gem className="w-4 h-4" />
                  Developers
                </div>
                <p className="text-2xl font-bold text-metallic-100">{developerCount}</p>
                <p className="text-xs text-metallic-500">Projects in development</p>
              </div>
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                  <Globe className="w-4 h-4" />
                  Explorers
                </div>
                <p className="text-2xl font-bold text-metallic-100">{explorerCount}</p>
                <p className="text-xs text-metallic-500">Early stage</p>
              </div>
            </div>

            {/* Results info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-metallic-400">
                Showing {filteredCompanies.length} of {companies.length} companies
              </p>
              <p className="text-xs text-metallic-500">
                Sorted alphabetically
              </p>
            </div>

            {/* Company grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map(company => (
                <CompanyCard 
                  key={`${company.exchange}-${company.ticker}`} 
                  company={company} 
                />
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-metallic-400">No companies found matching your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
