'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  Filter, 
  Building2, 
  Gem, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  Search,
  X,
  ChevronDown,
  Loader2,
  Factory,
  Compass,
  Hammer,
  Crown,
  Layers
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

interface Company {
  symbol: string;
  name: string;
  exchange: string;
  company_type: string;
  primary_commodity: string;
  secondary_commodities: string[];
  country: string;
  headquarters: string;
  latitude: number | null;
  longitude: number | null;
  market_cap_category: string;
  description: string;
}

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: Company;
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
  metadata: {
    total_companies: number;
    filters_applied: {
      exchange: string | null;
      commodity: string | null;
      country: string | null;
      company_type: string | null;
    };
  };
}

interface FilterOptions {
  exchanges: string[];
  commodities: string[];
  countries: string[];
  company_types: string[];
}

interface ExchangeSummary {
  exchange: string;
  total_companies: number;
  producers: number;
  explorers: number;
  developers: number;
  diversified: number;
  commodities: string[];
  countries: string[];
}

// Company type icons
const CompanyTypeIcon = ({ type }: { type: string }): JSX.Element => {
  switch (type) {
    case 'producer':
      return <Factory className="h-4 w-4 text-green-500" />;
    case 'explorer':
      return <Compass className="h-4 w-4 text-blue-500" />;
    case 'developer':
      return <Hammer className="h-4 w-4 text-yellow-500" />;
    case 'royalty':
      return <Crown className="h-4 w-4 text-purple-500" />;
    case 'diversified':
      return <Layers className="h-4 w-4 text-indigo-500" />;
    default:
      return <Building2 className="h-4 w-4 text-gray-500" />;
  }
};

// Exchange badge colors - dark theme
const exchangeColors: Record<string, string> = {
  ASX: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  JSE: 'bg-green-500/20 text-green-400 border border-green-500/30',
  CSE: 'bg-red-500/20 text-red-400 border border-red-500/30',
  TSX: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  TSXV: 'bg-purple-400/20 text-purple-300 border border-purple-400/30',
  NYSE: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  NASDAQ: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  LSE: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
};

// Commodity category colors
const commodityColors: Record<string, string> = {
  Gold: 'bg-yellow-500',
  Silver: 'bg-gray-400',
  Copper: 'bg-orange-600',
  Lithium: 'bg-cyan-400',
  Iron_Ore: 'bg-red-700',
  Uranium: 'bg-lime-500',
  Platinum: 'bg-slate-500',
  Nickel: 'bg-emerald-600',
  Rare_Earths: 'bg-violet-500',
  Coal: 'bg-gray-700',
  Diversified: 'bg-indigo-500',
};

