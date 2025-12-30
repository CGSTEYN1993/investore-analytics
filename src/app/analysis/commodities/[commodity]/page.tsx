'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, Globe, ExternalLink, Search, Filter, Loader2, RefreshCw, ChevronDown, MapPin, Gem } from 'lucide-react';
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
  is_primary: boolean;
}

interface CommodityData {
  commodity: string;
  total: number;
  companies: Company[];
  offset: number;
  limit: number;
}

// Commodity name mapping
const commodityDisplayNames: { [key: string]: { name: string; symbol: string } } = {
  'gold': { name: 'Gold', symbol: 'Au' },
  'silver': { name: 'Silver', symbol: 'Ag' },
  'copper': { name: 'Copper', symbol: 'Cu' },
  'lithium': { name: 'Lithium', symbol: 'Li' },
  'nickel': { name: 'Nickel', symbol: 'Ni' },
  'uranium': { name: 'Uranium', symbol: 'U' },
  'zinc': { name: 'Zinc', symbol: 'Zn' },
  'iron-ore': { name: 'Iron Ore', symbol: 'Fe' },
  'platinum': { name: 'Platinum', symbol: 'Pt' },
  'palladium': { name: 'Palladium', symbol: 'Pd' },
  'cobalt': { name: 'Cobalt', symbol: 'Co' },
  'graphite': { name: 'Graphite', symbol: 'C' },
  'manganese': { name: 'Manganese', symbol: 'Mn' },
  'vanadium': { name: 'Vanadium', symbol: 'V' },
  'coal': { name: 'Coal', symbol: 'Coal' },
  'potash': { name: 'Potash', symbol: 'K' },
  'rare-earths': { name: 'Rare Earths', symbol: 'REE' },
  'tungsten': { name: 'Tungsten', symbol: 'W' },
  'tin': { name: 'Tin', symbol: 'Sn' },
  'molybdenum': { name: 'Molybdenum', symbol: 'Mo' },
  'diamonds': { name: 'Diamonds', symbol: '💎' },
  'titanium': { name: 'Titanium', symbol: 'Ti' },
  'chromium': { name: 'Chromium', symbol: 'Cr' },
  'lead': { name: 'Lead', symbol: 'Pb' },
  'diversified': { name: 'Diversified Miners', symbol: 'Di' },
};

