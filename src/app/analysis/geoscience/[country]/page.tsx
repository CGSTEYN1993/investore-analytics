'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Database, Mountain, ExternalLink, Globe, Loader2, Search, AlertTriangle, Gem, Layers, BarChart3 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API = `${RAILWAY_API_URL}/api/v1/geoscience`;

interface MineralBelt {
  name: string;
  province_type: string;
  age: string;
  commodities: string[];
  description: string;
  center_lat: number;
  center_lng: number;
  state: string;
}

interface USGSDeposit {
  source: string;
  dep_id: string;
  name: string;
  commodity_codes: string;
  status: string;
  fips_code: string;
  url: string;
  lat: number | null;
  lng: number | null;
}

interface CompanyContext {
  name: string;
  ticker: string;
  belts: string[];
  operations: string[];
  deposits: string;
  reporting_standard: string;
}

interface SeismicEvent {
  date: string;
  magnitude: number;
  depth_km: number;
  lat: number;
  lng: number;
  region: string;
}

const countryMeta: Record<string, { name: string; flag: string; description: string; slug: string; apiCountry: string; usgsCountry: string }> = {
  'australia': {
    name: 'Australia',
    flag: '🇦🇺',
    description: 'Geoscience Australia (GA) and DMIRS/GSWA data: operating mines, mineral deposits, boreholes, and tenements.',
    slug: 'australia',
    apiCountry: 'AU',
    usgsCountry: 'Australia',
  },
  'canada': {
    name: 'Canada',
    flag: '🇨🇦',
    description: 'NRCan / Geological Survey of Canada mineral belt data and USGS MRDS deposits.',
    slug: 'canada',
    apiCountry: 'CA',
    usgsCountry: 'Canada',
  },
  'usa': {
    name: 'United States',
    flag: '🇺🇸',
    description: 'USGS Mineral Resources Data System (MRDS) — mineral deposits, occurrence data, and geological context.',
    slug: 'usa',
    apiCountry: 'US',
    usgsCountry: 'United States',
  },
  'south-africa': {
    name: 'South Africa',
    flag: '🇿🇦',
    description: 'Council for Geoscience (CGS) data: mineral belts, major deposit regions, and seismicity monitoring.',
    slug: 'south-africa',
    apiCountry: 'ZA',
    usgsCountry: 'South Africa',
  },
};

const COMMODITY_COLORS: Record<string, string> = {
  Gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Copper: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Nickel: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Uranium: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  Lithium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Platinum: 'bg-slate-400/20 text-slate-200 border-slate-400/30',
  Iron: 'bg-red-500/20 text-red-300 border-red-500/30',
  'Iron Ore': 'bg-red-500/20 text-red-300 border-red-500/30',
  Silver: 'bg-gray-400/20 text-gray-200 border-gray-400/30',
  Zinc: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Diamonds: 'bg-purple-400/20 text-purple-200 border-purple-400/30',
  Chromium: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  Cobalt: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Coal: 'bg-stone-500/20 text-stone-300 border-stone-500/30',
  Potash: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Manganese: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Vanadium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  PGE: 'bg-slate-400/20 text-slate-200 border-slate-400/30',
  Antimony: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'Rare Earths': 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
};

function getCommodityBadge(commodity: string) {
  const cls = COMMODITY_COLORS[commodity] || 'bg-metallic-700/30 text-metallic-300 border-metallic-600/30';
  return `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`;
}

// Decode USGS commodity codes to readable names
const CODE_TO_NAME: Record<string, string> = {
  AU: 'Gold', CU: 'Copper', AG: 'Silver', NI: 'Nickel', ZN: 'Zinc', PB: 'Lead',
  FE: 'Iron', MO: 'Molybdenum', W: 'Tungsten', SN: 'Tin', MN: 'Manganese',
  CR: 'Chromium', CO: 'Cobalt', LI: 'Lithium', PT: 'Platinum', V: 'Vanadium',
  UR: 'Uranium', REE: 'Rare Earths', GR: 'Graphite', DIA: 'Diamonds',
  PGE_PT: 'Platinum', PGE_OS: 'Osmium', PGE_IR: 'Iridium', PGE_RH: 'Rhodium', PGE_RU: 'Ruthenium', PGE: 'PGE',
  COAL: 'Coal', KCL: 'Potash', P: 'Phosphate', SDG: 'Sand & Gravel', LST: 'Limestone',
  CLY: 'Clay', STN: 'Stone', F: 'Fluorspar',
};

