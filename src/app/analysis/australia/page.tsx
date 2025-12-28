'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, ChevronDown, MapPin, Layers, ZoomIn, ZoomOut,
  ArrowUpRight, ArrowDownRight, Building2, X, Maximize2, Drill,
  Mountain, Droplets, Waves, Shield, TreePine, Users, Landmark,
  AlertTriangle, Loader2, RefreshCw, Database, Gem, Hammer, Info
} from 'lucide-react';
import { useGeoscienceData } from '@/hooks/useGeoscienceData';
import { 
  MapFeature, 
  OperatingMine, 
  CriticalMineral, 
  MineralDeposit, 
  getCommodityColor,
  getStatusColor,
  DEFAULT_MAP_LAYERS 
} from '@/types/geoscience';

// Layer configuration for GA data
const gaDataLayers = {
  operating_mines: { 
    name: 'Operating Mines', 
    color: '#22c55e', 
    icon: Hammer, 
    description: 'Active mining operations' 
  },
  critical_minerals: { 
    name: 'Critical Minerals', 
    color: '#06b6d4', 
    icon: Gem, 
    description: 'Strategic mineral deposits' 
  },
  deposits: { 
    name: 'Mineral Deposits', 
    color: '#f59e0b', 
    icon: Mountain, 
    description: 'OZMIN database deposits' 
  },
};

// Australian state boundaries for visualization
const australianStates = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT'];

