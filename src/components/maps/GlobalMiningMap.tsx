'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

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
  'Iron_Ore': '#b91c1c',
  'Uranium': '#84cc16',
  'Platinum': '#64748b',
  'Nickel': '#059669',
  'Rare Earths': '#8b5cf6',
  'Rare_Earths': '#8b5cf6',
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
  'Oil_Gas': '#1f2937',
  'Vanadium': '#a855f7',
  'Graphite': '#171717',
  'Aluminium': '#d1d5db',
  'Aluminum': '#d1d5db',
  'Mineral Sands': '#fcd34d',
  'Mineral_Sands': '#fcd34d',
};

// Exchange colors for clustering
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

export default function GlobalMiningMap({ geoData, onSelectCompany, selectedCompany }: GlobalMiningMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [L, setL] = useState<any>(null);

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        // Dynamically import Leaflet
        const leaflet = await import('leaflet');
        
        // Fix default marker icons
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        setL(leaflet);
        setLeafletLoaded(true);
      }
    };
    
    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !L || !mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    // Add dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    setIsLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, L]);

  // Add markers when geoData changes
  useEffect(() => {
    if (!mapRef.current || !L || !geoData) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Group companies by location to handle overlapping
    const locationGroups: Record<string, GeoJSONFeature[]> = {};
    
    geoData.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        // Round to 2 decimal places to group nearby companies
        const key = `${lat.toFixed(1)}_${lng.toFixed(1)}`;
        if (!locationGroups[key]) {
          locationGroups[key] = [];
        }
        locationGroups[key].push(feature);
      }
    });

    // Create markers for each location group
    Object.entries(locationGroups).forEach(([key, features]) => {
      const [lat, lng] = key.split('_').map(Number);
      const count = features.length;
      
      if (count === 1) {
        // Single company - show detailed marker
        const company = features[0].properties;
        const color = commodityColors[company.primary_commodity] || commodityColors[company.primary_commodity.replace(' ', '_')] || '#6366f1';
        
        // Create custom icon
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: ${color};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
              <span style="color: white; font-size: 10px; font-weight: bold;">${company.symbol.substring(0, 2)}</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([lat, lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="min-width: 200px; font-family: system-ui, sans-serif;">
              <div style="font-weight: 600; font-size: 14px; color: #333; margin-bottom: 4px;">
                ${company.symbol} - ${company.name}
              </div>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <span style="
                  background: ${exchangeColors[company.exchange] || '#6b7280'}20;
                  color: ${exchangeColors[company.exchange] || '#6b7280'};
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 500;
                ">${company.exchange}</span>
                <span style="
                  background: ${color}20;
                  color: ${color};
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 500;
                ">${company.primary_commodity}</span>
              </div>
              <div style="font-size: 12px; color: #666;">
                <div style="margin-bottom: 2px;"><strong>Type:</strong> ${company.company_type}</div>
                <div style="margin-bottom: 2px;"><strong>Country:</strong> ${company.country}</div>
                ${company.description ? `<div style="margin-top: 4px; font-style: italic; color: #888;">${company.description.substring(0, 100)}${company.description.length > 100 ? '...' : ''}</div>` : ''}
              </div>
            </div>
          `, {
            maxWidth: 300,
          });

        marker.on('click', () => {
          if (onSelectCompany) {
            onSelectCompany(company);
          }
        });

        markersRef.current.push(marker);
      } else {
        // Multiple companies - show cluster marker
        const primaryCommodities = [...new Set(features.map(f => f.properties.primary_commodity))];
        const dominantCommodity = primaryCommodities[0];
        const color = commodityColors[dominantCommodity] || '#6366f1';
        
        // Determine cluster size based on count
        const size = count > 50 ? 48 : count > 20 ? 40 : count > 10 ? 36 : 32;
        
        const icon = L.divIcon({
          className: 'cluster-marker',
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background: linear-gradient(135deg, ${color}, ${color}dd);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              <span style="color: white; font-size: ${size > 40 ? 14 : 12}px; font-weight: bold;">${count}</span>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        // Create popup content with list of companies
        const companiesList = features.slice(0, 10).map(f => {
          const c = f.properties;
          return `<div style="padding: 4px 0; border-bottom: 1px solid #eee;">
            <strong>${c.symbol}</strong> - ${c.name.substring(0, 30)}${c.name.length > 30 ? '...' : ''}
            <span style="color: #888; font-size: 10px;"> (${c.primary_commodity})</span>
          </div>`;
        }).join('');

        const marker = L.marker([lat, lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="min-width: 250px; max-height: 300px; overflow-y: auto; font-family: system-ui, sans-serif;">
              <div style="font-weight: 600; font-size: 14px; color: #333; margin-bottom: 8px; position: sticky; top: 0; background: white; padding-bottom: 4px;">
                ${count} Companies in this area
              </div>
              ${companiesList}
              ${features.length > 10 ? `<div style="padding: 8px 0; color: #888; font-size: 11px;">+ ${features.length - 10} more companies</div>` : ''}
            </div>
          `, {
            maxWidth: 300,
            maxHeight: 350,
          });

        marker.on('click', () => {
          mapRef.current.setView([lat, lng], mapRef.current.getZoom() + 2);
        });

        markersRef.current.push(marker);
      }
    });

    // Fit bounds if we have features
    if (geoData.features.length > 0) {
      const bounds = L.latLngBounds(
        geoData.features
          .filter(f => f.geometry && f.geometry.coordinates)
          .map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]])
      );
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
      }
    }
  }, [geoData, L, onSelectCompany]);

  // Handle zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([20, 0], 2);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-metallic-950 rounded-lg overflow-hidden border border-metallic-800">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-metallic-950/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <span className="text-metallic-400">Loading map...</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 p-4 max-w-xs">
        <h4 className="text-sm font-semibold text-metallic-100 mb-3">Commodities</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(commodityColors).slice(0, 12).map(([commodity, color]) => (
            !commodity.includes('_') && (
              <div key={commodity} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border border-white/30"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-metallic-300">{commodity}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      {geoData && (
        <div className="absolute top-4 right-4 z-10 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 p-4">
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

      {/* Custom zoom controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 hover:bg-metallic-800 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="h-5 w-5 text-metallic-300" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 hover:bg-metallic-800 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="h-5 w-5 text-metallic-300" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700 hover:bg-metallic-800 transition-colors"
          title="Reset view"
        >
          <Maximize2 className="h-5 w-5 text-metallic-300" />
        </button>
      </div>
    </div>
  );
}
