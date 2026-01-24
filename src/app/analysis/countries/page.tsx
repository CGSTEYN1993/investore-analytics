'use client';

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import Link from 'next/link';
import { 
  Search, Globe, MapPin, 
  Building2, ChevronDown, ArrowLeft, Loader2,
  Factory, Compass, Hammer, Map
} from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

// Lazy load the map component to avoid SSR issues
const GlobalMiningMap = lazy(() => import('@/components/maps/GlobalMiningMap'));

const API_URL = RAILWAY_API_URL;

// Country metadata with flags, regions, and coordinates
const countryMetadata: Record<string, { flag: string; region: string; lat: number; lng: number }> = {
  'Australia': { flag: '🇦🇺', region: 'Asia Pacific', lat: -25.2744, lng: 133.7751 },
  'Canada': { flag: '🇨🇦', region: 'North America', lat: 56.1304, lng: -106.3468 },
  'USA': { flag: '🇺🇸', region: 'North America', lat: 37.0902, lng: -95.7129 },
  'South Africa': { flag: '🇿🇦', region: 'Africa', lat: -30.5595, lng: 22.9375 },
  'Brazil': { flag: '🇧🇷', region: 'South America', lat: -14.2350, lng: -51.9253 },
  'Chile': { flag: '🇨🇱', region: 'South America', lat: -35.6751, lng: -71.5430 },
  'Peru': { flag: '🇵🇪', region: 'South America', lat: -9.1900, lng: -75.0152 },
  'Argentina': { flag: '🇦🇷', region: 'South America', lat: -38.4161, lng: -63.6167 },
  'Mexico': { flag: '🇲🇽', region: 'North America', lat: 23.6345, lng: -102.5528 },
  'Ghana': { flag: '🇬🇭', region: 'Africa', lat: 7.9465, lng: -1.0232 },
  'Mali': { flag: '🇲🇱', region: 'Africa', lat: 17.5707, lng: -3.9962 },
  'Burkina Faso': { flag: '🇧🇫', region: 'Africa', lat: 12.2383, lng: -1.5616 },
  'Senegal': { flag: '🇸🇳', region: 'Africa', lat: 14.4974, lng: -14.4524 },
  "Cote d'Ivoire": { flag: '🇨🇮', region: 'Africa', lat: 7.5400, lng: -5.5471 },
  'Tanzania': { flag: '🇹🇿', region: 'Africa', lat: -6.3690, lng: 34.8888 },
  'Mozambique': { flag: '🇲🇿', region: 'Africa', lat: -18.6657, lng: 35.5296 },
  'Namibia': { flag: '🇳🇦', region: 'Africa', lat: -22.9576, lng: 18.4904 },
  'Botswana': { flag: '🇧🇼', region: 'Africa', lat: -22.3285, lng: 24.6849 },
  'DR Congo': { flag: '🇨🇩', region: 'Africa', lat: -4.0383, lng: 21.7587 },
  'Zambia': { flag: '🇿🇲', region: 'Africa', lat: -13.1339, lng: 27.8493 },
  'Malawi': { flag: '🇲🇼', region: 'Africa', lat: -13.2543, lng: 34.3015 },
  'Angola': { flag: '🇦🇴', region: 'Africa', lat: -11.2027, lng: 17.8739 },
  'Lesotho': { flag: '🇱🇸', region: 'Africa', lat: -29.6100, lng: 28.2336 },
  'Madagascar': { flag: '🇲🇬', region: 'Africa', lat: -18.7669, lng: 46.8691 },
  'Sierra Leone': { flag: '🇸🇱', region: 'Africa', lat: 8.4606, lng: -11.7799 },
  'Indonesia': { flag: '🇮🇩', region: 'Asia Pacific', lat: -0.7893, lng: 113.9213 },
  'Philippines': { flag: '🇵🇭', region: 'Asia Pacific', lat: 12.8797, lng: 121.7740 },
  'Thailand': { flag: '🇹🇭', region: 'Asia Pacific', lat: 15.8700, lng: 100.9925 },
  'Cambodia': { flag: '🇰🇭', region: 'Asia Pacific', lat: 12.5657, lng: 104.9910 },
  'Mongolia': { flag: '🇲🇳', region: 'Asia Pacific', lat: 46.8625, lng: 103.8467 },
  'South Korea': { flag: '🇰🇷', region: 'Asia Pacific', lat: 35.9078, lng: 127.7669 },
  'Malaysia': { flag: '🇲🇾', region: 'Asia Pacific', lat: 4.2105, lng: 101.9758 },
  'Papua New Guinea': { flag: '🇵🇬', region: 'Asia Pacific', lat: -6.3150, lng: 143.9555 },
  'Solomon Islands': { flag: '🇸🇧', region: 'Asia Pacific', lat: -9.4280, lng: 160.0180 },
  'New Zealand': { flag: '🇳🇿', region: 'Asia Pacific', lat: -40.9006, lng: 174.8860 },
  'Spain': { flag: '🇪🇸', region: 'Europe', lat: 40.4637, lng: -3.7492 },
  'Sweden': { flag: '🇸🇪', region: 'Europe', lat: 60.1282, lng: 18.6435 },
  'Norway': { flag: '🇳🇴', region: 'Europe', lat: 60.4720, lng: 8.4689 },
  'Finland': { flag: '🇫🇮', region: 'Europe', lat: 61.9241, lng: 25.7482 },
  'Serbia': { flag: '🇷🇸', region: 'Europe', lat: 44.0165, lng: 21.0059 },
  'North Macedonia': { flag: '🇲🇰', region: 'Europe', lat: 41.5124, lng: 21.7465 },
  'Bosnia and Herzegovina': { flag: '🇧🇦', region: 'Europe', lat: 43.9159, lng: 17.6791 },
  'Guyana': { flag: '🇬🇾', region: 'South America', lat: 4.8604, lng: -58.9302 },
  'Ecuador': { flag: '🇪🇨', region: 'South America', lat: -1.8312, lng: -78.1834 },
  'Colombia': { flag: '🇨🇴', region: 'South America', lat: 4.5709, lng: -74.2973 },
  'Trinidad and Tobago': { flag: '🇹🇹', region: 'South America', lat: 10.6918, lng: -61.2225 },
  'Sudan': { flag: '🇸🇩', region: 'Africa', lat: 12.8628, lng: 30.2176 },
};

