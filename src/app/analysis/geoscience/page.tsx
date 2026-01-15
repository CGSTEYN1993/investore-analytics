'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, MapPin, Mountain, TrendingUp, FileText,
  Search, Filter, ChevronDown, ExternalLink, Drill, Gem, 
  AlertCircle, Loader2, RefreshCw, Database, BarChart3,
  Layers, FlaskConical, Clock, Map, Pickaxe
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';
import { 
  useGACompanyLinks, 
  useMinesByCompany, 
  useResourceSearch,
  GeoscienceLink,
  ResourceAnnouncement 
} from '@/hooks/useCompanyIntelligence';

// Format market cap
function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  return `$${num.toLocaleString()}`;
}

// Format confidence score
function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

// Get confidence color
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-400';
  if (confidence >= 0.6) return 'text-yellow-400';
  return 'text-orange-400';
}

// WA Data Types
interface WAMinedexSite {
  id: string;
  name: string;
  status: string;
  site_type: string;
  commodity: string;
  owner: string;
  deposit_type: string;
  region: string;
  lat: number;
  lng: number;
}

interface WADrillhole {
  id: string;
  hole_id: string;
  name: string;
  company: string;
  project: string;
  commodity: string;
  drill_type: string;
  max_depth: number;
  year_drilled: string;
  lat: number;
  lng: number;
}

interface WAGeochemistrySample {
  id: string;
  sample_id: string;
  name: string;
  sample_type: string;
  rock_type: string;
  geological_unit: string;
  au_ppb: number | null;
  cu_ppm: number | null;
  lat: number;
  lng: number;
}

interface WAGeochronology {
  id: string;
  sample_id: string;
  name: string;
  method: string;
  age_ma: number;
  age_error: number;
  rock_type: string;
  mineral_dated: string;
  lat: number;
  lng: number;
}

interface WADatasetInfo {
  id: string;
  name: string;
  description: string;
  update_frequency: string;
  license: string;
}

// Custom hook for WA DMIRS data
function useWAData() {
  const [waData, setWAData] = useState<{
    minedex: WAMinedexSite[];
    drillholes: WADrillhole[];
    geochemistry: WAGeochemistrySample[];
    geochronology: WAGeochronology[];
    totalFeatures: number;
  } | null>(null);
  const [datasets, setDatasets] = useState<Record<string, WADatasetInfo>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWAData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/geoscience/wa/all');
      if (!response.ok) throw new Error('Failed to fetch WA data');
      const data = await response.json();
      setWAData({
        minedex: data.minedex || [],
        drillholes: data.drillholes || [],
        geochemistry: data.geochemistry || [],
        geochronology: data.geochronology || [],
        totalFeatures: data.total_features || 0,
      });
      if (data.datasets) {
        setDatasets(data.datasets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDatasetInfo = async () => {
    try {
      const response = await fetch('/api/v1/geoscience/wa/datasets');
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets || {});
      }
    } catch (err) {
      console.error('Failed to fetch WA dataset info:', err);
    }
  };

  useEffect(() => {
    fetchDatasetInfo();
  }, []);

  return {
    waData,
    datasets,
    isLoading,
    error,
    fetchWAData,
    refresh: fetchWAData,
  };
}

