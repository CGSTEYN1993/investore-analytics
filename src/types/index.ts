/**
 * InvestOre Analytics - TypeScript Types
 */

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'admin' | 'analyst' | 'viewer';
  subscription_tier: 'free' | 'analyst' | 'enterprise';
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

// ============================================================================
// Peer Sets
// ============================================================================

export interface PeerSetFilters {
  exchanges?: string[];
  commodities?: string[];
  jurisdictions?: string[];
  stages?: string[];
  market_cap_min?: number;
  market_cap_max?: number;
  resource_min_oz_aueq?: number;
  resource_max_oz_aueq?: number;
  company_ids?: number[];
}

export interface PeerSet {
  id: number;
  name: string;
  description: string | null;
  filters_json: PeerSetFilters;
  is_public: boolean;
  share_token: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface PeerSetCreate {
  name: string;
  description?: string;
  filters: PeerSetFilters;
  is_public?: boolean;
}

// ============================================================================
// Companies & Projects
// ============================================================================

export interface Company {
  id: number;
  ticker: string;
  exchange: string;
  name: string;
  country: string | null;
  sector: string;
  primary_commodity: string | null;
  currency: string;
  website: string | null;
  metadata_json: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: number;
  company_id: number;
  name: string;
  jurisdiction: string;
  latitude: number | null;
  longitude: number | null;
  stage: ProjectStage;
  primary_commodity: string | null;
  ownership_percent: number;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export type ProjectStage = 
  | 'grassroots'
  | 'exploration'
  | 'development'
  | 'construction'
  | 'production'
  | 'care_maintenance'
  | 'closure';

// ============================================================================
// Resources
// ============================================================================

export interface Resource {
  id: number;
  project_id: number;
  commodity: string;
  category: ResourceCategory;
  tonnage: number;
  grade: number;
  grade_unit: string;
  contained_metal: number;
  metal_unit: string;
  effective_date: string;
  cutoff_grade: number | null;
  cutoff_unit: string | null;
  report_title: string | null;
  report_url: string | null;
  source_id: number | null;
  created_at: string;
}

export type ResourceCategory = 
  | 'measured'
  | 'indicated'
  | 'inferred'
  | 'proven'
  | 'probable';

export interface ResourceSummary {
  commodity: string;
  total_tonnage: number;
  avg_grade: number;
  grade_unit: string;
  total_contained_metal: number;
  metal_unit: string;
  category_breakdown: Record<string, number>;
}

// ============================================================================
// Valuation & Analytics
// ============================================================================

export interface ValuationMetrics {
  company_id: number;
  ticker: string;
  name: string;
  exchange: string;
  date: string;
  market_cap_usd: number | null;
  enterprise_value_usd: number | null;
  nav_usd: number | null;
  p_nav: number | null;
  cash_usd: number | null;
  debt_usd: number | null;
  total_aueq_oz: number | null;
  ev_per_aueq_oz: number | null;
}

export interface ValuationComparison {
  peer_set_id: number;
  peer_set_name: string;
  as_of_date: string;
  companies: ValuationMetrics[];
  stats: {
    [key: string]: {
      min: number;
      max: number;
      avg: number;
      median: number;
      count: number;
    };
  };
}

export interface EVResourcePoint {
  company_id: number;
  ticker: string;
  name: string;
  enterprise_value_usd: number;
  contained_metal: number;
  metal_unit: string;
  commodity: string;
  jurisdiction: string;
}

export interface EVResourceChart {
  data_points: EVResourcePoint[];
  x_label: string;
  y_label: string;
  generated_at: string;
}

// ============================================================================
// Map Data
// ============================================================================

export interface MapProject {
  id: number;
  name: string;
  company_name: string;
  ticker: string;
  latitude: number;
  longitude: number;
  stage: string;
  primary_commodity: string | null;
  jurisdiction: string;
  total_contained_aueq_oz: number | null;
}

export interface MapData {
  projects: MapProject[];
  center_lat: number;
  center_lng: number;
  zoom_level: number;
}

// ============================================================================
// Data Lineage
// ============================================================================

export interface LineageInfo {
  source_name: string;
  source_type: string;
  source_url: string | null;
  license: string | null;
  attribution: string | null;
  last_updated: string;
  record_timestamp: string;
}

export interface MetricWithLineage {
  metric_name: string;
  value: unknown;
  unit: string | null;
  lineage: LineageInfo;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  detail: string;
  errors?: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================================================
// Chart Types
// ============================================================================

export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
  color?: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

export interface ScatterChartConfig {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  xLog?: boolean;
  yLog?: boolean;
  colorBy?: 'jurisdiction' | 'commodity' | 'stage';
}

// ============================================================================
// Filter Options
// ============================================================================

export interface FilterOptions {
  exchanges: string[];
  commodities: string[];
  jurisdictions: string[];
  stages: string[];
}

// Commodity display names
export const COMMODITY_LABELS: Record<string, string> = {
  Au: 'Gold',
  Ag: 'Silver',
  Cu: 'Copper',
  Li: 'Lithium',
  Zn: 'Zinc',
  Ni: 'Nickel',
  Co: 'Cobalt',
  Pt: 'Platinum',
  Pd: 'Palladium',
  U: 'Uranium',
};

// Stage display names
export const STAGE_LABELS: Record<ProjectStage, string> = {
  grassroots: 'Grassroots',
  exploration: 'Exploration',
  development: 'Development',
  construction: 'Construction',
  production: 'Production',
  care_maintenance: 'Care & Maintenance',
  closure: 'Closure',
};

// Stage colors for visualization
export const STAGE_COLORS: Record<ProjectStage, string> = {
  grassroots: '#94a3b8',
  exploration: '#60a5fa',
  development: '#fbbf24',
  construction: '#f97316',
  production: '#22c55e',
  care_maintenance: '#a855f7',
  closure: '#ef4444',
};

// Commodity colors for visualization
export const COMMODITY_COLORS: Record<string, string> = {
  Au: '#FFD700',
  Ag: '#C0C0C0',
  Cu: '#B87333',
  Li: '#93C572',
  Zn: '#7D7D7D',
  Ni: '#8B8589',
  Co: '#0047AB',
  Pt: '#E5E4E2',
  Pd: '#CED0DD',
  U: '#39FF14',
};

// Re-export Prospector types
export * from './prospector';