// Australia-focused SVG Map with markers
function AustraliaMap({ 
  operatingMines,
  criticalMinerals, 
  deposits,
  visibleLayers,
  onFeatureClick,
  selectedFeature,
  isLoading,
}: { 
  operatingMines: OperatingMine[];
  criticalMinerals: CriticalMineral[];
  deposits: MineralDeposit[];
  visibleLayers: { operating_mines: boolean; critical_minerals: boolean; deposits: boolean };
  onFeatureClick: (feature: MapFeature) => void;
  selectedFeature: MapFeature | null;
  isLoading: boolean;
}) {
  const [hoveredFeature, setHoveredFeature] = useState<MapFeature | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Convert lat/lng to SVG coordinates (Australia-focused Mercator-like projection)
  const toSvgCoords = useCallback((lat: number, lng: number) => {
    // Australia bounds: lat -10 to -45, lng 110 to 155
    const minLat = -45, maxLat = -10;
    const minLng = 110, maxLng = 155;
    
    // Normalize to 0-1 range
    const x = ((lng - minLng) / (maxLng - minLng)) * 900 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 25;
    
    return { x, y };
  }, []);

  // Filter features by visible layers and bounds
  const visibleMines = visibleLayers.operating_mines ? operatingMines : [];
  const visibleCritical = visibleLayers.critical_minerals ? criticalMinerals : [];
  const visibleDeposits = visibleLayers.deposits ? deposits.slice(0, 500) : []; // Limit deposits for performance

  const totalVisibleFeatures = visibleMines.length + visibleCritical.length + visibleDeposits.length;

  return (
    <div className="relative bg-metallic-900 rounded-xl border border-metallic-800 overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-metallic-900/80 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <span className="text-metallic-300 text-sm">Loading Geoscience Australia data...</span>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.25, 4))}
          className="p-2 bg-metallic-800 rounded-lg hover:bg-metallic-700 text-metallic-300"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.25, 1))}
          className="p-2 bg-metallic-800 rounded-lg hover:bg-metallic-700 text-metallic-300"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
          className="p-2 bg-metallic-800 rounded-lg hover:bg-metallic-700 text-metallic-300"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Map SVG */}
      <div className="overflow-auto" style={{ maxHeight: '650px' }}>
        <svg 
          viewBox="0 0 1000 550" 
          className="w-full transition-transform duration-300"
          style={{ 
            minWidth: `${1000 * zoom}px`,
            minHeight: `${550 * zoom}px`,
          }}
        >
          {/* Background - ocean */}
          <rect fill="#0f172a" width="1000" height="550" />
          
          {/* Australia outline (simplified) */}
          <g stroke="#374151" strokeWidth="1" fill="#1e293b">
            {/* Main continent */}
            <path d="
              M 150,150 
              L 300,80 L 500,70 L 700,100 L 850,150 L 900,250 
              L 880,350 L 800,450 L 650,500 L 400,480 
              L 200,420 L 100,300 L 120,200 Z
            " />
            {/* Tasmania */}
            <path d="M 680,480 L 720,470 L 750,500 L 710,520 L 680,510 Z" />
          </g>

          {/* Grid lines */}
          <g stroke="#1e293b" strokeWidth="0.5" opacity="0.3">
            {[...Array(11)].map((_, i) => (
              <line key={`h${i}`} x1="50" y1={i * 50 + 25} x2="950" y2={i * 50 + 25} />
            ))}
            {[...Array(19)].map((_, i) => (
              <line key={`v${i}`} x1={i * 50 + 50} y1="25" x2={i * 50 + 50} y2="525" />
            ))}
          </g>

          {/* State labels */}
          <g fill="#475569" fontSize="14" fontWeight="bold" opacity="0.5">
            <text x="200" y="280">WA</text>
            <text x="450" y="180">NT</text>
            <text x="400" y="350">SA</text>
            <text x="550" y="150">QLD</text>
            <text x="620" y="340">NSW</text>
            <text x="670" y="400">VIC</text>
            <text x="700" y="490">TAS</text>
          </g>

          {/* Mineral Deposits (render first, underneath) */}
          {visibleDeposits.map((deposit) => {
            const { x, y } = toSvgCoords(deposit.lat, deposit.lng);
            const color = getCommodityColor(deposit.commodity);
            const isHovered = hoveredFeature?.id === deposit.id;
            const isSelected = selectedFeature?.id === deposit.id;

            return (
              <g key={deposit.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? 5 : 3}
                  fill={color}
                  opacity={0.6}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth={isSelected ? 2 : 0}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredFeature(deposit)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => onFeatureClick(deposit)}
                />
              </g>
            );
          })}

          {/* Critical Minerals (render second) */}
          {visibleCritical.map((mineral) => {
            const { x, y } = toSvgCoords(mineral.lat, mineral.lng);
            const color = gaDataLayers.critical_minerals.color;
            const isHovered = hoveredFeature?.id === mineral.id;
            const isSelected = selectedFeature?.id === mineral.id;

            return (
              <g key={mineral.id}>
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={color}
                    opacity={0.2}
                  />
                )}
                {/* Diamond shape for critical minerals */}
                <polygon
                  points={`${x},${y-6} ${x+5},${y} ${x},${y+6} ${x-5},${y}`}
                  fill={color}
                  stroke={isSelected ? '#fff' : '#000'}
                  strokeWidth={isSelected ? 2 : 0.5}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredFeature(mineral)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => onFeatureClick(mineral)}
                  transform={isHovered ? `scale(1.3) translate(${x * -0.23}, ${y * -0.23})` : ''}
                />
              </g>
            );
          })}

          {/* Operating Mines (render on top) */}
          {visibleMines.map((mine) => {
            const { x, y } = toSvgCoords(mine.lat, mine.lng);
            const color = getCommodityColor(mine.commodity);
            const isHovered = hoveredFeature?.id === mine.id;
            const isSelected = selectedFeature?.id === mine.id;

            return (
              <g key={mine.id}>
                {/* Pulse animation for hovered */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r={16}
                    fill={color}
                    opacity={0.3}
                    className="animate-ping"
                  />
                )}
                {/* Main marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? 8 : 5}
                  fill={color}
                  stroke={isSelected ? '#fff' : '#000'}
                  strokeWidth={isSelected ? 2 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredFeature(mine)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => onFeatureClick(mine)}
                />
              </g>
            );
          })}

          {/* Tooltip */}
          {hoveredFeature && (() => {
            const { x, y } = toSvgCoords(hoveredFeature.lat, hoveredFeature.lng);
            const tooltipX = x > 750 ? x - 220 : x + 15;
            const tooltipY = y > 450 ? y - 90 : y;
            const commodityValue = 'commodity' in hoveredFeature ? hoveredFeature.commodity : undefined;
            const color = getCommodityColor(commodityValue);
            
            return (
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect
                  x="0"
                  y="0"
                  width="210"
                  height="85"
                  rx="8"
                  fill="#1e1e2e"
                  stroke="#3a3a5e"
                />
                <rect
                  x="0"
                  y="0"
                  width="210"
                  height="24"
                  rx="8"
                  fill={color}
                  opacity="0.3"
                />
                <text x="12" y="17" fill={color} fontSize="10" fontWeight="bold">
                  {hoveredFeature.type === 'operating_mine' ? 'OPERATING MINE' : 
                   hoveredFeature.type === 'critical_mineral' ? 'CRITICAL MINERAL' : 'DEPOSIT'}
                </text>
                <text x="12" y="40" fill="#fff" fontSize="12" fontWeight="bold">
                  {hoveredFeature.name.length > 25 
                    ? hoveredFeature.name.substring(0, 25) + '...' 
                    : hoveredFeature.name}
                </text>
                <text x="12" y="58" fill="#aaa" fontSize="10">
                  {commodityValue || 'Unknown commodity'}
                </text>
                <text x="12" y="74" fill="#888" fontSize="9">
                  {'state' in hoveredFeature && hoveredFeature.state 
                    ? `${hoveredFeature.state}, Australia` 
                    : 'Australia'}
                </text>
                <text x="175" y="74" fill="#666" fontSize="8" textAnchor="end">
                  Click for details
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-metallic-800/95 backdrop-blur-sm rounded-lg p-4 space-y-3 max-w-xs">
        <div>
          <h4 className="text-xs font-medium text-metallic-400 mb-2">Data Layers</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(gaDataLayers).map(([key, layer]) => {
              const isVisible = visibleLayers[key as keyof typeof visibleLayers];
              if (!isVisible) return null;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-xs text-metallic-300">{layer.name}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-metallic-400 mb-2">Top Commodities</h4>
          <div className="flex flex-wrap gap-2">
            {['Gold', 'Iron', 'Copper', 'Lithium', 'Coal'].map((c) => (
              <div key={c} className="flex items-center gap-1">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getCommodityColor(c) }}
                />
                <span className="text-xs text-metallic-400">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature count */}
      <div className="absolute top-4 left-4 bg-metallic-800/95 backdrop-blur-sm rounded-lg px-4 py-2">
        <span className="text-sm text-metallic-300">
          <span className="font-bold text-metallic-100">{totalVisibleFeatures.toLocaleString()}</span> features
          {isLoading && <Loader2 className="w-3 h-3 inline ml-2 animate-spin" />}
        </span>
      </div>

      {/* Data source badge */}
      <div className="absolute bottom-4 right-4 bg-metallic-800/95 backdrop-blur-sm rounded-lg px-3 py-1.5">
        <span className="text-xs text-metallic-400 flex items-center gap-1.5">
          <Database className="w-3 h-3" />
          Geoscience Australia
        </span>
      </div>
    </div>
  );
}

// Feature Detail Panel
function FeatureDetailPanel({ 
  feature, 
  onClose 
}: { 
  feature: MapFeature;
  onClose: () => void;
}) {
  const color = getCommodityColor(feature.commodity);
  const layerInfo = gaDataLayers[feature.type as keyof typeof gaDataLayers];

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: color }}
          >
            {layerInfo?.icon && <layerInfo.icon className="w-6 h-6" />}
          </div>
          <div>
            <span 
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: `${layerInfo?.color || color}30`, color: layerInfo?.color || color }}
            >
              {layerInfo?.name?.toUpperCase() || feature.type.toUpperCase()}
            </span>
            <p className="text-sm text-metallic-500 mt-1">ID: {feature.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-metallic-800 text-metallic-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <h3 className="text-lg font-medium text-metallic-100 mb-2">{feature.name}</h3>
      
      <div className="flex items-center gap-2 text-sm text-metallic-400 mb-4">
        <MapPin className="w-4 h-4" />
        {'state' in feature && feature.state ? `${feature.state}, ` : ''}Australia
        <span className="text-metallic-600">•</span>
        <span className="text-xs">{feature.lat.toFixed(4)}°, {feature.lng.toFixed(4)}°</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-metallic-800/50 rounded-lg p-3">
          <p className="text-xs text-metallic-500 mb-1">Primary Commodity</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <p className="text-sm font-medium text-metallic-100">
              {feature.commodity || 'Not specified'}
            </p>
          </div>
        </div>
        
        {'status' in feature && feature.status && (
          <div className="bg-metallic-800/50 rounded-lg p-3">
            <p className="text-xs text-metallic-500 mb-1">Status</p>
            <p 
              className="text-sm font-medium"
              style={{ color: getStatusColor(feature.status as string) }}
            >
              {feature.status}
            </p>
          </div>
        )}

        {'company' in feature && feature.company && (
          <div className="bg-metallic-800/50 rounded-lg p-3 col-span-2">
            <p className="text-xs text-metallic-500 mb-1">Company</p>
            <p className="text-sm font-medium text-metallic-100">{feature.company}</p>
          </div>
        )}

        {'deposit_type' in feature && feature.deposit_type && (
          <div className="bg-metallic-800/50 rounded-lg p-3 col-span-2">
            <p className="text-xs text-metallic-500 mb-1">Deposit Type</p>
            <p className="text-sm font-medium text-metallic-100">{feature.deposit_type}</p>
          </div>
        )}

        {'is_critical' in feature && feature.is_critical && (
          <div className="col-span-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Critical Mineral</span>
            </div>
            <p className="text-xs text-metallic-400 mt-1">
              Essential for clean energy and advanced technologies
            </p>
          </div>
        )}
      </div>

      <div className="text-xs text-metallic-500 flex items-center gap-2 mb-4">
        <Info className="w-3 h-3" />
        Source: Geoscience Australia
      </div>

      <div className="flex gap-2">
        <a 
          href={`https://portal.ga.gov.au`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium text-center"
        >
          View on GA Portal
        </a>
      </div>
    </div>
  );
}

// Stats Panel Component
function StatsPanel({ 
  operatingMines, 
  criticalMinerals, 
  deposits,
  isLoading 
}: {
  operatingMines: OperatingMine[];
  criticalMinerals: CriticalMineral[];
  deposits: MineralDeposit[];
  isLoading: boolean;
}) {
  // Calculate commodity breakdown
  const commodityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    [...operatingMines, ...criticalMinerals, ...deposits].forEach(f => {
      if (f.commodity) {
        const primary = f.commodity.split(',')[0].trim();
        counts[primary] = (counts[primary] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [operatingMines, criticalMinerals, deposits]);

  // Calculate state breakdown
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    operatingMines.forEach(m => {
      if (m.state) counts[m.state] = (counts[m.state] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [operatingMines]);

  if (isLoading) {
    return (
      <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-primary-500" />
        Data Summary
      </h3>
      
      <div className="space-y-4">
        {/* Totals */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-metallic-800/50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-green-400">{operatingMines.length}</p>
            <p className="text-xs text-metallic-500">Mines</p>
          </div>
          <div className="bg-metallic-800/50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-cyan-400">{criticalMinerals.length}</p>
            <p className="text-xs text-metallic-500">Critical</p>
          </div>
          <div className="bg-metallic-800/50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-amber-400">{deposits.length}</p>
            <p className="text-xs text-metallic-500">Deposits</p>
          </div>
        </div>

        {/* Top commodities */}
        <div>
          <h4 className="text-xs font-medium text-metallic-400 mb-2">Top Commodities</h4>
          <div className="space-y-1.5">
            {commodityCounts.slice(0, 5).map(([commodity, count]) => (
              <div key={commodity} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getCommodityColor(commodity) }}
                />
                <span className="text-xs text-metallic-300 flex-1">{commodity}</span>
                <span className="text-xs text-metallic-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* State breakdown */}
        {stateCounts.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-metallic-400 mb-2">By State (Mines)</h4>
            <div className="flex flex-wrap gap-1.5">
              {stateCounts.map(([state, count]) => (
                <span 
                  key={state}
                  className="text-xs bg-metallic-800 px-2 py-1 rounded text-metallic-300"
                >
                  {state}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AustraliaMapPage() {
  const { data, stats, isLoading, error, refresh } = useGeoscienceData();
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  
  // Layer visibility toggles
  const [visibleLayers, setVisibleLayers] = useState({
    operating_mines: true,
    critical_minerals: true,
    deposits: true,
  });

  const handleFeatureClick = useCallback((feature: MapFeature) => {
    setSelectedFeature(feature);
  }, []);

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Extract unique commodities from data
  const commodities = useMemo(() => {
    if (!data) return ['all'];
    const set = new Set<string>();
    [...data.operating_mines, ...data.critical_minerals, ...data.mineral_deposits].forEach(f => {
      if (f.commodity) {
        f.commodity.split(',').forEach(c => set.add(c.trim()));
      }
    });
    return ['all', ...Array.from(set).sort()];
  }, [data]);

  // Filter data based on selections
  const filteredMines = useMemo(() => {
    if (!data) return [];
    return data.operating_mines.filter(m => {
      const matchCommodity = commodityFilter === 'all' || m.commodity?.includes(commodityFilter);
      const matchState = stateFilter === 'all' || m.state === stateFilter;
      const matchSearch = !searchTerm || 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.company?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCommodity && matchState && matchSearch;
    });
  }, [data, commodityFilter, stateFilter, searchTerm]);

  const filteredCritical = useMemo(() => {
    if (!data) return [];
    return data.critical_minerals.filter(m => {
      const matchCommodity = commodityFilter === 'all' || m.commodity?.includes(commodityFilter);
      const matchState = stateFilter === 'all' || m.state === stateFilter;
      const matchSearch = !searchTerm || 
        m.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCommodity && matchState && matchSearch;
    });
  }, [data, commodityFilter, stateFilter, searchTerm]);

  const filteredDeposits = useMemo(() => {
    if (!data) return [];
    return data.mineral_deposits.filter(d => {
      const matchCommodity = commodityFilter === 'all' || d.commodity?.includes(commodityFilter);
      const matchState = stateFilter === 'all' || d.state === stateFilter;
      const matchSearch = !searchTerm || 
        d.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCommodity && matchState && matchSearch;
    });
  }, [data, commodityFilter, stateFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
              <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
              <span>/</span>
              <span className="text-metallic-300">Australia Mining Map</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-metallic-100 flex items-center gap-3">
                  Australian Mining Map
                  <span className="text-xs font-normal bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                    Live Data
                  </span>
                </h1>
                <p className="text-metallic-400 text-sm">
                  Real-time mining data from Geoscience Australia open databases
                </p>
              </div>
              <button
                onClick={refresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 hover:bg-metallic-700 rounded-lg text-metallic-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
              <input
                type="text"
                placeholder="Search mines, deposits, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={commodityFilter}
                  onChange={(e) => setCommodityFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {commodities.slice(0, 20).map((c) => (
                    <option key={c} value={c}>{c === 'all' ? 'All Commodities' : c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All States</option>
                  {australianStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <AustraliaMap 
              operatingMines={filteredMines}
              criticalMinerals={filteredCritical}
              deposits={filteredDeposits}
              visibleLayers={visibleLayers}
              onFeatureClick={handleFeatureClick}
              selectedFeature={selectedFeature}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedFeature ? (
              <FeatureDetailPanel 
                feature={selectedFeature} 
                onClose={() => setSelectedFeature(null)} 
              />
            ) : (
              <>
                {/* Data Layers */}
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                  <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Data Layers
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(gaDataLayers).map(([key, layer]) => {
                      const isVisible = visibleLayers[key as keyof typeof visibleLayers];
                      const Icon = layer.icon;
                      const count = key === 'operating_mines' ? filteredMines.length :
                                    key === 'critical_minerals' ? filteredCritical.length :
                                    filteredDeposits.length;
                      
                      return (
                        <button
                          key={key}
                          onClick={() => toggleLayer(key as keyof typeof visibleLayers)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                            isVisible 
                              ? 'bg-opacity-20 border' 
                              : 'bg-metallic-800/50 hover:bg-metallic-800'
                          }`}
                          style={isVisible ? { 
                            backgroundColor: `${layer.color}20`,
                            borderColor: `${layer.color}50`
                          } : {}}
                        >
                          <div 
                            className={`w-8 h-8 rounded flex items-center justify-center`}
                            style={{ backgroundColor: isVisible ? layer.color : '#374151' }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className={`text-sm font-medium ${
                              isVisible ? '' : 'text-metallic-300'
                            }`} style={isVisible ? { color: layer.color } : {}}>
                              {layer.name}
                            </span>
                            <span className="text-xs text-metallic-500 block">
                              {count.toLocaleString()} features
                            </span>
                          </div>
                          <div 
                            className={`w-2 h-2 rounded-full`}
                            style={{ backgroundColor: isVisible ? layer.color : '#4b5563' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stats Panel */}
                <StatsPanel 
                  operatingMines={filteredMines}
                  criticalMinerals={filteredCritical}
                  deposits={filteredDeposits}
                  isLoading={isLoading}
                />

                {/* Link to original global map */}
                <Link 
                  href="/analysis/map"
                  className="block bg-metallic-900 border border-metallic-800 rounded-xl p-4 hover:bg-metallic-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-metallic-100">Global Mining Map</p>
                      <p className="text-xs text-metallic-500">View worldwide projects</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {/* Quick Feature List */}
            {!selectedFeature && (
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-metallic-800">
                  <h3 className="font-semibold text-metallic-100">Operating Mines</h3>
                  <p className="text-xs text-metallic-500">Click to select on map</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredMines.slice(0, 20).map((mine) => (
                    <button
                      key={mine.id}
                      onClick={() => setSelectedFeature(mine)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-metallic-800/50 transition-colors text-left border-b border-metallic-800/50 last:border-b-0"
                    >
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: getCommodityColor(mine.commodity) }}
                      >
                        <Hammer className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-metallic-100 text-sm truncate">
                          {mine.name}
                        </div>
                        <div className="text-xs text-metallic-500 truncate">
                          {mine.commodity} • {mine.state}
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredMines.length === 0 && !isLoading && (
                    <div className="p-4 text-center text-metallic-500 text-sm">
                      No mines match your filters
                    </div>
                  )}
                  {isLoading && (
                    <div className="p-4 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
