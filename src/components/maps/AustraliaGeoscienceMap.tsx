'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Layers, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2,
  Database, Mountain, Gem, Target, MapPin, Circle,
  ChevronDown, Eye, EyeOff, Info, X
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface GeoscienceMapFeature {
  id: string;
  name: string;
  type: 'operating_mine' | 'developing_mine' | 'deposit' | 'province' | 'borehole' | 'geochemistry' | 'critical_mineral';
  lat: number;
  lng: number;
  commodity?: string;
  status?: string;
  state?: string;
  owner?: string;
  resource?: string;
  description?: string;
  // Province-specific
  age?: string;
  rockType?: string;
  area_km2?: number;
  // Borehole-specific
  depth_m?: number;
  drillType?: string;
  // Geochemistry-specific
  element?: string;
  concentration?: number;
  unit?: string;
}

export interface GeoscienceMapLayer {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
  count: number;
}

export interface AustraliaGeoscienceMapProps {
  operatingMines?: GeoscienceMapFeature[];
  developingMines?: GeoscienceMapFeature[];
  criticalMinerals?: GeoscienceMapFeature[];
  deposits?: GeoscienceMapFeature[];
  provinces?: GeoscienceMapFeature[];
  boreholes?: GeoscienceMapFeature[];
  geochemistry?: GeoscienceMapFeature[];
  onSelectFeature?: (feature: GeoscienceMapFeature) => void;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

type TileProvider = 'cartodb-dark' | 'cartodb-light' | 'osm' | 'satellite' | 'terrain';

const tileProviders: Record<TileProvider, { url: string; attribution: string; name: string }> = {
  'cartodb-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    name: 'Dark',
  },
  'cartodb-light': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    name: 'Light',
  },
  'osm': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
    name: 'Street',
  },
  'satellite': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, DigitalGlobe',
    name: 'Satellite',
  },
  'terrain': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    name: 'Terrain',
  },
};

// Commodity colors
const commodityColors: Record<string, string> = {
  'Gold': '#fbbf24',
  'gold': '#fbbf24',
  'Silver': '#9ca3af',
  'Copper': '#ea580c',
  'copper': '#ea580c',
  'Lithium': '#22d3ee',
  'lithium': '#22d3ee',
  'Iron': '#b91c1c',
  'Iron Ore': '#b91c1c',
  'iron ore': '#b91c1c',
  'Uranium': '#84cc16',
  'uranium': '#84cc16',
  'Nickel': '#059669',
  'nickel': '#059669',
  'Rare Earths': '#8b5cf6',
  'REE': '#8b5cf6',
  'Coal': '#374151',
  'coal': '#374151',
  'Zinc': '#71717a',
  'zinc': '#71717a',
  'Cobalt': '#2563eb',
  'cobalt': '#2563eb',
  'Manganese': '#7c3aed',
  'Graphite': '#171717',
  'default': '#6366f1',
};

// Feature type colors
const featureTypeColors: Record<string, string> = {
  'operating_mine': '#22c55e',    // Green
  'developing_mine': '#3b82f6',   // Blue
  'critical_mineral': '#06b6d4',  // Cyan
  'deposit': '#f59e0b',           // Amber
  'province': '#8b5cf6',          // Purple (outline)
  'borehole': '#ec4899',          // Pink
  'geochemistry': '#14b8a6',      // Teal
};