// Exchange flags
const exchangeFlags: { [key: string]: string } = {
  'ASX': '🇦🇺',
  'TSX': '🇨🇦',
  'TSXV': '🇨🇦',
  'CSE': '🇨🇦',
  'JSE': '🇿🇦',
  'NYSE': '🇺🇸',
  'LSE': '🇬🇧',
  'NASDAQ': '🇺🇸',
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

function CompanyCard({ company, commoditySymbol, isDiversified }: { company: Company; commoditySymbol: string; isDiversified?: boolean }) {
  const color = getCommodityColor(company.primary_commodity || commoditySymbol);
  
  // For diversified companies, show their actual commodities prominently
  const showCommoditiesProminently = isDiversified || commoditySymbol === 'Di' || !company.is_primary;
  
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
              <span className="text-xs px-1.5 py-0.5 bg-metallic-800 rounded text-metallic-400">
                {exchangeFlags[company.exchange] || ''} {company.exchange}
              </span>
              {company.is_primary && !isDiversified && (
                <span className="text-xs px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded">
                  Primary
                </span>
              )}
            </div>
            <p className="text-sm text-metallic-400 line-clamp-1">{company.name}</p>
          </div>
        </div>
        {company.website && (
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(company.website!, '_blank');
            }}
            className="text-metallic-500 hover:text-primary-400 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </span>
        )}
      </div>
      
      {/* Commodities section - more prominent for diversified */}
      {showCommoditiesProminently && (company.primary_commodity || company.secondary_commodities) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {company.primary_commodity && (
            <span 
              className="px-2 py-1 text-xs font-medium rounded-md text-white"
              style={{ backgroundColor: getCommodityColor(company.primary_commodity) }}
            >
              {company.primary_commodity}
            </span>
          )}
          {company.secondary_commodities?.split(',').map((comm, i) => (
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
          <p className="text-metallic-100 font-medium capitalize">{company.company_type || '-'}</p>
        </div>
        {!showCommoditiesProminently && company.primary_commodity && (
          <div>
            <p className="text-metallic-500">Primary</p>
            <p className="text-metallic-100 font-medium">{company.primary_commodity}</p>
          </div>
        )}
        {!showCommoditiesProminently && company.secondary_commodities && (
          <div>
            <p className="text-metallic-500">Also mines</p>
            <p className="text-metallic-300 text-xs line-clamp-1">{company.secondary_commodities}</p>
          </div>
        )}
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

export default function CommodityDetailPage() {
  const params = useParams();
  const commodity = params.commodity as string;
  const [data, setData] = useState<CommodityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'primary' | 'secondary'>('all');
  const [filterExchange, setFilterExchange] = useState<string>('all');
  
  const commodityInfo = commodityDisplayNames[commodity] || { 
    name: commodity?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown', 
    symbol: commodity?.slice(0, 2).toUpperCase() || '??' 
  };
  const color = getCommodityColor(commodityInfo.symbol);

  const fetchCompanies = async () => {
    if (!commodity) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/spatial/commodities/${commodity}/companies?limit=500`);
      if (!response.ok) throw new Error('Failed to fetch companies');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Unable to fetch company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [commodity]);

  // Filter companies
  const filteredCompanies = data?.companies.filter(company => {
    const matchesSearch = 
      company.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' ||
      (filterType === 'primary' && company.is_primary) ||
      (filterType === 'secondary' && !company.is_primary);
    
    const matchesExchange = 
      filterExchange === 'all' || company.exchange === filterExchange;
    
    return matchesSearch && matchesType && matchesExchange;
  }) || [];

  // Get unique exchanges for filter
  const exchanges = Array.from(new Set(data?.companies.map(c => c.exchange) || [])).sort();
  
  // Stats
  const primaryCount = data?.companies.filter(c => c.is_primary).length || 0;
  const secondaryCount = (data?.total || 0) - primaryCount;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/analysis/commodities"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Commodities</span>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-xl"
                style={{ backgroundColor: color }}
              >
                {commodityInfo.symbol}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-metallic-100">{commodityInfo.name} Mining Companies</h1>
                <p className="text-metallic-400 text-sm">
                  {data?.total.toLocaleString() || 0} companies • {primaryCount} primary, {secondaryCount} secondary producers
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-metallic-500" />
              <input
                type="text"
                placeholder="Search companies by ticker or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              {/* Type filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="primary">Primary Producers</option>
                <option value="secondary">Secondary Producers</option>
              </select>
              
              {/* Exchange filter */}
              <select
                value={filterExchange}
                onChange={(e) => setFilterExchange(e.target.value)}
                className="px-3 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Exchanges</option>
                {exchanges.map(ex => (
                  <option key={ex} value={ex}>{exchangeFlags[ex] || ''} {ex}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-metallic-400">Loading {commodityInfo.name} companies from database...</p>
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
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                  <Building2 className="w-4 h-4" />
                  Total Companies
                </div>
                <p className="text-2xl font-bold text-metallic-100">{data?.total.toLocaleString()}</p>
              </div>
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-primary-400 text-sm mb-1">
                  <Gem className="w-4 h-4" />
                  Primary Producers
                </div>
                <p className="text-2xl font-bold text-metallic-100">{primaryCount}</p>
                <p className="text-xs text-metallic-500">Main commodity focus</p>
              </div>
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                  <Globe className="w-4 h-4" />
                  Secondary Producers
                </div>
                <p className="text-2xl font-bold text-metallic-100">{secondaryCount}</p>
                <p className="text-xs text-metallic-500">Multi-commodity operations</p>
              </div>
            </div>

            {/* Results info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-metallic-400">
                Showing {filteredCompanies.length} of {data?.total || 0} companies
              </p>
              <p className="text-xs text-metallic-500">
                Sorted by market cap
              </p>
            </div>

            {/* Company grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map(company => (
                <CompanyCard 
                  key={`${company.exchange}-${company.ticker}`} 
                  company={company} 
                  commoditySymbol={commodityInfo.symbol}
                  isDiversified={commodity === 'diversified' || commodityInfo.symbol === 'Di'}
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
