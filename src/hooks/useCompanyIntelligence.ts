/**
 * React Hook for Company Intelligence Data
 * 
 * Provides access to company intelligence linking
 * Geoscience Australia data, JORC resources, and announcements.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPublicApiUrl } from '@/lib/public-api-url';

// Types
export interface GeoscienceLink {
  ga_id: string;
  ga_name: string;
  ga_type: string;
  company_symbol: string;
  company_name: string;
  match_confidence: number;
  match_method: string;
  commodity: string;
  state: string;
  lat: number;
  lng: number;
}

export interface ResourceEstimate {
  category: string;
  tonnage_mt: number;
  grade: number;
  grade_unit: string;
  commodity: string;
  contained_metal?: number;
  contained_unit?: string;
  effective_date?: string;
  source_announcement?: string;
}

export interface DrillingResult {
  hole_id: string;
  from_m: number;
  to_m: number;
  width_m: number;
  grade: number;
  grade_unit: string;
  commodity: string;
  source_announcement?: string;
}

export interface Announcement {
  header?: string;
  title?: string;
  document_date?: string;
  url?: string;
}

export interface CompanyIntelligence {
  symbol: string;
  company_name: string;
  exchange: string;
  operating_mines: GeoscienceLink[];
  deposits: GeoscienceLink[];
  critical_minerals: GeoscienceLink[];
  resources: ResourceEstimate[];
  total_resources_mt: number;
  recent_drilling: DrillingResult[];
  resource_announcements: Announcement[];
  drilling_announcements: Announcement[];
  resource_value_usd?: number;
  ev_per_resource_oz?: number;
  last_updated: string;
}

export interface ResourceAnnouncement {
  symbol: string;
  title: string;
  date: string;
  url: string;
  resources: ResourceEstimate[];
}

interface UseCompanyIntelligenceResult {
  intelligence: CompanyIntelligence | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseGALinksResult {
  links: GeoscienceLink[];
  totalMatches: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseResourceSearchResult {
  announcements: ResourceAnnouncement[];
  count: number;
  isLoading: boolean;
  error: string | null;
  search: (commodity?: string, minTonnage?: number, daysBack?: number) => Promise<void>;
}

/**
 * Hook to fetch company intelligence
 */
export function useCompanyIntelligence(symbol: string): UseCompanyIntelligenceResult {
  const [intelligence, setIntelligence] = useState<CompanyIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntelligence = useCallback(async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const response = await fetch(
        `${API_URL}/api/v1/geoscience/intelligence/company/${symbol}?include_ga_data=true&include_announcements=true`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch intelligence: ${response.status}`);
      }

      const data = await response.json();
      setIntelligence(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company intelligence');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  return {
    intelligence,
    isLoading,
    error,
    refresh: fetchIntelligence,
  };
}

/**
 * Hook to fetch GA-company links
 */
export function useGACompanyLinks(
  gaType: 'all' | 'operating_mine' | 'critical_mineral' | 'deposit' = 'all',
  minConfidence: number = 0.5
): UseGALinksResult {
  const [links, setLinks] = useState<GeoscienceLink[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const response = await fetch(
        `${API_URL}/api/v1/geoscience/intelligence/links?ga_type=${gaType}&min_confidence=${minConfidence}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch links: ${response.status}`);
      }

      const data = await response.json();
      setLinks(data.links || []);
      setTotalMatches(data.total_matches || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GA-company links');
    } finally {
      setIsLoading(false);
    }
  }, [gaType, minConfidence]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    totalMatches,
    isLoading,
    error,
    refresh: fetchLinks,
  };
}

/**
 * Hook to search resource announcements
 */
export function useResourceSearch(): UseResourceSearchResult {
  const [announcements, setAnnouncements] = useState<ResourceAnnouncement[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    commodity?: string,
    minTonnage?: number,
    daysBack: number = 90
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      if (commodity) params.append('commodity', commodity);
      if (minTonnage) params.append('min_tonnage', minTonnage.toString());
      params.append('days_back', daysBack.toString());

      const response = await fetch(
        `${API_URL}/api/v1/geoscience/intelligence/resources/search?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to search: ${response.status}`);
      }

      const data = await response.json();
      setAnnouncements(data.announcements || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search announcements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    announcements,
    count,
    isLoading,
    error,
    search,
  };
}

/**
 * Hook to fetch company announcements
 */
export function useCompanyAnnouncements(
  symbol: string,
  announcementType?: string,
  daysBack: number = 365
) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const params = new URLSearchParams();
      if (announcementType) params.append('announcement_type', announcementType);
      params.append('days_back', daysBack.toString());

      const response = await fetch(
        `${API_URL}/api/v1/geoscience/intelligence/announcements/${symbol}?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch announcements: ${response.status}`);
      }

      const data = await response.json();
      setAnnouncements(data.announcements || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, announcementType, daysBack]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    count,
    isLoading,
    error,
    refresh: fetchAnnouncements,
  };
}

/**
 * Hook to fetch mines grouped by company
 */
export function useMinesByCompany() {
  const [minesByCompany, setMinesByCompany] = useState<Record<string, GeoscienceLink[]>>({});
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalMines, setTotalMines] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getPublicApiUrl();
      const response = await fetch(
        `${API_URL}/api/v1/geoscience/intelligence/mines/by-company`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();
      setMinesByCompany(data.companies || {});
      setTotalCompanies(data.total_companies || 0);
      setTotalMines(data.total_mines || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mines by company');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    minesByCompany,
    totalCompanies,
    totalMines,
    isLoading,
    error,
    refresh: fetchData,
  };
}
