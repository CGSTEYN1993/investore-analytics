'use client';

import React, { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, MapPin, Mountain, TrendingUp, FileText,
  Search, Filter, ChevronDown, ExternalLink, Drill, Gem, 
  AlertCircle, Loader2, RefreshCw, Database, BarChart3,
  Globe, Layers, FileSearch, Sparkles, Play, Map, X, Info,
  Target, Users, MapPinned, Crosshair
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';
import { 
  useGACompanyLinks, 
  useMinesByCompany, 
  useResourceSearch,
  GeoscienceLink,
  ResourceAnnouncement 
} from '@/hooks/useCompanyIntelligence';
import {
  useGeologicalProvinces,
  useDrillingParser,
  useResourceParser,
  useGeoscienceMapData,
  useSiteDetails,
  useMapCompanies,
  useSitesByCompany,
  useMapTenements,
  GeologicalProvince,
  MapFeature,
  SiteDetails
} from '@/hooks/useGeologicalData';

// Lazy load the map component to avoid SSR issues
const AustraliaGeoscienceMap = lazy(() => import('@/components/maps/AustraliaGeoscienceMap'));

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
  const [activeTab, setActiveTab] = useState<'map' | 'links' | 'mines' | 'resources' | 'provinces' | 'drilling' | 'jorc'>('map');
  const [gaTypeFilter, setGaTypeFilter] = useState<'all' | 'operating_mine' | 'critical_mineral' | 'deposit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  const [searchDaysBack, setSearchDaysBack] = useState(90);
  
  // Drilling/JORC parser state
  const [drillingText, setDrillingText] = useState('');
  const [jorcText, setJorcText] = useState('');
  
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
  
  // New geological hooks
  const {
    provinces,
    isLoading: provincesLoading,
    error: provincesError,
    refresh: refreshProvinces
  } = useGeologicalProvinces(200);
  
  const {
    intercepts: parsedIntercepts,
    isLoading: drillingParserLoading,
    error: drillingParserError,
    parseText: parseDrillingText
  } = useDrillingParser();
  
  const {
    resources: parsedResources,
    mlFeatures,
    isLoading: resourceParserLoading,
    error: resourceParserError,
    parseText: parseResourceText
  } = useResourceParser();
  
  // Map data state
  const [mapCommodityFilter, setMapCommodityFilter] = useState('');
  const [mapStateFilter, setMapStateFilter] = useState('');
  const [mapCompanyFilter, setMapCompanyFilter] = useState('');
  const [includeBoreholes, setIncludeBoreholes] = useState(false);
  const [includeGeochemistry, setIncludeGeochemistry] = useState(false);
  const [showSiteDetailsPanel, setShowSiteDetailsPanel] = useState(false);
  
  // Map data hook
  const {
    data: mapData,
    isLoading: mapLoading,
    error: mapError,
    refresh: refreshMapData
  } = useGeoscienceMapData({
    commodity: mapCommodityFilter || undefined,
    state: mapStateFilter || undefined,
    includeBoreholes,
    includeGeochemistry,
    limitPerLayer: 1000
  });
  
  // Selected map feature
  const [selectedMapFeature, setSelectedMapFeature] = useState<MapFeature | null>(null);
  
  // Company list for filtering
  const { companies: mapCompanies, isLoading: companiesLoading } = useMapCompanies();
  
  // Site details when a feature is selected
  const { 
    details: siteDetails, 
    isLoading: siteDetailsLoading, 
    error: siteDetailsError 
  } = useSiteDetails(
    selectedMapFeature?.name || null,
    selectedMapFeature?.type
  );
  
  // Sites filtered by company
  const { 
    data: companySites, 
    isLoading: companySitesLoading 
  } = useSitesByCompany(mapCompanyFilter || null);
  
  // WA Mining Tenements
  const [includeTenements, setIncludeTenements] = useState(false);
  const {
    features: tenements,
    isLoading: tenementsLoading,
    error: tenementsError,
    refresh: refreshTenements
  } = useMapTenements({
    limit: includeTenements ? 1000 : 0,
  });
  
  // When a feature is selected, show the details panel
  useEffect(() => {
    if (selectedMapFeature) {
      setShowSiteDetailsPanel(true);
    }
  }, [selectedMapFeature]);
  
  // Combine map data with company filter
  const filteredMapData = useMemo(() => {
    if (!mapData) return null;
    if (!mapCompanyFilter) return mapData;
    
    // If company filter is set, use companySites data
    if (companySites) {
      return {
        operatingMines: companySites.operating_mines || [],
        developingMines: companySites.developing_mines || [],
        criticalMinerals: companySites.critical_minerals || [],
        deposits: companySites.deposits || [],
        boreholes: [],
        geochemistry: [],
        totals: {
          operatingMines: companySites.operating_mines?.length || 0,
          developingMines: companySites.developing_mines?.length || 0,
          criticalMinerals: companySites.critical_minerals?.length || 0,
          deposits: companySites.deposits?.length || 0,
          boreholes: 0,
          geochemistry: 0,
        }
      };
    }
    
    return mapData;
  }, [mapData, mapCompanyFilter, companySites]);
  
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Mountain className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalMatches}</div>
                <div className="text-sm text-slate-400">GA Links</div>
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
                <div className="text-sm text-slate-400">Companies</div>
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
                <div className="text-sm text-slate-400">Mines</div>
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
                <div className="text-sm text-slate-400">Announcements</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{provinces.length}</div>
                <div className="text-sm text-slate-400">Provinces</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">ML</div>
                <div className="text-sm text-slate-400">Ready Data</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Map View
            </span>
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'links'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              GA-Company Links
            </span>
          </button>
          <button
            onClick={() => setActiveTab('mines')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'mines'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Mines by Company
            </span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'resources'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Announcements
            </span>
          </button>
          <button
            onClick={() => setActiveTab('provinces')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'provinces'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Geological Provinces
            </span>
          </button>
          <button
            onClick={() => setActiveTab('drilling')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'drilling'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Drill className="w-4 h-4" />
              Drill Parser
            </span>
          </button>
          <button
            onClick={() => setActiveTab('jorc')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'jorc'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Gem className="w-4 h-4" />
              JORC Parser
            </span>
          </button>
        </div>

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            {/* Map Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={mapCommodityFilter}
                onChange={(e) => setMapCommodityFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">All Commodities</option>
                <option value="Gold">Gold</option>
                <option value="Copper">Copper</option>
                <option value="Lithium">Lithium</option>
                <option value="Iron">Iron Ore</option>
                <option value="Nickel">Nickel</option>
                <option value="Uranium">Uranium</option>
                <option value="Zinc">Zinc</option>
                <option value="Coal">Coal</option>
              </select>
              
              <select
                value={mapStateFilter}
                onChange={(e) => setMapStateFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">All States</option>
                <option value="WA">Western Australia</option>
                <option value="QLD">Queensland</option>
                <option value="NSW">New South Wales</option>
                <option value="SA">South Australia</option>
                <option value="VIC">Victoria</option>
                <option value="NT">Northern Territory</option>
                <option value="TAS">Tasmania</option>
              </select>
              
              <select
                value={mapCompanyFilter}
                onChange={(e) => setMapCompanyFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-w-[180px]"
              >
                <option value="">All Companies</option>
                {mapCompanies.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              
              <label className="flex items-center gap-2 text-slate-300 text-sm">
                <input
                  type="checkbox"
                  checked={includeBoreholes}
                  onChange={(e) => setIncludeBoreholes(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                />
                Boreholes
              </label>
              
              <label className="flex items-center gap-2 text-slate-300 text-sm">
                <input
                  type="checkbox"
                  checked={includeGeochemistry}
                  onChange={(e) => setIncludeGeochemistry(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                />
                Geochemistry
              </label>
              
              <button
                onClick={refreshMapData}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              {filteredMapData && (
                <div className="ml-auto flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rotate-45" />
                    Operating: {filteredMapData.totals?.operatingMines ?? filteredMapData.operatingMines?.length ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rotate-45" />
                    Developing: {filteredMapData.totals?.developingMines ?? filteredMapData.developingMines?.length ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-cyan-400" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                    Critical: {filteredMapData.totals?.criticalMinerals ?? filteredMapData.criticalMinerals?.length ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    Deposits: {filteredMapData.totals?.deposits ?? filteredMapData.deposits?.length ?? 0}
                  </span>
                </div>
              )}
            </div>

            {/* Map Container */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden" style={{ height: '700px' }}>
              {mapLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="ml-3 text-slate-400">Loading geoscience data...</span>
                </div>
              ) : mapError ? (
                <div className="flex items-center justify-center h-full text-red-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {mapError}
                </div>
              ) : (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <span className="ml-3 text-slate-400">Loading map...</span>
                  </div>
                }>
                  <AustraliaGeoscienceMap
                    operatingMines={filteredMapData?.operatingMines || []}
                    developingMines={filteredMapData?.developingMines || []}
                    criticalMinerals={filteredMapData?.criticalMinerals || []}
                    deposits={filteredMapData?.deposits || []}
                    boreholes={filteredMapData?.boreholes || []}
                    geochemistry={filteredMapData?.geochemistry || []}
                    tenements={includeTenements ? tenements : []}
                    onSelectFeature={(feature) => setSelectedMapFeature(feature)}
                    className="h-full"
                  />
                </Suspense>
              )}
            </div>
            
            {/* Site Details Panel */}
            {selectedMapFeature && showSiteDetailsPanel && (
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMapFeature.type === 'operating_mine' ? 'bg-green-500/20 text-green-400' :
                      selectedMapFeature.type === 'developing_mine' ? 'bg-blue-500/20 text-blue-400' :
                      selectedMapFeature.type === 'critical_mineral' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedMapFeature.name}</h3>
                      <p className="text-sm text-slate-400 capitalize">
                        {selectedMapFeature.type.replace(/_/g, ' ')}
                        {selectedMapFeature.status && ` • ${selectedMapFeature.status}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSiteDetailsPanel(false);
                      setSelectedMapFeature(null);
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
                  {siteDetailsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mr-2" />
                      <span className="text-slate-400">Loading site details...</span>
                    </div>
                  ) : siteDetailsError ? (
                    <>
                      {/* Basic Info from Map Feature */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedMapFeature.commodity && (
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Commodity</span>
                            <p className="text-white font-medium">{selectedMapFeature.commodity}</p>
                          </div>
                        )}
                        {selectedMapFeature.state && (
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">State</span>
                            <p className="text-white font-medium">{selectedMapFeature.state}</p>
                          </div>
                        )}
                        {selectedMapFeature.owner && (
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Owner</span>
                            <p className="text-white font-medium">{selectedMapFeature.owner}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Coordinates</span>
                          <p className="text-white font-medium text-sm">
                            {selectedMapFeature.lat.toFixed(4)}°S, {selectedMapFeature.lng.toFixed(4)}°E
                          </p>
                        </div>
                      </div>
                      {selectedMapFeature.description && (
                        <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">{selectedMapFeature.description}</p>
                      )}
                    </>
                  ) : siteDetails ? (
                    <>
                      {/* Site Overview */}
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Site Overview
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/30 p-3 rounded-lg">
                          {siteDetails.site.commodity && (
                            <div>
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Commodity</span>
                              <p className="text-white font-medium">{siteDetails.site.commodity}</p>
                            </div>
                          )}
                          {siteDetails.site.state && (
                            <div>
                              <span className="text-xs text-slate-500 uppercase tracking-wide">State</span>
                              <p className="text-white font-medium">{siteDetails.site.state}</p>
                            </div>
                          )}
                          {siteDetails.site.owner && (
                            <div>
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Owner</span>
                              <p className="text-white font-medium">{siteDetails.site.owner}</p>
                            </div>
                          )}
                          {siteDetails.site.status && (
                            <div>
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Status</span>
                              <p className="text-white font-medium">{siteDetails.site.status}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Coordinates</span>
                            <p className="text-white font-medium text-sm">
                              {siteDetails.site.lat?.toFixed(4)}°S, {siteDetails.site.lng?.toFixed(4)}°E
                            </p>
                          </div>
                          {siteDetails.site.mine_type && (
                            <div>
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Mine Type</span>
                              <p className="text-white font-medium">{siteDetails.site.mine_type}</p>
                            </div>
                          )}
                          {siteDetails.site.size && (
                            <div>
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Size</span>
                              <p className="text-white font-medium">{siteDetails.site.size}</p>
                            </div>
                          )}
                          {siteDetails.site.all_commodities && siteDetails.site.all_commodities.length > 1 && (
                            <div className="col-span-2">
                              <span className="text-xs text-slate-500 uppercase tracking-wide">All Commodities</span>
                              <p className="text-white font-medium">{siteDetails.site.all_commodities.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Resource Estimates */}
                      {siteDetails.resources && siteDetails.resources.has_resources && (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                            <MapPinned className="w-4 h-4" />
                            Resource Estimates
                          </h4>
                          <div className="bg-slate-800/30 p-3 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {siteDetails.resources.measured && (
                                <div>
                                  <span className="text-slate-500 text-xs">Measured</span>
                                  <p className="text-green-400 font-medium">{siteDetails.resources.measured.toLocaleString()} Mt</p>
                                </div>
                              )}
                              {siteDetails.resources.indicated && (
                                <div>
                                  <span className="text-slate-500 text-xs">Indicated</span>
                                  <p className="text-blue-400 font-medium">{siteDetails.resources.indicated.toLocaleString()} Mt</p>
                                </div>
                              )}
                              {siteDetails.resources.inferred && (
                                <div>
                                  <span className="text-slate-500 text-xs">Inferred</span>
                                  <p className="text-amber-400 font-medium">{siteDetails.resources.inferred.toLocaleString()} Mt</p>
                                </div>
                              )}
                              {siteDetails.resources.total_tonnage_mt && (
                                <div>
                                  <span className="text-slate-500 text-xs">Total Tonnage</span>
                                  <p className="text-white font-bold">{siteDetails.resources.total_tonnage_mt.toLocaleString()} Mt</p>
                                </div>
                              )}
                              {siteDetails.resources.primary_grade && (
                                <div>
                                  <span className="text-slate-500 text-xs">Primary Grade</span>
                                  <p className="text-white font-medium">
                                    {siteDetails.resources.primary_grade} {siteDetails.resources.grade_unit || ''}
                                  </p>
                                </div>
                              )}
                              {siteDetails.resources.contained_metal && (
                                <div>
                                  <span className="text-slate-500 text-xs">Contained Metal</span>
                                  <p className="text-white font-medium">
                                    {siteDetails.resources.contained_metal.toLocaleString()} {siteDetails.resources.metal_unit || ''}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Nearby Resources */}
                            {siteDetails.resources.nearby_resources && siteDetails.resources.nearby_resources.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-700">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Nearby Resource Comparisons</span>
                                <div className="mt-2 space-y-2">
                                  {siteDetails.resources.nearby_resources.slice(0, 3).map((nr, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-slate-300">{nr.name} ({nr.commodity})</span>
                                      <span className="text-white">
                                        {nr.resource_tonnage_mt?.toLocaleString()} Mt @ {nr.resource_grade} {nr.resource_grade_unit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Geological Context */}
                      {siteDetails.geological_context && (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Geological Context
                          </h4>
                          <div className="bg-slate-800/30 p-3 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              {siteDetails.geological_context.province && (
                                <div>
                                  <span className="text-slate-500 text-xs">Province</span>
                                  <p className="text-white">
                                    {typeof siteDetails.geological_context.province === 'object' 
                                      ? siteDetails.geological_context.province.name || JSON.stringify(siteDetails.geological_context.province)
                                      : siteDetails.geological_context.province}
                                  </p>
                                </div>
                              )}
                              {siteDetails.geological_context.deposit_type && (
                                <div>
                                  <span className="text-slate-500 text-xs">Deposit Type</span>
                                  <p className="text-white">{siteDetails.geological_context.deposit_type}</p>
                                </div>
                              )}
                              {siteDetails.geological_context.host_rock && (
                                <div>
                                  <span className="text-slate-500 text-xs">Host Rock</span>
                                  <p className="text-white">{siteDetails.geological_context.host_rock}</p>
                                </div>
                              )}
                              {siteDetails.geological_context.alteration && (
                                <div>
                                  <span className="text-slate-500 text-xs">Alteration</span>
                                  <p className="text-white">{siteDetails.geological_context.alteration}</p>
                                </div>
                              )}
                              {siteDetails.geological_context.structural_setting && (
                                <div>
                                  <span className="text-slate-500 text-xs">Structural Setting</span>
                                  <p className="text-white">{siteDetails.geological_context.structural_setting}</p>
                                </div>
                              )}
                              {siteDetails.geological_context.tectonic_setting && (
                                <div>
                                  <span className="text-slate-500 text-xs">Tectonic Setting</span>
                                  <p className="text-white">{siteDetails.geological_context.tectonic_setting}</p>
                                </div>
                              )}
                              {siteDetails.geological_context.age_of_mineralization && (
                                <div>
                                  <span className="text-slate-500 text-xs">Age of Mineralization</span>
                                  <p className="text-white">{siteDetails.geological_context.age_of_mineralization}</p>
                                </div>
                              )}
                              {siteDetails.geological_context.mineralization_style && (
                                <div>
                                  <span className="text-slate-500 text-xs">Mineralization Style</span>
                                  <p className="text-white">{siteDetails.geological_context.mineralization_style}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Nearby Deposits */}
                      {siteDetails.nearby_deposits && siteDetails.nearby_deposits.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Nearby Deposits ({siteDetails.nearby_deposits.length})
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-slate-500 text-xs uppercase">
                                  <th className="text-left py-2 pr-4">Name</th>
                                  <th className="text-left py-2 pr-4">Commodity</th>
                                  <th className="text-right py-2">Distance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {siteDetails.nearby_deposits.slice(0, 5).map((dep, idx) => (
                                  <tr key={idx} className="border-t border-slate-800">
                                    <td className="py-2 pr-4 text-white">{dep.name}</td>
                                    <td className="py-2 pr-4 text-slate-400">{dep.commodity}</td>
                                    <td className="py-2 text-right text-slate-400">{dep.distance_km.toFixed(1)} km</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      {/* Drilling Summary */}
                      {siteDetails.drilling_summary && (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                            <Drill className="w-4 h-4" />
                            Nearby Drilling Activity
                          </h4>
                          <div className="grid grid-cols-3 gap-4 bg-slate-800/30 p-3 rounded-lg">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-white">{siteDetails.drilling_summary.total_holes_nearby || 0}</p>
                              <span className="text-xs text-slate-500">Nearby Holes</span>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-white">{siteDetails.drilling_summary.total_metres?.toLocaleString() || 0}</p>
                              <span className="text-xs text-slate-500">Total Metres</span>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-white">{siteDetails.drilling_summary.deepest_hole_m || 0}m</p>
                              <span className="text-xs text-slate-500">Deepest Hole</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Nearby Boreholes */}
                      {siteDetails.nearby_boreholes && siteDetails.nearby_boreholes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                            <Crosshair className="w-4 h-4" />
                            Nearby Boreholes ({siteDetails.nearby_boreholes.length})
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-slate-500 text-xs uppercase">
                                  <th className="text-left py-2 pr-4">Name</th>
                                  <th className="text-left py-2 pr-4">Type</th>
                                  <th className="text-right py-2 pr-4">Depth</th>
                                  <th className="text-right py-2">Distance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {siteDetails.nearby_boreholes.slice(0, 5).map((bh, idx) => (
                                  <tr key={idx} className="border-t border-slate-800">
                                    <td className="py-2 pr-4 text-white">{bh.name}</td>
                                    <td className="py-2 pr-4 text-slate-400">{bh.drill_type || bh.purpose}</td>
                                    <td className="py-2 pr-4 text-right text-slate-400">{bh.depth_m ? `${bh.depth_m}m` : '-'}</td>
                                    <td className="py-2 text-right text-slate-400">{bh.distance_km.toFixed(1)} km</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      {/* LLM Context */}
                      {siteDetails.llm_context && (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Summary
                          </h4>
                          <p className="text-sm text-slate-300 bg-slate-800/30 p-3 rounded-lg whitespace-pre-wrap">
                            {siteDetails.llm_context}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Fallback to basic info */
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedMapFeature.commodity && (
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Commodity</span>
                            <p className="text-white font-medium">{selectedMapFeature.commodity}</p>
                          </div>
                        )}
                        {selectedMapFeature.state && (
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">State</span>
                            <p className="text-white font-medium">{selectedMapFeature.state}</p>
                          </div>
                        )}
                        {selectedMapFeature.owner && (
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Owner</span>
                            <p className="text-white font-medium">{selectedMapFeature.owner}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Coordinates</span>
                          <p className="text-white font-medium text-sm">
                            {selectedMapFeature.lat.toFixed(4)}°S, {selectedMapFeature.lng.toFixed(4)}°E
                          </p>
                        </div>
                      </div>
                      {selectedMapFeature.description && (
                        <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">{selectedMapFeature.description}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
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

        {/* Geological Provinces Tab */}
        {activeTab === 'provinces' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Australian Geological Provinces</h2>
                <p className="text-sm text-slate-400">
                  Data from Geoscience Australia - used for ML prospectivity modeling
                </p>
              </div>
              <button
                onClick={refreshProvinces}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {provincesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : provincesError ? (
              <div className="flex items-center justify-center py-12 text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {provincesError}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {provinces.slice(0, 50).map((province, index) => (
                  <div 
                    key={`${province.id || index}`}
                    className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          province.type === 'sedimentary' ? 'bg-blue-500/20 text-blue-400' :
                          province.type === 'igneous' ? 'bg-orange-500/20 text-orange-400' :
                          province.type === 'metamorphic' ? 'bg-purple-500/20 text-purple-400' :
                          province.type === 'tectonic' ? 'bg-red-500/20 text-red-400' :
                          province.type === 'metallogenic' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {province.type}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-white font-medium mb-2">
                      {province.name || `Province ${index + 1}`}
                    </h3>
                    {province.age_era && (
                      <p className="text-sm text-slate-400 mb-2">Era: {province.age_era}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {province.centroid_lat.toFixed(2)}°, {province.centroid_lng.toFixed(2)}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drilling Parser Tab */}
        {activeTab === 'drilling' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Drill className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Drilling Results Parser</h2>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs ml-2">ML Tool</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Paste drilling results text from ASX announcements to extract structured intercept data.
                Supports formats like &quot;RC123: 15m @ 3.2 g/t Au from 45m&quot;
              </p>
              
              <textarea
                value={drillingText}
                onChange={(e) => setDrillingText(e.target.value)}
                placeholder="Paste drilling results text here...

Examples:
- RC123: 15m @ 3.2 g/t Au from 45m including 3m @ 12.5 g/t Au
- DDH001: 8.5m @ 1.2% Cu from 120m
- 12m @ 2.1 g/t gold from 85m in hole RC456"
                className="w-full h-40 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-sm"
              />
              
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => parseDrillingText(drillingText)}
                  disabled={!drillingText || drillingParserLoading}
                  className="px-6 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {drillingParserLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Parse Intercepts
                </button>
                <button
                  onClick={() => setDrillingText('RC123: 15m @ 3.2 g/t Au from 45m including 3m @ 12.5 g/t Au. RC124: 8m @ 2.1% Cu from 120m. DDH001: 25m @ 1.5 g/t gold from 200m')}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Load Example
                </button>
              </div>
            </div>

            {drillingParserError && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5" />
                {drillingParserError}
              </div>
            )}

            {parsedIntercepts.length > 0 && (
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                  <h3 className="text-white font-medium">
                    Parsed Intercepts ({parsedIntercepts.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/30">
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Hole ID</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">From (m)</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">To (m)</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Width (m)</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Grade</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Commodity</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">High Grade?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedIntercepts.map((intercept, index) => (
                        <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-mono text-amber-400">{intercept.hole_id}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                              {intercept.hole_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white">{intercept.from_m.toFixed(1)}</td>
                          <td className="px-4 py-3 text-white">{intercept.to_m.toFixed(1)}</td>
                          <td className="px-4 py-3 text-white font-medium">{intercept.width_m.toFixed(1)}</td>
                          <td className="px-4 py-3 text-emerald-400 font-medium">
                            {intercept.grade.toFixed(2)} {intercept.grade_unit}
                          </td>
                          <td className="px-4 py-3">
                            <span 
                              className="px-2 py-0.5 rounded text-xs"
                              style={{ 
                                backgroundColor: `${getCommodityColor(intercept.commodity)}20`,
                                color: getCommodityColor(intercept.commodity)
                              }}
                            >
                              {intercept.commodity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {intercept.includes_higher_grade && (
                              <span className="text-yellow-400 text-sm">
                                ✓ {intercept.higher_grade_interval}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* JORC Resource Parser Tab */}
        {activeTab === 'jorc' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Gem className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">JORC Resource Parser</h2>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs ml-2">ML Tool</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Paste JORC resource estimates from announcements to extract tonnage, grade, and contained metal.
              </p>
              
              <textarea
                value={jorcText}
                onChange={(e) => setJorcText(e.target.value)}
                placeholder="Paste JORC resource text here...

Examples:
- Indicated Resource of 23.5 Mt at 2.1 g/t Au for 1.6 Moz gold
- 45 Mt @ 1.2% Cu for 540kt contained copper (Measured + Indicated)
- Inferred: 12.3 Mt at 0.8 g/t gold"
                className="w-full h-40 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm"
              />
              
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => parseResourceText(jorcText)}
                  disabled={!jorcText || resourceParserLoading}
                  className="px-6 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {resourceParserLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Parse Resources
                </button>
                <button
                  onClick={() => setJorcText('Measured Resource of 5.2 Mt at 3.5 g/t Au for 0.59 Moz. Indicated Resource of 23.5 Mt at 2.1 g/t Au for 1.6 Moz gold. Inferred Resource of 15 Mt at 1.2 g/t for 0.58 Moz')}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Load Example
                </button>
              </div>
            </div>

            {resourceParserError && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5" />
                {resourceParserError}
              </div>
            )}

            {parsedResources.length > 0 && (
              <>
                {/* ML Features Card */}
                {mlFeatures && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <h3 className="text-white font-medium">ML Features Extracted</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-slate-400">Total Tonnage</div>
                        <div className="text-xl font-bold text-white">{mlFeatures.total_tonnage_mt.toFixed(1)} Mt</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Avg Grade</div>
                        <div className="text-xl font-bold text-white">{mlFeatures.average_grade.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Contained Metal</div>
                        <div className="text-xl font-bold text-emerald-400">{mlFeatures.total_contained_moz.toFixed(2)} Moz</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Quality Score</div>
                        <div className="text-xl font-bold text-purple-400">{(mlFeatures.resource_quality_score * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="text-sm text-slate-400 mb-2">Category Distribution</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${mlFeatures.measured_percent}%` }}
                            title={`Measured: ${mlFeatures.measured_percent}%`}
                          />
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${mlFeatures.indicated_percent}%` }}
                            title={`Indicated: ${mlFeatures.indicated_percent}%`}
                          />
                          <div 
                            className="h-full bg-amber-500" 
                            style={{ width: `${mlFeatures.inferred_percent}%` }}
                            title={`Inferred: ${mlFeatures.inferred_percent}%`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded bg-emerald-500" />
                          Measured {mlFeatures.measured_percent.toFixed(0)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded bg-blue-500" />
                          Indicated {mlFeatures.indicated_percent.toFixed(0)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded bg-amber-500" />
                          Inferred {mlFeatures.inferred_percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resources Table */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-white font-medium">
                      Parsed Resources ({parsedResources.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/30">
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Category</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Tonnage</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Grade</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Commodity</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Contained</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedResources.map((resource, index) => (
                          <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                resource.category.includes('Measured') ? 'bg-emerald-500/20 text-emerald-400' :
                                resource.category.includes('Indicated') ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {resource.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white font-medium">{resource.tonnage_mt.toFixed(1)} Mt</td>
                            <td className="px-4 py-3 text-emerald-400 font-medium">
                              {resource.grade.toFixed(2)} {resource.grade_unit}
                            </td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-0.5 rounded text-xs"
                                style={{ 
                                  backgroundColor: `${getCommodityColor(resource.commodity)}20`,
                                  color: getCommodityColor(resource.commodity)
                                }}
                              >
                                {resource.commodity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-purple-400 font-medium">
                              {resource.contained_metal.toFixed(2)} {resource.metal_unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
