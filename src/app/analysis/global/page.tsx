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
  Pickaxe
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
const CompanyTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'producer':
      return <Factory className="h-4 w-4 text-green-500" />;
    case 'explorer':
      return <Compass className="h-4 w-4 text-blue-500" />;
    case 'developer':
      return <Pickaxe className="h-4 w-4 text-yellow-500" />;
    default:
      return <Building2 className="h-4 w-4 text-gray-500" />;
  }
};

// Exchange badge colors
const exchangeColors: Record<string, string> = {
  ASX: 'bg-blue-100 text-blue-800',
  JSE: 'bg-green-100 text-green-800',
  CSE: 'bg-red-100 text-red-800',
  TSX: 'bg-purple-100 text-purple-800',
  TSXV: 'bg-purple-50 text-purple-700',
  NYSE: 'bg-yellow-100 text-yellow-800',
  NASDAQ: 'bg-teal-100 text-teal-800',
  LSE: 'bg-orange-100 text-orange-800',
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
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [exchangeSummary, setExchangeSummary] = useState<ExchangeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Fetch GeoJSON data when filters change
  useEffect(() => {
    async function fetchGeoData() {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (selectedExchange) params.append('exchange', selectedExchange);
        if (selectedCommodity) params.append('commodity', selectedCommodity);
        if (selectedCountry) params.append('country', selectedCountry);
        if (selectedType) params.append('company_type', selectedType);
        
        const url = `${API_BASE}/api/v1/spatial/geojson?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch spatial data');
        }
        
        const data = await response.json();
        setGeoData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchGeoData();
  }, [selectedExchange, selectedCommodity, selectedCountry, selectedType]);

  // Filter companies by search query
  const filteredCompanies = useMemo(() => {
    if (!geoData) return [];
    
    let companies = geoData.features.map(f => f.properties);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      companies = companies.filter(c => 
        c.symbol.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query)
      );
    }
    
    return companies;
  }, [geoData, searchQuery]);

  // Group companies by country for the map view
  const companiesByCountry = useMemo(() => {
    const grouped: Record<string, Company[]> = {};
    filteredCompanies.forEach(company => {
      if (!grouped[company.country]) {
        grouped[company.country] = [];
      }
      grouped[company.country].push(company);
    });
    return grouped;
  }, [filteredCompanies]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Global Spatial View</h1>
                <p className="text-sm text-gray-500">
                  Mining & exploration companies across {filterOptions?.exchanges?.length || 0} exchanges
                </p>
              </div>
            </div>
            
            {/* View toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
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
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-bold text-gray-900">{exchange.exchange}</div>
              <div className="text-2xl font-bold text-blue-600">{exchange.total_companies}</div>
              <div className="text-xs text-gray-500 mt-1">
                {exchange.producers} producers · {exchange.explorers} explorers
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Exchange filter */}
            <div className="relative">
              <select
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Exchanges</option>
                {filterOptions?.exchanges?.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Commodity filter */}
            <div className="relative">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Commodities</option>
                {filterOptions?.commodities?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Country filter */}
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {filterOptions?.countries?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Company type filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {filterOptions?.company_types?.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {filteredCompanies.length} Companies
                </h3>
                <span className="text-sm text-gray-500">
                  {geoData?.metadata?.total_companies} total in database
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Symbol</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Company</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Exchange</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Commodity</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCompanies.map((company) => (
                    <tr 
                      key={`${company.exchange}-${company.symbol}`}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedCompany(company)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-blue-600">
                          {company.symbol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{company.name}</div>
                        {company.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
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
                          <span className="text-sm capitalize">{company.company_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            commodityColors[company.primary_commodity.replace(' ', '_')] || 'bg-gray-400'
                          }`} />
                          <span className="text-sm">{company.primary_commodity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{company.country}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Map View - Grouped by Country */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(companiesByCountry).map(([country, companies]) => (
              <div key={country} className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900">{country}</h3>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    {companies.length}
                  </span>
                </div>
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {companies.map((company) => (
                    <div 
                      key={`${company.exchange}-${company.symbol}`}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => setSelectedCompany(company)}
                    >
                      <div className="flex items-center gap-2">
                        <CompanyTypeIcon type={company.company_type} />
                        <div>
                          <div className="font-medium text-sm">{company.symbol}</div>
                          <div className="text-xs text-gray-500">{company.name}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        exchangeColors[company.exchange] || 'bg-gray-100 text-gray-800'
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-blue-600">
                    {selectedCompany.symbol}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    exchangeColors[selectedCompany.exchange] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCompany.exchange}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedCompany.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedCompany.description && (
                <p className="text-gray-600">{selectedCompany.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Company Type</div>
                  <div className="flex items-center gap-1 mt-1">
                    <CompanyTypeIcon type={selectedCompany.company_type} />
                    <span className="font-medium capitalize">{selectedCompany.company_type}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Primary Commodity</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${
                      commodityColors[selectedCompany.primary_commodity.replace(' ', '_')] || 'bg-gray-400'
                    }`} />
                    <span className="font-medium">{selectedCompany.primary_commodity}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Operations</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedCompany.country}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Headquarters</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedCompany.headquarters}</span>
                  </div>
                </div>
              </div>
              
              {selectedCompany.secondary_commodities?.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Secondary Commodities</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.secondary_commodities.map((c) => (
                      <span 
                        key={c}
                        className="px-2 py-1 bg-gray-100 rounded text-sm"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedCompany.latitude && selectedCompany.longitude && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Location</div>
                  <div className="text-sm font-mono text-gray-600">
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
