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

// Simple SVG World Map Component with Country Outlines
function WorldMapSimple({ countries: countryData }: { countries: typeof countries }) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Country path data (simplified SVG paths for major mining countries)
  const countryPaths: Record<string, { d: string; viewBox: { x: number; y: number } }> = {
    // Canada
    'CA': { 
      d: 'M52,65 L58,60 L70,58 L85,55 L95,48 L105,45 L115,43 L130,42 L145,45 L155,52 L160,58 L165,55 L175,52 L180,48 L190,52 L195,60 L190,68 L180,72 L170,75 L160,78 L150,82 L140,80 L130,78 L115,75 L100,72 L85,70 L70,68 L60,68 Z',
      viewBox: { x: 52, y: 42 }
    },
    // USA
    'US': { 
      d: 'M55,95 L70,92 L85,90 L100,88 L115,90 L130,92 L145,95 L155,98 L160,102 L155,108 L145,112 L130,115 L115,112 L100,108 L85,105 L70,102 L60,100 Z',
      viewBox: { x: 55, y: 88 }
    },
    // Mexico
    'MX': { 
      d: 'M60,115 L72,118 L80,122 L85,128 L82,135 L75,140 L68,138 L62,132 L58,125 L58,118 Z',
      viewBox: { x: 58, y: 115 }
    },
    // Peru
    'PE': { 
      d: 'M95,165 L102,162 L108,168 L105,178 L100,185 L92,182 L88,175 L90,168 Z',
      viewBox: { x: 88, y: 162 }
    },
    // Chile (long narrow shape)
    'CL': { 
      d: 'M98,188 L102,185 L105,195 L103,210 L100,225 L95,238 L90,245 L88,235 L92,220 L95,205 L97,195 Z',
      viewBox: { x: 88, y: 185 }
    },
    // South Africa
    'ZA': { 
      d: 'M280,195 L295,192 L305,198 L308,210 L302,218 L290,222 L278,218 L275,208 L278,198 Z',
      viewBox: { x: 275, y: 192 }
    },
    // DR Congo
    'CD': { 
      d: 'M268,155 L282,152 L292,158 L295,168 L290,178 L278,180 L268,175 L265,165 Z',
      viewBox: { x: 265, y: 152 }
    },
    // Australia
    'AU': { 
      d: 'M355,175 L380,172 L400,178 L415,188 L418,200 L410,212 L395,218 L375,215 L360,208 L352,195 L350,185 Z',
      viewBox: { x: 350, y: 172 }
    },
  };

  // Get country data by code
  const getCountryInfo = (code: string) => countryData.find(c => c.code === code);

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
        <Map className="w-5 h-5 text-primary-400" />
        Global Mining Activity by Country
      </h3>
      
      {/* Interactive Map */}
      <div className="relative bg-gradient-to-b from-metallic-800/30 to-metallic-800/50 rounded-lg overflow-hidden" style={{ aspectRatio: '2/1' }}>
        <svg 
          viewBox="0 0 500 280" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines for reference */}
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-metallic-700/30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Equator and major latitude lines */}
          <line x1="0" y1="140" x2="500" y2="140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4,4" className="text-metallic-600/40" />
          <line x1="0" y1="70" x2="500" y2="70" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2,4" className="text-metallic-700/30" />
          <line x1="0" y1="210" x2="500" y2="210" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2,4" className="text-metallic-700/30" />
          
          {/* Simplified continent outlines */}
          {/* North America outline */}
          <path 
            d="M40,35 Q60,30 80,32 Q100,28 120,30 Q140,25 160,28 Q180,25 195,35 Q200,50 195,65 Q185,80 175,85 Q165,75 155,78 Q145,85 130,90 Q115,95 100,92 Q85,88 70,90 Q55,95 45,88 Q35,80 38,65 Q40,50 40,35 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-metallic-600/50"
          />
          
          {/* South America outline */}
          <path 
            d="M85,130 Q100,125 110,135 Q115,150 112,170 Q108,190 100,210 Q95,230 88,245 Q82,250 80,240 Q85,220 88,200 Q90,180 88,160 Q85,145 85,130 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-metallic-600/50"
          />
          
          {/* Africa outline */}
          <path 
            d="M240,95 Q260,90 280,95 Q295,100 305,115 Q310,135 308,155 Q305,175 298,195 Q290,215 275,225 Q260,230 250,220 Q245,200 248,180 Q250,160 248,140 Q245,120 240,95 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-metallic-600/50"
          />
          
          {/* Europe outline */}
          <path 
            d="M240,40 Q260,35 280,40 Q295,45 300,55 Q295,65 285,70 Q270,75 255,72 Q245,68 240,58 Q238,48 240,40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-metallic-600/50"
          />
          
          {/* Asia outline */}
          <path 
            d="M300,30 Q330,25 360,30 Q390,35 420,45 Q440,55 450,70 Q445,90 435,100 Q420,105 400,100 Q380,95 360,90 Q340,85 320,80 Q305,75 300,60 Q298,45 300,30 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-metallic-600/50"
          />
          
          {/* Australia outline */}
          <path 
            d="M380,155 Q410,150 435,160 Q450,175 448,195 Q440,215 420,225 Q395,230 375,220 Q360,205 365,185 Q370,165 380,155 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-metallic-600/50"
          />
          
          {/* Country highlights with data */}
          {countryData.map((country) => {
            const pathData = countryPaths[country.code];
            if (!pathData) return null;
            
            const isHovered = hoveredCountry === country.code;
            const isSelected = selectedCountry === country.code;
            const intensity = Math.min(country.companies / 3000, 1);
            
            return (
              <g key={country.code}>
                <path
                  d={pathData.d}
                  fill={isHovered || isSelected ? 'rgba(168, 85, 247, 0.4)' : `rgba(168, 85, 247, ${0.15 + intensity * 0.35})`}
                  stroke={isHovered || isSelected ? '#a855f7' : 'rgba(168, 85, 247, 0.5)'}
                  strokeWidth={isHovered || isSelected ? 2 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredCountry(country.code)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => setSelectedCountry(selectedCountry === country.code ? null : country.code)}
                />
                {/* Country label */}
                <text
                  x={pathData.viewBox.x + 20}
                  y={pathData.viewBox.y + 15}
                  className="text-[8px] fill-metallic-300 pointer-events-none font-medium"
                  style={{ display: isHovered || isSelected ? 'block' : 'none' }}
                >
                  {country.name}
                </text>
              </g>
            );
          })}
          
          {/* Pulsing markers for each country */}
          {countryData.map((country) => {
            const pathData = countryPaths[country.code];
            if (!pathData) return null;
            
            const cx = pathData.viewBox.x + 25;
            const cy = pathData.viewBox.y + 20;
            const isHovered = hoveredCountry === country.code;
            
            return (
              <g key={`marker-${country.code}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill="#a855f7"
                  className="transition-all duration-200"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 10 : 6}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1"
                  opacity="0.5"
                  className="animate-ping"
                />
              </g>
            );
          })}
        </svg>
        
        {/* Hover tooltip */}
        {hoveredCountry && (
          <div className="absolute top-4 right-4 bg-metallic-800/95 backdrop-blur border border-metallic-700 rounded-lg px-4 py-3 shadow-xl z-10">
            {(() => {
              const country = getCountryInfo(hoveredCountry);
              if (!country) return null;
              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="font-semibold text-metallic-100">{country.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-metallic-500">Companies:</span>
                    <span className="text-metallic-200 font-medium">{country.companies.toLocaleString()}</span>
                    <span className="text-metallic-500">Projects:</span>
                    <span className="text-metallic-200 font-medium">{country.projects.toLocaleString()}</span>
                    <span className="text-metallic-500">Market Cap:</span>
                    <span className="text-metallic-200 font-medium">{country.marketCap}</span>
                    <span className="text-metallic-500">Today:</span>
                    <span className={country.change >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                      {country.change >= 0 ? '+' : ''}{country.change}%
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-metallic-700">
                    <span className="text-xs text-metallic-500">Top: </span>
                    <span className="text-xs text-metallic-300">{country.topCommodities.join(', ')}</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-metallic-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500/30" />
            <span>Fewer companies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500/70" />
            <span>More companies</span>
          </div>
        </div>
        <Link 
          href="/analysis/global" 
          className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
        >
          Open Full Interactive Map
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
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