export default function GlobalSpatialPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [exchangeSummary, setExchangeSummary] = useState<ExchangeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter state
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // View state
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Fetch filter options and exchange summary on mount
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [filtersRes, exchangesRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/spatial/filters`),
          fetch(`${API_BASE}/api/v1/spatial/exchanges`),
        ]);
        
        if (filtersRes.ok) {
          const data = await filtersRes.json();
          setFilterOptions(data);
        }
        
        if (exchangesRes.ok) {
          const data = await exchangesRes.json();
          setExchangeSummary(data.exchanges || []);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    }
    
    fetchFilterOptions();
  }, []);

  // Fetch companies data when filters change - use /companies endpoint for ALL companies
  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (selectedExchange) params.append('exchange', selectedExchange);
        if (selectedCommodity) params.append('commodity', selectedCommodity);
        if (selectedCountry) params.append('country', selectedCountry);
        if (selectedType) params.append('company_type', selectedType);
        params.append('page', currentPage.toString());
        params.append('page_size', '100');
        
        // Fetch both companies list (for list view) and GeoJSON (for map view)
        const [companiesRes, geoRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/spatial/companies?${params.toString()}`),
          fetch(`${API_BASE}/api/v1/spatial/geojson?${params.toString()}`),
        ]);
        
        if (companiesRes.ok) {
          const data = await companiesRes.json();
          setCompanies(data.companies || []);
          setTotalCompanies(data.total || 0);
          setTotalPages(data.total_pages || 1);
        }
        
        if (geoRes.ok) {
          const data = await geoRes.json();
          setGeoData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompanies();
  }, [selectedExchange, selectedCommodity, selectedCountry, selectedType, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedExchange, selectedCommodity, selectedCountry, selectedType]);

  // Filter companies by search query (client-side filtering)
  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies;
    
    const query = searchQuery.toLowerCase();
    return companies.filter(c => 
      c.symbol.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.country.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  // Group companies by country for the map view (using GeoJSON data which has coordinates)
  const companiesByCountry = useMemo(() => {
    if (!geoData) return {};
    const grouped: Record<string, Company[]> = {};
    geoData.features.forEach(feature => {
      const company = feature.properties;
      if (!grouped[company.country]) {
        grouped[company.country] = [];
      }
      grouped[company.country].push(company);
    });
    return grouped;
  }, [geoData]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedExchange('');
    setSelectedCommodity('');
    setSelectedCountry('');
    setSelectedType('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedExchange || selectedCommodity || selectedCountry || selectedType || searchQuery;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
                <Globe className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-metallic-100">Global Spatial View</h1>
                <p className="text-sm text-metallic-400">
                  Mining & exploration companies across {filterOptions?.exchanges?.length || 0} exchanges
                </p>
              </div>
            </div>
            
            {/* View toggle */}
            <div className="flex items-center gap-2 bg-metallic-800/50 rounded-lg p-1 border border-metallic-700">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-metallic-400 hover:text-metallic-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-metallic-400 hover:text-metallic-200'
                }`}
              >
                Map View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {exchangeSummary.map((exchange) => (
            <button
              key={exchange.exchange}
              onClick={() => setSelectedExchange(
                selectedExchange === exchange.exchange ? '' : exchange.exchange
              )}
              className={`p-4 rounded-lg border transition-all ${
                selectedExchange === exchange.exchange
                  ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/30'
                  : 'border-metallic-700 bg-metallic-900/50 hover:border-metallic-600 hover:bg-metallic-800/50'
              }`}
            >
              <div className="text-lg font-bold text-metallic-100">{exchange.exchange}</div>
              <div className="text-2xl font-bold text-primary-400">{exchange.total_companies}</div>
              <div className="text-xs text-metallic-400 mt-1">
                {exchange.producers} producers · {exchange.explorers} explorers
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-metallic-900/50 rounded-lg border border-metallic-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-metallic-400" />
            <h2 className="font-semibold text-metallic-100">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-metallic-500" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Exchange filter */}
            <div className="relative">
              <select
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e.target.value)}
                className="w-full px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Exchanges</option>
                {filterOptions?.exchanges?.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-metallic-500 pointer-events-none" />
            </div>
            
            {/* Commodity filter */}
            <div className="relative">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Commodities</option>
                {filterOptions?.commodities?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-metallic-500 pointer-events-none" />
            </div>
            
            {/* Country filter */}
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Countries</option>
                {filterOptions?.countries?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-metallic-500 pointer-events-none" />
            </div>
            
            {/* Company type filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Types</option>
                {filterOptions?.company_types?.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-metallic-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-metallic-900/50 rounded-lg border border-metallic-800 overflow-hidden">
            <div className="p-4 border-b border-metallic-800 bg-metallic-800/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-metallic-100">
                  {filteredCompanies.length} Companies {searchQuery && `(filtered from ${companies.length})`}
                </h3>
                <span className="text-sm text-metallic-400">
                  {totalCompanies.toLocaleString()} total matching filters
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-metallic-800/50 border-b border-metallic-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-metallic-300">Symbol</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-metallic-300">Company</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-metallic-300">Exchange</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-metallic-300">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-metallic-300">Commodity</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-metallic-300">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-metallic-800">
                  {filteredCompanies.map((company) => (
                    <tr 
                      key={`${company.exchange}-${company.symbol}`}
                      className="hover:bg-metallic-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedCompany(company)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-primary-400">
                          {company.symbol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-metallic-100">{company.name}</div>
                        {company.description && (
                          <div className="text-xs text-metallic-500 truncate max-w-xs">
                            {company.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          exchangeColors[company.exchange] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.exchange}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <CompanyTypeIcon type={company.company_type} />
                          <span className="text-sm text-metallic-200 capitalize">{company.company_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            commodityColors[company.primary_commodity.replace(' ', '_')] || 'bg-metallic-500'
                          }`} />
                          <span className="text-sm text-metallic-200">{company.primary_commodity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-metallic-500" />
                          <span className="text-sm text-metallic-200">{company.country}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-metallic-800 flex items-center justify-between">
                <span className="text-sm text-metallic-400">
                  Page {currentPage} of {totalPages} ({totalCompanies.toLocaleString()} companies)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-metallic-800 border border-metallic-700 rounded text-sm text-metallic-300 hover:bg-metallic-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-metallic-800 border border-metallic-700 rounded text-sm text-metallic-300 hover:bg-metallic-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Map View - Grouped by Country */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(companiesByCountry).map(([country, companies]) => (
              <div key={country} className="bg-metallic-900/50 rounded-lg border border-metallic-800 overflow-hidden">
                <div className="p-4 bg-metallic-800/50 border-b border-metallic-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-400" />
                    <h3 className="font-semibold text-metallic-100">{country}</h3>
                  </div>
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded text-sm font-medium">
                    {companies.length}
                  </span>
                </div>
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {companies.map((company) => (
                    <div 
                      key={`${company.exchange}-${company.symbol}`}
                      className="flex items-center justify-between p-2 hover:bg-metallic-800/50 rounded cursor-pointer transition-colors"
                      onClick={() => setSelectedCompany(company)}
                    >
                      <div className="flex items-center gap-2">
                        <CompanyTypeIcon type={company.company_type} />
                        <div>
                          <div className="font-medium text-sm text-metallic-100">{company.symbol}</div>
                          <div className="text-xs text-metallic-400">{company.name}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        exchangeColors[company.exchange] || 'bg-metallic-700 text-metallic-300'
                      }`}>
                        {company.exchange}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-metallic-900 border border-metallic-700 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-metallic-700 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-primary-400">
                    {selectedCompany.symbol}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    exchangeColors[selectedCompany.exchange] || 'bg-metallic-700 text-metallic-300'
                  }`}>
                    {selectedCompany.exchange}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-metallic-100 mt-1">
                  {selectedCompany.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 hover:bg-metallic-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-metallic-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedCompany.description && (
                <p className="text-metallic-300">{selectedCompany.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-metallic-500">Company Type</div>
                  <div className="flex items-center gap-1 mt-1">
                    <CompanyTypeIcon type={selectedCompany.company_type} />
                    <span className="font-medium text-metallic-100 capitalize">{selectedCompany.company_type}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-metallic-500">Primary Commodity</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${
                      commodityColors[selectedCompany.primary_commodity.replace(' ', '_')] || 'bg-metallic-500'
                    }`} />
                    <span className="font-medium text-metallic-100">{selectedCompany.primary_commodity}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-metallic-500">Operations</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-metallic-500" />
                    <span className="font-medium text-metallic-100">{selectedCompany.country}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-metallic-500">Headquarters</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4 text-metallic-500" />
                    <span className="font-medium text-metallic-100">{selectedCompany.headquarters}</span>
                  </div>
                </div>
              </div>
              
              {selectedCompany.secondary_commodities?.length > 0 && (
                <div>
                  <div className="text-sm text-metallic-500 mb-2">Secondary Commodities</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.secondary_commodities.map((c) => (
                      <span 
                        key={c}
                        className="px-2 py-1 bg-metallic-800 border border-metallic-700 rounded text-sm text-metallic-200"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedCompany.latitude && selectedCompany.longitude && (
                <div>
                  <div className="text-sm text-metallic-500 mb-2">Location</div>
                  <div className="text-sm font-mono text-metallic-300">
                    {selectedCompany.latitude.toFixed(4)}°, {selectedCompany.longitude.toFixed(4)}°
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
