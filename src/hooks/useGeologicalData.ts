/**
 * React Hooks for Geological Data
 * 
 * Provides access to ML/LLM-ready geological data including:
 * - Geological provinces
 * - Mineral deposits (OZMIN)
 * - Drilling results parsing
 * - JORC resource estimates
 * - Tenement data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPublicApiUrl } from '@/lib/public-api-url';

// Types
export interface GeologicalProvince {
  id: string;
  name: string;
  type: string;
  age_era: string;
  age: string;
  tectonic_setting: string;
  description: string;
  area_km2: number | null;
  centroid_lat: number;
  centroid_lng: number;
  source: string;
  known_deposit_types: string[];
  prospectivity_metals: string[];
}

export interface MineralDeposit {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state: string;
  deposit_type: string;
  mineralization_style: string;
  primary_commodity: string;
  all_commodities: string[];
  status: string;
  owner: string | null;
  geological_province: string;
  keywords: string[];
}

export interface DrillIntercept {
  hole_id: string;
  hole_type: string;
  from_m: number;
  to_m: number;
  width_m: number;
  grade: number;
  grade_unit: string;
  commodity: string;
  includes_higher_grade: boolean;
  higher_grade_interval: string | null;
}

export interface DrillingAnalysis {
  min_grade: number;
  max_grade: number;
  mean_grade: number;
  median_grade: number;
  num_intercepts: number;
  num_high_grade: number;
  num_wide_intercepts: number;
  mean_gt_m: number;
  max_gt_m: number;
}

export interface DrillingCompanySummary {
  symbol: string;
  period_days: number;
  announcements_count: number;
  intercepts_parsed: number;
  unique_holes: number;
  analysis: DrillingAnalysis | null;
  announcements: Array<{
    title: string;
    date: string;
    url: string;
  }>;
}

export interface JORCResource {
  deposit_name: string;
  commodity: string;
  category: string;
  tonnage_mt: number;
  grade: number;
  grade_unit: string;
  contained_metal: number;
  metal_unit: string;
}

export interface ResourceMLFeatures {
  total_tonnage_mt: number;
  average_grade: number;
  total_contained_moz: number;
  measured_percent: number;
  indicated_percent: number;
  inferred_percent: number;
  resource_quality_score: number;
  grade_quality_score: number;
}

export interface CompanyResourceSummary {
  symbol: string;
  period_days: number;
  announcements_count: number;
  resources_parsed: number;
  ml_features: ResourceMLFeatures;
  llm_context: string;
}

export interface Tenement {
  id: string;
  tenement_number: string;
  tenement_type: string;
  state: string;
  status: string;
  holder_name: string;
  area_km2: number;
  commodities: string[];
}

export interface TenementPortfolio {
  company_symbol: string;
  company_name: string;
  total_tenements: number;
  total_area_km2: number;
  tenements_by_state: Record<string, number>;
  commodities_targeted: string[];
}

// ============================================================================
// GEOLOGICAL PROVINCES HOOK
// ============================================================================

export function useGeologicalProvinces(limit: number = 100) {
  const [provinces, setProvinces] = useState<GeologicalProvince[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const response = await fetch(
        `${API_URL}/api/v1/geological/provinces?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch provinces: ${response.status}`);
      }

      const data = await response.json();
      setProvinces(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load geological provinces');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { provinces, isLoading, error, refresh: fetchData };
}

// ============================================================================
// MINERAL DEPOSITS HOOK
// ============================================================================

export function useMineralDeposits(
  commodity?: string,
  state?: string,
  limit: number = 500
) {
  const [deposits, setDeposits] = useState<MineralDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      if (commodity) params.append('commodity', commodity);
      if (state) params.append('state', state);
      params.append('limit', limit.toString());

      const response = await fetch(
        `${API_URL}/api/v1/geological/deposits?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch deposits: ${response.status}`);
      }

      const data = await response.json();
      setDeposits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mineral deposits');
    } finally {
      setIsLoading(false);
    }
  }, [commodity, state, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { deposits, isLoading, error, refresh: fetchData };
}

// ============================================================================
// DRILLING PARSER HOOK
// ============================================================================

export function useDrillingParser() {
  const [intercepts, setIntercepts] = useState<DrillIntercept[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseText = useCallback(async (text: string, symbol?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      params.append('text', text);
      if (symbol) params.append('symbol', symbol);

      const response = await fetch(
        `${API_URL}/api/v1/geological/drilling/parse?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to parse drilling text: ${response.status}`);
      }

      const data = await response.json();
      setIntercepts(data.intercepts || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse drilling text');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { intercepts, isLoading, error, parseText };
}

// ============================================================================
// COMPANY DRILLING SUMMARY HOOK
// ============================================================================

export function useCompanyDrillingSummary(symbol: string, daysBack: number = 365) {
  const [summary, setSummary] = useState<DrillingCompanySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const response = await fetch(
        `${API_URL}/api/v1/geological/drilling/company/${symbol}?days_back=${daysBack}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch drilling summary: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drilling summary');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, daysBack]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, isLoading, error, refresh: fetchData };
}

// ============================================================================
// JORC RESOURCE SUMMARY HOOK
// ============================================================================

export function useCompanyResourceSummary(symbol: string, daysBack: number = 730) {
  const [summary, setSummary] = useState<CompanyResourceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const response = await fetch(
        `${API_URL}/api/v1/geological/resources/company/${symbol}?days_back=${daysBack}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch resource summary: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resource summary');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, daysBack]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, isLoading, error, refresh: fetchData };
}

// ============================================================================
// RESOURCE PARSER HOOK
// ============================================================================

export function useResourceParser() {
  const [resources, setResources] = useState<JORCResource[]>([]);
  const [mlFeatures, setMlFeatures] = useState<ResourceMLFeatures | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseText = useCallback(async (text: string, symbol?: string, commodity: string = 'GOLD') => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      params.append('text', text);
      if (symbol) params.append('symbol', symbol);
      params.append('commodity', commodity);

      const response = await fetch(
        `${API_URL}/api/v1/geological/resources/parse?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to parse resource text: ${response.status}`);
      }

      const data = await response.json();
      setResources(data.resources || []);
      setMlFeatures(data.ml_features || null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resource text');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { resources, mlFeatures, isLoading, error, parseText };
}

// ============================================================================
// TENEMENT PORTFOLIO HOOK
// ============================================================================

export function useTenementPortfolio(symbol: string) {
  const [portfolio, setPortfolio] = useState<TenementPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const response = await fetch(
        `${API_URL}/api/v1/geological/tenements/company/${symbol}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tenement portfolio: ${response.status}`);
      }

      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenement portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { portfolio, isLoading, error, refresh: fetchData };
}

// ============================================================================
// ML TRAINING DATASET HOOK
// ============================================================================

export function useMLTrainingDataset(
  includeDeposits: boolean = true,
  includeProvinces: boolean = true,
  commodity?: string,
  limit: number = 100
) {
  const [dataset, setDataset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      params.append('include_deposits', includeDeposits.toString());
      params.append('include_provinces', includeProvinces.toString());
      if (commodity) params.append('commodity', commodity);
      params.append('limit', limit.toString());

      const response = await fetch(
        `${API_URL}/api/v1/geological/ml/training-dataset?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ML dataset: ${response.status}`);
      }

      const data = await response.json();
      setDataset(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ML training dataset');
    } finally {
      setIsLoading(false);
    }
  }, [includeDeposits, includeProvinces, commodity, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { dataset, isLoading, error, refresh: fetchData };
}

// ============================================================================
// LLM CONTEXT HOOK
// ============================================================================

export function useLLMContext(symbol: string) {
  const [context, setContext] = useState<{
    company_context: string | null;
    drilling_context: string | null;
    resource_context: string | null;
  }>({
    company_context: null,
    drilling_context: null,
    resource_context: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      
      // Fetch all context in parallel
      const [companyRes, drillingRes, resourceRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/geological/llm/context/company/${symbol}`),
        fetch(`${API_URL}/api/v1/geological/drilling/llm/summary/${symbol}`),
        fetch(`${API_URL}/api/v1/geological/resources/llm/summary/${symbol}`)
      ]);

      const newContext = {
        company_context: null as string | null,
        drilling_context: null as string | null,
        resource_context: null as string | null
      };

      if (companyRes.status === 'fulfilled' && companyRes.value.ok) {
        const data = await companyRes.value.json();
        newContext.company_context = data.context_text;
      }

      if (drillingRes.status === 'fulfilled' && drillingRes.value.ok) {
        const data = await drillingRes.value.json();
        newContext.drilling_context = data.context_text;
      }

      if (resourceRes.status === 'fulfilled' && resourceRes.value.ok) {
        const data = await resourceRes.value.json();
        newContext.resource_context = data.context_text;
      }

      setContext(newContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load LLM context');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { context, isLoading, error, refresh: fetchData };
}

// ============================================================================
// MAP DATA HOOKS
// ============================================================================

export interface MapFeature {
  id: string;
  name: string;
  type: 'operating_mine' | 'developing_mine' | 'deposit' | 'borehole' | 'geochemistry' | 'critical_mineral' | 'province';
  lat: number;
  lng: number;
  commodity?: string;
  status?: string;
  state?: string;
  owner?: string;
  resource?: string;
  description?: string;
  depth_m?: number;
  drillType?: string;
  element?: string;
  concentration?: number;
  unit?: string;
}

export interface MapDataLayers {
  operatingMines: MapFeature[];
  developingMines: MapFeature[];
  criticalMinerals: MapFeature[];
  deposits: MapFeature[];
  boreholes: MapFeature[];
  geochemistry: MapFeature[];
  totals: {
    operatingMines: number;
    developingMines: number;
    criticalMinerals: number;
    deposits: number;
    boreholes: number;
    geochemistry: number;
  };
}

/**
 * Hook to fetch all map layers in a single request
 */
