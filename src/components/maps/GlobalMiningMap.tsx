'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Layers, Map as MapIcon, X } from 'lucide-react';

// Company interface matching the API response
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
  };
}

interface GlobalMiningMapProps {
  geoData: GeoJSONData | null;
  onSelectCompany?: (company: Company) => void;
  selectedCompany?: Company | null;
}

// Map tile providers
type TileProvider = 'cartodb-dark' | 'cartodb-light' | 'osm' | 'satellite';

const tileProviders: Record<TileProvider, { url: string; attribution: string; name: string }> = {
  'cartodb-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'Dark',
  },
  'cartodb-light': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    name: 'Light',
  },
  'osm': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: 'Street',
  },
  'satellite': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar',
    name: 'Satellite',
  },
};

// Commodity colors for markers
const commodityColors: Record<string, string> = {
  'Gold': '#fbbf24',
  'Silver': '#9ca3af',
  'Copper': '#ea580c',
  'Lithium': '#22d3ee',
  'Iron Ore': '#b91c1c',
  'Uranium': '#84cc16',
  'Platinum': '#64748b',
  'Nickel': '#059669',
  'Rare Earths': '#8b5cf6',
  'Coal': '#374151',
  'Diversified': '#6366f1',
  'Zinc': '#71717a',
  'Diamonds': '#38bdf8',
  'Cobalt': '#2563eb',
  'Manganese': '#7c3aed',
  'Chrome': '#0891b2',
  'Tin': '#78716c',
  'Lead': '#52525b',
  'Oil & Gas': '#1f2937',
  'Vanadium': '#a855f7',
  'Graphite': '#171717',
  'Aluminium': '#d1d5db',
};

// Convert lat/lng to tile coordinates
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
}

// Convert lat/lng to pixel coordinates within the map
function latLngToPixel(lat: number, lng: number, zoom: number, tileSize: number = 256) {
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n * tileSize;
  const latRad = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n * tileSize;
  return { x, y };
}

