/**
 * Geoscience Australia Data Types
 * 
 * Types for Australian mining and geological data from
 * Geoscience Australia's open data services.
 */

// Base interfaces
export interface Coordinates {
  lat: number;
  lng: number;
}

// Operating Mine
export interface OperatingMine {
  id: string;
  name: string;
  company?: string;
  commodity?: string;
  status?: string;
  state?: string;
  lat: number;
  lng: number;
  type: 'operating_mine';
  source: string;
}

// Critical Mineral Deposit
export interface CriticalMineral {
  id: string;
  name: string;
  company?: string;
  commodity?: string;
  status?: string;
  state?: string;
  resource_size?: string;
  lat: number;
  lng: number;
  type: 'critical_mineral';
  is_critical: boolean;
}

// Mineral Deposit (OZMIN)
export interface MineralDeposit {
  id: string;
  name: string;
  commodity?: string;
  deposit_type?: string;
  state?: string;
  lat: number;
  lng: number;
  type: 'deposit';
  source: string;
}

// Geological Province
export interface GeologicalProvince {
  id: string;
  name: string;
  province_type?: string;
  age?: string;
  area_km2?: number;
  geometry?: GeoJSONGeometry;
  type: 'province';
}

// Borehole/Drillhole
export interface Borehole {
  id: string;
  name: string;
  purpose?: string;
  status?: string;
  depth_m?: number;
  driller?: string;
  lat: number;
  lng: number;
  type: 'borehole';
}

// GeoJSON types
export interface GeoJSONGeometry {
  type: 'Point' | 'Polygon' | 'MultiPolygon' | 'LineString';
  coordinates: number[] | number[][] | number[][][];
}

// Combined map feature type
export type MapFeature = 
  | OperatingMine 
  | CriticalMineral 
  | MineralDeposit 
  | Borehole;

// All data response
export interface AllAustraliaData {
  operating_mines: OperatingMine[];
  critical_minerals: CriticalMineral[];
  mineral_deposits: MineralDeposit[];
  total_features: number;
  last_updated: string;
  source: string;
}

// Statistics response
export interface DataStatistics {
  total_operating_mines: number;
  total_critical_minerals: number;
  total_mineral_deposits: number;
  total_features: number;
  commodity_breakdown: Record<string, number>;
  state_breakdown: Record<string, number>;
  last_updated: string;
  data_source: string;
}

// Commodity definition
export interface Commodity {
  code: string;
  name: string;
  category: CommodityCategory;
}

export type CommodityCategory = 
  | 'precious' 
  | 'base' 
  | 'bulk' 
  | 'critical' 
  | 'energy';

export interface CommodityCategoryInfo {
  id: CommodityCategory;
  name: string;
  color: string;
}

// Commodities list response
export interface CommoditiesResponse {
  commodities: Commodity[];
  categories: CommodityCategoryInfo[];
}

// Australian states
export type AustralianState = 
  | 'NSW' 
  | 'VIC' 
  | 'QLD' 
  | 'WA' 
  | 'SA' 
  | 'TAS' 
  | 'NT' 
  | 'ACT';

// Filter parameters
export interface MinesFilter {
  commodity?: string;
  state?: AustralianState;
  limit?: number;
}

export interface CriticalMineralsFilter {
  mineral?: string;
  status?: string;
  limit?: number;
}

export interface DepositsFilter {
  commodity?: string;
  bbox?: string;  // "minLng,minLat,maxLng,maxLat"
  limit?: number;
}

export interface BoreholesFilter {
  bbox?: string;
  purpose?: string;
  limit?: number;
}

// Map layer configuration
export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  icon: string;
  dataType: 'operating_mine' | 'critical_mineral' | 'deposit' | 'borehole' | 'province';
}

// Default map layers
export const DEFAULT_MAP_LAYERS: MapLayer[] = [
  {
    id: 'operating_mines',
    name: 'Operating Mines',
    visible: true,
    color: '#22c55e',  // green
    icon: 'pickaxe',
    dataType: 'operating_mine',
  },
  {
    id: 'critical_minerals',
    name: 'Critical Minerals',
    visible: true,
    color: '#06b6d4',  // cyan
    icon: 'gem',
    dataType: 'critical_mineral',
  },
  {
    id: 'deposits',
    name: 'Mineral Deposits',
    visible: true,
    color: '#f59e0b',  // amber
    icon: 'mountain',
    dataType: 'deposit',
  },
  {
    id: 'boreholes',
    name: 'Boreholes',
    visible: false,
    color: '#8b5cf6',  // purple
    icon: 'drill',
    dataType: 'borehole',
  },
];

// Commodity colors for map markers
export const COMMODITY_COLORS: Record<string, string> = {
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Copper': '#B87333',
  'Iron': '#8B4513',
  'Iron Ore': '#8B4513',
  'Lithium': '#00CED1',
  'Nickel': '#708090',
  'Zinc': '#A9A9A9',
  'Lead': '#4A4A4A',
  'Uranium': '#32CD32',
  'Coal': '#2F4F4F',
  'Rare earth': '#FF69B4',
  'Rare Earths': '#FF69B4',
  'Cobalt': '#4169E1',
  'Manganese': '#8B008B',
  'Graphite': '#1C1C1C',
  'Vanadium': '#7B68EE',
  'default': '#94a3b8',
};

// Get color for a commodity
export function getCommodityColor(commodity?: string): string {
  if (!commodity) return COMMODITY_COLORS.default;
  
  // Check for exact match first
  if (COMMODITY_COLORS[commodity]) {
    return COMMODITY_COLORS[commodity];
  }
  
  // Check if commodity string contains any known commodity
  for (const [key, color] of Object.entries(COMMODITY_COLORS)) {
    if (commodity.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  
  return COMMODITY_COLORS.default;
}

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  'Operating': '#22c55e',
  'Developing': '#3b82f6',
  'Care & Maintenance': '#f59e0b',
  'Exploration': '#8b5cf6',
  'Closed': '#ef4444',
  'default': '#94a3b8',
};

// Get color for status
export function getStatusColor(status?: string): string {
  if (!status) return STATUS_COLORS.default;
  return STATUS_COLORS[status] || STATUS_COLORS.default;
}
