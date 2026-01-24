/**
 * Geoscience Australia API Service
 * 
 * Client for fetching Australian mining and geological data
 * from the InvestOre Analytics backend.
 */

import {
  OperatingMine,
  CriticalMineral,
  MineralDeposit,
  Borehole,
  GeologicalProvince,
  AllAustraliaData,
  DataStatistics,
  CommoditiesResponse,
  MinesFilter,
  CriticalMineralsFilter,
  DepositsFilter,
  BoreholesFilter,
} from '@/types/geoscience';

import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_BASE_URL = RAILWAY_API_URL;
const GA_ENDPOINT = `${API_BASE_URL}/api/v1/geoscience`;

/**
 * Generic fetch wrapper with error handling
 */
async function fetchGA<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
  // Build query string
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const queryString = searchParams.toString();
  const url = `${GA_ENDPOINT}${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Cache for 5 minutes on the client
    next: { revalidate: 300 },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Geoscience Australia API Service
 */
export const geoscienceService = {
  /**
   * Get all Australian mining data in a single request
   * Best for initial map load
   */
  async getAllData(): Promise<AllAustraliaData> {
    return fetchGA<AllAustraliaData>('/all');
  },
  
  /**
   * Get Australian operating mines
   */
  async getMines(filter?: MinesFilter): Promise<OperatingMine[]> {
    return fetchGA<OperatingMine[]>('/mines', filter as Record<string, string | number | undefined>);
  },
  
  /**
   * Get critical minerals deposits and mines
   */
  async getCriticalMinerals(filter?: CriticalMineralsFilter): Promise<CriticalMineral[]> {
    return fetchGA<CriticalMineral[]>('/critical-minerals', filter as Record<string, string | number | undefined>);
  },
  
  /**
   * Get mineral deposits from OZMIN database
   */
  async getDeposits(filter?: DepositsFilter): Promise<MineralDeposit[]> {
    return fetchGA<MineralDeposit[]>('/deposits', filter as Record<string, string | number | undefined>);
  },
  
  /**
   * Get geological province boundaries
   */
  async getProvinces(provinceType?: string, limit?: number): Promise<GeologicalProvince[]> {
    return fetchGA<GeologicalProvince[]>('/provinces', { province_type: provinceType, limit });
  },
  
  /**
   * Get borehole/drillhole data
   */
  async getBoreholes(filter?: BoreholesFilter): Promise<Borehole[]> {
    return fetchGA<Borehole[]>('/boreholes', filter as Record<string, string | number | undefined>);
  },
  
  /**
   * Get list of available commodities
   */
  async getCommodities(): Promise<CommoditiesResponse> {
    return fetchGA<CommoditiesResponse>('/commodities');
  },
  
  /**
   * Get data statistics
   */
  async getStats(): Promise<DataStatistics> {
    return fetchGA<DataStatistics>('/stats');
  },
};

export default geoscienceService;