export default function GlobalMiningMap({ geoData, onSelectCompany }: GlobalMiningMapProps) {
  const [hoveredCluster, setHoveredCluster] = useState<{ features: GeoJSONFeature[], x: number, y: number } | null>(null);
  const [zoom, setZoom] = useState(2);
  const [center, setCenter] = useState({ lat: 20, lng: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, lat: 0, lng: 0 });
  const [tileProvider, setTileProvider] = useState<TileProvider>('cartodb-dark');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (fullscreenRef.current?.requestFullscreen) {
        fullscreenRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Update container size on resize
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

  const tileSize = 256;

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
        
        // Wrap X coordinate
        tileX = ((tileX % n) + n) % n;
        
        // Skip tiles outside valid Y range
        if (tileY < 0 || tileY >= n) continue;
        
        const screenX = containerSize.width / 2 + (centerTile.x + dx - centerPixel.x / tileSize) * tileSize;
        const screenY = containerSize.height / 2 + (tileY - centerPixel.y / tileSize) * tileSize;
        
        result.push({ x: tileX, y: tileY, screenX, screenY });
      }
    }
    
    return result;
  }, [center, zoom, containerSize, tileSize]);

  // Calculate marker positions
  const markers = useMemo(() => {
    if (!geoData?.features) return [];
    
    const centerPixel = latLngToPixel(center.lat, center.lng, zoom, tileSize);
    
    // Group by location for clustering
    const gridSize = Math.max(1, 4 - zoom); // Less clustering at higher zoom
    const locationMap = new Map<string, GeoJSONFeature[]>();
    
    geoData.features.forEach(feature => {
      if (feature.geometry?.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        const key = `${Math.round(lat / gridSize) * gridSize}_${Math.round(lng / gridSize) * gridSize}`;
        const existing = locationMap.get(key) || [];
        existing.push(feature);
        locationMap.set(key, existing);
      }
    });
    
    const result: Array<{
      screenX: number;
      screenY: number;
      features: GeoJSONFeature[];
      primaryCommodity: string;
    }> = [];
    
    locationMap.forEach((features) => {
      // Use average position of cluster
      let avgLat = 0, avgLng = 0;
      features.forEach(f => {
        const [lng, lat] = f.geometry.coordinates;
        avgLat += lat;
        avgLng += lng;
      });
      avgLat /= features.length;
      avgLng /= features.length;
      
      const pixel = latLngToPixel(avgLat, avgLng, zoom, tileSize);
      const screenX = containerSize.width / 2 + (pixel.x - centerPixel.x);
      const screenY = containerSize.height / 2 + (pixel.y - centerPixel.y);
      
      // Find primary commodity
      const commodityCounts = new Map<string, number>();
      features.forEach(f => {
        const c = f.properties.primary_commodity;
        commodityCounts.set(c, (commodityCounts.get(c) || 0) + 1);
      });
      let maxCount = 0;
      let primaryCommodity = 'Diversified';
      commodityCounts.forEach((count, commodity) => {
        if (count > maxCount) {
          maxCount = count;
          primaryCommodity = commodity;
        }
      });
      
      // Only include visible markers (with padding)
      if (screenX > -50 && screenX < containerSize.width + 50 &&
          screenY > -50 && screenY < containerSize.height + 50) {
        result.push({ screenX, screenY, features, primaryCommodity });
      }
    });
    
    return result;
  }, [geoData, center, zoom, containerSize, tileSize]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, lat: center.lat, lng: center.lng });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      // Convert pixel movement to lat/lng change
      const scale = 360 / (Math.pow(2, zoom) * tileSize);
      const newLng = dragStart.lng - dx * scale;
      const newLat = Math.max(-85, Math.min(85, dragStart.lat + dy * scale));
      
      setCenter({ lat: newLat, lng: newLng });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    setZoom(z => Math.max(1, Math.min(10, z + delta)));
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 1, 10));
  const handleZoomOut = () => setZoom(z => Math.max(z - 1, 1));
  const handleReset = () => { setZoom(2); setCenter({ lat: 20, lng: 0 }); };

  // Get tile URL
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

  return (
    <div ref={fullscreenRef} className={`relative w-full h-full bg-metallic-950 rounded-lg overflow-hidden border border-metallic-800 ${isFullscreen ? 'min-h-screen' : 'min-h-[600px]'}`}>
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
              imageRendering: 'auto',
            }}
            draggable={false}
          />
        ))}
        
        {/* Markers Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {markers.map((marker, i) => {
            const count = marker.features.length;
            const color = commodityColors[marker.primaryCommodity] || '#6366f1';
            const size = count > 20 ? 28 : count > 10 ? 22 : count > 5 ? 18 : 14;
            
            return (
              <div
                key={i}
                className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                style={{
                  left: marker.screenX,
                  top: marker.screenY,
                }}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredCluster({
                      features: marker.features,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredCluster(null)}
                onClick={() => {
                  if (marker.features.length === 1 && onSelectCompany) {
                    onSelectCompany(marker.features[0].properties);
                  } else if (marker.features.length > 1) {
                    // Zoom in on cluster
                    const [lng, lat] = marker.features[0].geometry.coordinates;
                    setCenter({ lat, lng });
                    setZoom(z => Math.min(z + 2, 10));
                  }
                }}
              >
                {/* Marker glow */}
                <div
                  className="absolute rounded-full animate-pulse"
                  style={{
                    width: size + 10,
                    height: size + 10,
                    backgroundColor: color,
                    opacity: 0.3,
                    left: -5,
                    top: -5,
                  }}
                />
                {/* Main marker */}
                <div
                  className="relative rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: color,
                  }}
                >
                  {count > 1 && (
                    <span className="text-white font-bold text-xs">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-metallic-900/95 backdrop-blur-sm rounded-lg p-3 border border-metallic-700 shadow-xl">
        <h3 className="text-sm font-semibold text-metallic-100 mb-2">Commodities</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {['Gold', 'Silver', 'Copper', 'Lithium', 'Iron Ore', 'Uranium', 'Platinum', 'Nickel', 'Rare Earths', 'Coal'].map(commodity => (
            <div key={commodity} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: commodityColors[commodity] }}
              />
              <span className="text-xs text-metallic-300">{commodity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Stats */}
      <div className="absolute top-4 right-4 bg-metallic-900/95 backdrop-blur-sm rounded-lg p-3 border border-metallic-700 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-metallic-400">Map Stats</span>
        </div>
        <div className="text-2xl font-bold text-metallic-100">
          {geoData?.features?.length || 0}
        </div>
        <div className="text-xs text-metallic-400">Companies with coordinates</div>
        <div className="text-xs text-metallic-500 mt-1">Zoom: {zoom.toFixed(1)}x</div>
      </div>

      {/* Layer Selector */}
      <div className="absolute top-4 right-40">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="p-2 bg-metallic-800/90 hover:bg-metallic-700 rounded-lg border border-metallic-600 text-metallic-100 transition-colors"
          title="Change map style"
        >
          <Layers className="w-5 h-5" />
        </button>
        {showLayerMenu && (
          <div className="absolute top-12 right-0 bg-metallic-900/95 backdrop-blur-sm rounded-lg border border-metallic-700 shadow-xl overflow-hidden">
            {(Object.keys(tileProviders) as TileProvider[]).map(key => (
              <button
                key={key}
                onClick={() => { setTileProvider(key); setShowLayerMenu(false); }}
                className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                  tileProvider === key 
                    ? 'bg-blue-600 text-white' 
                    : 'text-metallic-200 hover:bg-metallic-700'
                }`}
              >
                {tileProviders[key].name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-metallic-800/90 hover:bg-metallic-700 rounded-lg border border-metallic-600 text-metallic-100 transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-metallic-800/90 hover:bg-metallic-700 rounded-lg border border-metallic-600 text-metallic-100 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-metallic-800/90 hover:bg-metallic-700 rounded-lg border border-metallic-600 text-metallic-100 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-metallic-800/90 hover:bg-metallic-700 rounded-lg border border-metallic-600 text-metallic-100 transition-colors"
          title="Reset view"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 left-2 text-[10px] text-metallic-500 bg-metallic-900/70 px-2 py-1 rounded">
        © OpenStreetMap © CARTO © Esri
      </div>

      {/* Hover Tooltip */}
      {hoveredCluster && (
        <div
          className="absolute z-50 bg-metallic-900/95 backdrop-blur-sm rounded-lg p-3 border border-metallic-700 shadow-xl max-w-xs pointer-events-none"
          style={{
            left: Math.min(hoveredCluster.x + 15, containerSize.width - 250),
            top: Math.min(hoveredCluster.y + 15, containerSize.height - 200),
          }}
        >
          <div className="text-sm font-semibold text-metallic-100 mb-2">
            {hoveredCluster.features.length} {hoveredCluster.features.length === 1 ? 'Company' : 'Companies'}
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {hoveredCluster.features.slice(0, 8).map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: commodityColors[feature.properties.primary_commodity] || '#6366f1' }}
                />
                <span className="text-xs text-metallic-200 truncate">
                  {feature.properties.symbol} - {feature.properties.name}
                </span>
              </div>
            ))}
            {hoveredCluster.features.length > 8 && (
              <div className="text-xs text-metallic-400 pt-1">
                +{hoveredCluster.features.length - 8} more...
              </div>
            )}
          </div>
          {hoveredCluster.features.length > 1 && (
            <div className="text-xs text-blue-400 mt-2">Click to zoom in</div>
          )}
        </div>
      )}
    </div>
  );
}
