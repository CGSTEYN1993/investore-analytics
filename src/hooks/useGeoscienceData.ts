/**
 * React Hook for Geoscience Australia Data
 * 
 * Provides easy access to Australian mining data with
 * loading states, error handling, and caching.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import geoscienceService from '@/services/geoscienceService';
import {
  AllAustraliaData,
  DataStatistics,
  OperatingMine,
  CriticalMineral,
  MineralDeposit,
  Borehole,
  MinesFilter,
  CriticalMineralsFilter,
  DepositsFilter,
  BoreholesFilter,
  MapFeature,
} from '@/types/geoscience';

interface UseGeoscienceDataResult {
  // Data
  data: AllAustraliaData | null;
  stats: DataStatistics | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  
  // Filtered data helpers
  getFeaturesByType: (type: MapFeature['type']) => MapFeature[];
  getFeaturesByCommodity: (commodity: string) => MapFeature[];
  getFeaturesByState: (state: string) => MapFeature[];
}

/**
 * Hook to fetch and manage all Geoscience Australia data
 */
export function useGeoscienceData(): UseGeoscienceDataResult {
  const [data, setData] = useState<AllAustraliaData | null>(null);
  const [stats, setStats] = useState<DataStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allData = await geoscienceService.getAllData();
      setData(allData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    
    try {
      const statistics = await geoscienceService.getStats();
      setStats(statistics);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);
  
  const refresh = useCallback(async () => {
    await Promise.all([fetchData(), fetchStats()]);
  }, [fetchData, fetchStats]);
  
  const getFeaturesByType = useCallback((type: MapFeature['type']): MapFeature[] => {
    if (!data) return [];
    
    switch (type) {
      case 'operating_mine':
        return data.operating_mines;
      case 'critical_mineral':
        return data.critical_minerals;
      case 'deposit':
        return data.mineral_deposits;
      default:
        return [];
    }
  }, [data]);
  
  const getFeaturesByCommodity = useCallback((commodity: string): MapFeature[] => {
    if (!data) return [];
    
    const allFeatures: MapFeature[] = [
      ...data.operating_mines,
      ...data.critical_minerals,
      ...data.mineral_deposits,
    ];
    
    return allFeatures.filter(f => {
      const commodityValue = 'commodity' in f ? f.commodity : undefined;
      return commodityValue?.toLowerCase().includes(commodity.toLowerCase());
    });
  }, [data]);
  
  const getFeaturesByState = useCallback((state: string): MapFeature[] => {
    if (!data) return [];
    
    const allFeatures: MapFeature[] = [
      ...data.operating_mines,
      ...data.critical_minerals,
      ...data.mineral_deposits,
    ];
    
    return allFeatures.filter(f => 
      'state' in f && f.state === state
    );
  }, [data]);
  
  return {
    data,
    stats,
    isLoading,
    isLoadingStats,
    error,
    refresh,
    getFeaturesByType,
    getFeaturesByCommodity,
    getFeaturesByState,
  };
}

interface UseMinesResult {
  mines: OperatingMine[];
  isLoading: boolean;
  error: string | null;
  refetch: (filter?: MinesFilter) => Promise<void>;
}

/**
 * Hook to fetch operating mines with optional filtering
 */
export function useMines(initialFilter?: MinesFilter): UseMinesResult {
  const [mines, setMines] = useState<OperatingMine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refetch = useCallback(async (filter?: MinesFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await geoscienceService.getMines(filter);
      setMines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mines');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refetch(initialFilter);
  }, []);
  
  return { mines, isLoading, error, refetch };
}

interface UseCriticalMineralsResult {
  minerals: CriticalMineral[];
  isLoading: boolean;
  error: string | null;
  refetch: (filter?: CriticalMineralsFilter) => Promise<void>;
}

/**
 * Hook to fetch critical minerals data
 */
export function useCriticalMinerals(initialFilter?: CriticalMineralsFilter): UseCriticalMineralsResult {
  const [minerals, setMinerals] = useState<CriticalMineral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refetch = useCallback(async (filter?: CriticalMineralsFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await geoscienceService.getCriticalMinerals(filter);
      setMinerals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load critical minerals');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refetch(initialFilter);
  }, []);
  
  return { minerals, isLoading, error, refetch };
}

interface UseDepositsResult {
  deposits: MineralDeposit[];
  isLoading: boolean;
  error: string | null;
  refetch: (filter?: DepositsFilter) => Promise<void>;
}

/**
 * Hook to fetch mineral deposits
 */
export function useDeposits(initialFilter?: DepositsFilter): UseDepositsResult {
  const [deposits, setDeposits] = useState<MineralDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refetch = useCallback(async (filter?: DepositsFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await geoscienceService.getDeposits(filter);
      setDeposits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deposits');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refetch(initialFilter);
  }, []);
  
  return { deposits, isLoading, error, refetch };
}

interface UseBoreholesResult {
  boreholes: Borehole[];
  isLoading: boolean;
  error: string | null;
  refetch: (filter?: BoreholesFilter) => Promise<void>;
}

/**
 * Hook to fetch boreholes
 */
export function useBoreholes(initialFilter?: BoreholesFilter): UseBoreholesResult {
  const [boreholes, setBoreholes] = useState<Borehole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refetch = useCallback(async (filter?: BoreholesFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await geoscienceService.getBoreholes(filter);
      setBoreholes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load boreholes');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refetch(initialFilter);
  }, []);
  
  return { boreholes, isLoading, error, refetch };
}