export function useGeoscienceMapData(
  options: {
    commodity?: string;
    state?: string;
    includeBoreholes?: boolean;
    includeGeochemistry?: boolean;
    limitPerLayer?: number;
  } = {}
) {
  const [data, setData] = useState<MapDataLayers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      
      if (options.commodity) params.append('commodity', options.commodity);
      if (options.state) params.append('state', options.state);
      if (options.includeBoreholes) params.append('include_boreholes', 'true');
      if (options.includeGeochemistry) params.append('include_geochemistry', 'true');
      if (options.limitPerLayer) params.append('limit_per_layer', String(options.limitPerLayer));

      const response = await fetch(`${API_URL}/api/v1/geological/map/all-layers?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map data');
    } finally {
      setIsLoading(false);
    }
  }, [options.commodity, options.state, options.includeBoreholes, options.includeGeochemistry, options.limitPerLayer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}

/**
 * Hook to fetch operating mines
 */
export function useMapOperatingMines(commodity?: string, state?: string, limit?: number) {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      if (commodity) params.append('commodity', commodity);
      if (state) params.append('state', state);
      if (limit) params.append('limit', String(limit));

      const response = await fetch(`${API_URL}/api/v1/geological/map/operating-mines?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      setFeatures(result.features || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load operating mines');
    } finally {
      setIsLoading(false);
    }
  }, [commodity, state, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { features, isLoading, error, refresh: fetchData };
}

/**
 * Hook to fetch critical minerals
 */
export function useMapCriticalMinerals(mineral?: string, limit?: number) {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      if (mineral) params.append('mineral', mineral);
      if (limit) params.append('limit', String(limit));

      const response = await fetch(`${API_URL}/api/v1/geological/map/critical-minerals?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      setFeatures(result.features || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load critical minerals');
    } finally {
      setIsLoading(false);
    }
  }, [mineral, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { features, isLoading, error, refresh: fetchData };
}

/**
 * Hook to fetch mineral deposits
 */
export function useMapDeposits(commodity?: string, state?: string, depositType?: string, limit?: number) {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      if (commodity) params.append('commodity', commodity);
      if (state) params.append('state', state);
      if (depositType) params.append('deposit_type', depositType);
      if (limit) params.append('limit', String(limit));

      const response = await fetch(`${API_URL}/api/v1/geological/map/deposits?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      setFeatures(result.features || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deposits');
    } finally {
      setIsLoading(false);
    }
  }, [commodity, state, depositType, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { features, isLoading, error, refresh: fetchData };
}

/**
 * Hook to fetch boreholes
 */
export function useMapBoreholes(purpose?: string, minDepth?: number, limit?: number) {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      if (purpose) params.append('purpose', purpose);
      if (minDepth) params.append('min_depth', String(minDepth));
      if (limit) params.append('limit', String(limit));

      const response = await fetch(`${API_URL}/api/v1/geological/map/boreholes?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      setFeatures(result.features || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load boreholes');
    } finally {
      setIsLoading(false);
    }
  }, [purpose, minDepth, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { features, isLoading, error, refresh: fetchData };
}

/**
 * Hook to fetch geochemistry samples
 */
export function useMapGeochemistry(element?: string, limit?: number) {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      if (element) params.append('element', element);
      if (limit) params.append('limit', String(limit));

      const response = await fetch(`${API_URL}/api/v1/geological/map/geochemistry?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      setFeatures(result.features || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load geochemistry');
    } finally {
      setIsLoading(false);
    }
  }, [element, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { features, isLoading, error, refresh: fetchData };
}
