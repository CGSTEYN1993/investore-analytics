'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Globe, MapPin, TrendingUp, TrendingDown, 
  Building2, ChevronDown, ArrowUpRight, ArrowDownRight, Map, ArrowLeft
} from 'lucide-react';

// Country mining data
const countries = [
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    region: 'North America',
    companies: 2836,
    marketCap: '$564B',
    topCommodities: ['Au', 'Cu', 'Li', 'U', 'Ni'],
    change: 1.92,
    projects: 4521,
    provinces: [
      { name: 'Ontario', companies: 892, projects: 1245 },
      { name: 'British Columbia', companies: 634, projects: 987 },
      { name: 'Quebec', companies: 521, projects: 876 },
      { name: 'Saskatchewan', companies: 234, projects: 543 },
      { name: 'Alberta', companies: 178, projects: 234 },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    region: 'Asia Pacific',
    companies: 1892,
    marketCap: '$425B',
    topCommodities: ['Au', 'Fe', 'Li', 'Cu', 'Zn'],
    change: -0.52,
    projects: 3245,
    provinces: [
      { name: 'Western Australia', companies: 1123, projects: 1892 },
      { name: 'Queensland', companies: 345, projects: 567 },
      { name: 'New South Wales', companies: 234, projects: 456 },
      { name: 'South Australia', companies: 190, projects: 330 },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    companies: 1234,
    marketCap: '$320B',
    topCommodities: ['Au', 'Cu', 'Li', 'Mo', 'U'],
    change: 1.12,
    projects: 2345,
    provinces: [
      { name: 'Nevada', companies: 456, projects: 876 },
      { name: 'Arizona', companies: 234, projects: 456 },
      { name: 'Alaska', companies: 123, projects: 234 },
      { name: 'Utah', companies: 89, projects: 178 },
    ],
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    region: 'Africa',
    companies: 689,
    marketCap: '$285B',
    topCommodities: ['Au', 'Pt', 'Pd', 'Cr', 'Mn'],
    change: -1.23,
    projects: 987,
    provinces: [
      { name: 'Gauteng', companies: 234, projects: 345 },
      { name: 'North West', companies: 178, projects: 287 },
      { name: 'Limpopo', companies: 145, projects: 234 },
    ],
  },
  {
    code: 'PE',
    name: 'Peru',
    flag: '🇵🇪',
    region: 'South America',
    companies: 456,
    marketCap: '$98B',
    topCommodities: ['Cu', 'Au', 'Ag', 'Zn', 'Pb'],
    change: 3.45,
    projects: 876,
    provinces: [
      { name: 'Cajamarca', companies: 134, projects: 234 },
      { name: 'Arequipa', companies: 112, projects: 198 },
      { name: 'Ancash', companies: 89, projects: 156 },
    ],
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    region: 'South America',
    companies: 387,
    marketCap: '$145B',
    topCommodities: ['Cu', 'Li', 'Au', 'Mo', 'I'],
    change: 2.18,
    projects: 654,
    provinces: [
      { name: 'Antofagasta', companies: 156, projects: 267 },
      { name: 'Atacama', companies: 98, projects: 178 },
      { name: 'Coquimbo', companies: 67, projects: 112 },
    ],
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    region: 'North America',
    companies: 345,
    marketCap: '$67B',
    topCommodities: ['Ag', 'Au', 'Cu', 'Zn', 'Pb'],
    change: 0.89,
    projects: 567,
    provinces: [
      { name: 'Sonora', companies: 123, projects: 198 },
      { name: 'Chihuahua', companies: 89, projects: 145 },
      { name: 'Durango', companies: 67, projects: 112 },
    ],
  },
  {
    code: 'CD',
    name: 'DR Congo',
    flag: '🇨🇩',
    region: 'Africa',
    companies: 234,
    marketCap: '$89B',
    topCommodities: ['Co', 'Cu', 'Au', 'Sn', 'Ta'],
    change: 4.56,
    projects: 345,
    provinces: [
      { name: 'Katanga', companies: 145, projects: 234 },
      { name: 'Kivu', companies: 56, projects: 78 },
    ],
  },
];

const regions = ['All Regions', 'North America', 'South America', 'Africa', 'Asia Pacific', 'Europe'];

function CountryCard({ country }: { country: typeof countries[0] }) {
  const isPositive = country.change >= 0;

  return (
    <Link
      href={`/analysis/countries/${country.code.toLowerCase()}`}
      className="group bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{country.flag}</span>
          <div>
            <h3 className="font-bold text-metallic-100 group-hover:text-primary-400 transition-colors">
              {country.name}
            </h3>
            <p className="text-xs text-metallic-500">{country.region}</p>
          </div>
        </div>
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isPositive ? '+' : ''}{country.change}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-metallic-500 mb-1">Companies</p>
          <p className="text-xl font-bold text-metallic-100">{country.companies.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Market Cap</p>
          <p className="text-xl font-bold text-metallic-100">{country.marketCap}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-metallic-500 mb-2">Top Commodities</p>
        <div className="flex flex-wrap gap-1">
          {country.topCommodities.map((c) => (
            <span key={c} className="px-2 py-1 bg-metallic-800 rounded text-xs text-metallic-300 font-medium">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-metallic-800">
        <p className="text-xs text-metallic-500 mb-2">Top Regions</p>
        <div className="space-y-1">
          {country.provinces.slice(0, 3).map((p) => (
            <div key={p.name} className="flex items-center justify-between text-sm">
              <span className="text-metallic-400">{p.name}</span>
              <span className="text-metallic-300">{p.companies} cos</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// Simple SVG World Map Component
function WorldMapSimple({ countries: countryData }: { countries: typeof countries }) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Simplified coordinates for country markers on a basic world map
  const countryPositions: Record<string, { x: number; y: number }> = {
    'CA': { x: 20, y: 25 },
    'US': { x: 22, y: 35 },
    'MX': { x: 18, y: 43 },
    'PE': { x: 28, y: 60 },
    'CL': { x: 28, y: 70 },
    'ZA': { x: 58, y: 70 },
    'CD': { x: 56, y: 52 },
    'AU': { x: 85, y: 65 },
  };

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
        <Map className="w-5 h-5" />
        Global Mining Activity
      </h3>
      <div className="relative bg-metallic-800/50 rounded-lg p-4 aspect-[2/1]">
        {/* Simple map background */}
        <svg viewBox="0 0 100 60" className="w-full h-full opacity-20">
          <path
            d="M10,30 Q20,20 30,25 Q35,20 40,30 Q50,35 60,30 Q70,25 80,30 Q90,35 95,28"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            className="text-metallic-500"
          />
          <path
            d="M5,45 Q15,50 25,48 Q35,55 45,50 Q55,45 65,52 Q75,48 85,50"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            className="text-metallic-500"
          />
        </svg>

        {/* Country markers */}
        {countryData.map((country) => {
          const pos = countryPositions[country.code];
          if (!pos) return null;

          const isHovered = hoveredCountry === country.code;
          const size = Math.min(Math.max(country.companies / 500, 2), 6);

          return (
            <div
              key={country.code}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onMouseEnter={() => setHoveredCountry(country.code)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              <div
                className={`rounded-full transition-all duration-200 ${
                  isHovered ? 'bg-primary-400 scale-150' : 'bg-primary-500/70'
                }`}
                style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
              />
              {/* Pulse animation */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/30 animate-ping`}
                style={{ width: `${size * 6}px`, height: `${size * 6}px` }}
              />

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-metallic-800 border border-metallic-700 rounded-lg px-3 py-2 whitespace-nowrap z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{country.flag}</span>
                    <span className="font-medium text-metallic-100">{country.name}</span>
                  </div>
                  <div className="text-xs text-metallic-400">
                    {country.companies.toLocaleString()} companies
                  </div>
                  <div className={`text-xs ${country.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {country.change >= 0 ? '+' : ''}{country.change}% today
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <Link 
          href="/analysis/map" 
          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          Open Interactive Map →
        </Link>
      </div>
    </div>
  );
}

export default function CountriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [sortBy, setSortBy] = useState<'companies' | 'marketCap' | 'change'>('companies');

  const filteredCountries = useMemo(() => {
    return countries
      .filter(c => {
        const matchesSearch = 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = selectedRegion === 'All Regions' || c.region === selectedRegion;
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortBy === 'companies') return b.companies - a.companies;
        if (sortBy === 'change') return b.change - a.change;
        return 0;
      });
  }, [searchTerm, selectedRegion, sortBy]);

  const totalCompanies = countries.reduce((sum, c) => sum + c.companies, 0);
  const totalProjects = countries.reduce((sum, c) => sum + c.projects, 0);

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
            <h1 className="text-2xl font-bold text-metallic-100">Mining by Country</h1>
            <p className="text-metallic-400 text-sm">Explore mining companies and projects by country and region</p>
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
                Total Companies
              </div>
              <p className="text-2xl font-bold text-metallic-100">{totalCompanies.toLocaleString()}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                Total Projects
              </div>
              <p className="text-2xl font-bold text-metallic-100">{totalProjects.toLocaleString()}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Top Performer
              </div>
              <p className="text-2xl font-bold text-green-400">🇨🇩 DR Congo +4.56%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Map Section */}
        <div className="mb-8">
          <WorldMapSimple countries={countries} />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
                <option value="marketCap">Market Cap</option>
                <option value="change">Performance</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Countries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCountries.map((country) => (
            <CountryCard key={country.code} country={country} />
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
