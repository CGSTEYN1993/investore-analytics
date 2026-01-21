/**
 * Mining Data Service
 * 
 * Fetches extracted mining data from the backend API.
 * Data sources: V1-V10 extraction pipeline (projects, resources, reserves, drilling, economics)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

// Types
export interface ProjectSummary {
  id: number;
  symbol: string;
  project_name: string;
  current_phase?: string;
  mine_life_years?: number;
  study_type?: string;
  funding_status?: string;
  first_production_year?: number;
  announcement_date?: string;
  extraction_confidence: number;
  llm_validated: boolean;
}

export interface ResourceEstimate {
  id: number;
  symbol: string;
  project_name?: string;
  category: 'measured' | 'indicated' | 'inferred';
  commodity: string;
  tonnage_mt?: number;
  grade?: number;
  grade_unit?: string;
  contained_metal?: number;
  contained_unit?: string;
  cutoff_grade?: number;
  effective_date?: string;
  announcement_date?: string;
  extraction_confidence: number;
}

export interface ReserveEstimate {
  id: number;
  symbol: string;
  project_name?: string;
  category: 'proved' | 'probable';
  commodity: string;
  tonnage_mt?: number;
  grade?: number;
  grade_unit?: string;
  contained_metal?: number;
  contained_unit?: string;
  dilution_percent?: number;
  mining_recovery_percent?: number;
  effective_date?: string;
}

export interface DrillingResult {
  id: number;
  symbol: string;
  project_name?: string;
  hole_id: string;
  drill_type?: string;
  depth_from?: number;
  depth_to?: number;
  interval_m?: number;
  commodity?: string;
  grade?: number;
  grade_unit?: string;
  azimuth?: number;
  dip?: number;
  easting?: number;
  northing?: number;
  announcement_date?: string;
}

export interface EconomicMetrics {
  id: number;
  symbol: string;
  project_name?: string;
  study_type?: string;
  npv_usd?: number;
  discount_rate?: number;
  irr_percent?: number;
  payback_years?: number;
  capex_usd?: number;
  opex_per_unit?: number;
  aisc_per_oz?: number;
  gold_price_assumption?: number;
  currency: string;
  announcement_date?: string;
}

export interface CompanyMiningData {
  symbol: string;
  company_name?: string;
  projects: ProjectSummary[];
  resources: ResourceEstimate[];
  reserves: ReserveEstimate[];
  drilling: DrillingResult[];
  economics: EconomicMetrics[];
  total_resources_mt: number;
  total_reserves_mt: number;
  latest_announcement?: string;
}

export interface ResourcesByCategory {
  measured_mt: number;
  indicated_mt: number;
  inferred_mt: number;
  measured_indicated_mt: number;
  total_mt: number;
}

export interface ResourcesByCommodity {
  commodity: string;
  by_category: ResourcesByCategory;
  contained_metal: number;
  contained_unit: string;
  company_count: number;
}

export interface ExtractionStats {
  total_documents: number;
  processed_documents: number;
  projects_extracted: number;
  resources_extracted: number;
  reserves_extracted: number;
  drilling_results: number;
  economic_metrics: number;
  last_extraction?: string;
}

export interface ProjectPhases {
  [phase: string]: number;
}

// New types for exploration and stages integration
export interface ExplorationDrilling {
  id: number;
  symbol: string;
  project_name?: string;
  hole_id: string;
  drill_type?: string;
  total_depth?: number;
  azimuth?: number;
  dip?: number;
  easting?: number;
  northing?: number;
  latitude?: number;
  longitude?: number;
  announcement_date?: string;
  status: string;
}

export interface ExplorationDrillingResponse {
  total: number;
  drilling: ExplorationDrilling[];
  companies: string[];
  projects: string[];
  exchanges: string[];
}

export interface DrillIntercept {
  id: number;
  symbol: string;
  hole_id: string;
  project_name?: string;
  from_m?: number;
  to_m?: number;
  width_m?: number;
  grade?: number;
  grade_unit?: string;
  commodity?: string;
  announcement_date?: string;
  nsr_value?: number;
}

export interface DrillInterceptsResponse {
  total: number;
  intercepts: DrillIntercept[];
  companies: string[];
  commodities: string[];
  exchanges: string[];
}

export interface ExplorationSummary {
  total_holes: number;
  total_meters: number;
  total_intercepts: number;
  companies_with_drilling: number;
  commodities_found: string[];
  avg_hole_depth: number;
  deepest_hole: number;
}

export interface ProjectByPhase {
  id: number;
  symbol: string;
  project_name: string;
  current_phase?: string;
  study_type?: string;
  commodity?: string;
  mine_life_years?: number;
  first_production_year?: number;
  announcement_date?: string;
}

export interface ProjectPhasesResponse {
  phases: { [phase: string]: number };
  projects: ProjectByPhase[];
  total: number;
  companies: string[];
  project_names: string[];
  exchanges: string[];
}

export interface ResourceWithLocation {
  id: number;
  symbol: string;
  project_name?: string;
  category: string;
  commodity: string;
  tonnage_mt?: number;
  grade?: number;
  grade_unit?: string;
  contained_metal?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchMining<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}/api/v1/mining${endpoint}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    const error: any = new Error(`HTTP ${response.status}`);
    error.response = { status: response.status };
    throw error;
  }
  
  return response.json();
}

// API Service
class MiningDataService {
  /**
   * Get all mining data for a specific company
   */
  async getCompanyData(
    symbol: string,
    options?: { includeDrilling?: boolean; includeEconomics?: boolean }
  ): Promise<CompanyMiningData> {
    const params = new URLSearchParams();
    if (options?.includeDrilling !== undefined) {
      params.append('include_drilling', String(options.includeDrilling));
    }
    if (options?.includeEconomics !== undefined) {
      params.append('include_economics', String(options.includeEconomics));
    }
    
    const query = params.toString();
    return fetchMining<CompanyMiningData>(`/company/${symbol}${query ? `?${query}` : ''}`);
  }

  /**
   * Get aggregated resource summary by commodity
   */
  async getResourcesSummary(options?: {
    commodity?: string;
    category?: string;
    minTonnage?: number;
  }): Promise<ResourcesByCommodity[]> {
    const params = new URLSearchParams();
    if (options?.commodity) params.append('commodity', options.commodity);
    if (options?.category) params.append('category', options.category);
    if (options?.minTonnage) params.append('min_tonnage', String(options.minTonnage));
    
    const query = params.toString();
    return fetchMining<ResourcesByCommodity[]>(`/resources/summary${query ? `?${query}` : ''}`);
  }

  /**
   * Get project counts by development phase
   */
  async getProjectPhases(): Promise<ProjectPhases> {
    return fetchMining<ProjectPhases>('/projects/phases');
  }

  /**
   * Get notable drilling results
   */
  async getDrillingHighlights(options?: {
    commodity?: string;
    minGrade?: number;
    minInterval?: number;
    limit?: number;
  }): Promise<DrillingResult[]> {
    const params = new URLSearchParams();
    if (options?.commodity) params.append('commodity', options.commodity);
    if (options?.minGrade) params.append('min_grade', String(options.minGrade));
    if (options?.minInterval) params.append('min_interval', String(options.minInterval));
    if (options?.limit) params.append('limit', String(options.limit));
    
    const query = params.toString();
    return fetchMining<DrillingResult[]>(`/drilling/highlights${query ? `?${query}` : ''}`);
  }

  /**
   * Get economic metrics for comparisons
   */
  async getEconomicsComparisons(options?: {
    studyType?: string;
    minNpv?: number;
    minIrr?: number;
  }): Promise<EconomicMetrics[]> {
    const params = new URLSearchParams();
    if (options?.studyType) params.append('study_type', options.studyType);
    if (options?.minNpv) params.append('min_npv', String(options.minNpv));
    if (options?.minIrr) params.append('min_irr', String(options.minIrr));
    
    const query = params.toString();
    return fetchMining<EconomicMetrics[]>(`/economics/comparisons${query ? `?${query}` : ''}`);
  }

  /**
   * Get extraction pipeline statistics
   */
  async getExtractionStats(): Promise<ExtractionStats> {
    return fetchMining<ExtractionStats>('/stats');
  }

  /**
   * Search across all mining data
   */
  async search(
    query: string,
    options?: { dataType?: 'project' | 'resource' | 'drilling'; limit?: number }
  ): Promise<{
    projects: ProjectSummary[];
    resources: ResourceEstimate[];
    drilling: DrillingResult[];
  }> {
    const params = new URLSearchParams({ q: query });
    if (options?.dataType) params.append('data_type', options.dataType);
    if (options?.limit) params.append('limit', String(options.limit));
    
    return fetchMining(`/search?${params}`);
  }

  /**
   * Get drilling data for exploration page with locations
   */
  async getExplorationDrilling(options?: {
    symbol?: string;
    project?: string;
    drillType?: string;
    exchange?: string;
    minDepth?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<ExplorationDrillingResponse> {
    const params = new URLSearchParams();
    if (options?.symbol) params.append('symbol', options.symbol);
    if (options?.project) params.append('project', options.project);
    if (options?.drillType) params.append('drill_type', options.drillType);
    if (options?.exchange) params.append('exchange', options.exchange);
    if (options?.minDepth) params.append('min_depth', String(options.minDepth));
    if (options?.dateFrom) params.append('date_from', options.dateFrom);
    if (options?.dateTo) params.append('date_to', options.dateTo);
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    
    const query = params.toString();
    return fetchMining<ExplorationDrillingResponse>(`/exploration/drilling${query ? `?${query}` : ''}`);
  }

  /**
   * Get drill intercepts with assay results
   */
  async getDrillIntercepts(options?: {
    symbol?: string;
    commodity?: string;
    exchange?: string;
    minGrade?: number;
    minWidth?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<DrillInterceptsResponse> {
    const params = new URLSearchParams();
    if (options?.symbol) params.append('symbol', options.symbol);
    if (options?.commodity) params.append('commodity', options.commodity);
    if (options?.exchange) params.append('exchange', options.exchange);
    if (options?.minGrade) params.append('min_grade', String(options.minGrade));
    if (options?.minWidth) params.append('min_width', String(options.minWidth));
    if (options?.dateFrom) params.append('date_from', options.dateFrom);
    if (options?.dateTo) params.append('date_to', options.dateTo);
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    
    const query = params.toString();
    return fetchMining<DrillInterceptsResponse>(`/exploration/intercepts${query ? `?${query}` : ''}`);
  }

  /**
   * Get exploration summary statistics
   */
  async getExplorationSummary(): Promise<ExplorationSummary> {
    return fetchMining<ExplorationSummary>('/exploration/summary');
  }

  /**
   * Get projects by development phase for stages page
   */
  async getProjectsByPhase(options?: {
    phase?: string;
    symbol?: string;
    commodity?: string;
    project?: string;
    exchange?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProjectPhasesResponse> {
    const params = new URLSearchParams();
    if (options?.phase) params.append('phase', options.phase);
    if (options?.symbol) params.append('symbol', options.symbol);
    if (options?.commodity) params.append('commodity', options.commodity);
    if (options?.project) params.append('project', options.project);
    if (options?.exchange) params.append('exchange', options.exchange);
    if (options?.dateFrom) params.append('date_from', options.dateFrom);
    if (options?.dateTo) params.append('date_to', options.dateTo);
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    
    const query = params.toString();
    return fetchMining<ProjectPhasesResponse>(`/projects/by-phase${query ? `?${query}` : ''}`);
  }

  /**
   * Get resources with locations for map display
   */
  async getResourcesWithLocations(options?: {
    commodity?: string;
    category?: string;
    minTonnage?: number;
    limit?: number;
  }): Promise<ResourceWithLocation[]> {
    const params = new URLSearchParams();
    if (options?.commodity) params.append('commodity', options.commodity);
    if (options?.category) params.append('category', options.category);
    if (options?.minTonnage) params.append('min_tonnage', String(options.minTonnage));
    if (options?.limit) params.append('limit', String(options.limit));
    
    const query = params.toString();
    return fetchMining<ResourceWithLocation[]>(`/resources/locations${query ? `?${query}` : ''}`);
  }
}

export const miningDataService = new MiningDataService();
export default miningDataService;