export default function GeoscienceIntelligencePage() {
  // State
  const [activeTab, setActiveTab] = useState<'links' | 'mines' | 'resources' | 'wa-minedex' | 'wa-drillholes' | 'wa-geochem' | 'wa-geochronology'>('links');
  const [gaTypeFilter, setGaTypeFilter] = useState<'all' | 'operating_mine' | 'critical_mineral' | 'deposit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  const [searchDaysBack, setSearchDaysBack] = useState(90);
  const [waLoaded, setWaLoaded] = useState(false);
  
  // Data hooks
  const { 
    links, 
    totalMatches, 
    isLoading: linksLoading, 
    error: linksError,
    refresh: refreshLinks 
  } = useGACompanyLinks(gaTypeFilter, 0.5);
  
  const {
    minesByCompany,
    totalCompanies,
    totalMines,
    isLoading: minesLoading,
    error: minesError,
    refresh: refreshMines
  } = useMinesByCompany();
  
  const {
    announcements: resourceAnns,
    count: resourceCount,
    isLoading: resourcesLoading,
    error: resourcesError,
    search: searchResources
  } = useResourceSearch();

  // WA DMIRS Data hook
  const {
    waData,
    datasets: waDatasets,
    isLoading: waLoading,
    error: waError,
    fetchWAData,
  } = useWAData();

  // Load WA data when switching to WA tabs
  useEffect(() => {
    if (activeTab.startsWith('wa-') && !waLoaded && !waLoading) {
      fetchWAData();
      setWaLoaded(true);
    }
  }, [activeTab, waLoaded, waLoading, fetchWAData]);
  
  // Filter links by search query
  const filteredLinks = useMemo(() => {
    if (!searchQuery) return links;
    const query = searchQuery.toLowerCase();
    return links.filter(link => 
      link.ga_name.toLowerCase().includes(query) ||
      link.company_name.toLowerCase().includes(query) ||
      link.company_symbol.toLowerCase().includes(query) ||
      link.commodity.toLowerCase().includes(query)
    );
  }, [links, searchQuery]);
  
  // Handle resource search
  const handleResourceSearch = () => {
    searchResources(commodityFilter || undefined, undefined, searchDaysBack);
  };
  
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/analysis"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Analysis Hub</span>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Geoscience Intelligence</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                Data from Geoscience Australia & WA DMIRS linked to ASX companies
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Data Source Selector */}
        <div className="flex items-center gap-4 p-3 bg-slate-900/30 rounded-xl border border-slate-800">
          <span className="text-sm text-slate-400">Data Source:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('links')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !activeTab.startsWith('wa-')
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Geoscience Australia
              </span>
            </button>
            <button
              onClick={() => setActiveTab('wa-minedex')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab.startsWith('wa-')
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                WA DMIRS / GSWA
              </span>
            </button>
          </div>
          {activeTab.startsWith('wa-') && (
            <span className="ml-auto text-xs text-amber-400/70">
              {waData?.totalFeatures || 0} total WA features loaded
            </span>
          )}
        </div>

        {/* Stats Cards - GA */}
        {!activeTab.startsWith('wa-') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Mountain className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalMatches}</div>
                <div className="text-sm text-slate-400">GA Features Linked</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalCompanies}</div>
                <div className="text-sm text-slate-400">ASX Companies</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Drill className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalMines}</div>
                <div className="text-sm text-slate-400">Operating Mines</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{resourceCount}</div>
                <div className="text-sm text-slate-400">Resource Announcements</div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Stats Cards - WA DMIRS */}
        {activeTab.startsWith('wa-') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-amber-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Pickaxe className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{waData?.minedex?.length || 0}</div>
                  <div className="text-sm text-slate-400">MINEDEX Sites</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-amber-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Drill className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{waData?.drillholes?.length || 0}</div>
                  <div className="text-sm text-slate-400">Exploration Drillholes</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-amber-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{waData?.geochemistry?.length || 0}</div>
                  <div className="text-sm text-slate-400">Geochem Samples</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-amber-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{waData?.geochronology?.length || 0}</div>
                  <div className="text-sm text-slate-400">Geochronology Ages</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - GA */}
        {!activeTab.startsWith('wa-') && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'links'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            GA-Company Links
          </button>
          <button
            onClick={() => setActiveTab('mines')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'mines'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Mines by Company
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'resources'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Resource Announcements
          </button>
        </div>
        )}

        {/* Tabs - WA DMIRS */}
        {activeTab.startsWith('wa-') && (
        <div className="flex items-center gap-2 border-b border-amber-800/30 pb-4">
          <button
            onClick={() => setActiveTab('wa-minedex')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'wa-minedex'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Pickaxe className="w-4 h-4" />
              MINEDEX Sites
            </span>
          </button>
          <button
            onClick={() => setActiveTab('wa-drillholes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'wa-drillholes'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Drill className="w-4 h-4" />
              Drillholes
            </span>
          </button>
          <button
            onClick={() => setActiveTab('wa-geochem')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'wa-geochem'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Geochemistry
            </span>
          </button>
          <button
            onClick={() => setActiveTab('wa-geochronology')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'wa-geochronology'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Geochronology
            </span>
          </button>
          <button
            onClick={fetchWAData}
            disabled={waLoading}
            className="ml-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {waLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
        )}

        {/* GA-Company Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search mines, companies, commodities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              
              <select
                value={gaTypeFilter}
                onChange={(e) => setGaTypeFilter(e.target.value as typeof gaTypeFilter)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="all">All Types</option>
                <option value="operating_mine">Operating Mines</option>
                <option value="critical_mineral">Critical Minerals</option>
                <option value="deposit">Deposits</option>
              </select>
              
              <button
                onClick={refreshLinks}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Links Table */}
            {linksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : linksError ? (
              <div className="flex items-center justify-center py-12 text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {linksError}
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50">
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">GA Feature</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">ASX Company</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Commodity</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">State</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Confidence</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLinks.slice(0, 100).map((link, index) => (
                        <tr 
                          key={`${link.ga_id}-${index}`} 
                          className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Mountain className="w-4 h-4 text-slate-500" />
                              <span className="text-white font-medium">{link.ga_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              link.ga_type === 'operating_mine' 
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : link.ga_type === 'critical_mineral'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {link.ga_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/company/${link.company_symbol}`}
                              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <span className="font-mono font-bold">{link.company_symbol}</span>
                              <span className="text-slate-400 text-sm">{link.company_name}</span>
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ 
                                backgroundColor: `${getCommodityColor(link.commodity)}20`,
                                color: getCommodityColor(link.commodity)
                              }}
                            >
                              {link.commodity || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{link.state || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${getConfidenceColor(link.match_confidence)}`}>
                              {formatConfidence(link.match_confidence)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://www.google.com/maps/@${link.lat},${link.lng},12z`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                                title="View on map"
                              >
                                <MapPin className="w-4 h-4" />
                              </a>
                              <Link
                                href={`/company/${link.company_symbol}`}
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                                title="View company"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredLinks.length > 100 && (
                  <div className="px-4 py-3 text-center text-sm text-slate-400 border-t border-slate-800">
                    Showing 100 of {filteredLinks.length} results. Refine your search for more specific results.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mines by Company Tab */}
        {activeTab === 'mines' && (
          <div className="space-y-4">
            {minesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : minesError ? (
              <div className="flex items-center justify-center py-12 text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {minesError}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(minesByCompany).slice(0, 30).map(([symbol, mines]) => (
                  <div 
                    key={symbol}
                    className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Link
                        href={`/company/${symbol}`}
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Building2 className="w-5 h-5" />
                        <span className="font-mono font-bold text-lg">{symbol}</span>
                      </Link>
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
                        {mines.length} mine{mines.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {mines.slice(0, 5).map((mine, index) => (
                        <div 
                          key={`${mine.ga_id}-${index}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-slate-300 truncate flex-1">{mine.ga_name}</span>
                          <span 
                            className="px-2 py-0.5 rounded text-xs ml-2"
                            style={{ 
                              backgroundColor: `${getCommodityColor(mine.commodity)}20`,
                              color: getCommodityColor(mine.commodity)
                            }}
                          >
                            {mine.commodity || 'N/A'}
                          </span>
                        </div>
                      ))}
                      {mines.length > 5 && (
                        <div className="text-xs text-slate-500 pt-1">
                          +{mines.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resource Announcements Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            {/* Search Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-slate-400 mb-1">Commodity Filter</label>
                <select
                  value={commodityFilter}
                  onChange={(e) => setCommodityFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">All Commodities</option>
                  <option value="GOLD">Gold</option>
                  <option value="COPPER">Copper</option>
                  <option value="LITHIUM">Lithium</option>
                  <option value="NICKEL">Nickel</option>
                  <option value="IRON">Iron Ore</option>
                  <option value="ZINC">Zinc</option>
                  <option value="URANIUM">Uranium</option>
                </select>
              </div>
              <div className="w-40">
                <label className="block text-sm text-slate-400 mb-1">Days Back</label>
                <select
                  value={searchDaysBack}
                  onChange={(e) => setSearchDaysBack(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={180}>180 Days</option>
                  <option value={365}>1 Year</option>
                </select>
              </div>
              <div className="self-end">
                <button
                  onClick={handleResourceSearch}
                  disabled={resourcesLoading}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {resourcesLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </button>
              </div>
            </div>

            {/* Results */}
            {resourcesError ? (
              <div className="flex items-center justify-center py-12 text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {resourcesError}
              </div>
            ) : resourceAnns.length > 0 ? (
              <div className="space-y-4">
                {resourceAnns.map((ann, index) => (
                  <div 
                    key={`${ann.symbol}-${index}`}
                    className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/company/${ann.symbol}`}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded font-mono font-bold"
                        >
                          {ann.symbol}
                        </Link>
                        <span className="text-slate-400 text-sm">{ann.date}</span>
                      </div>
                      {ann.url && (
                        <a
                          href={ann.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <h3 className="text-white font-medium mb-3">{ann.title}</h3>
                    {ann.resources.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {ann.resources.map((resource, rIndex) => (
                          <div 
                            key={rIndex}
                            className="bg-slate-800/50 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-400 uppercase">{resource.category}</span>
                              <span 
                                className="px-2 py-0.5 rounded text-xs"
                                style={{ 
                                  backgroundColor: `${getCommodityColor(resource.commodity)}20`,
                                  color: getCommodityColor(resource.commodity)
                                }}
                              >
                                {resource.commodity}
                              </span>
                            </div>
                            <div className="text-white font-bold">
                              {resource.tonnage_mt.toFixed(1)} Mt @ {resource.grade} {resource.grade_unit}
                            </div>
                            {resource.contained_metal && (
                              <div className="text-sm text-slate-400 mt-1">
                                {resource.contained_metal.toFixed(1)} {resource.contained_unit} contained
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Gem className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click Search to find resource announcements</p>
                <p className="text-sm mt-2">
                  Searches ASX mining companies for JORC resource estimates
                </p>
              </div>
            )}
          </div>
        )}

        {/* WA MINEDEX Tab */}
        {activeTab === 'wa-minedex' && (
          <div className="space-y-4">
            {waLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="ml-3 text-slate-400">Loading WA DMIRS data...</span>
              </div>
            ) : waError ? (
              <div className="flex items-center justify-center py-12 text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {waError}
              </div>
            ) : (
              <>
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-amber-400">MINEDEX (DMIRS-001)</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Comprehensive database of all mines, deposits, and prospects in Western Australia.
                    Includes site name, status, commodities, owner/operator, and deposit type.
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/50">
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Site Name</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Commodities</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Owner</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(waData?.minedex || []).slice(0, 100).map((site, index) => (
                          <tr 
                            key={`${site.id}-${index}`}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Pickaxe className="w-4 h-4 text-amber-500" />
                                <span className="text-white font-medium">{site.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                site.status === 'Operating' 
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : site.status === 'Care and Maintenance'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {site.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{site.site_type || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${getCommodityColor(site.commodity?.split(',')[0] || '')}20`,
                                  color: getCommodityColor(site.commodity?.split(',')[0] || '')
                                }}
                              >
                                {site.commodity || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-300 text-sm truncate max-w-[200px]">{site.owner || 'N/A'}</td>
                            <td className="px-4 py-3">
                              {site.lat && site.lng ? (
                                <a
                                  href={`https://www.google.com/maps/@${site.lat},${site.lng},12z`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-400 hover:text-amber-300 transition-colors"
                                >
                                  <MapPin className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(waData?.minedex?.length || 0) > 100 && (
                    <div className="px-4 py-3 text-center text-sm text-slate-400 border-t border-slate-800">
                      Showing 100 of {waData?.minedex?.length || 0} MINEDEX sites
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* WA Drillholes Tab */}
        {activeTab === 'wa-drillholes' && (
          <div className="space-y-4">
            {waLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Drill className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-blue-400">Mineral Exploration Drillholes (DMIRS-046)</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Open file exploration drillholes from company reports submitted to DMIRS.
                    Historic drilling data to aid mineral exploration in Western Australia.
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/50">
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Hole ID</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Company</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Project</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Commodity</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Depth (m)</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Year</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(waData?.drillholes || []).slice(0, 100).map((hole, index) => (
                          <tr 
                            key={`${hole.id}-${index}`}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span className="text-white font-mono text-sm">{hole.hole_id || hole.name}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-300 text-sm">{hole.company || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{hole.project || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${getCommodityColor(hole.commodity)}20`,
                                  color: getCommodityColor(hole.commodity)
                                }}
                              >
                                {hole.commodity || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white font-medium">{hole.max_depth ? `${hole.max_depth}m` : 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{hole.drill_type || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{hole.year_drilled || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(waData?.drillholes?.length || 0) > 100 && (
                    <div className="px-4 py-3 text-center text-sm text-slate-400 border-t border-slate-800">
                      Showing 100 of {waData?.drillholes?.length || 0} drillholes
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* WA Geochemistry Tab */}
        {activeTab === 'wa-geochem' && (
          <div className="space-y-4">
            {waLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-emerald-400">GSWA Geochemistry - WACHEM (DMIRS-047)</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Multi-element geochemistry database of rocks, unconsolidated regolith, and drill core
                    collected by the Geological Survey of Western Australia.
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/50">
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Sample ID</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Rock Type</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Geological Unit</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Au (ppb)</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Cu (ppm)</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(waData?.geochemistry || []).slice(0, 100).map((sample, index) => (
                          <tr 
                            key={`${sample.id}-${index}`}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span className="text-white font-mono text-sm">{sample.sample_id || sample.name}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{sample.sample_type || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-300 text-sm">{sample.rock_type || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm truncate max-w-[150px]">{sample.geological_unit || 'N/A'}</td>
                            <td className="px-4 py-3">
                              {sample.au_ppb ? (
                                <span className={`font-medium ${sample.au_ppb > 100 ? 'text-yellow-400' : 'text-slate-300'}`}>
                                  {sample.au_ppb}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {sample.cu_ppm ? (
                                <span className={`font-medium ${sample.cu_ppm > 1000 ? 'text-orange-400' : 'text-slate-300'}`}>
                                  {sample.cu_ppm}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {sample.lat && sample.lng ? (
                                <a
                                  href={`https://www.google.com/maps/@${sample.lat},${sample.lng},12z`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                  <MapPin className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(waData?.geochemistry?.length || 0) > 100 && (
                    <div className="px-4 py-3 text-center text-sm text-slate-400 border-t border-slate-800">
                      Showing 100 of {waData?.geochemistry?.length || 0} geochemistry samples
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* WA Geochronology Tab */}
        {activeTab === 'wa-geochronology' && (
          <div className="space-y-4">
            {waLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-purple-400">GSWA Geochronology (DMIRS-029)</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Isotopic age determinations (U-Pb, Ar-Ar, K-Ar methods) obtained from geological
                    samples throughout Western Australia. Essential for understanding geological history.
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/50">
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Sample</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Method</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Age (Ma)</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">± Error</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Rock Type</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Mineral</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(waData?.geochronology || []).slice(0, 100).map((sample, index) => (
                          <tr 
                            key={`${sample.id}-${index}`}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span className="text-white font-mono text-sm">{sample.sample_id || sample.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                sample.method === 'U-Pb'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : sample.method === 'Ar-Ar'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-purple-500/20 text-purple-400'
                              }`}>
                                {sample.method || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white font-bold">
                              {sample.age_ma ? `${sample.age_ma.toLocaleString()}` : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {sample.age_error ? `± ${sample.age_error}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-300 text-sm">{sample.rock_type || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{sample.mineral_dated || 'N/A'}</td>
                            <td className="px-4 py-3">
                              {sample.lat && sample.lng ? (
                                <a
                                  href={`https://www.google.com/maps/@${sample.lat},${sample.lng},12z`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                  <MapPin className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(waData?.geochronology?.length || 0) > 100 && (
                    <div className="px-4 py-3 text-center text-sm text-slate-400 border-t border-slate-800">
                      Showing 100 of {waData?.geochronology?.length || 0} geochronology samples
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