// Australia bounds
const AUSTRALIA_BOUNDS = {
  center: { lat: -25.2744, lng: 133.7751 },
  zoom: 4,
  minLat: -44,
  maxLat: -10,
  minLng: 112,
  maxLng: 154,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function latLngToPixel(lat: number, lng: number, zoom: number, tileSize: number = 256) {
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n * tileSize;
  const latRad = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n * tileSize;
  return { x, y };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AustraliaGeoscienceMap({
  operatingMines = [],
  developingMines = [],
  criticalMinerals = [],
  deposits = [],
  provinces = [],
  boreholes = [],
  geochemistry = [],
  onSelectFeature,
  className = '',
}: AustraliaGeoscienceMapProps) {
  // State
  const [zoom, setZoom] = useState(AUSTRALIA_BOUNDS.zoom);
  const [center, setCenter] = useState(AUSTRALIA_BOUNDS.center);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, lat: 0, lng: 0 });
  const [tileProvider, setTileProvider] = useState<TileProvider>('cartodb-dark');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showBaseMapMenu, setShowBaseMapMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<GeoscienceMapFeature | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<GeoscienceMapFeature | null>(null);
  
  // Layer visibility
  const [layers, setLayers] = useState({
    operatingMines: true,
    developingMines: true,
    criticalMinerals: true,
    deposits: false, // Many items - off by default
    provinces: false, // Background context
    boreholes: false, // Can be many
    geochemistry: false, // Can be many
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  const tileSize = 256;

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      fullscreenRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  // Calculate visible tiles
  const tiles = useMemo(() => {
    const centerPixel = latLngToPixel(center.lat, center.lng, zoom, tileSize);
    const tilesX = Math.ceil(containerSize.width / tileSize) + 2;
    const tilesY = Math.ceil(containerSize.height / tileSize) + 2;
    
    const centerTile = {
      x: Math.floor(centerPixel.x / tileSize),
      y: Math.floor(centerPixel.y / tileSize),
    };
    
    const result: Array<{ x: number; y: number; screenX: number; screenY: number }> = [];
    const n = Math.pow(2, zoom);
    
    for (let dx = -Math.floor(tilesX / 2); dx <= Math.ceil(tilesX / 2); dx++) {
      for (let dy = -Math.floor(tilesY / 2); dy <= Math.ceil(tilesY / 2); dy++) {
        let tileX = centerTile.x + dx;
        const tileY = centerTile.y + dy;
        
        tileX = ((tileX % n) + n) % n;
        if (tileY < 0 || tileY >= n) continue;
        
        const screenX = containerSize.width / 2 + (centerTile.x + dx - centerPixel.x / tileSize) * tileSize;
        const screenY = containerSize.height / 2 + (tileY - centerPixel.y / tileSize) * tileSize;
        
        result.push({ x: tileX, y: tileY, screenX, screenY });
      }
    }
    
    return result;
  }, [center, zoom, containerSize, tileSize]);

  // Calculate marker positions for all enabled layers
  const markers = useMemo(() => {
    const centerPixel = latLngToPixel(center.lat, center.lng, zoom, tileSize);
    const result: Array<{
      screenX: number;
      screenY: number;
      feature: GeoscienceMapFeature;
    }> = [];
    
    const addMarkers = (features: GeoscienceMapFeature[], layerEnabled: boolean) => {
      if (!layerEnabled) return;
      
      features.forEach(feature => {
        if (feature.lat && feature.lng) {
          const pixel = latLngToPixel(feature.lat, feature.lng, zoom, tileSize);
          const screenX = containerSize.width / 2 + (pixel.x - centerPixel.x);
          const screenY = containerSize.height / 2 + (pixel.y - centerPixel.y);
          
          // Only include visible markers
          if (screenX > -50 && screenX < containerSize.width + 50 &&
              screenY > -50 && screenY < containerSize.height + 50) {
            result.push({ screenX, screenY, feature });
          }
        }
      });
    };
    
    // Add in order (bottom to top)
    addMarkers(geochemistry, layers.geochemistry);
    addMarkers(boreholes, layers.boreholes);
    addMarkers(deposits, layers.deposits);
    addMarkers(developingMines, layers.developingMines);
    addMarkers(criticalMinerals, layers.criticalMinerals);
    addMarkers(operatingMines, layers.operatingMines);
    
    return result;
  }, [operatingMines, developingMines, criticalMinerals, deposits, boreholes, geochemistry, layers, center, zoom, containerSize, tileSize]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, lat: center.lat, lng: center.lng });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      const scale = 360 / (Math.pow(2, zoom) * tileSize);
      const newLng = dragStart.lng - dx * scale;
      const newLat = Math.max(-85, Math.min(85, dragStart.lat + dy * scale));
      
      setCenter({ lat: newLat, lng: newLng });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    setZoom(z => Math.max(3, Math.min(12, z + delta)));
  };

  const handleReset = () => {
    setZoom(AUSTRALIA_BOUNDS.zoom);
    setCenter(AUSTRALIA_BOUNDS.center);
  };

  const getTileUrl = (x: number, y: number, z: number) => {
    const provider = tileProviders[tileProvider];
    const subdomains = ['a', 'b', 'c'];
    const s = subdomains[Math.abs(x + y) % subdomains.length];
    return provider.url
      .replace('{s}', s)
      .replace('{z}', String(z))
      .replace('{x}', String(x))
      .replace('{y}', String(y))
      .replace('{r}', '');
  };

  const getMarkerStyle = (feature: GeoscienceMapFeature) => {
    const color = featureTypeColors[feature.type] || commodityColors[feature.commodity || ''] || commodityColors.default;
    
    switch (feature.type) {
      case 'operating_mine':
        return { shape: 'diamond', size: 16, color };
      case 'developing_mine':
        return { shape: 'diamond', size: 14, color };
      case 'critical_mineral':
        return { shape: 'hexagon', size: 14, color };
      case 'deposit':
        return { shape: 'circle', size: 10, color };
      case 'borehole':
        return { shape: 'triangle', size: 8, color };
      case 'geochemistry':
        return { shape: 'dot', size: 6, color };
      default:
        return { shape: 'circle', size: 10, color };
    }
  };

  const renderMarker = (marker: { screenX: number; screenY: number; feature: GeoscienceMapFeature }, index: number) => {
    const style = getMarkerStyle(marker.feature);
    const isHovered = hoveredFeature?.id === marker.feature.id;
    const isSelected = selectedFeature?.id === marker.feature.id;
    
    return (
      <div
        key={`${marker.feature.type}-${marker.feature.id}-${index}`}
        className={`absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform ${isHovered || isSelected ? 'scale-150 z-50' : 'hover:scale-125'}`}
        style={{ left: marker.screenX, top: marker.screenY }}
        onMouseEnter={() => setHoveredFeature(marker.feature)}
        onMouseLeave={() => setHoveredFeature(null)}
        onClick={() => {
          setSelectedFeature(marker.feature);
          onSelectFeature?.(marker.feature);
        }}
      >
        {/* Glow effect */}
        {(isHovered || isSelected) && (
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              width: style.size + 12,
              height: style.size + 12,
              backgroundColor: style.color,
              opacity: 0.4,
              left: -(style.size + 12) / 2 + style.size / 2,
              top: -(style.size + 12) / 2 + style.size / 2,
            }}
          />
        )}
        
        {/* Marker shape */}
        {style.shape === 'diamond' && (
          <div
            className="border-2 border-white shadow-lg rotate-45"
            style={{ width: style.size, height: style.size, backgroundColor: style.color }}
          />
        )}
        {style.shape === 'hexagon' && (
          <div
            className="border border-white shadow-lg"
            style={{
              width: style.size,
              height: style.size,
              backgroundColor: style.color,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
          />
        )}
        {style.shape === 'circle' && (
          <div
            className="rounded-full border border-white shadow-lg"
            style={{ width: style.size, height: style.size, backgroundColor: style.color }}
          />
        )}
        {style.shape === 'triangle' && (
          <div
            className="border border-white shadow-lg"
            style={{
              width: 0,
              height: 0,
              borderLeft: `${style.size / 2}px solid transparent`,
              borderRight: `${style.size / 2}px solid transparent`,
              borderBottom: `${style.size}px solid ${style.color}`,
            }}
          />
        )}
        {style.shape === 'dot' && (
          <div
            className="rounded-full opacity-80"
            style={{ width: style.size, height: style.size, backgroundColor: style.color }}
          />
        )}
      </div>
    );
  };

  // Layer counts
  const layerCounts = {
    operatingMines: operatingMines.length,
    developingMines: developingMines.length,
    criticalMinerals: criticalMinerals.length,
    deposits: deposits.length,
    provinces: provinces.length,
    boreholes: boreholes.length,
    geochemistry: geochemistry.length,
  };

  return (
    <div ref={fullscreenRef} className={`relative w-full h-full bg-metallic-950 rounded-lg overflow-hidden border border-metallic-800 ${isFullscreen ? 'min-h-screen' : ''} ${className}`}>
      {/* Map Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ minHeight: '600px' }}
      >
        {/* Tile Layer */}
        {tiles.map((tile, i) => (
          <img
            key={`${tile.x}-${tile.y}-${zoom}-${i}`}
            src={getTileUrl(tile.x, tile.y, zoom)}
            alt=""
            className="absolute pointer-events-none select-none"
            style={{
              width: tileSize,
              height: tileSize,
              left: tile.screenX,
              top: tile.screenY,
            }}
            draggable={false}
          />
        ))}

        {/* Markers Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {markers.map((marker, i) => renderMarker(marker, i))}
        </div>
      </div>

      {/* Layer Control Panel */}
      <div className="absolute top-4 left-4 bg-metallic-900/95 backdrop-blur-sm rounded-lg border border-metallic-700 shadow-xl max-w-xs">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="w-full flex items-center justify-between px-4 py-3 text-metallic-100 hover:bg-metallic-800/50 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="font-medium">Data Layers</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showLayerMenu ? 'rotate-180' : ''}`} />
        </button>
        
        {showLayerMenu && (
          <div className="px-4 pb-4 space-y-2">
            {/* Operating Mines */}
            <button
              onClick={() => setLayers(l => ({ ...l, operatingMines: !l.operatingMines }))}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                layers.operatingMines ? 'text-green-400 bg-green-500/10' : 'text-metallic-500 hover:bg-metallic-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rotate-45 border border-white" />
                <span>Operating Mines</span>
              </span>
              <span className="text-xs text-metallic-500">{layerCounts.operatingMines}</span>
            </button>
            
            {/* Developing Mines */}
            <button
              onClick={() => setLayers(l => ({ ...l, developingMines: !l.developingMines }))}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                layers.developingMines ? 'text-blue-400 bg-blue-500/10' : 'text-metallic-500 hover:bg-metallic-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rotate-45 border border-white" />
                <span>Developing Mines</span>
              </span>
              <span className="text-xs text-metallic-500">{layerCounts.developingMines}</span>
            </button>
            
            {/* Critical Minerals */}
            <button
              onClick={() => setLayers(l => ({ ...l, criticalMinerals: !l.criticalMinerals }))}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                layers.criticalMinerals ? 'text-cyan-400 bg-cyan-500/10' : 'text-metallic-500 hover:bg-metallic-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-400" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                <span>Critical Minerals</span>
              </span>
              <span className="text-xs text-metallic-500">{layerCounts.criticalMinerals}</span>
            </button>
            
            {/* Deposits */}
            <button
              onClick={() => setLayers(l => ({ ...l, deposits: !l.deposits }))}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                layers.deposits ? 'text-amber-400 bg-amber-500/10' : 'text-metallic-500 hover:bg-metallic-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full border border-white" />
                <span>Mineral Deposits</span>
              </span>
              <span className="text-xs text-metallic-500">{layerCounts.deposits}</span>
            </button>
            
            {/* Boreholes */}
            <button
              onClick={() => setLayers(l => ({ ...l, boreholes: !l.boreholes }))}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                layers.boreholes ? 'text-pink-400 bg-pink-500/10' : 'text-metallic-500 hover:bg-metallic-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '10px solid #ec4899',
                  }}
                />
                <span>Boreholes</span>
              </span>
              <span className="text-xs text-metallic-500">{layerCounts.boreholes}</span>
            </button>
            
            {/* Geochemistry */}
            <button
              onClick={() => setLayers(l => ({ ...l, geochemistry: !l.geochemistry }))}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                layers.geochemistry ? 'text-teal-400 bg-teal-500/10' : 'text-metallic-500 hover:bg-metallic-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full opacity-80" />
                <span>Geochemistry Samples</span>
              </span>
              <span className="text-xs text-metallic-500">{layerCounts.geochemistry}</span>
            </button>
          </div>
        )}
      </div>

      {/* Base Map Selector */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setShowBaseMapMenu(!showBaseMapMenu)}
            className="bg-metallic-900/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-metallic-700 text-metallic-100 text-sm flex items-center gap-2 hover:bg-metallic-800"
          >
            <MapPin className="w-4 h-4" />
            {tileProviders[tileProvider].name}
            <ChevronDown className={`w-3 h-3 transition-transform ${showBaseMapMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showBaseMapMenu && (
            <div className="absolute right-0 mt-2 bg-metallic-900/95 backdrop-blur-sm rounded-lg border border-metallic-700 shadow-xl overflow-hidden z-50">
              {Object.entries(tileProviders).map(([key, provider]) => (
                <button
                  key={key}
                  onClick={() => {
                    setTileProvider(key as TileProvider);
                    setShowBaseMapMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-metallic-800 ${
                    tileProvider === key ? 'text-accent-400 bg-metallic-800' : 'text-metallic-300'
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z + 1, 12))}
          className="bg-metallic-900/95 backdrop-blur-sm p-2 rounded-lg border border-metallic-700 text-metallic-100 hover:bg-metallic-800"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 1, 3))}
          className="bg-metallic-900/95 backdrop-blur-sm p-2 rounded-lg border border-metallic-700 text-metallic-100 hover:bg-metallic-800"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="bg-metallic-900/95 backdrop-blur-sm p-2 rounded-lg border border-metallic-700 text-metallic-100 hover:bg-metallic-800"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="bg-metallic-900/95 backdrop-blur-sm p-2 rounded-lg border border-metallic-700 text-metallic-100 hover:bg-metallic-800"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Feature Info Panel */}
      {selectedFeature && (
        <div className="absolute bottom-4 left-4 bg-metallic-900/95 backdrop-blur-sm rounded-lg border border-metallic-700 shadow-xl p-4 max-w-sm">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-metallic-100">{selectedFeature.name}</h3>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-metallic-400 hover:text-metallic-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-metallic-400">Type:</span>
              <span className="text-metallic-100 capitalize">{selectedFeature.type.replace('_', ' ')}</span>
            </div>
            {selectedFeature.commodity && (
              <div className="flex justify-between">
                <span className="text-metallic-400">Commodity:</span>
                <span className="text-metallic-100">{selectedFeature.commodity}</span>
              </div>
            )}
            {selectedFeature.state && (
              <div className="flex justify-between">
                <span className="text-metallic-400">State:</span>
                <span className="text-metallic-100">{selectedFeature.state}</span>
              </div>
            )}
            {selectedFeature.owner && (
              <div className="flex justify-between">
                <span className="text-metallic-400">Owner:</span>
                <span className="text-metallic-100">{selectedFeature.owner}</span>
              </div>
            )}
            {selectedFeature.status && (
              <div className="flex justify-between">
                <span className="text-metallic-400">Status:</span>
                <span className="text-metallic-100">{selectedFeature.status}</span>
              </div>
            )}
            {selectedFeature.depth_m && (
              <div className="flex justify-between">
                <span className="text-metallic-400">Depth:</span>
                <span className="text-metallic-100">{selectedFeature.depth_m}m</span>
              </div>
            )}
            {selectedFeature.description && (
              <p className="text-metallic-300 text-xs mt-2 border-t border-metallic-700 pt-2">
                {selectedFeature.description}
              </p>
            )}
            <div className="flex justify-between text-xs text-metallic-500 pt-2 border-t border-metallic-700">
              <span>Lat: {selectedFeature.lat.toFixed(4)}</span>
              <span>Lng: {selectedFeature.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredFeature && !selectedFeature && (
        <div
          className="absolute pointer-events-none bg-metallic-900/95 backdrop-blur-sm rounded px-2 py-1 text-xs text-metallic-100 border border-metallic-700 shadow-lg z-50"
          style={{
            left: '50%',
            bottom: 70,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="font-medium">{hoveredFeature.name}</span>
          {hoveredFeature.commodity && <span className="text-metallic-400"> • {hoveredFeature.commodity}</span>}
        </div>
      )}

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-metallic-900/95 backdrop-blur-sm border-t border-metallic-700 px-4 py-2 flex items-center justify-between text-xs text-metallic-400">
        <div className="flex items-center gap-4">
          <span>Zoom: {zoom.toFixed(1)}</span>
          <span>Center: {center.lat.toFixed(2)}, {center.lng.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Visible: {markers.length} features</span>
          <span className="text-metallic-500">Source: Geoscience Australia</span>
        </div>
      </div>
    </div>
  );
}
