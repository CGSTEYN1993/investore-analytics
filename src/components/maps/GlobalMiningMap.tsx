'use client';

import { useMemo, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

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

// Exchange colors
const exchangeColors: Record<string, string> = {
  ASX: '#3b82f6',
  JSE: '#22c55e',
  CSE: '#ef4444',
  TSX: '#a855f7',
  TSXV: '#c084fc',
  NYSE: '#eab308',
  NASDAQ: '#14b8a6',
  LSE: '#f97316',
};

export default function GlobalMiningMap({ geoData, onSelectCompany }: GlobalMiningMapProps) {
  const [hoveredCompany, setHoveredCompany] = useState<Company | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Convert lat/lng to SVG coordinates
  const toSvgCoords = (lat: number, lng: number) => {
    const mapWidth = 500;
    const mapHeight = 300;
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  // Group companies by approximate location for clustering
  const clusters = useMemo(() => {
    if (!geoData?.features) return [];
    
    const locationMap = new Map<string, GeoJSONFeature[]>();
    
    geoData.features.forEach(feature => {
      if (feature.geometry?.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        const key = `${Math.round(lat / 5) * 5}_${Math.round(lng / 10) * 10}`;
        const existing = locationMap.get(key) || [];
        existing.push(feature);
        locationMap.set(key, existing);
      }
    });
    
    const result: Array<{
      lat: number;
      lng: number;
      features: GeoJSONFeature[];
      primaryCommodity: string;
    }> = [];
    
    locationMap.forEach((features, key) => {
      const [lat, lng] = key.split('_').map(Number);
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
      
      result.push({ lat, lng, features, primaryCommodity });
    });
    
    return result;
  }, [geoData]);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-metallic-950 rounded-lg overflow-hidden border border-metallic-800">
      {/* SVG Map */}
      <svg 
        viewBox="0 0 500 300" 
        className="w-full h-full"
        style={{ 
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Background */}
        <rect width="500" height="300" fill="#0a0a0f" />
        
        {/* Grid lines */}
        {[0, 60, 120, 180, 240, 300, 360, 420, 480].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#1a1a2e" strokeWidth="0.5" />
        ))}
        {[0, 50, 100, 150, 200, 250, 300].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="500" y2={y} stroke="#1a1a2e" strokeWidth="0.5" />
        ))}
        
        {/* Simplified continent outlines */}
        {/* North America */}
        <path d="M 40,40 Q 60,35 80,40 L 100,50 Q 110,55 120,52 L 130,60 Q 125,80 135,100 L 120,120 Q 100,130 80,125 L 60,130 Q 40,120 35,100 L 40,80 Q 35,60 40,40 Z" 
              fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
        {/* South America */}
        <path d="M 100,140 Q 110,135 120,140 L 125,160 Q 130,180 125,200 L 115,220 Q 105,240 95,235 L 85,220 Q 80,200 85,180 L 90,160 Q 95,145 100,140 Z" 
              fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
        {/* Europe */}
        <path d="M 230,50 Q 250,45 270,50 L 280,60 Q 290,55 300,60 L 295,80 Q 280,85 265,80 L 250,85 Q 235,80 230,70 L 230,50 Z" 
              fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
        {/* Africa */}
        <path d="M 240,90 Q 260,85 280,90 L 295,110 Q 300,130 295,150 L 285,175 Q 270,195 255,190 L 240,175 Q 230,155 235,130 L 240,110 Q 235,95 240,90 Z" 
              fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
        {/* Asia */}
        <path d="M 300,40 Q 330,35 360,40 L 400,50 Q 430,55 450,65 L 460,85 Q 465,100 455,115 L 430,120 Q 400,125 370,115 L 340,120 Q 320,115 310,100 L 300,80 Q 295,60 300,40 Z" 
              fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
        {/* Australia */}
        <path d="M 400,170 Q 420,165 440,170 L 455,185 Q 460,200 455,215 L 440,225 Q 420,230 400,225 L 385,210 Q 380,195 385,180 L 400,170 Z" 
              fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
        
        {/* Company markers */}
        {clusters.map((cluster, i) => {
          const { x, y } = toSvgCoords(cluster.lat, cluster.lng);
          const count = cluster.features.length;
          const color = commodityColors[cluster.primaryCommodity] || '#6366f1';
          const size = count > 20 ? 8 : count > 5 ? 6 : 4;
          
          return (
            <g 
              key={i}
              transform={`translate(${x}, ${y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => {
                if (count === 1) {
                  setHoveredCompany(cluster.features[0].properties);
                }
              }}
              onMouseLeave={() => setHoveredCompany(null)}
              onClick={() => {
                if (count === 1 && onSelectCompany) {
                  onSelectCompany(cluster.features[0].properties);
                }
              }}
            >
              <circle
                r={size}
                fill={color}
                stroke="white"
                strokeWidth="0.5"
                opacity="0.9"
              />
              {count > 1 && (
                <text
                  y="1"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="5"
                  fontWeight="bold"
                >
                  {count > 99 ? '99+' : count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 p-4 max-w-xs">
        <h4 className="text-sm font-semibold text-metallic-100 mb-3">Commodities</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(commodityColors).slice(0, 10).map(([commodity, color]) => (
            <div key={commodity} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-metallic-300">{commodity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      {geoData && (
        <div className="absolute top-4 right-4 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-semibold text-metallic-100">Map Stats</span>
          </div>
          <div className="text-2xl font-bold text-primary-400">
            {geoData.features.length.toLocaleString()}
          </div>
          <div className="text-xs text-metallic-400">Companies with coordinates</div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredCompany && (
        <div className="absolute bottom-4 left-4 bg-metallic-900/95 backdrop-blur-sm rounded-lg border border-metallic-700 p-4 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ 
                backgroundColor: `${exchangeColors[hoveredCompany.exchange] || '#6b7280'}30`,
                color: exchangeColors[hoveredCompany.exchange] || '#6b7280'
              }}
            >
              {hoveredCompany.exchange}
            </span>
            <span className="font-mono font-bold text-primary-400">{hoveredCompany.symbol}</span>
          </div>
          <div className="font-medium text-metallic-100">{hoveredCompany.name}</div>
          <div className="text-sm text-metallic-400 mt-1">
            {hoveredCompany.primary_commodity} • {hoveredCompany.country}
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 hover:bg-metallic-800 transition-colors"
        >
          <ZoomIn className="h-5 w-5 text-metallic-300" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 hover:bg-metallic-800 transition-colors"
        >
          <ZoomOut className="h-5 w-5 text-metallic-300" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 hover:bg-metallic-800 transition-colors"
        >
          <Maximize2 className="h-5 w-5 text-metallic-300" />
        </button>
      </div>
    </div>
  );
}