interface CountryData {
  name: string;
  code: string;
  company_count: number;
  commodities: string[];
  producers: number;
  developers: number;
  explorers: number;
}

interface Company {
  ticker: string;
  name: string;
  exchange: string;
  primary_commodity: string;
  secondary_commodities: string[];
  company_type: string;
  operating_countries: string[];
}

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
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
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
  metadata: {
    total_companies: number;
  };
}

const regions = ['All Regions', 'North America', 'South America', 'Africa', 'Asia Pacific', 'Europe'];

// Company type icons
const CompanyTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'producer':
      return <Factory className="h-4 w-4 text-green-500" />;
    case 'explorer':
      return <Compass className="h-4 w-4 text-blue-500" />;
    case 'developer':
      return <Hammer className="h-4 w-4 text-yellow-500" />;
    default:
      return <Building2 className="h-4 w-4 text-gray-500" />;
  }
};

function CountryCard({ country, onClick }: { country: CountryData; onClick: () => void }) {
  const meta = countryMetadata[country.name] || { flag: '🏳️', region: 'Unknown' };

  return (
    <div
      onClick={onClick}
      className="group bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{meta.flag}</span>
          <div>
            <h3 className="font-bold text-metallic-100 group-hover:text-primary-400 transition-colors">
              {country.name}
            </h3>
            <p className="text-xs text-metallic-500">{meta.region}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-metallic-500 mb-1">Companies</p>
          <p className="text-xl font-bold text-metallic-100">{country.company_count}</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Producers</p>
          <p className="text-xl font-bold text-green-400">{country.producers}</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Explorers</p>
          <p className="text-xl font-bold text-blue-400">{country.explorers}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-metallic-500 mb-2">Top Commodities</p>
        <div className="flex flex-wrap gap-1">
          {country.commodities.slice(0, 5).map((c) => (
            <span key={c} className="px-2 py-1 bg-metallic-800 rounded text-xs text-metallic-300 font-medium">
              {c}
            </span>
          ))}
          {country.commodities.length > 5 && (
            <span className="px-2 py-1 bg-metallic-800 rounded text-xs text-metallic-400">
              +{country.commodities.length - 5}
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-metallic-800 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-green-400">
          <Factory className="w-3 h-3" />
          <span>{country.producers}</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          <Hammer className="w-3 h-3" />
          <span>{country.developers}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-400">
          <Compass className="w-3 h-3" />
          <span>{country.explorers}</span>
        </div>
      </div>
    </div>
  );
}

function CompanyList({ companies, country }: { companies: Company[]; country: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || c.company_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [companies, searchTerm, typeFilter]);

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <h3 className="font-semibold text-metallic-100 mb-4">
        Companies Operating in {country} ({companies.length})
      </h3>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 text-sm"
        >
          <option value="all">All Types</option>
          <option value="producer">Producers</option>
          <option value="developer">Developers</option>
          <option value="explorer">Explorers</option>
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map((company) => (
          <Link
            key={company.ticker}
            href={`/company/${company.ticker}`}
            className="flex items-center justify-between p-3 bg-metallic-800/50 hover:bg-metallic-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <CompanyTypeIcon type={company.company_type} />
              <div>
                <span className="font-medium text-metallic-100">{company.ticker}</span>
                <span className="text-metallic-500 text-sm ml-2">{company.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs">
                {company.primary_commodity}
              </span>
              {company.operating_countries && company.operating_countries.length > 1 && (
                <span className="text-xs text-metallic-500">
                  +{company.operating_countries.length - 1} countries
                </span>
              )}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-metallic-500 py-4">No companies found</p>
        )}
      </div>
    </div>
  );
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [sortBy, setSortBy] = useState<'companies' | 'producers' | 'name'>('companies');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryCompanies, setCountryCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);

  // Fetch countries data
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch(`${API_URL}/api/v1/spatial/countries/operating`);
        if (response.ok) {
          const data = await response.json();
          setCountries(data.countries || []);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

  // Fetch GeoJSON for map
  useEffect(() => {
    async function fetchGeoData() {
      try {
        const response = await fetch(`${API_URL}/api/v1/spatial/geojson`);
        if (response.ok) {
          const data = await response.json();
          setGeoData(data);
        }
      } catch (error) {
        console.error('Error fetching geo data:', error);
      }
    }

    fetchGeoData();
  }, []);

  // Fetch companies when a country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setCountryCompanies([]);
      return;
    }

    async function fetchCompanies() {
      setLoadingCompanies(true);
      try {
        const response = await fetch(`${API_URL}/api/v1/spatial/countries/${encodeURIComponent(selectedCountry!)}/companies`);
        if (response.ok) {
          const data = await response.json();
          setCountryCompanies(data.companies || []);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    }

    fetchCompanies();
  }, [selectedCountry]);

  const filteredCountries = useMemo(() => {
    return countries
      .filter(c => {
        const meta = countryMetadata[c.name];
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = selectedRegion === 'All Regions' || (meta && meta.region === selectedRegion);
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortBy === 'companies') return b.company_count - a.company_count;
        if (sortBy === 'producers') return b.producers - a.producers;
        return a.name.localeCompare(b.name);
      });
  }, [countries, searchTerm, selectedRegion, sortBy]);

  const totalCompanies = countries.reduce((sum, c) => sum + c.company_count, 0);
  const totalProducers = countries.reduce((sum, c) => sum + c.producers, 0);
  const totalExplorers = countries.reduce((sum, c) => sum + c.explorers, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-metallic-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-metallic-400">Loading countries data...</p>
        </div>
      </div>
    );
  }

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
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
              <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
              <span>/</span>
              <span className="text-metallic-300">Countries</span>
            </div>
            <h1 className="text-2xl font-bold text-metallic-100">Mining by Operating Country</h1>
            <p className="text-metallic-400 text-sm">
              Companies grouped by where their mines and projects are actually located
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <Globe className="w-4 h-4" />
                Countries
              </div>
              <p className="text-2xl font-bold text-metallic-100">{countries.length}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <Building2 className="w-4 h-4" />
                Company Presence
              </div>
              <p className="text-2xl font-bold text-metallic-100">{totalCompanies.toLocaleString()}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <Factory className="w-4 h-4 text-green-400" />
                Producing Operations
              </div>
              <p className="text-2xl font-bold text-green-400">{totalProducers}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <Compass className="w-4 h-4 text-blue-400" />
                Exploration Projects
              </div>
              <p className="text-2xl font-bold text-blue-400">{totalExplorers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View toggle and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 bg-metallic-800/50 rounded-lg p-1 border border-metallic-700">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'map' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-metallic-400 hover:text-metallic-200'
              }`}
            >
              <Map className="w-4 h-4" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'list' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-metallic-400 hover:text-metallic-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              List View
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
            <input
              type="text"
              placeholder="Search countries..."
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
                  <option key={region} value={region}>{region}</option>
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
                <option value="producers">Most Producers</option>
                <option value="name">Alphabetical</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden" style={{ height: '600px' }}>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              }>
                <GlobalMiningMap 
                  geoData={geoData}
                  selectedCountry={selectedCountry || undefined}
                  onSelectCompany={(company) => {
                    // Navigate to company page
                    window.location.href = `/company/${company.symbol}`;
                  }}
                />
              </Suspense>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-metallic-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Gold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-600" />
                <span>Copper</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span>Lithium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <span>Uranium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>Diversified</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Country Panel */}
        {selectedCountry && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-metallic-100 flex items-center gap-2">
                {countryMetadata[selectedCountry]?.flag} {selectedCountry}
              </h2>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-sm text-metallic-400 hover:text-metallic-200"
              >
                Clear selection
              </button>
            </div>
            {loadingCompanies ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : (
              <CompanyList companies={countryCompanies} country={selectedCountry} />
            )}
          </div>
        )}

        {/* Countries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCountries.map((country) => (
            <CountryCard 
              key={country.name} 
              country={country} 
              onClick={() => setSelectedCountry(country.name)}
            />
          ))}
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-metallic-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-metallic-100 mb-2">No countries found</h3>
            <p className="text-metallic-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
