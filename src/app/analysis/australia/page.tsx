'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, MapPin, Mountain, TrendingUp, FileText,
  Search, Filter, ChevronDown, ExternalLink, Drill, Gem, 
  AlertCircle, Loader2, RefreshCw, Database, BarChart3
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

export default function AustraliaGeosciencePage() {
  // State
  const [activeTab, setActiveTab] = useState<'links' | 'mines' | 'resources'>('links');
  const [gaTypeFilter, setGaTypeFilter] = useState<'all' | 'operating_mine' | 'critical_mineral' | 'deposit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  const [searchDaysBack, setSearchDaysBack] = useState(90);
  
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
                <span className="text-2xl">🇦🇺</span>
                <Database className="w-6 h-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Australia - Geoscience Data</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                Data from Geoscience Australia linked to ASX companies
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
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

        {/* Tabs */}
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
      </main>
    </div>
  );
}