function decodeCommodityCodes(codes: string): string[] {
  return codes.trim().split(/\s+/).map(c => CODE_TO_NAME[c] || c).filter(Boolean);
}

export default function GeoscienceCountryPage() {
  const params = useParams();
  const country = params.country as string;
  const meta = countryMeta[country];

  const [mineralBelts, setMineralBelts] = useState<MineralBelt[]>([]);
  const [deposits, setDeposits] = useState<USGSDeposit[]>([]);
  const [companyContexts, setCompanyContexts] = useState<CompanyContext[]>([]);
  const [seismicity, setSeismicity] = useState<SeismicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect Australia to main geoscience page
  if (country === 'australia') {
    if (typeof window !== 'undefined') {
      window.location.href = '/analysis/geoscience';
    }
    return (
      <div className="min-h-screen bg-metallic-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-metallic-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-metallic-100 mb-2">Country Not Found</h1>
          <Link href="/analysis/geoscience" className="text-primary-400 hover:underline">
            Back to Geoscience
          </Link>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          // Mineral belts
          fetch(`${API}/multi-country/mineral-belts?region=${meta.apiCountry}${selectedCommodity ? `&commodity=${selectedCommodity}` : ''}`).then(r => r.json()),
          // USGS deposits
          fetch(`${API}/multi-country/usgs-deposits?country=${meta.usgsCountry}${selectedCommodity ? `&commodity=${selectedCommodity}` : ''}&limit=100`).then(r => r.json()),
          // South Africa context (only for SA)
          country === 'south-africa'
            ? fetch(`${API}/multi-country/south-africa${selectedCommodity ? `?commodity=${selectedCommodity}` : ''}`).then(r => r.json())
            : Promise.resolve(null),
        ]);

        // Mineral belts
        if (results[0].status === 'fulfilled' && results[0].value) {
          setMineralBelts(results[0].value.mineral_belts || []);
        }
        // USGS deposits
        if (results[1].status === 'fulfilled' && results[1].value) {
          setDeposits(results[1].value.deposits || []);
        }
        // SA-specific context
        if (results[2].status === 'fulfilled' && results[2].value) {
          const saData = results[2].value;
          if (saData.company_contexts) {
            setCompanyContexts(saData.company_contexts);
          }
          if (saData.seismicity_events) {
            setSeismicity(saData.seismicity_events);
          }
        }
      } catch (err) {
        setError('Failed to load geoscience data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [country, selectedCommodity, meta.apiCountry, meta.usgsCountry]);

  // Collect all unique commodities from belts
  const allCommodities = Array.from(
    new Set(mineralBelts.flatMap(b => b.commodities))
  ).sort();

  // Filter deposits by search
  const filteredDeposits = deposits.filter(d => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return d.name.toLowerCase().includes(term) || d.commodity_codes.toLowerCase().includes(term);
  });

  // Status color
  function statusColor(status: string): string {
    if (status === 'Producer') return 'text-green-400';
    if (status === 'Past Producer') return 'text-yellow-400';
    if (status === 'Occurrence') return 'text-blue-400';
    return 'text-metallic-400';
  }

  return (
    <div className="min-h-screen bg-metallic-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nav */}
        <Link
          href="/analysis/geoscience"
          className="flex items-center gap-2 text-metallic-400 hover:text-primary-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Geoscience
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{meta.flag}</span>
          <div>
            <h1 className="text-3xl font-bold text-metallic-100">{meta.name} Geological Survey Data</h1>
            <p className="text-metallic-400 mt-1">{meta.description}</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-metallic-900/50 border border-metallic-800 rounded-lg p-4 text-center">
            <Mountain className="w-5 h-5 text-primary-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-metallic-100">{mineralBelts.length}</div>
            <div className="text-xs text-metallic-500">Mineral Belts</div>
          </div>
          <div className="bg-metallic-900/50 border border-metallic-800 rounded-lg p-4 text-center">
            <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-metallic-100">{deposits.length}</div>
            <div className="text-xs text-metallic-500">USGS Deposits</div>
          </div>
          <div className="bg-metallic-900/50 border border-metallic-800 rounded-lg p-4 text-center">
            <Gem className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-metallic-100">{allCommodities.length}</div>
            <div className="text-xs text-metallic-500">Commodities</div>
          </div>
          <div className="bg-metallic-900/50 border border-metallic-800 rounded-lg p-4 text-center">
            <Globe className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-metallic-100">
              {deposits.filter(d => d.status === 'Producer').length}
            </div>
            <div className="text-xs text-metallic-500">Active Producers</div>
          </div>
        </div>

        {/* Commodity filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-metallic-400 mr-1">Filter by commodity:</span>
          <button
            onClick={() => setSelectedCommodity('')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              !selectedCommodity
                ? 'bg-primary-500/20 text-primary-300 border-primary-500/40'
                : 'bg-metallic-800/40 text-metallic-400 border-metallic-700/40 hover:bg-metallic-800/60'
            }`}
          >
            All
          </button>
          {allCommodities.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCommodity(c === selectedCommodity ? '' : c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                c === selectedCommodity
                  ? 'bg-primary-500/20 text-primary-300 border-primary-500/40'
                  : 'bg-metallic-800/40 text-metallic-400 border-metallic-700/40 hover:bg-metallic-800/60'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mr-3" />
            <span className="text-metallic-400">Loading geoscience data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mineral Belts */}
            {mineralBelts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-metallic-100 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary-400" />
                  Mineral Belts &amp; Geological Provinces
                </h2>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {mineralBelts.map((belt, i) => (
                    <div key={i} className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-5 hover:border-metallic-700 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-metallic-100 text-lg">{belt.name}</h3>
                          <span className="text-xs text-metallic-500 capitalize">{belt.province_type} · {belt.state}</span>
                        </div>
                        <MapPin className="w-4 h-4 text-metallic-600 flex-shrink-0" />
                      </div>
                      <p className="text-sm text-metallic-400 mb-3 line-clamp-3">{belt.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {belt.commodities.map(c => (
                          <span key={c} className={getCommodityBadge(c)}>{c}</span>
                        ))}
                      </div>
                      <div className="text-xs text-metallic-600 mt-2">
                        Age: {belt.age}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* USGS Deposits */}
            {deposits.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-metallic-100 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    USGS MRDS Mineral Deposits
                    <span className="text-sm font-normal text-metallic-500">({filteredDeposits.length})</span>
                  </h2>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-metallic-500" />
                    <input
                      type="text"
                      placeholder="Search deposits..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-metallic-900/50 border border-metallic-700 rounded-lg pl-9 pr-4 py-2 text-sm text-metallic-200 placeholder-metallic-600 focus:outline-none focus:border-primary-500/50 w-64"
                    />
                  </div>
                </div>
                <div className="bg-metallic-900/30 border border-metallic-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-metallic-900/60 border-b border-metallic-800">
                          <th className="text-left px-4 py-3 text-metallic-400 font-medium">Deposit Name</th>
                          <th className="text-left px-4 py-3 text-metallic-400 font-medium">Commodities</th>
                          <th className="text-left px-4 py-3 text-metallic-400 font-medium">Status</th>
                          <th className="text-left px-4 py-3 text-metallic-400 font-medium">Coordinates</th>
                          <th className="text-left px-4 py-3 text-metallic-400 font-medium">Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeposits.slice(0, 50).map((dep, i) => (
                          <tr key={dep.dep_id || i} className="border-b border-metallic-800/50 hover:bg-metallic-800/20">
                            <td className="px-4 py-2.5 text-metallic-200 font-medium max-w-[240px] truncate">
                              {dep.name || 'Unnamed'}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {decodeCommodityCodes(dep.commodity_codes).slice(0, 4).map((c, j) => (
                                  <span key={j} className={getCommodityBadge(c)}>{c}</span>
                                ))}
                              </div>
                            </td>
                            <td className={`px-4 py-2.5 font-medium ${statusColor(dep.status)}`}>
                              {dep.status || 'Unknown'}
                            </td>
                            <td className="px-4 py-2.5 text-metallic-500 text-xs font-mono">
                              {dep.lat && dep.lng ? `${dep.lat.toFixed(3)}, ${dep.lng.toFixed(3)}` : '—'}
                            </td>
                            <td className="px-4 py-2.5">
                              {dep.url && (
                                <a
                                  href={dep.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-400 hover:text-primary-300"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredDeposits.length > 50 && (
                    <div className="px-4 py-3 text-center text-xs text-metallic-500 border-t border-metallic-800/50">
                      Showing 50 of {filteredDeposits.length} deposits. Refine your search to see more.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* SA Company Geological Context */}
            {companyContexts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-metallic-100 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  JSE Mining Company Geological Context
                </h2>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {companyContexts.map((ctx, i) => (
                    <div key={i} className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-metallic-100 text-lg">{ctx.name}</h3>
                        <span className="text-xs text-metallic-500 font-mono">JSE:{ctx.ticker}</span>
                      </div>
                      <p className="text-sm text-metallic-400 mb-3 line-clamp-3">{ctx.deposits}</p>
                      <div className="space-y-1 text-xs text-metallic-500">
                        <div><strong className="text-metallic-400">Belts:</strong> {ctx.belts.join(', ')}</div>
                        <div><strong className="text-metallic-400">Operations:</strong> {ctx.operations.join(', ')}</div>
                        <div><strong className="text-metallic-400">Reporting:</strong> {ctx.reporting_standard}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Seismicity */}
            {seismicity.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-metallic-100 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Recent Seismic Activity (Mining-induced &amp; Natural)
                </h2>
                <div className="bg-metallic-900/30 border border-metallic-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-metallic-900/60 border-b border-metallic-800">
                        <th className="text-left px-4 py-3 text-metallic-400 font-medium">Date</th>
                        <th className="text-left px-4 py-3 text-metallic-400 font-medium">Magnitude</th>
                        <th className="text-left px-4 py-3 text-metallic-400 font-medium">Depth (km)</th>
                        <th className="text-left px-4 py-3 text-metallic-400 font-medium">Region</th>
                        <th className="text-left px-4 py-3 text-metallic-400 font-medium">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seismicity.map((ev, i) => (
                        <tr key={i} className="border-b border-metallic-800/50 hover:bg-metallic-800/20">
                          <td className="px-4 py-2.5 text-metallic-300">{ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</td>
                          <td className={`px-4 py-2.5 font-medium ${ev.magnitude >= 4 ? 'text-red-400' : ev.magnitude >= 3 ? 'text-amber-400' : 'text-metallic-300'}`}>
                            {ev.magnitude?.toFixed(1) || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-metallic-400">{ev.depth_km?.toFixed(1) || '—'}</td>
                          <td className="px-4 py-2.5 text-metallic-300">{ev.region || '—'}</td>
                          <td className="px-4 py-2.5 text-metallic-500 text-xs font-mono">
                            {ev.lat && ev.lng ? `${ev.lat.toFixed(3)}, ${ev.lng.toFixed(3)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Empty state */}
            {!loading && mineralBelts.length === 0 && deposits.length === 0 && (
              <div className="bg-metallic-900/30 border border-metallic-800 rounded-xl p-12 text-center">
                <Database className="w-12 h-12 text-metallic-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-metallic-300 mb-2">No data found</h3>
                <p className="text-metallic-500">
                  {selectedCommodity
                    ? `No ${selectedCommodity} data available for ${meta.name}. Try a different commodity filter.`
                    : `No geoscience data currently available for ${meta.name}.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
