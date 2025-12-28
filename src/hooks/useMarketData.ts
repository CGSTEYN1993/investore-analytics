/**
 * React Hooks for Market Data
 * 
 * Provides easy access to ASX market data with
 * loading states, error handling, and auto-refresh.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import marketService from '@/services/marketService';
import {
  ASXStockQuote,
  MiningOverview,
  TopMovers,
  NewsArticle,
  CommodityOverview,
  CommodityPrice,
} from '@/types/market';

// ========== Single Quote Hook ==========

interface UseQuoteResult {
  quote: ASXStockQuote | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useQuote(symbol: string, autoRefresh = true, refreshInterval = 60000): UseQuoteResult {
  const [quote, setQuote] = useState<ASXStockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchQuote = useCallback(async () => {
    if (!symbol) return;
    
    try {
      const data = await marketService.getQuote(symbol);
      setQuote(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchQuote();
    
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchQuote, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchQuote, autoRefresh, refreshInterval]);
  
  return { quote, isLoading, error, refresh: fetchQuote };
}

// ========== Multiple Quotes Hook ==========

interface UseMultipleQuotesResult {
  quotes: ASXStockQuote[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMultipleQuotes(symbols: string[], autoRefresh = true): UseMultipleQuotesResult {
  const [quotes, setQuotes] = useState<ASXStockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchQuotes = useCallback(async () => {
    if (!symbols.length) return;
    
    try {
      const data = await marketService.getMultipleQuotes(symbols);
      setQuotes(data.quotes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchQuotes();
    
    if (autoRefresh) {
      const interval = setInterval(fetchQuotes, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchQuotes, autoRefresh]);
  
  return { quotes, isLoading, error, refresh: fetchQuotes };
}

// ========== Company News Hook ==========

interface UseCompanyNewsResult {
  news: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCompanyNews(symbol: string, days = 7): UseCompanyNewsResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchNews = useCallback(async () => {
    if (!symbol) return;
    
    try {
      const data = await marketService.getCompanyNews(symbol, days);
      setNews(data.articles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, days]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchNews();
  }, [fetchNews]);
  
  return { news, isLoading, error, refresh: fetchNews };
}

// ========== Mining Sector Overview Hook ==========

interface UseMiningOverviewResult {
  overview: MiningOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMiningOverview(): UseMiningOverviewResult {
  const [overview, setOverview] = useState<MiningOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      const data = await marketService.getMiningOverview();
      setOverview(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mining overview');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    setIsLoading(true);
    fetchData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);
  
  return { overview, isLoading, error, refresh: fetchData };
}

// ========== Top Movers Hook ==========

interface UseTopMoversResult {
  movers: TopMovers | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTopMovers(): UseTopMoversResult {
  const [movers, setMovers] = useState<TopMovers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      const data = await marketService.getTopMovers();
      setMovers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load top movers');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    setIsLoading(true);
    fetchData();
    
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);
  
  return { movers, isLoading, error, refresh: fetchData };
}

// ========== Commodities Hook ==========

interface UseCommoditiesResult {
  commodities: CommodityPrice[];
  overview: CommodityOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCommodities(): UseCommoditiesResult {
  const [commodities, setCommodities] = useState<CommodityPrice[]>([]);
  const [overview, setOverview] = useState<CommodityOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      const [commoditiesData, overviewData] = await Promise.all([
        marketService.getAllCommodities(),
        marketService.getCommodityOverview(),
      ]);
      setCommodities(commoditiesData.commodities);
      setOverview(overviewData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commodities');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    setIsLoading(true);
    fetchData();
    
    const interval = setInterval(fetchData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchData]);
  
  return { commodities, overview, isLoading, error, refresh: fetchData };
}

// ========== Market News Hook ==========

interface UseMarketNewsResult {
  news: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMarketNews(category = 'general'): UseMarketNewsResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchNews = useCallback(async () => {
    try {
      const data = await marketService.getMarketNews(category);
      setNews(data.articles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market news');
    } finally {
      setIsLoading(false);
    }
  }, [category]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchNews();
  }, [fetchNews]);
  
  return { news, isLoading, error, refresh: fetchNews };
}
